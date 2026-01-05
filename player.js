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
    this.executingDash = false;
    this.dashContext = {
      dash_direction: null,
      has_snapped_pos: false,
      time_of_activation: 0,
      deactivateCallback: null,
      originatingOrb: null,
    };

    this.sprite = sprite;
  }
  draw() {
    noSmooth();
    if(this.executingDash) {
      this.dashDraw();
      return;
    }
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

  physics_tick(deltaT) {
    if(this.executingDash) {
      this.dashPhysicsTick(deltaT);
      return;
    }
    if(this.executingJump && !this.keys.up) this.executingJump = false;
    if(this.keys.up && this.onGround && !this.executingJump) this.jump();
    if(this.keys.left === this.keys.right) {
      this.vel.x = 0;
    } else {
      this.vel.x = this.HORIZONTAL_SPEED * (this.keys.right ? 1 : -1);
    }
    
    this.applyGravity(deltaT);
    physics.do_collisions(this, deltaT);
    if(this.aabb.origin.y > level.h + 5) this.respawn();
  }

  dashActivate(deactivateCallback, originatingOrb) {
    this.dashContext.time_of_activation = millis();
    this.dashContext.original_player_pos = player.pos;
    this.dashContext.has_snapped_pos = false;
    this.dashContext.deactivateCallback = deactivateCallback;
    this.dashContext.originatingOrb = originatingOrb;
    this.vel = createVector(0, 0);
    this.executingDash = true;
  }
  dashDeactivate() {
    this.vel = createVector(0, 0);
    this.executingDash = false;
    this.dashContext.deactivateCallback();
  }

  dashPhysicsTick(deltaT) {
    const context = this.dashContext;
    const ability_duration = (millis() - context.time_of_activation) / 1000;
    if(ability_duration < 0.05) {
      return;
    }
    if(!context.has_snapped_pos) {
      this.aabb.set_centre(context.originatingOrb.activate_box.get_centre());

      context.dash_direction = createVector(0, -1);
      if(this.keys.down) context.dash_direction = createVector(0, 1);
      if(this.keys.up) context.dash_direction = createVector(0, -1);
      if(this.keys.left) context.dash_direction = createVector(-1, 0);
      if(this.keys.right) context.dash_direction = createVector(1, 0);
      this.vel = p5.Vector.mult(context.dash_direction, abilities.Dash.dash_speed);

      context.has_snapped_pos = true;
    }
    console.log("here");
    const completion_delta_t = ability_duration >= abilities.Dash.total_dash_length ? -(ability_duration - abilities.Dash.total_dash_length - deltaT) : deltaT;

    physics.do_collisions(this, completion_delta_t);

    // end ability
    if(ability_duration >= abilities.Dash.total_dash_length) {
      const remaining_delta_t = deltaT - completion_delta_t;
      this.dashDeactivate();
      physics.do_collisions(this, remaining_delta_t);
    }
  }

  dashDraw() {
    const context = this.dashContext;
    if(context.dash_direction === null) {
      // haven't started dashing yet
      this.sprite.draw(this.aabb.origin.x, this.aabb.origin.y, this.aabb.dims.x, this.aabb.dims.y);
    } else if(context.dash_direction.x !== 0) {
      // dashing horizontally
      this.sprite.draw(this.aabb.origin.x, this.aabb.origin.y + this.aabb.dims.y / 3, this.aabb.dims.x, this.aabb.dims.y / 3);
    } else {
      // dashing vertically
      this.sprite.draw(this.aabb.origin.x + this.aabb.dims.x / 3, this.aabb.origin.y, this.aabb.dims.x / 3, this.aabb.dims.y);
    }
  }

  respawn() {
    this.vel = createVector(0, 0);
    this.aabb.origin = level.scene_items[0].aabb.origin.copy();
    cam.calculateCameraStartPos(null, level.w, level.h);
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