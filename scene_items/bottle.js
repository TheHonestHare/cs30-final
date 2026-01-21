class EnergyBottle {
  static oneBottleSprite;
  static oneBottleCollectedSprite;
  static twoBottlesSprite;
  static twoBottlesCollectedSprite;

  static clink_1_sound;
  static clink_2_sound;

  static preload() {
    EnergyBottle.oneBottleSprite = new material.Sprite(miscSpriteSheet, 0, 24, 8, 8);
    EnergyBottle.oneBottleCollectedSprite = new material.Sprite(miscSpriteSheet, 8, 24, 8, 8);
    EnergyBottle.twoBottlesSprite = new material.Sprite(miscSpriteSheet, 16, 24, 8, 8);
    EnergyBottle.twoBottlesCollectedSprite = new material.Sprite(miscSpriteSheet, 24, 24, 8, 8);

    EnergyBottle.clink_1_sound = loadSound('assets/sounds/bottle_clink_1.mp3');
    EnergyBottle.clink_2_sound = loadSound('assets/sounds/bottle_clink_2.mp3');
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
      if(this.count === 1) {
        EnergyBottle.clink_1_sound.play();
      } else {
        EnergyBottle.clink_2_sound.play();
      }
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

  toJSON() {
    return {
      type: "EnergyBottle",
      x: this.gridx,
      y: this.gridy,
      count: this.count,
    };
  }

  static createDefaultObj(x, y) {
    return new EnergyBottle({
      x: x,
      y: y,
      count: 1
    });
  }
}