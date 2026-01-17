const abilities = (() => {
  return {
    placed_array: [],
    index: null,
    current_ability_still_running: false,
    begin_grid_pos: undefined,
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
        strokeWeight((sin(millis()/250)+1.5)*2);
        rect(x, y, 1, 1);
      },
      onLeftClick() {
        if(!this.active) return;
        [x,y] = mouse.get_mouse_grid_pos();
        const click_pos = createVector(x, y);
        const maybe_ability = this.selected_ability.try_to_place(click_pos);
        if(maybe_ability === null) {
          this.begin_grid_pos = click_pos;
          return;
        }
        abilities.placed_array.push(maybe_ability);
      },
      onLeftRelease() {
        if(!this.active || this.begin_grid_pos === undefined) return;
        [x,y] = mouse.get_mouse_grid_pos();
        const end_pos = createVector(x,y);
        const maybe_ability = this.selected_ability.try_to_drag_place(this.begin_grid_pos, end_pos);
        this.begin_grid_pos = undefined;
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
      this.Climb.preload();
      this.placer.selected_ability = this.Climb;
    },

    draw() {
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
    // static try_to_place(click_grid_pos) ?Ability
    // static try_to_drag_place(begin_grid_pos, end_grid_pos) ?Ability
    // would_click_remove(click_pos) bool
    
    Dash: class {
      static idle_sprite;
      static lightning_sprite;

      static dash_speed = 50;
      static total_dash_length = 0.2;
      static preload() {
        this.idle_sprite = new material.Sprite(miscSpriteSheet, 0, 8, 8, 8);
        this.lightning_sprite = new material.Sprite(miscSpriteSheet, 0, 16, 32, 8);
      }
      static try_to_place(click_grid_pos) {
        return new this(click_grid_pos.x, click_grid_pos.y);
      }
      static try_to_drag_place(begin_grid_pos, end_grid_pos) {
        return null;
      }

      constructor(x, y) {
        const padding = 0.75;
        this.done = false;
        this.grid_pos = createVector(x, y);
        this.activate_box = new physics.AABB(createVector(x, y).sub(padding, padding), createVector(1, 1).add(2 * padding, 2 * padding));
      }
      would_click_remove(click_grid_pos) {
        return click_grid_pos.x === this.grid_pos.x && click_grid_pos.y === this.grid_pos.y;
      }
      activate() {
        if(!this.activate_box.is_overlapping_aabb(player.aabb)) return false;

        console.log("player is dashing");
        this.done = false;
        player.dashActivate(abilities.Dash.deactivate(this), this);
        return true;
      }
      static deactivate(context) {
        return () => {
          console.log("player finished dashing");
          context.done = true;
        };
      }
      deactivate() {
        Dash.deactivate(this)();
      }
      physics_tick(deltaT) {
        return !this.done;
      }
      draw(state) {
        // TODO: add animations
        if(state === abilities.draw_states.INACTIVE) return;
        abilities.Dash.idle_sprite.draw(this.grid_pos.x, this.grid_pos.y, 1, 1, state === abilities.draw_states.PRIMED ? 128 : 255);
      }
    },
    Climb: class {
      static sprites = [];
      static max_speed = 50;
      static preload() {
        abilities.Climb.sprites.push(new material.Sprite(miscSpriteSheet, 0, 32, 8, 8)); // DOWN
        abilities.Climb.sprites.push(new material.Sprite(miscSpriteSheet, 8, 32, 8, 8)); // UP
        abilities.Climb.sprites.push(new material.Sprite(miscSpriteSheet, 16, 32, 8, 8)); // LEFT
        abilities.Climb.sprites.push(new material.Sprite(miscSpriteSheet, 24, 32, 8, 8)); // RIGHT
      }
      static try_to_place(click_grid_pos) {
        return null;
      }
      static directions = {
        DOWN: 0,
        UP: 1,
        LEFT: 2,
        RIGHT: 3
      };
      static try_to_drag_place(begin_grid_pos, end_grid_pos) {
        let length;
        let orient;
        let dir;
        if(begin_grid_pos.x === end_grid_pos.x && begin_grid_pos.y === end_grid_pos.y) return null; // prevent single block climb
        if(level.block_array[begin_grid_pos.y * level.w + begin_grid_pos.x]) return null; // if starting in block, return
        if(Math.abs(end_grid_pos.x - begin_grid_pos.x) >= Math.abs(end_grid_pos.y - begin_grid_pos.y)) {
          // x direction

          if(level.block_array[(begin_grid_pos.y + 1) * level.w + begin_grid_pos.x]) {
            orient = abilities.Climb.directions.DOWN;
          } else if(level.block_array[(begin_grid_pos.y-1) * level.w + begin_grid_pos.x]) {
            orient = abilities.Climb.directions.UP;
          } else {
            // no block detected either up or down, failure
            return null;
          }
          dir = end_grid_pos.x > begin_grid_pos.x ? 1 : -1;
          for(length = 1; length <= Math.abs(end_grid_pos.x - begin_grid_pos.x); length++) {
            const curr_block_index = begin_grid_pos.y * level.w + begin_grid_pos.x + length*dir;
            const below_block_index = curr_block_index + (orient === abilities.Climb.directions.DOWN ? 1 : -1) * level.w;
            if(level.block_array[curr_block_index]) break;
            if(level.block_array[below_block_index]) continue;

            // TODO: allow 1 block climb?
            if(length === 1) return null;
            break;
          }
        } else {
          // y direction
          if(level.block_array[begin_grid_pos.y * level.w + begin_grid_pos.x-1]) {
            orient = abilities.Climb.directions.LEFT;
          } else if(level.block_array[begin_grid_pos.y * level.w + begin_grid_pos.x+1]) {
            orient = abilities.Climb.directions.RIGHT;
          } else {
            // no block detected either up or down, failure
            return null;
          }
          dir = end_grid_pos.y > begin_grid_pos.y ? 1 : -1;
          for(length = 1; length <= Math.abs(end_grid_pos.y - begin_grid_pos.y); length++) {
            const curr_block_index = (begin_grid_pos.y+length*dir) * level.w + begin_grid_pos.x;
            const below_block_index =  curr_block_index + (orient === abilities.Climb.directions.RIGHT ? 1 : -1);
            if(level.block_array[curr_block_index]) break;
            if(level.block_array[below_block_index]) continue;

            // TODO: allow 1 block climb?
            if(length === 1) return null;
            break;
          }
        }
        return new this(begin_grid_pos.x, begin_grid_pos.y, orient, length, dir);
      }

      // orient is of abilities.Climb.directions
      constructor(begin_x, begin_y, orient, length, dir) {
        this.begin_x = begin_x;
        this.begin_y = begin_y;
        this.orient = orient;
        this.length = length;
        this.dir = dir;
        const x_expanding = this.isHorizontal() ? 1 : 0;
        const y_expanding = !x_expanding;
        const left_most = Math.min(begin_x, begin_x + length*dir*x_expanding);
        const top_most = Math.min(begin_y, begin_y + length*dir*y_expanding + 1);
        const dim_x = Math.max(1, length * x_expanding);
        const dim_y = Math.max(1, length * y_expanding);
        this.activate_box = new physics.AABB(createVector(left_most, top_most), createVector(dim_x, dim_y));
        this.done = false;
      }

      isHorizontal() {
        return this.orient === abilities.Climb.directions.UP || this.orient === abilities.Climb.directions.DOWN;
      }
      
      draw(state) {
        if(state === abilities.draw_states.INACTIVE) return;
        const sprite_to_use = abilities.Climb.sprites[this.orient];
        let x_increment;
        let y_increment;
        if(this.isHorizontal()) {
          x_increment = this.dir;
          y_increment = 0;
        } else {
          x_increment = 0;
          y_increment = this.dir;
        }
        for(let i = 0; i < this.length; i++) {
          sprite_to_use.draw(this.begin_x + x_increment*i, this.begin_y+y_increment*i, 1, 1, state === abilities.draw_states.PRIMED ? 128 : 255);
        }
      }
      activate() {
        if(!this.activate_box.is_overlapping_aabb(player.aabb)) return false;
        console.log("player is climbing");
        this.done = false;
        player.climbActivate(()=>{}, this);
        return true;
      }
      physics_tick(deltaT) {
        if(this.done) {
          console.log("player finished climbing");
        }
        return !this.done;
      }
    }

  };
})();