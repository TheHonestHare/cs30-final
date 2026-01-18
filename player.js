class Player {
  constructor(x, y, sprite) {
    this.JUMP_HEIGHT = 6;
    this.TIME_TO_JUMP_APEX = 0.3;
    this.APEX_HANG_MODIFIER = 0.5;
    this.APEX_THRESHOLD = 0.4;
    this.HORIZONTAL_SPEED = 12;
    this.MAX_FALL_SPEED = 40;
    this.GROUND_ACCEL = 150;
    this.AIR_DEFRICTION_FRACTOR = 0.75;
    this.GROUND_DECEL = 60;
    
    this.aabb = new physics.AABB(createVector(x, y), createVector(2, 2));
    this.vel = createVector(0, 1);
    this.accel = createVector(0, 16);
    this.maxSpeed = createVector(10, 30);

    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      activate: false,
    };

    this.onGround = false;
    this.executingJump = false;
    this.decelerateJump = false;
    this.executingDash = false;
    this.executingClimb = false;
    this.ignoreInput = false;
    this.dashContext = {
      dash_direction: null,
      has_snapped_pos: false,
      time_of_activation: 0,
      deactivateCallback: null,
      originatingOrb: null,
    };
    this.climbContext = {
      time_of_activation: 0,
      climbObject: null,
      deactivateCallback: null,
      storedSpeed: null,
      flingGraceTime: 0,
    };

    this.sprite = sprite;
  }
  draw() {
    if(this.executingDash) {
      this.dashDraw();
      return;
    }
    const new_origin = pixelAlignVector(this.aabb.origin);
    this.sprite.draw(new_origin.x, new_origin.y, this.aabb.dims.x, this.aabb.dims.y);
  }

  // code derived from Sebastian Lague https://www.youtube.com/watch?v=PlT44xr0iW0
  applyGravity(deltaT) {
    const GRAVITY_EARLY_JUMP_END_MODIFIER = 3;
    const is_at_apex = Math.abs(this.vel.y) < this.APEX_THRESHOLD;
    const gravity = 2 * this.JUMP_HEIGHT / (this.TIME_TO_JUMP_APEX * this.TIME_TO_JUMP_APEX) * (is_at_apex ? this.APEX_HANG_MODIFIER : 1);
    this.vel.add(createVector(0, gravity).mult(deltaT)); 
    if(this.decelerateJump && this.executingJump) {
      if(this.vel.y < 0) {
        this.vel.y *= 0.30;
      } else {
        this.decelerateJump = false;
      }
    }
    this.vel.y = clamp(this.vel.y, -Infinity, this.MAX_FALL_SPEED);
  }

  jump() {
    this.executingJump = true;
    this.decelerateJump = false;
    this.vel.y = -2 * this.JUMP_HEIGHT / this.TIME_TO_JUMP_APEX;
    console.log("jump");
  }

  physics_tick(deltaT) {
    if(this.executingDash) {
      this.dashPhysicsTick(deltaT);
      return;
    } else if(this.executingClimb) {
      this.climbPhysicsTick(deltaT);
      return;
    } else if(this.onGround) {
      this.vel.y = 0;
      this.executingJump = false;
    } else {
      this.applyGravity(deltaT);
    }
    
    if(!this.ignoreInput) {
      if(this.executingJump && !this.keys.up) this.decelerateJump = true;
      if(this.keys.up && this.onGround) this.jump();
      
      const x_dir = this.keys.right - this.keys.left;
      if(Math.abs(this.vel.x) <= this.HORIZONTAL_SPEED) {
        // accelerating player to desired vel
        this.vel.x = approach(this.vel.x, this.HORIZONTAL_SPEED * x_dir, this.GROUND_ACCEL * (this.onGround ? 1 : this.AIR_DEFRICTION_FRACTOR) * deltaT);
      } else {
        // decelerating player to desired vel
        this.vel.x = approach(this.vel.x, this.HORIZONTAL_SPEED * x_dir, this.GROUND_DECEL * (this.onGround ? 1 : this.AIR_DEFRICTION_FRACTOR) * deltaT);
      }
      
      
    }
    
    
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
    this.vel.setMag(this.HORIZONTAL_SPEED);
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
    const new_origin = pixelAlignVector(this.aabb.origin);
    if(context.dash_direction === null) {
      // haven't started dashing yet
      this.sprite.draw(new_origin.x, new_origin.y, this.aabb.dims.x, this.aabb.dims.y);
    } else if(context.dash_direction.x !== 0) {
      // dashing horizontally
      this.sprite.draw(new_origin.x, new_origin.y + this.aabb.dims.y / 3, this.aabb.dims.x, this.aabb.dims.y / 3);
    } else {
      // dashing vertically
      this.sprite.draw(new_origin.x + this.aabb.dims.x / 3, new_origin.y, this.aabb.dims.x / 3, this.aabb.dims.y);
    }
  }

  climbActivate(deactivateCallback, climbObject) {
    this.executingJump = false;
    this.climbContext.climbObject = climbObject;
    this.climbContext.deactivateCallback = deactivateCallback;
    this.executingClimb = true;
    // snapping player
    switch(climbObject.orient) {
      case abilities.Climb.directions.DOWN: {
        this.aabb.origin.y = climbObject.activate_box.origin.y - 1;
        break;
      }
      case abilities.Climb.directions.UP: {
        this.aabb.origin.y = climbObject.activate_box.origin.y;
        break;
      }
      case abilities.Climb.directions.LEFT: {
        this.aabb.origin.x = climbObject.activate_box.origin.x;
        break;
      }
      case abilities.Climb.directions.RIGHT: {
        this.aabb.origin.x = climbObject.activate_box.origin.x - 1;
        break;
      }
    }
    this.vel = createVector(0,0);
  }

  climbDeactivate() {
    const context = this.climbContext;
    if(context.storedSpeed !== null) {
      if(context.climbObject.isHorizontal()) {
        this.vel.x = context.storedSpeed;
        console.log(this.vel.x) 
      } else {
        this.vel.y = context.storedSpeed;
      }
    }
    this.executingClimb = false;
    context.climbObject.done = true;
    context.deactivateCallback();
    context.flingGraceTime = 0;
    context.storedSpeed = null;
  }

  climbPhysicsTick(deltaT) {
    const context = this.climbContext;
    context.flingGraceTime -= deltaT;

    if(context.flingGraceTime <= 0) {
      context.flingGraceTime = 0;
      context.storedSpeed = null;
      console.log("reset")
    }
    if(!this.keys.activate) {
      this.climbDeactivate();
      return;
    }

    if(context.climbObject.isHorizontal()) {
      // fling
      if(context.climbObject.orient === abilities.Climb.directions.DOWN && this.keys.up) {
        this.climbDeactivate();
        this.jump();
        return;
      }
      // normal movement
      this.vel.y = 0;
      if(this.keys.left === this.keys.right) {
        this.vel.x = 0;
      } else {
        const x_dir = this.keys.right-this.keys.left;
        player.vel.x = approach(player.vel.x , abilities.Climb.MAX_SPEED_H * x_dir, abilities.Climb.HORIZONTAL_RAMPUP * deltaT);
      }
    } else {

      // fling
      if(context.climbObject.orient === abilities.Climb.directions.LEFT && this.keys.right) {
        this.climbDeactivate();
        this.vel.x = this.HORIZONTAL_SPEED * 1.5;
        return;
      } else if(context.climbObject.orient === abilities.Climb.directions.RIGHT && this.keys.left) {
        this.climbDeactivate();
        this.vel.x = -this.HORIZONTAL_SPEED * 1.5;
        return;
      }
      
      // normal movement
      this.vel.x = 0;
      if(this.keys.up === this.keys.down) {
        this.vel.y = 0;
      } else {
        const y_dir = this.keys.down-this.keys.up;
        player.vel.y = approach(Math.max(Math.abs(player.vel.y), this.HORIZONTAL_SPEED)*y_dir , abilities.Climb.MAX_SPEED_V*y_dir, abilities.Climb.VERTICAL_RAMPUP * deltaT);
      }
    }
    
    // do physics move
    physics.do_collisions(this, deltaT);

    // stop the player from leaving ability
    if(context.climbObject.isHorizontal()) {
      let went_out;
      if(this.aabb.origin.x > context.climbObject.activate_box.origin.x + context.climbObject.activate_box.dims.x) {
        went_out = true;
        this.aabb.origin.x = context.climbObject.activate_box.origin.x + context.climbObject.activate_box.dims.x;
      } else if(this.aabb.origin.x + this.aabb.dims.x < context.climbObject.activate_box.origin.x) {
        went_out = true;
        this.aabb.origin.x = -this.aabb.dims.x + context.climbObject.activate_box.origin.x;
      }
      if(went_out) {
        if(context.storedSpeed === null) {
          context.storedSpeed = this.vel.x;
          context.flingGraceTime = abilities.Climb.FLING_GRACE_TIME;
        }
        this.vel.x = 0;
      }
    } else {
      let went_out = false;
      if(this.aabb.origin.y > context.climbObject.activate_box.origin.y + context.climbObject.activate_box.dims.y) {
        went_out = true;
        this.aabb.origin.y = context.climbObject.activate_box.origin.y + context.climbObject.activate_box.dims.y;
      } else if(this.aabb.origin.y + this.aabb.dims.y < context.climbObject.activate_box.origin.y) {
        went_out = true;
        this.aabb.origin.y = -this.aabb.dims.y + context.climbObject.activate_box.origin.y;
      }
      if(went_out) {
        if(context.storedSpeed === null) {
          context.storedSpeed = this.vel.y;
          context.flingGraceTime = abilities.Climb.FLING_GRACE_TIME;
        }
        this.vel.y = 0;
      }
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
    this.keys.activate = keyIsDown("J".charCodeAt(0));

    if(keyIsDown(" ".charCodeAt(0))) {
      console.log(`x: ${this.aabb.origin.x}, y: ${this.aabb.origin.y}, vel.x: ${this.vel.x}, vel.y: ${this.vel.y}`);
    }

  }
}