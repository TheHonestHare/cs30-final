const mouse = (() => {
  return {
    get_mouse_grid_pos() {
      // p5js is dumb and doesn't translate mouseX and mouseY automatically
      const mousePosFloorX = floor((mouseX - cam.pos.x) / (cam.zoom * 8));
      const mousePosFloorY = floor((mouseY - cam.pos.y) / (cam.zoom * 8));
      return [mousePosFloorX, mousePosFloorY];
    },
    onLeftClick() {
      [x, y] = mouse.get_mouse_grid_pos();
      level.setBlock(x, y, true);
    },
    onRightClick() {
      [x, y] = mouse.get_mouse_grid_pos();
      level.setBlock(x, y, false);
    }
  };
})();