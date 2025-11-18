const Biome = require('./Biome');
const Types = require('../Types');

class FireBiome extends Biome {
  constructor(game, definition) {
    super(game, Types.Biome.Fire, definition);
    this.zIndex = 2;
  }

  applyEffects(player) {
    // Neutral biome - no special effects
  }
}

module.exports = FireBiome;
