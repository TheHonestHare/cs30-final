const level_editor = {
  active: false,
  current_selection_start: undefined,
  placing: "blocks",
  selected_index: 1,
  render_selection() {
    if(!this.active) return;
    const mouse_grid_pos = (() => {
      [x, y] = mouse.get_mouse_grid_pos();
      return createVector(x, y);
    })();
    const select_start = this.current_selection_start === undefined ? mouse_grid_pos : this.current_selection_start;
    if(!between(mouse_grid_pos.x, -1, level.w) || !between(mouse_grid_pos.y, -1, level.h)) return;
    if(!between(select_start.x, -1, level.w) || !between(select_start.y, -1, level.h)) return;

    const selection_width = Math.max(1, mouse_grid_pos.x - select_start.x + 1);
    const selection_height = Math.max(1, mouse_grid_pos.y - select_start.y + 1); 

    // display the centre blocks if the left mouse
    if((!mouseIsPressed || mouseButton === LEFT) && this.placing === "blocks") {
      const block_sprite = blockSprites.get(level.block_names[this.selected_index]);
      for(let x = 0; x < selection_width; x++) {
        for(let y = 0; y < selection_height; y++) {
          if(block_sprite instanceof material.Sprite) {
            block_sprite.draw(select_start.x + x, select_start.y + y, 1, 1, 128);
          } else {
            block_sprite.draw(select_start.x + x, select_start.y + y, 1, 1, this.selected_index, this.selected_index, this.selected_index, this.selected_index, this.selected_index, 128);
          }
        }
      }
    }

    stroke(255, 255, 0, 255);
    fill(0, 0, 0, 0);
    strokeWeight((sin(millis()/250)+1.5)*2);
    rect(select_start.x, select_start.y, selection_width, selection_height);
    noStroke();
  },
  onMouseClick(is_left) {
    if(!this.active) return;
    this.current_selection_start = (() => {
      [x, y] = mouse.get_mouse_grid_pos();
      return createVector(x, y);
    })();
  },
  onMouseRelease(is_left) {
    if(!this.active) return;
    const mouse_grid_pos = (() => {
      [x, y] = mouse.get_mouse_grid_pos();
      return createVector(x, y);
    })();
    if(this.placing === "blocks") {
      const block_index = is_left ? this.selected_index : 0;
      this.fill_selection_with_block(this.current_selection_start, mouse_grid_pos, block_index); 
    } else if(this.placing === "scene_items") {
      level.scene_items.push(SceneItems.getNthItem(this.selected_index).createDefaultObj(x, y));
    }
    this.current_selection_start = undefined;
    
  },
  fill_selection_with_block(topleft, botright, material_index) {
    if(!between(topleft.x, -1, level.w) || !between(topleft.y, -1, level.h)) return;
    if(!between(botright.x, -1, level.w) || !between(botright.y, -1, level.h)) return;

    for(let x = topleft.x; x < botright.x+1; x++) {
      for(let y = topleft.y; y < botright.y+1; y++) {
        level.block_array[y * level.w + x] = material_index;
      }
    }
    level.createLevelImage();
  }
};