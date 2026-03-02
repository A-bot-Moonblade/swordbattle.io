const Biome = require('./Biome');
const Types = require('../Types');

class EarthBiome extends Biome {
  constructor(game, definition) {
    super(game, Types.Biome.Earth, definition);
    this.zIndex = 2;
  }

  applyEffects(player) {
    // Neutral biome - no special effects
  }
}

module.exports = EarthBiome;
