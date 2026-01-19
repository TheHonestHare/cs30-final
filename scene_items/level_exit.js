class LevelExitTrigger {
  static preload() {}
  constructor(data) {
    this.aabb = new physics.AABB(createVector(data.x, data.y), createVector());
    this.nextLevel = data.nextLevel;
  }
  tick() {
    if(this.aabb.is_overlapping_aabb(player.aabb)) {
      level_manager.level = this.nextLevel;
      level_manager.load();
    }
  }
  draw() {}
  reset() {}
  static createDefaultObj(x, y) {
    return new LevelExitTrigger({
      x: x,
      y: y,
      dimx: 1,
      dimy: 1,
      nextLevel: level_manager.level + 1,
    });
  }
  toJSON() {
    return {
      type: "LevelExitTrigger",
      x: this.aabb.origin.x,
      y: this.aabb.origin.y,
      dimx: this.aabb.dims.x,
      dimy: this.aabb.dims.y,
      nextLevel: this.nextLevel,
    };
  }
}