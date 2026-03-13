
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = execSync('grep -l "dark:" -r .').toString().trim().split('\n');

files.forEach(file => {
  if (!file) return;
  console.log(`Processing ${file}`);
  let content = fs.readFileSync(file, 'utf8');
  // Remove dark: classes
  // Match dark: followed by any non-space, non-quote character
  content = content.replace(/ "]+/g, '');
  content = content.replace(/ "]+/g, '');
  fs.writeFileSync(file, content);
});
