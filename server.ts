import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // In-memory store for available jobs. In a real production app, this would be a database.
  let availableJobs: any[] = [];

  app.use(express.json());

  // --- PAYSTACK INTEGRATION ---
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
  
  app.post('/api/paystack/initialize', async (req, res) => {
    const { email, amount } = req.body;
    
    if (!PAYSTACK_SECRET) {
      console.warn("PAYSTACK_SECRET_KEY not set. Using mock initialization.");
      return res.json({
        status: true,
        data: {
          authorization_url: `https://checkout.paystack.com/mock_${Date.now()}`,
          access_code: `mock_code_${Date.now()}`,
          reference: `mock_ref_${Date.now()}`
        }
      });
    }

    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        { email, amount, callback_url: `${req.headers.origin}/wallet` },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
      );
      res.json(response.data);
    } catch (error: any) {
      console.error("Paystack Init Error:", error.response?.data || error.message);
      res.status(500).json({ message: "Failed to initialize payment" });
    }
  });

  app.get('/api/paystack/verify/:reference', async (req, res) => {
    const { reference } = req.params;

    if (!PAYSTACK_SECRET || reference.startsWith('mock_')) {
      console.warn("Mock verification for ref:", reference);
      return res.json({ status: true, data: { status: 'success', amount: 10000 } });
    }

    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
      );
      res.json(response.data);
    } catch (error: any) {
      console.error("Paystack Verify Error:", error.response?.data || error.message);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post('/api/notifications/register', async (req, res) => {
    const { userId, token } = req.body;
    console.log(`Registering FCM token for user ${userId}: ${token}`);
    // In production, save this to Supabase profiles table
    res.json({ status: 'ok' });
  });

  // API routes will go here
  app.get('/api/public/jobs', (req, res) => {
    // Return the current list of available jobs.
    res.json(availableJobs);
  });

  // --- PRICING ENGINE (MULTI-ZONE) ---

  type Zone = 'ZONE_1' | 'ZONE_2' | 'ZONE_3' | 'ZONE_4';

  const RATE_CARDS = {
    ZONE_1: { // Metro Hustle (JHB, CPT, DBN)
      base: { day: 85, evening: 100, night: 150 },
      surcharges: { 
        peakHour: 30, // 07-09 & 16-18
        heavyLoad: 20, 
        express: 50 
      }
    },
    ZONE_2: { // Secondary Cities (BFN, PE, EL)
      base: { day: 75, evening: 90, night: 120 },
      surcharges: { 
        peakHour: 0, 
        heavyLoad: 20, 
        express: 30 
      }
    },
    ZONE_3: { // Bethlehem Standard (Towns)
      base: { day: 60, evening: 80, night: 100 },
      surcharges: { 
        peakHour: 0, 
        heavyLoad: 20, 
        express: 30 
      }
    },
    ZONE_4: { // Rural & Township
      base: { day: 80, evening: 100, night: 120 }, // Bakkie Premium built-in
      surcharges: { 
        peakHour: 0, 
        heavyLoad: 20, 
        express: 30 
      }
    }
  };

  const detectZone = (address: string): Zone => {
    const addr = address.toLowerCase();
    // Zone 1: Metros
    if (addr.match(/johannesburg|sandton|pretoria|centurion|midrand|soweto|cape town|durban|umhlanga/)) return 'ZONE_1';
    // Zone 2: Secondary
    if (addr.match(/bloemfontein|gqeberha|port elizabeth|east london|mbombela|nelspruit|polokwane|kimberley/)) return 'ZONE_2';
    // Zone 4: Rural/Township keywords (Simple heuristic for demo)
    if (addr.match(/rural|farm|location|village/)) return 'ZONE_4';
    // Zone 3: Default (Bethlehem, etc.)
    return 'ZONE_3';
  };

  const calculatePrice = (address: string, options: { isHeavyLoad?: boolean, isExpress?: boolean }) => {
    const now = new Date();
    const hour = now.getHours();
    const zone = detectZone(address);
    const rates = RATE_CARDS[zone];

    let period = 'day';
    let basePrice = rates.base.day;
    let peakSurcharge = 0;

    // Time of Day Logic
    if (hour >= 20 && hour <= 23) {
      period = 'evening';
      basePrice = rates.base.evening;
    } else if (hour >= 0 && hour < 6) {
      period = 'night';
      basePrice = rates.base.night;
    }

    // Peak Hour Logic (Zone 1 Only)
    if (zone === 'ZONE_1' && period === 'day') {
      if ((hour >= 7 && hour < 9) || (hour >= 16 && hour < 18)) {
        peakSurcharge = rates.surcharges.peakHour;
      }
    }

    let total = basePrice + peakSurcharge;

    if (options.isHeavyLoad) total += rates.surcharges.heavyLoad;
    if (options.isExpress) total += rates.surcharges.express;

    const vat = total * 0.15;
    const finalTotal = total + vat;

    return { 
      total: finalTotal, 
      breakdown: { 
        zone,
        base: basePrice, 
        period, 
        peakSurcharge,
        heavyLoad: options.isHeavyLoad ? rates.surcharges.heavyLoad : 0, 
        express: options.isExpress ? rates.surcharges.express : 0,
        vat: vat
      } 
    };
  };

  app.post('/api/jobs', (req, res) => {
    const requestData = req.body;
    const pickupAddress = requestData.fullDetails?.pickup?.address || "";
    
    // Calculate authoritative price
    const pricing = calculatePrice(pickupAddress, {
      isHeavyLoad: requestData.fullDetails?.errandDetails?.isHeavyLoad,
      isExpress: requestData.fullDetails?.errandDetails?.isExpress
    });

    const newJob = {
      ...requestData,
      id: `job_${Date.now()}`,
      price: `R ${pricing.total.toFixed(2)}`,
      pricingBreakdown: pricing.breakdown
    };

    availableJobs.unshift(newJob);
    console.log(`New job in ${pricing.breakdown.zone}:`, pricing);
    res.status(201).json(newJob);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const path = await import('path');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
