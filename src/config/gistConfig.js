// GitHub Gist configuration for cross-device sync.
// Values come from secrets.<env>.js (see secrets.example.js).
import secrets from 'secrets';

export const GIST_CONFIG = {
  GITHUB_TOKEN: secrets.GITHUB_TOKEN,
  GIST_ID: secrets.GIST_ID,
};
