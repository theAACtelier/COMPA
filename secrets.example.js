// Template for local secrets.
// Copy to `secrets.development.js` (npm start) and `secrets.production.js` (npm run build)
// and fill in real values. Those files are gitignored.
module.exports = {
  OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY',

  // GitHub token with 'gist' scope + target Gist ID (cross-device sync)
  GITHUB_TOKEN: 'YOUR_GITHUB_TOKEN',
  GIST_ID: 'YOUR_GIST_ID',
};
