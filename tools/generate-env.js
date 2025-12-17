// Simple env generator: reads .env and writes src/environments/environment.auto.ts
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const root = process.cwd();
const envPath = path.join(root, '.env');

if (!fs.existsSync(envPath)) {
  console.log('.env not found; using defaults from .env.example or hardcoded.');
}

dotenv.config({ path: envPath });

const API_URL = process.env.API_URL || 'http://localhost:3000';
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'YOUR_SPOTIFY_CLIENT_ID';
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:4200/callback';

const outDir = path.join(root, 'src', 'environments');
const outFile = path.join(outDir, 'environment.auto.ts');

const content = `export const environmentAuto = {
  apiUrl: '${API_URL}',
  spotifyClientId: '${SPOTIFY_CLIENT_ID}',
  spotifyRedirectUri: '${SPOTIFY_REDIRECT_URI}'
};
`;

fs.writeFileSync(outFile, content, { encoding: 'utf8' });
console.log(`Generated ${path.relative(root, outFile)}.`);
