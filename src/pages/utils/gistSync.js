// GitHub Gist synchronization utility for COMPA project
// Handles pause state and intention state sync across devices

import { GIST_CONFIG } from '../../config/gistConfig';

const GIST_URL = `https://api.github.com/gists/${GIST_CONFIG.GIST_ID}`;

// Local cache for sync state
let lastKnownState = {
  paused: false,
  intention: 0,
  timestamp: 0
};

/**
 * Fetch current sync state from GitHub Gist
 * @returns {Promise<Object>} Object containing paused, intention, and timestamp
 */
export const getSyncState = async () => {
  try {
    const response = await fetch(GIST_URL, {
      headers: {
        'Authorization': `token ${GIST_CONFIG.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const gist = await response.json();
    const content = gist.files['compa-sync.json'].content;
    const newState = JSON.parse(content);
    
    // Only return state if it's different from last known state
    if (newState.timestamp > lastKnownState.timestamp) {
      lastKnownState = newState;
      return newState;
    }
    
    // Return cached state if no changes
    return lastKnownState;
  } catch (error) {
    console.error('Failed to get sync state from Gist:', error);
    // Return cached state if fetch fails
    return lastKnownState;
  }
};

/**
 * Update sync state in GitHub Gist
 * @param {boolean} paused - Current pause state
 * @param {number} intention - Current intention state
 * @returns {Promise<boolean>} Success status
 */
export const updateSyncState = async (paused, intention) => {
  try {
    const state = {
      paused,
      intention,
      timestamp: Date.now()
    };
    
    // Skip update if state hasn't changed
    if (lastKnownState.paused === paused && lastKnownState.intention === intention) {
      return true;
    }
    
    const response = await fetch(GIST_URL, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GIST_CONFIG.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'compa-sync.json': {
            content: JSON.stringify(state, null, 2)
          }
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Update local cache
    lastKnownState = state;
    console.log('Sync state updated in Gist:', state);
    return true;
  } catch (error) {
    console.error('Failed to update sync state in Gist:', error);
    return false;
  }
};

/**
 * Check if Gist sync is properly configured
 * @returns {boolean} Configuration status
 */
export const isGistConfigured = () => {
  return GIST_CONFIG.GITHUB_TOKEN !== 'YOUR_GITHUB_TOKEN' && 
         GIST_CONFIG.GIST_ID !== 'YOUR_GIST_ID';
}; 