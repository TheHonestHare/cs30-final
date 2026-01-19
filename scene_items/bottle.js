class EnergyBottle {
  static oneBottleSprite;
  static oneBottleCollectedSprite;
  static twoBottlesSprite;
  static twoBottlesCollectedSprite;

  static preload() {
    EnergyBottle.oneBottleSprite = new material.Sprite(miscSpriteSheet, 0, 24, 8, 8);
    EnergyBottle.oneBottleCollectedSprite = new material.Sprite(miscSpriteSheet, 8, 24, 8, 8);
    EnergyBottle.twoBottlesSprite = new material.Sprite(miscSpriteSheet, 16, 24, 8, 8);
    EnergyBottle.twoBottlesCollectedSprite = new material.Sprite(miscSpriteSheet, 24, 24, 8, 8);
  }

  constructor(data) {
    this.aabb = new physics.AABB(createVector(data.x + 1/8, data.y + 1/8), createVector(6/8, 6/8));
    this.count = data.count;
    this.collected = false;
    this.gridx = data.x;
    this.gridy = data.y;
  }
  tick() {
    const overlapping = !this.collected && this.aabb.is_overlapping_aabb(player.aabb);
    if(overlapping) {
      this.collected = true;
      abilities.power_level += this.count;
    }
  }
  draw() {
    if(!this.collected && this.count === 1) EnergyBottle.oneBottleSprite.draw(this.gridx, this.gridy, 1, 1);
    if(this.collected && this.count === 1) EnergyBottle.oneBottleCollectedSprite.draw(this.gridx, this.gridy, 1, 1);
    if(!this.collected && this.count === 2) EnergyBottle.twoBottlesSprite.draw(this.gridx, this.gridy, 1, 1);
    if(this.collected && this.count === 2) EnergyBottle.twoBottlesCollectedSprite.draw(this.gridx, this.gridy, 1, 1);
  }
  reset() {
    this.collected = false;
  }

  static createDefaultObj(x, y) {
    return new EnergyBottle({
      x: x,
      y: y,
      count: 1
    });
  }
}