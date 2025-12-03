const cam = {
  "aabb": undefined,
  "target": undefined,
  "vel": undefined,
  "zoom": 2.6,
  calculateCameraStartPos(spawn, level_w, level_h) {
    let y = height - level_h * this.zoom * 8;
    if(y < 0) y = height - spawn.y * this.zoom * 8 - height / 2;
    this.aabb = new physics.AABB(createVector(), createVector(width / this.zoom / 8, height / this.zoom / 8));
    this.target = player.aabb.get_centre();
    this.aabb.set_centre(p5.Vector.sub(this.aabb.dims, this.target));
  },
  transform() {
    scale(this.zoom * 8);
    translate(this.aabb.origin);
    fill("yellow");
    circle(this.target.x, this.target.y, 1);
    circle(this.aabb.dims.x, this.aabb.dims.y, 1);
  },
  update(deltaT) {
    this.target = p5.Vector.add(player.aabb.get_centre(), createVector(30, 0));
    const maxSpeed = 20 * deltaT;
    let delta = p5.Vector.sub(this.aabb.dims, this.target).sub(this.aabb.get_centre());
    delta.y = 0;
    delta.setMag(Math.min(delta.mag(), maxSpeed));
    this.aabb.origin.add(delta);
  }
  
};