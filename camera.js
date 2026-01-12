const cam = {
  aabb: undefined,
  zoom: 5.0,
  target: undefined,
  vel: undefined,
  acc: undefined,
  followMode: undefined,
  modes: {
    none: 0,
    x_only: 1,
    y_only: 2,
    free: 3,
    fly: 4,
  },
  calculateCameraStartPos(followMode) {
    this.aabb = new physics.AABB(createVector(), createVector(width / this.zoom / 8, height / this.zoom / 8));
    this.target = new physics.AABB(p5.Vector.mult(this.aabb.dims, 0.5), createVector(level.w, level.h).sub(this.aabb.dims)).snapPointTo(player.aabb.get_centre().add(10, 0));
    this.aabb.set_centre(p5.Vector.sub(this.aabb.dims, this.target));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.followMode = followMode;
  },
  transform() {
    scale(this.zoom * 8);
    let translation = this.aabb.origin.copy();
    // uncomment to add a pixel-snapping camera
    // translation.mult(8);
    // translation.x = Math.floor(translation.x);
    // translation.y = Math.floor(translation.y);
    // translation.mult(1/8);
    translate(translation);
  },
  camera_debug_draw() {
    fill("yellow");
    circle(-this.aabb.origin.x+this.aabb.dims.x/2, -this.aabb.origin.y+this.aabb.dims.y/2, 1);
    circle(this.target.x, this.target.y, 1);
  },
  update(deltaT) {
    if(this.followMode === this.modes.fly) {
      this.target.x += 10 * deltaT * (player.keys.right - player.keys.left);
      this.target.y -= 10 * deltaT * (player.keys.up - player.keys.down);
    }
    const optimalTarget = player.aabb.get_centre().add(10, 0);
    this.target.x = [this.modes.fly, this.modes.none, this.modes.y_only].indexOf(this.followMode) !== -1 ? this.target.x : optimalTarget.x;
    this.target.y = [this.modes.fly, this.modes.none, this.modes.x_only].indexOf(this.followMode) !== -1 ? this.target.y : optimalTarget.y;
    this.target = new physics.AABB(p5.Vector.mult(this.aabb.dims, 0.5), createVector(level.w, level.h).sub(this.aabb.dims)).snapPointTo(this.target);

    const maxSpeed = 40;

    let delta = p5.Vector.sub(this.aabb.dims, this.target).sub(this.aabb.get_centre());
    if(Math.abs(delta.x) < 0.0001) {
      this.vel.x = 0; 
    } else {
      this.vel.x = (delta.x > 0 ? 1 : -1) * Math.min(maxSpeed, Math.abs(delta.x) * 2.5 * (this.followMode === this.modes.fly ? 10 : 1));
    }
    if(Math.abs(delta.y) < 0.0001) {
      this.vel.y = 0;
    } else {
      this.vel.y = (delta.y > 0 ? 1 : -1) * Math.min(maxSpeed, Math.abs(delta.y) * 2.5 * (this.followMode === this.modes.fly ? 10 : 1));
    }
    
    this.aabb.origin.add(p5.Vector.mult(this.vel, deltaT));
  },
  freecam_enable() {
    this.followMode = this.modes.fly;
  },
  freecam_disable() {
    this.followMode = this.modes.free;
    cam.calculateCameraStartPos(this.followMode);
  }
};