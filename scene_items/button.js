class Button {
  static off_sprites = [];
  static on_sprites = [];
  static press_sound;
  static preload() {
    for(const coordx of [0, 8, 16, 24]) {
      Button.off_sprites.push(new material.Sprite(miscSpriteSheet, coordx, 48, 8, 8));
      Button.on_sprites.push(new material.Sprite(miscSpriteSheet, coordx, 56, 8, 8));
    }

    Button.press_sound = loadSound('assets/sounds/button_press.mp3');
  }
  constructor(data) {
    this.aabb = new physics.AABB(createVector(data.x, data.y), createVector(1, 1));
    this.channel = data.channel;
    this.was_overlapping = false;
  }
  tick() {
    if(this.aabb.is_overlapping_aabb(player.aabb)) {
      if(this.was_overlapping) return;
      this.was_overlapping = true;
      level.channels[this.channel] = !level.channels[this.channel];
      Button.press_sound.play();
    } else {
      this.was_overlapping = false;
    }
  }
  draw() {
    if(level.channels[this.channel]) {
      Button.on_sprites[this.channel % 4].draw(this.aabb.origin.x, this.aabb.origin.y, 1, 1);
    } else {
      Button.off_sprites[this.channel % 4].draw(this.aabb.origin.x, this.aabb.origin.y, 1, 1);
    }
  }
  reset() {}
  static createDefaultObj(x, y) {
    return new Button({
      x: x,
      y: y,
      channel: 0,
    });
  }

  toJSON() {
    return {
      type: "Button",
      x: this.aabb.origin.x,
      y: this.aabb.origin.y,
      channel: this.channel,
    };
  }
}