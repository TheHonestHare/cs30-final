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
    // a tileset is a predefined
    Tileset: class {
      // converts 8*up+4*left+2*right+1*down (up,left,right,down are booleans of if the material there DOESN'T match) to its position in a tileset image
      static TILE_SET_INDICES = [[1, 1], [1, 2], [2, 1], [2, 2], [0, 1], [0, 2], [3, 1], [3, 2], [1, 0], [1, 3], [2, 0], [2, 3], [0, 0], [0, 3], [3, 0], [3, 3]];
      // helper function to get the up material, left material, right material, and down material
      static getMaterialDirections(blockArray, blockArrayW, blockArrayH, index) {
        const x = index % blockArrayW;
        const y = Math.floor(index / blockArrayW);
        return [
          y === 0 ? null : blockArray[index-blockArrayW],              // up
          x === 0 ? null : blockArray[index-1],                        // left
          x+1 === blockArrayW ? null : blockArray[index+1],            // right
          y+1 === blockArrayH ? null : blockArray[index+blockArrayW],  // down
        ];
      }
      constructor(file_name) {
        this.image = loadImage("assets/" + file_name);
      }
      draw_to_dest(dest, x, y, width, height, mat_num, up_mat, left_mat, right_mat, down_mat, opacity=null) {
        dest.push();
        if(opacity !== null) dest.tint(255, opacity);
        // see TILE_SET_INDICES comment
        const [tilesetX, tilesetY] = material.Tileset.TILE_SET_INDICES[(up_mat!==mat_num)*8 + (left_mat!==mat_num)*4 + (right_mat!==mat_num)*2 + (down_mat!==mat_num)];
        dest.image(this.image, x, y, width, height, tilesetX * 8, tilesetY * 8, 8, 8);
        dest.pop();
      }
      draw(x, y, width, height, mat_num, up_mat, left_mat, right_mat, down_mat, opacity=null) {
        push();
        if(opacity !== null) tint(255, opacity);
        // see TILE_SET_INDICES comment
        const [tilesetX, tilesetY] = material.Tileset.TILE_SET_INDICES[(up_mat!==mat_num)*8 + (left_mat!==mat_num)*4 + (right_mat!==mat_num)*2 + (down_mat!==mat_num)];
        image(this.image, x, y, width, height, tilesetX * 8, tilesetY * 8, 8, 8);
        pop();
      }
    },
    blockProperties: class {
      constructor(solid, hurt_aabb, visible) {
        this.solid = solid;
        this.hurt_aabb = hurt_aabb;
        this.visible = visible;
      }
    },
    getBlockProperties(name) {
      switch(name) {
        case "air": {
          return new material.blockProperties(false, null, false);
        }
        case "left_spike": {
          return new material.blockProperties(false, new physics.AABB(createVector(0, 0), createVector(2/8, 8/8)), true);
        }
        case "up_spike": {
          return new material.blockProperties(false, new physics.AABB(createVector(0, 6/8), createVector(8/8, 2/8)), true);
        }
        case "down_spike": {
          return new material.blockProperties(false, new physics.AABB(createVector(0, 0/8), createVector(8/8, 2/8)), true);
        }
        case "right_spike": {
          return new material.blockProperties(false, new physics.AABB(createVector(6/8, 0), createVector(2/8, 8/8)), true);
        }
        default: {
          return new material.blockProperties(true, null, true);
        }
      }
    }

    
    
  };
})();