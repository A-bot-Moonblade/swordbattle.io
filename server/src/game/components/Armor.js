const Property = require('./Property');

class Armor {
  constructor(max = 100, regen = 0.5, regenWait = 5000) {
    this.max = new Property(max);
    this.regen = new Property(regen);
    this.regenWait = new Property(regenWait);

    this.percent = 1;
    this.lastDamage = null;
  }

  /**
   * Calculate damage resistance based on current armor
   * Returns a multiplier (0 to 1) where lower = more resistance
   * Formula: resistance increases with armor, capping at ~75% reduction
   */
  getDamageResistance() {
    const armorValue = this.percent * this.max.value;
    // Formula: 1 / (1 + armor/200) gives diminishing returns
    // At 100 armor: ~33% damage reduction
    // At 200 armor: ~50% damage reduction
    // At 400 armor: ~67% damage reduction
    return 1 / (1 + armorValue / 200);
  }

  /**
   * Damage armor when player is hit
   * @param {number} damage - Raw damage amount
   */
  damaged(damage) {
    // Armor deteriorates based on damage taken
    const deterioration = damage / this.max.value * 0.3; // 30% of health damage
    this.percent = Math.max(this.percent - deterioration, 0);
    this.lastDamage = Date.now();
  }

  gain(amount) {
    this.percent = Math.min(this.percent + amount / this.max.value, 1);
  }

  /**
   * Update armor regeneration
   * Only regenerates if health is full
   * @param {number} dt - Delta time
   * @param {boolean} isHealthFull - Whether player is at full health
   */
  update(dt, isHealthFull) {
    if (!isHealthFull) return; // Only regen when health is full
    if (this.lastDamage && Date.now() - this.lastDamage < this.regenWait.value) return;

    const coef = this.regen.value / this.max.value * dt;
    this.percent = Math.min(this.percent + coef, 1);
  }

  cleanup() {
    this.max.reset();
    this.regen.reset();
    this.regenWait.reset();
  }
}

module.exports = Armor;
