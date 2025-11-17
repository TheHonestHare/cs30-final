const level_editor = {
  active: false,
  current_selection_start: undefined,
  selected_block: blockEnum.WOOD,
  render_selection() {
    if(!this.active) return;
    const mouse_grid_pos = (() => {
      [x, y] = mouse.get_mouse_grid_pos();
      return createVector(x, y);
    })();
    const select_start = this.current_selection_start === undefined ? mouse_grid_pos : this.current_selection_start;
    if(!between(mouse_grid_pos.x, -1, level.w) || !between(mouse_grid_pos.y, -1, level.h)) return;
    if(!between(select_start.x, -1, level.w) || !between(select_start.y, -1, level.h)) return;
    stroke(255, 255, 0, 255);
    fill(0, 0, 0, 0);
    strokeWeight((sin(millis()/250)+1.5)*0.1);
    rect(select_start.x, select_start.y, Math.max(1, mouse_grid_pos.x - select_start.x + 1), Math.max(1, mouse_grid_pos.y - select_start.y + 1));
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
    this.fill_selection_with_block(this.current_selection_start, mouse_grid_pos, is_left ? this.selected_block : blockEnum.AIR);
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