# Map Configuration System

This directory contains all available map configurations for Swordbattle.io. The game supports multiple map layouts that can be switched easily using environment variables or configuration settings.

## Current Map Layout

The active map features:
- **Map Size**: 60,000 x 60,000 (2x larger than original)
- **4 Triangular Biomes** (isosceles triangles with apex at center):
  - **Top**: Ice biome
  - **Right**: Fire biome
  - **Bottom**: Desert biome (currently using ice textures as placeholder)
  - **Left**: Earth biome
- **Central Island**: Neutral zone at (0, 0) with radius 4000
- **4 Corner Spawnzones**: Safe spawning areas at each corner
- **4 Rivers**: Flow from corners to center

## How to Switch Maps

### Method 1: Environment Variable (Recommended)

Set the `ACTIVE_MAP` environment variable before starting the server:

```bash
# Linux/Mac
export ACTIVE_MAP=main
npm start

# Or in one line:
ACTIVE_MAP=main npm start

# Windows (Command Prompt)
set ACTIVE_MAP=main
npm start

# Windows (PowerShell)
$env:ACTIVE_MAP="main"
npm start
```

### Method 2: Edit config.js

Edit `server/src/config.js` and change the `activeMap` value:

```javascript
world: {
  worldHeight: 60000,
  worldWidth: 60000,
  activeMap: 'main', // Change this to your desired map name
}
```

### Method 3: .env File

Add to your `.env` file:

```
ACTIVE_MAP=main
```

## Available Maps

- **main** - Current default map with 4 biomes (Ice, Fire, Desert, Earth)

## Creating a New Map

To create a new map configuration:

1. **Copy an existing map file** as a template:
   ```bash
   cp main.js winter.js
   ```

2. **Edit your new map file** (e.g., `winter.js`):
   - Modify biome types, positions, and shapes
   - Adjust entity spawns and quantities
   - Change biome effects if needed

3. **Register the map** in `index.js`:
   ```javascript
   const maps = {
     main: require('./main'),
     winter: require('./winter'), // Add your new map here
   };
   ```

4. **Activate your map** using one of the methods above:
   ```bash
   ACTIVE_MAP=winter npm start
   ```

## Map File Structure

Each map configuration file exports an object with:

```javascript
module.exports = {
  coinsCount: 0,          // Additional coins to spawn globally
  aiPlayersCount: 20,     // Number of AI bots to maintain
  biomes: [               // Array of biome configurations
    {
      type: Types.Biome.Ice,
      pos: [x, y],        // Position offset
      radius: 2000,       // For circular biomes
      // OR
      points: [...],      // For polygon biomes (relative to pos)
      objects: [...]      // Entities to spawn in this biome
    },
    // ... more biomes
  ],
};
```

## Biome Types

Available biome types (defined in `server/src/game/Types.js`):

- `Types.Biome.Fire` - Fire biome (+10% health, -10% damage)
- `Types.Biome.Earth` - Earth biome (-10% speed, +5% damage)
- `Types.Biome.Ice` - Ice biome (slipping effect, +10% swing duration)
- `Types.Biome.River` - River biome (+25% speed, -20% zoom)
- `Types.Biome.Safezone` - Safe spawn area (no PvP)
- `Types.Biome.Island` - Neutral island (no special effects)
- `Types.Biome.Desert` - Desert biome (+5% speed, -5% max health)

## Shape Types

Biomes can have different shapes:

### Circle
```javascript
{
  type: Types.Biome.Island,
  pos: [0, 0],
  radius: 4000,
}
```

### Polygon (Triangle, Rectangle, etc.)
```javascript
{
  type: Types.Biome.Ice,
  pos: [-30000, -30000],  // Origin point
  points: [               // Vertices relative to pos
    [0, 0],              // Bottom-left corner
    [60000, 0],          // Bottom-right corner
    [30000, 30000],      // Top apex (center of map)
  ],
}
```

## Tips for Map Design

1. **Balance**: Ensure each biome has roughly equal resources and difficulty
2. **Spacing**: Leave enough space between obstacles for player movement
3. **Variety**: Mix different entity types to keep gameplay interesting
4. **Testing**: Always test your map thoroughly before deploying

## Troubleshooting

- **Map not loading**: Check console for error messages. Map will fall back to 'main' if not found.
- **Server crash on startup**: Verify your map file syntax is correct (valid JavaScript)
- **Biomes overlapping**: Check biome positions and shapes don't conflict
- **Validation error**: Map width/height must match calculated bounds from biome definitions

## Example: Creating a Seasonal Variant

To create a winter-themed variant of the main map:

1. Copy `main.js` to `winter.js`
2. Change all biomes to Ice type
3. Replace entities with winter-themed ones (Yeti, Wolf, etc.)
4. Adjust spawn rates for seasonal feel
5. Register in `index.js`
6. Launch with `ACTIVE_MAP=winter npm start`
