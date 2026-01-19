class SignalTower {
  static off_sprite;
  static on_sprite;
  static preload() {
    SignalTower.off_sprite = new material.Sprite(miscSpriteSheet, 56, 0, 8, 16);
    SignalTower.on_sprite = new material.Sprite(miscSpriteSheet, 56, 16, 8, 16);
  }
  constructor(data) {
    this.aabb = new physics.AABB(createVector(data.x, data.y+3), createVector(2, 4));
    this.energy_level = data.energy_level;
  }
  tick() {
    abilities.placer.can_enter = this.aabb.is_overlapping_aabb(player.aabb);
    if(abilities.placer.can_enter) {
      abilities.power_level = this.energy_level;
      abilities.index = null;
      level.scene_items.forEach((obj) => {
        obj.reset();
      });
    }
  }
  draw() {
    if(abilities.placer.can_enter) {
      SignalTower.on_sprite.draw(this.aabb.origin.x, this.aabb.origin.y, 2, 4);
    } else {
      SignalTower.off_sprite.draw(this.aabb.origin.x, this.aabb.origin.y, 2, 4);
    }
  }
  reset() {}
  static createDefaultObj(x, y) {
    return new SignalTower({
      x: x,
      y: y-6,
      energy_level: 3,
    });
  }

  toJSON() {
    return {
      type: "SignalTower",
      x: this.aabb.origin.x,
      y: this.aabb.origin.y-3,
      energy_level: this.energy_level,
    };
  }
}