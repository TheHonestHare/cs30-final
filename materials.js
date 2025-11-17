const material = (() => {
  return {
    SpriteSheet: class {
      constructor(file_name) {
        this.image = loadImage("assets/" + file_name);
      }
    },
    Sprite: class {
      constructor(sprite_sheet, sprite_sheet_x, sprite_sheet_y, sprite_width, sprite_height) {
        this.sprite_sheet = sprite_sheet;
        this.sprite_pos_x = sprite_sheet_x;
        this.sprite_pos_y = sprite_sheet_y;
        this.w = sprite_width;
        this.h = sprite_height;
      }
      draw_to_dest(dest, x, y, width, height, opacity=255) {
        dest.tint(255, opacity);
        dest.image(this.sprite_sheet.image, x, y, width, height, this.sprite_pos_x, this.sprite_pos_y, this.w, this.h);
        dest.tint(255, 255);
      }
      draw(x, y, width, height, opacity=255) {
        tint(255, opacity);
        image(this.sprite_sheet.image, x, y, width, height, this.sprite_pos_x, this.sprite_pos_y, this.w, this.h);
        tint(255, 255);
      }
    },
    
  };
})();