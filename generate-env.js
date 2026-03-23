const fs = require('fs');

const apiUrl = process.env.API_URL || 'https://boggle-backend.onrender.com';
const cryptoKey = process.env.CRYPTO_KEY || "SandroBoggle";

const content = `
window.__env = {
  apiUrl: "${apiUrl}",
  cryptoKey: "${cryptoKey}"
};
`;

fs.writeFileSync('./src/assets/environment.js', content);