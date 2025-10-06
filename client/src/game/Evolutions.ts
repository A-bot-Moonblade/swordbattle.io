import { EvolutionTypes } from './Types';

// Type: [name, texture, textureScale, textureOrigin, description]
export const Evolutions: Record<any, [string, string, number, [number, number], string, string]> = {
  [EvolutionTypes.Tank]: ['Tank', 'tankOverlay', 1, [0.5, 0.55], 'Large & defensive', 'Overpower'],
  [EvolutionTypes.Berserker]: ['Berserker', 'berserkerOverlay', 1.18, [0.47, 0.6], 'Strong & fast', 'Rampage'],
  [EvolutionTypes.Vampire]: ['Vampire', 'vampireOverlay', 1.09, [0.5, 0.53], 'Gains HP from attacks', 'Leech'],
  [EvolutionTypes.Knight]: ['Knight', 'knightOverlay', 1.09, [0.5, 0.53], 'Quick & agile', 'Quick Hits'],
  [EvolutionTypes.Samurai]: ['Samurai', 'samuraiOverlay', 1.09, [0.5, 0.53], 'Swift & powerful', 'Iaijutsu'],
  [EvolutionTypes.Rook]: ['Rook', 'rookOverlay', 1.09, [0.5, 0.53], 'Moves in 4 directions', 'Castle Dash'],
  [EvolutionTypes.Stalker]: ['Stalker', 'stalkerOverlay', 1.09, [0.5, 0.53], 'Mysterious yet inescapable', 'Invisiblity'],
  [EvolutionTypes.Warrior]: ['Warrior', 'warriorOverlay', 1.09, [0.5, 0.53], 'Large, fast, unstoppable', 'Siege'],
  [EvolutionTypes.Lumberjack]: ['Lumberjack', 'lumberjackOverlay', 1.09, [0.5, 0.53], 'Breaks chests with ease', 'Scouting'],
  [EvolutionTypes.Defender]: ['Defender', 'defenderOverlay', 1.4535, [0.5, 0.53], 'Near-unkillable defense', 'Fortress'],
  [EvolutionTypes.Fighter]: ['Fighter', 'fighterOverlay', 1.2717, [0.5, 0.53], 'Great for fast-paced combat', 'Quick Boost'],
  [EvolutionTypes.Fisherman]: ['Fisherman', 'fishermanOverlay', 1.09, [0.5, 0.53], 'Swordthrows pull in enemies', 'Melee Pull'],
  [EvolutionTypes.Archer]: ['Archer', 'archerOverlay', 1.09, [0.49, 0.5], 'Swordthrows have more power', 'Full Draw'],
  [EvolutionTypes.Sniper]: ['Sniper', 'sniperOverlay', 1.4535, [0.5, 0.53], 'Sees & throws farther', 'One-Shot'],
  [EvolutionTypes.SuperArcher]: ['Super Archer', 'superArcherOverlay', 1.09, [0.49, 0.5], 'Farther swordthrows = more damage', 'Throw Recharge'],
  [EvolutionTypes.Rammer]: ['Rammer', 'rammerOverlay', 1.09, [0.5, 0.53], 'Swordthrows bring you along', 'InfiniRam'],
  [EvolutionTypes.Juggernaut]: ['Juggernaut', 'juggernautOverlay', 1.09, [0.5, 0.53], 'Very powerful but no ability', 'None'],
  [EvolutionTypes.Slasher]: ['Slasher', 'slasherOverlay', 1.2717, [0.5, 0.53], 'Sword swings are wider', 'Fast Slash'],
  [EvolutionTypes.Striker]: ['Striker', 'strikerOverlay', 1.4535, [0.5, 0.53], 'Chains damage across players', 'Thunderstorm'],
  [EvolutionTypes.Plaguebearer]: ['Plaguebearer', 'plaguebearerOverlay', 1.2717, [0.5, 0.53], 'Deals damage over time', 'Poison Field'],
};
