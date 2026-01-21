class Level {
  constructor(block_array, block_names, w, h, spawnx, spawny, scene_items, channels) {
    // deep copy array
    this.block_array = [...block_array];
    this.block_names = block_names;
    this.w = w;
    this.h = h;
    this.spawnPos = createVector(spawnx, spawny);


    this.scene_items = [];
    scene_items.forEach((val) => {
      this.scene_items.push(SceneItems.processEntry(val));
    });
    this.channels = channels;
    this.createLevelImage();
  }
  static fromObject(obj) {
    return new Level(obj.block_array, obj.block_names, obj.w, obj.h, obj.spawnx, obj.spawny, obj.scene_items, obj.channels);
  }
  draw() {
    image(this.img, 0, 0, this.w, this.h);
    this.scene_items.forEach((val) => {
      val.tick();
      val.draw();
    });
  }
  createLevelImage() {
    let img = createGraphics(this.w * 8, this.h * 8);
    img.noSmooth();
    for(let i = 0; i < this.w; i++) {
      for(let j = 0; j < this.h; j++) {
        const block_mat_index = this.block_array[j * this.w + i];
        const block_mat = this.block_names[block_mat_index];
        const block_props = material.getBlockProperties(block_mat);
        if(!block_props.visible) continue;   
        const mat = blockSprites.get(block_mat);
        if(mat instanceof material.Sprite) {
          mat.draw_to_dest(img, i * 8, j * 8, 8, 8);
        } else {
          mat.draw_to_dest(img, i * 8, j * 8, 8, 8, block_mat_index, ...material.Tileset.getMaterialDirections(this.block_array, this.w, this.h, j * this.w + i));
        }
      }
    }
    this.img = img;
  }
  setBlock(x, y, val) {
    if(!between(x, -1, level.w) || !between(y, -1, level.h)) return;
    level.block_array[y * level.w + x] = true;
    level.createLevelImage();
  }
  // helper function
  getBlockProperties(x, y) {
    return material.getBlockProperties(this.block_names[this.block_array[y * this.w + x]]);
  }

  reset() {
    for(let i = 0; i < this.channels.length; i++) {
      this.channels[i] = false;
    }
    for(const item of this.scene_items) {
      item.reset();
    }
  }

  toJSON() {
    return {
      block_array: this.block_array,
      block_names: this.block_names,
      w: this.w,
      h: this.h,
      spawnx: this.spawnPos.x,
      spawny: this.spawnPos.y,
      scene_items: this.scene_items,
    };
  }
}
const level_manager = {
  "level": 0,
  load() {
    level = this.getNthLevel(this.level);
    player.aabb.origin.x = level.spawnPos.x;
    player.aabb.origin.y = level.spawnPos.y;
    abilities.placed_array = [];
    cam.calculateCameraStartPos();

    // tutorial
    if(this.level === 1) {
      abilities.placed_array.push(abilities.Dash.try_to_place(createVector(18, 15)));
      abilities.placed_array.push(abilities.Dash.try_to_place(createVector(24, 13)));
      abilities.placed_array.push(abilities.Dash.try_to_place(createVector(24, 6)));
    }
  },
  getNthLevel(n) {
    console.log(`fetching level ${n}`);
    switch(n) {
      case 0:
        return Level.fromObject(level0);
      default: {
        return Level.fromObject(levelList[n-1]);
      }
    }
  }
};

let levelList = [];

function preloadLevelList() {
  levelList.push(loadJSON('./levels/level1.json'));
  levelList.push(loadJSON('./levels/level2.json'));
}