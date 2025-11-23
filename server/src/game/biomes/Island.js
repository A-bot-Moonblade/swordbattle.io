const Biome = require('./Biome');
const Types = require('../Types');

class Island extends Biome {
  constructor(game, definition) {
    super(game, Types.Biome.Island, definition);
    this.zIndex = 2;
  }

  applyEffects(player) {
    // Island is a neutral biome with no special effects
    player.viewport.zoom.multiplier *= 1.0;
  }

  collides(player, response) {
    // No collision effects
  }
}

module.exports = Island;
