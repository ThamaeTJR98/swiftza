import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/public/jobs", (req, res) => {
    // Mock jobs for the onboarding live feed
    const mockJobs = [
      {
        id: "job-1",
        type: "Ride",
        title: "Sandton City → OR Tambo",
        location: "Johannesburg",
        price: "R450.00",
        distance: "2.4 km away",
        color: "text-brand-teal",
        status: "SEARCHING",
      },
      {
        id: "job-2",
        type: "Errand",
        title: "Grocery Shopping",
        location: "Rosebank Mall",
        price: "R120.00",
        distance: "0.8 km away",
        color: "text-brand-gold",
        status: "SEARCHING",
      },
      {
        id: "job-3",
        type: "Move",
        title: "Apartment Move",
        location: "Midrand",
        price: "R1,200.00",
        distance: "5.2 km away",
        color: "text-brand-purple",
        status: "SEARCHING",
      }
    ];
    res.json(mockJobs);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
