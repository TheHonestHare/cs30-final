const cam = {
  "aabb": undefined,
  "target": undefined,
  "vel": undefined,
  "zoom": 2.6,
  calculateCameraStartPos(spawn, level_w, level_h) {
    let y = height - level_h * this.zoom * 8;
    if(y < 0) y = height - spawn.y * this.zoom * 8 - height / 2;
    this.aabb = new physics.AABB(createVector(0, y), createVector(width / this.zoom / 8, height / this.zoom / 8));
    this.targetOffset = player.aabb.get_centre();
  },
  transform() {
    translate(this.aabb.origin);
    scale(this.zoom * 8);
    fill("yellow");
    circle(this.target.x, this.target.y, 1);
  },
  update(deltaT) {
    this.target = p5.Vector.add(player.aabb.get_centre(), 0);
    const maxSpeed = max(player.vel.mag() * 1.5 * deltaT, 20 * deltaT);
    let delta = p5.Vector.sub(this.target, this.aabb.get_centre());
    console.log(delta);
    delta.setMag(Math.min(delta.mag(), maxSpeed));
    this.aabb.set_centre(this.target);
  }
  
};