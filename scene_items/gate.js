class Gate {
  static horizontal_sprite;
  static vertical_sprite;
  static defaults = {
    channel: 0,
    horizontal: false,
    inverted: false,
  };
  static preload() {
    Gate.horizontal_sprite = new material.Sprite(miscSpriteSheet, 32, 48, 8, 8);
    Gate.vertical_sprite = new material.Sprite(miscSpriteSheet, 32, 56, 8, 8);
  }
  constructor(data) {
    this.channel = data.channel;
    this.is_horizontal = data.horizontal;
    this.gridx = data.x;
    this.gridy = data.y;
    if(this.is_horizontal) {
      this.aabb = new physics.AABB(createVector(data.x, data.y+3/8), createVector(1, 2/8));
    } else {
      this.aabb = new physics.AABB(createVector(data.x+3/8, data.y), createVector(2/8, 1));
    }
    this.is_inverted = data.inverted;
  }
  tick() {
    if((level.channels[this.channel] !== this.is_inverted) && this.aabb.is_overlapping_aabb(player.aabb)) {
      player.respawn();
    } 
  }
  draw() {
    push();
    let opacity = 255;
    if(level.channels[this.channel] === this.is_inverted) opacity = 100;

    if(this.is_horizontal) {
      Gate.horizontal_sprite.draw(this.gridx, this.gridy, 1, 1, opacity);
    } else {
      Gate.vertical_sprite.draw(this.gridx, this.gridy, 1, 1, opacity);
    }
    pop();
  }
  reset() {}
  static createDefaultObj(x, y) {
    return new Gate({
      x: x,
      y: y,
      channel: Gate.defaults.channel,
      horizontal: Gate.defaults.horizontal,
      inverted: Gate.defaults.inverted,
    });
  }

  toJSON() {
    return {
      type: "Gate",
      x: this.gridx,
      y: this.gridy,
      channel: this.channel,
      horizontal: this.is_horizontal,
      inverted: this.is_inverted,
    };
  }
}
