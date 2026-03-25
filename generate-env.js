const fs = require('fs');

const apiUrl = process.env.API_URL || 'https://boggle-backend.onrender.com';
const cryptoKey = process.env.CRYPTO_KEY || "SandroBoggle";
const defaultTimer = process.env.DEFAULT_TIMER || 300

const content = `
window.__env = {
  apiUrl: "${apiUrl}",
  cryptoKey: "${cryptoKey}",
  defaultTimer: "${defaultTimer}"
};
`;

fs.writeFileSync('./src/assets/environment.js', content);