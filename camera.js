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
    // remove this if disabling WEBGL mode as it corrects the offset added by it
    translation.sub(p5.Vector.div(this.aabb.dims, 2));
    translate(translation);
  },
  transform_pixelated() {
    scale(8);
    let translation = this.aabb.origin.copy();
    
    
    translation.mult(8);
    translation.x = Math.floor(translation.x);
    translation.y = Math.floor(translation.y);
    translation.mult(1/8);
    const rounded_dims_x = (pixelatedBuffer.width-1) / 2 / 8;
    const rounded_dims_y = (pixelatedBuffer.height-1) / 2 / 8;
    // I have absolutely 0 clue why the 1/8s are required here but it broken without so I am keeping it in
    translation.sub(rounded_dims_x-1/8, rounded_dims_y-1/8);
    translate(translation);
  },
  camera_debug_draw() {
    fill("yellow");
    circle(-this.aabb.origin.x+this.aabb.dims.x/2, -this.aabb.origin.y+this.aabb.dims.y/2, 1);
    circle(this.target.x, this.target.y, 1);
    circle(-this.aabb.origin.x, -this.aabb.origin.y, 1);
    circle(-this.aabb.origin.x+this.aabb.dims.x, -this.aabb.origin.y+this.aabb.dims.y, 1);
  },
  update(deltaT) {
    if(this.followMode === this.modes.fly) {
      this.target.x += 10 * deltaT * (player.keys.right - player.keys.left);
      this.target.y -= 10 * deltaT * (player.keys.up - player.keys.down);
    }
    let optimalTarget = player.aabb.get_centre().add(10, 0);
    this.target.x = [this.modes.fly, this.modes.none, this.modes.y_only].indexOf(this.followMode) !== -1 ? this.target.x : optimalTarget.x;
    if([this.modes.fly, this.modes.none, this.modes.x_only].indexOf(this.followMode) === -1) {
      this.target.y = optimalTarget.y;
    }
    this.target = new physics.AABB(p5.Vector.mult(this.aabb.dims, 0.5), createVector(level.w, level.h).sub(this.aabb.dims)).snapPointTo(this.target);

    const maxSpeedX = 40;
    const maxSpeedY = 80;

    let delta = p5.Vector.sub(this.aabb.dims, this.target).sub(this.aabb.get_centre());
    if(Math.abs(delta.x) < 0.0001) {
      this.vel.x = 0; 
    } else {
      this.vel.x = (delta.x > 0 ? 1 : -1) * Math.min(maxSpeedX, Math.abs(delta.x) * 2.5 * (this.followMode === this.modes.fly ? 10 : 1));
    }
    if(Math.abs(delta.y) < 0.0001) {
      this.vel.y = 0;
    } else {
      this.vel.y = (delta.y > 0 ? 1 : -1) * Math.min(maxSpeedY, Math.abs(delta.y) * 2.5 * (this.followMode === this.modes.fly ? 10 : 1.5));
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