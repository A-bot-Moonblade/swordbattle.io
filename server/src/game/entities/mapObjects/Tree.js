const Entity = require('../Entity');
const Circle = require('../../shapes/Circle');
const Types = require('../../Types');

class Tree extends Entity {
  static defaultDefinition = {
    forbiddenEntities: [Types.Entity.House1],
  };

  constructor(game, objectData) {
    super(game, Types.Entity.Tree, objectData);

    this.isStatic = true;
    this.shape = Circle.create(0, 0, this.size);
    this.targets.push(Types.Entity.Player);

    this.spawn();
  }

  processTargetsCollision(player) {
    player.addEffect(Types.Effect.Speed, 'tree', { multiplier: 0.9 });
  }
}

module.exports = Tree;
