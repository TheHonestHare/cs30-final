const cam = {
  aabb: undefined,
  zoom: 2.6,
  target: undefined,
  vel: undefined,
  acc: undefined,
  calculateCameraStartPos(spawn, level_w, level_h) {
    let y = height - level_h * this.zoom * 8;
    if(y < 0) y = height - spawn.y * this.zoom * 8 - height / 2;
    this.aabb = new physics.AABB(createVector(), createVector(width / this.zoom / 8, height / this.zoom / 8));
    this.target = player.aabb.get_centre();
    this.aabb.set_centre(p5.Vector.sub(this.aabb.dims, this.target));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
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
    const maxSpeed = 20;
    let delta = p5.Vector.sub(this.aabb.dims, this.target).sub(this.aabb.get_centre());
    delta.y = 0;
    if(Math.abs(delta.x) > 3) {
      this.vel.x = maxSpeed * (delta.x > 0 ? 1 : -1);
    } else if(Math.abs(delta.x) > 0.1) {
      this.acc.x = dampAcc(this.vel.x, delta.x);
      console.log(this.acc);
      this.vel.add(p5.Vector.mult(this.acc, deltaT));
    } else {
      this.acc = createVector(0, 0);
      this.vel.x = player.vel.x;
    }
    this.aabb.origin.add(p5.Vector.mult(this.vel, deltaT));
  }  
};