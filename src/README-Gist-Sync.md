# GitHub Gist Cross-Device Sync Setup

## Prerequisites

1. **GitHub Account**: You need a GitHub account
2. **Personal Access Token**: Create a token with 'gist' permission

## Setup Steps

### 1. Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select "gist" permission
4. Copy the generated token

### 2. Create a Gist

1. Go to: https://gist.github.com
2. Create a new gist with:
   - Filename: `compa-sync.json`
   - Content: `{"paused": false, "intention": 0, "timestamp": 0}`
3. Copy the Gist ID from the URL (e.g., `abc123def456`)

### 3. Configure the Application

1. Copy `secrets.example.js` (repo root) to `secrets.development.js` / `secrets.production.js`
2. Set `GITHUB_TOKEN` to your actual token
3. Set `GIST_ID` to your actual Gist ID

### 4. Test the Sync

1. Run the application on two devices
2. One device should be AAC interface, another should be CP interface
3. Test pause/unpause and intention changes
4. Both devices should sync in real-time (1-second delay)

## Troubleshooting

- **Sync not working**: Check if token and Gist ID are correct
- **Rate limiting**: GitHub has rate limits, but 1-second polling should be fine
- **Network issues**: Check internet connection on both devices 