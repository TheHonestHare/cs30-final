const cam = {
  aabb: undefined,
  zoom: 4.0,
  target: undefined,
  vel: undefined,
  acc: undefined,
  followMode: undefined,
  modes: {
    none: 0,
    x_only: 1,
    y_only: 2,
    free: 3,
  },
  calculateCameraStartPos(spawn, level_w, level_h) {
    this.aabb = new physics.AABB(createVector(), createVector(width / this.zoom / 8, height / this.zoom / 8));
    this.target = player.aabb.get_centre();
    this.target.y = level_h / 2;
    this.aabb.set_centre(p5.Vector.sub(this.aabb.dims, this.target));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
  },
  transform() {
    scale(this.zoom * 8);
    translate(this.aabb.origin);
    circle(-this.aabb.origin.x+cam.aabb.dims.x/2, 0, 1);
    fill("yellow");
    circle(this.target.x, this.target.y, 1);
    circle(this.aabb.dims.x, this.aabb.dims.y, 1);
    circle(0, 0, 1);
    circle(level.w, 0, 1);
  },
  update(deltaT) {
    this.target = p5.Vector.add(player.aabb.get_centre(), createVector(15, 0));
    //this.target = (new physics.AABB(p5.Vector.mult(cam.aabb.dims, 0.5), createVector(level.w, level.h).sub(cam.aabb.dims))).snapPointTo(this.target);
    const maxSpeed = 40;
    let delta = p5.Vector.sub(this.aabb.dims, this.target).sub(this.aabb.get_centre());
    delta.y = 0;
    if(Math.abs(delta.x) < 0.3) {
      this.vel.x = 0;
    } else {
      this.vel.x = (delta.x > 0 ? 1 : -1) * Math.min(maxSpeed, Math.abs(delta.x) * 2.5);
    }
    
    this.aabb.origin.add(p5.Vector.mult(this.vel, deltaT));
  }  
};