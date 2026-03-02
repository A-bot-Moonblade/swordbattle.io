const config = require('../../config');

// Available map configurations
// To add a new map, create a new file in this directory (e.g., winter.js)
// and add it to this object
const maps = {
  main: require('./main'),
  // Add more map configurations here:
  // winter: require('./winter'),
  // desert: require('./desert'),
};

// Get the active map from config
const activeMapName = config.world.activeMap;

// Validate that the map exists
if (!maps[activeMapName]) {
  console.warn(`Map "${activeMapName}" not found, falling back to "main"`);
  module.exports = maps.main;
} else {
  console.log(`✓ Loading map configuration: ${activeMapName}`);
  module.exports = maps[activeMapName];
}

// Export metadata about available maps
module.exports.availableMaps = Object.keys(maps);
module.exports.activeMapName = activeMapName;
