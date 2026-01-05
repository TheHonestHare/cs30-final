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
        player.dashActivate(abilities.Dash.deactivate(this), this);
        return true;
      }
      static deactivate(context) {
        return () => {
          console.log("player finished dashing");
          context.done = true;
        };
      }
      physics_tick(deltaT) {
        return this.done;
      }
      draw(state) {
        // TODO: add animations
        if(state === abilities.draw_states.INACTIVE) return;
        abilities.Dash.idle_sprite.draw(this.grid_pos.x, this.grid_pos.y, 1, 1, state === abilities.draw_states.PRIMED ? 128 : 255);
      }
    }

  };
})();