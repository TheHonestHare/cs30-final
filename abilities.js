const abilities = (() => {
  return {
    placed_array: [],
    index: null,
    current_ability_still_running: false,
    draw_states: {
      INACTIVE: 0,
      PRIMED: 1,
      ACTIVE: 2,
      ICON: 3,
    },
    placer: {
      active: false,
      selected_ability: undefined,

      highlight_grid_pos() {
        if(!this.active) return;
        [x, y] = mouse.get_mouse_grid_pos();
        if(!between(x, -1, level.w) || !between(y, -1, level.h)) return;
        fill(0, 0, 0, 0);
        stroke('red');
        strokeWeight((sin(millis()/250)+1.5)*0.1);
        rect(x, y, 1, 1);
      },
      onLeftClick() {
        if(!this.active) return;
        [x,y] = mouse.get_mouse_grid_pos();
        const maybe_ability = this.selected_ability.try_to_place(createVector(x, y));
        if(maybe_ability === null) return;
        abilities.placed_array.push(maybe_ability);
      },
      exit() {
        this.active = false;
        abilities.index = null;
      },
      enter() {
        this.active = true;
        abilities.index = null;
        abilities.current_ability_still_running = false;
      }
    },

    preload() {
      this.Dash.preload();
      this.placer.selected_ability = this.Dash;
    },

    draw() {
      noSmooth();
      if(this.placer.active) {
        this.placed_array.forEach((placed) => {
          placed.draw(abilities.draw_states.ICON);
        });
        return;
      }
      if(this.index === null) {
        if(this.placed_array.length > 0) this.placed_array[0].draw(abilities.draw_states.PRIMED);
        return;
      }

      for(let i = 0; i < this.placed_array.length; i++) {
        let draw_state = abilities.draw_states.INACTIVE;
        if(i - this.index === 1) draw_state = abilities.draw_states.PRIMED;
        if(i === this.index && abilities.current_ability_still_running) draw_state = abilities.draw_states.ACTIVE;
        this.placed_array[i].draw(draw_state);
      }
    },
    activate() {
      if(this.placer.active) return;
      if(this.index === null) {
        if(this.placed_array.length === 0) return;
        this.index = 0;
        this.current_ability_still_running = this.placed_array[this.index].activate();
        return;
      }
      if(this.index >= this.placed_array.length-1) {
        this.current_ability_still_running = false;
        return;
      }
      if(this.current_ability_still_running) this.placed_array[this.index].deactivate();
      this.index += 1;
      this.current_ability_still_running = this.placed_array[this.index].activate();
    },

    physics_tick(deltaT) {
      if(this.current_ability_still_running) {
        this.current_ability_still_running = this.placed_array[this.index].physics_tick(deltaT);
      };
    },
    // TODO: make this some sort of parent class
    // each ability type should have the following functions:
    // activate() bool     (returns false if ability failed to activate)
    // draw(state)
    // static preload()
    // physics_tick(deltaT) bool   (returns true if the ability is still going)
    // static try_to_place(click_pos) ?Ability
    // would_click_remove(click_pos) bool
    
    Dash: class {
      static idle_sprite;
      static lightning_sprite;

      static dash_speed = 60;
      static total_dash_length = 0.2;
      static preload() {
        this.idle_sprite = new material.Sprite(miscSpriteSheet, 0, 8, 8, 8);
        this.lightning_sprite = new material.Sprite(miscSpriteSheet, 0, 16, 32, 8);
      }
      static try_to_place(click_grid_pos) {
        return new this(click_grid_pos.x, click_grid_pos.y);
      }

      constructor(x, y) {
        const padding = 0.75;
        this.time_of_activation = null;
        this.original_player_pos = null;
        this.has_snapped_pos = null;
        this.dash_direction = null;
        
        this.grid_pos = createVector(x, y);
        this.activate_box = new physics.AABB(createVector(x, y).sub(padding, padding), createVector(1, 1).add(2 * padding, 2 * padding));
      }
      would_click_remove(click_grid_pos) {
        return click_grid_pos.x === this.x && click_grid_pos.y === this.y;
      }
      activate() {
        if(!this.activate_box.is_overlapping_aabb(player.aabb)) return false;

        console.log("player is dashing");

        this.time_of_activation = millis();
        this.original_player_pos = player.pos;
        this.has_snapped_pos = false;

        player.vel = createVector(0, 0);
        player.physics_tick = abilities.Dash.player_physics_tick(this);
        player.draw = abilities.Dash.player_draw(this);
        return true;
      }
      deactivate() {
        console.log("player finished dashing");
        player.draw = Player.default_draw;
        player.physics_tick = Player.default_physics_tick;
        player.vel = createVector(0, 0);
      }
      physics_tick(deltaT) {
        if((millis() - this.time_of_activation) / 1000 < abilities.Dash.total_dash_length) return true;
        // dash is finished;
        this.deactivate();
        return false;
      }
      draw(state) {
        // TODO: add animations
        if(state === abilities.draw_states.INACTIVE) return;
        abilities.Dash.idle_sprite.draw(this.grid_pos.x, this.grid_pos.y, 1, 1, state === abilities.draw_states.PRIMED ? 128 : 255);
      }
      static player_physics_tick(context) {
        return function(deltaT) {
          const ability_duration = (millis() - context.time_of_activation) / 1000;


          if(ability_duration < 0.05) {
            return;
          }
          if(!context.has_snapped_pos) {
            this.aabb.set_centre(context.activate_box.get_centre());

            context.dash_direction = createVector(0, -1);
            if(this.keys.down) context.dash_direction = createVector(0, 1);
            if(this.keys.up) context.dash_direction = createVector(0, -1);
            if(this.keys.left) context.dash_direction = createVector(-1, 0);
            if(this.keys.right) context.dash_direction = createVector(1, 0);
            this.vel = p5.Vector.mult(context.dash_direction, abilities.Dash.dash_speed);

            context.has_snapped_pos = true;
          }
          const completion_delta_t = ability_duration >= abilities.Dash.total_dash_length ? -(ability_duration - abilities.Dash.total_dash_length - deltaT) : deltaT;

          physics.do_collisions(player, completion_delta_t);

          // end ability
          if(ability_duration >= abilities.Dash.total_dash_length) {
            const remaining_delta_t = deltaT - completion_delta_t;
            context.deactivate();
            physics.do_collisions(player, remaining_delta_t);
          }
        };
      }
      static player_draw(context) {
        return function() {
          noSmooth();
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
          
          smooth();
        };
      }
    }

  };
})();