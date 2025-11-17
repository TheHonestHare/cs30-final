class Level {
  constructor(block_array, w, h, spawnx, spawny, scene_items) {
    // deep copy array
    this.block_array = [...block_array];
    this.w = w;
    this.h = h;
    this.spawnPos = createVector(spawnx, spawny);


    this.scene_items = [];
    scene_items.forEach((val) => {
      this.scene_items.push(SceneItems.processEntry(val));
    });
    this.createLevelImage();
  }
  static fromObject(obj) {
    return new Level(obj.block_array, obj.w, obj.h, obj.spawnx, obj.spawny, obj.scene_items);
  }
  draw() {
    noSmooth();
    image(this.img, 0, 0, this.w, this.h);
    this.scene_items.forEach((val) => {
      val.tick();
      val.draw();
    });
  }
  createLevelImage() {
    let img = createGraphics(this.w * 8, this.h * 8);
    for(let i = 0; i < this.w; i++) {
      for(let j = 0; j < this.h; j++) {
        const block_mat = this.block_array[j * this.w + i];
        if(block_mat === blockEnum.AIR) continue;   
        blockSprites[block_mat-1].draw_to_dest(img, i * 8, j * 8, 8, 8);
      }
    }
    this.img = img;
  }
  setBlock(x, y, val) {
    if(!between(x, -1, level.w) || !between(y, -1, level.h)) return;
    level.block_array[y * level.w + x] = true;
    level.createLevelImage();
  }
}
const blockEnum = {
  AIR: 0,
  WOOD: 1,
};
const level_manager = {
  "level": 0,
  "load": (n) => {
    switch(n) {
      case 0: 
        return Level.fromObject(level0);
    }
  }
};

