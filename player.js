class Player {
  constructor(x, y, sprite) {
    this.JUMP_HEIGHT = 10;
    this.TIME_TO_JUMP_APEX = 0.5;
    this.APEX_HANG_MODIFIER = 0.2;
    this.APEX_THRESHOLD = 0.4;
    this.HORIZONTAL_SPEED = 10;
    
    this.aabb = new physics.AABB(createVector(x, y), createVector(2, 2));
    this.vel = createVector(0, 1);
    this.accel = createVector(0, 16);
    this.maxSpeed = createVector(10, 30);

    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.onGround = false;
    this.executingJump = false;

    // abilities will temporarily set this to make their custom effects
    this.physics_tick = Player.default_physics_tick;
    this.draw = Player.default_draw;

    this.sprite = sprite;
  }
  static default_draw() {
    noSmooth();
    this.sprite.draw(this.aabb.origin.x, this.aabb.origin.y, this.aabb.dims.x, this.aabb.dims.y);
  }

  // code derived from Sebastian Lague https://www.youtube.com/watch?v=PlT44xr0iW0
  applyGravity(deltaT) {
    const GRAVITY_EARLY_JUMP_END_MODIFIER = 3;
    const is_at_apex = Math.abs(this.vel.y) < this.APEX_THRESHOLD;
    const gravity = 2 * this.JUMP_HEIGHT / (this.TIME_TO_JUMP_APEX * this.TIME_TO_JUMP_APEX) * (is_at_apex ? this.APEX_HANG_MODIFIER : 1);
    this.vel.add(createVector(0, gravity).mult(deltaT)); 
    if(!this.executingJump && this.vel.y < 0) this.vel.y *= 0.30;
  }

  jump() {
    this.executingJump = true;
    this.vel.y = -2 * this.JUMP_HEIGHT / this.TIME_TO_JUMP_APEX;
    console.log("jump");
  }

  static default_physics_tick(deltaT) {
    if(this.executingJump && !this.keys.up) this.executingJump = false;
    if(this.keys.up && this.onGround && !this.executingJump) this.jump();
    if(this.keys.left === this.keys.right) {
      this.vel.x = 0;
    } else {
      this.vel.x = this.HORIZONTAL_SPEED * (this.keys.right ? 1 : -1);
    }
    
    this.applyGravity(deltaT);
    physics.do_collisions(player, deltaT);
    if(this.aabb.origin.y > level.h + 5) this.respawn();
  }

  respawn() {
    player.vel = createVector(0, 0);
    player.aabb.origin = level.scene_items[0].aabb.origin.copy();
  }
  
  process_input() {
    this.keys.up = keyIsDown("W".charCodeAt(0));

    this.keys.down = keyIsDown("S".charCodeAt(0));
    this.keys.left = keyIsDown("A".charCodeAt(0));
    this.keys.right = keyIsDown("D".charCodeAt(0));

    if(keyIsDown(" ".charCodeAt(0))) {
      console.log(`x: ${this.aabb.origin.x}, y: ${this.aabb.origin.y}, vel.x: ${this.vel.x}, vel.y: ${this.vel.y}`);
    }

  }
}