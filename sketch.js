/*
Dracen Lim
Computer Science 30
Grid based game

This is a platformer where you need to place down abilities in order to use them

Controls:
L: toggle level editor. Use arrows to change the selection, left click to place, right click to delete
U: when at the signal tower, undo the last ability placed
   when in the level editor, undo the last scene object placed (eg bottles, signal towers)
   when not at the signal tower, respawns the player
J: If by the signal tower, enter/exit the signal tower. Otherwise, activates the next ability in the sequence. There is currently 2 abilities
  DASH:
   J + WASD will cause the player to dash in the respective direction if they are touching a dash orb
  CLIMB:
    holding J will allow you to move along the climb at incredible speeds. Releasing J or pressing the button that is opposite of the wall/floor will send the player flying
  Pressing J multiple times will move through the ability sequence.
Dragging/clicking left click (at signal tower) places either a climb (ONLY NEXT TO WALL) or a dash. The order in which the dash orbs are placed forms the ability sequence
*/

let level;
let player;
let pixelatedBuffer;

let blockSpriteSheet;
let blockSprites = new Map();

let defaultBlockTileSet;

let miscSpriteSheet;

function preload() {
  preloadLevelList();
  blockSpriteSheet = new material.SpriteSheet("blocks.png");
  blockSprites.set("wood", new material.Sprite(blockSpriteSheet, 0, 0, 8, 8));
  blockSprites.set("left_grip", new material.Sprite(blockSpriteSheet, 8, 0, 8, 8));
  blockSprites.set("right_grip", new material.Sprite(blockSpriteSheet, 16, 0, 8, 8));
  blockSprites.set("up_spike", new material.Sprite(blockSpriteSheet, 24, 0, 8, 8));
  blockSprites.set("left_spike", new material.Sprite(blockSpriteSheet, 32, 0, 8, 8));
  blockSprites.set("down_spike", new material.Sprite(blockSpriteSheet, 40, 0, 8, 8));
  blockSprites.set("right_spike", new material.Sprite(blockSpriteSheet, 48, 0, 8, 8));
  blockSprites.set("default_tile", new material.Tileset("test_tileset.png"));
  blockSprites.set("metal_tile", new material.Tileset("metal_tileset.png"));
  blockSprites.set("oxidized_tile", new material.Tileset("oxidized_tileset.png"));
  blockSprites.set("metal_pole", new material.Tileset("metal_pole_tileset.png"));
  blockSprites.set("cobble_tile", new material.Tileset("cobble_tileset.png"));


  miscSpriteSheet = new material.SpriteSheet("misc.png");
  Player.preload();
  SceneItems.preload();

  abilities.preload();
}
function setup() {
  setAttributes("antialias", false);
  createCanvas(floor(windowWidth/cam.zoom)*cam.zoom, floor(windowHeight/cam.zoom)*cam.zoom, WEBGL);
  player = new Player(4, -4);
  level_manager.load();
  pixelatedBuffer = createFramebuffer({
    antialias: false,
    textureFiltering: NEAREST,
    width: Math.floor(width / cam.zoom) + 1, // adding 1 on each side allows us to offset the "real" camera by subpixel movements
    height: Math.floor(height / cam.zoom) + 1,
    pixelDensity: 1,
  });
  cam.calculateCameraStartPos(cam.modes.free);
}

function draw() {
  if(deltaTime/1000 > 1/15) return;
  player.process_input();
  player.physics_tick(deltaTime / 1000);
  abilities.physics_tick(deltaTime / 1000);
  cam.update(deltaTime / 1000);

  noStroke();
  
  pixelatedBuffer.draw(() => {
    push();
    clear();
    cam.transform_pixelated();
    level.draw();
    player.draw();
    abilities.draw();
    pop();
  });
  clear();
  bg.draw();
  const subpixel_offset_x =  Math.floor(cam.aabb.origin.x*8) - cam.aabb.origin.x*8;
  const subpixel_offset_y =  Math.floor(cam.aabb.origin.y*8) - cam.aabb.origin.y*8;

  image(pixelatedBuffer, -width/2, -height/2, width, height, subpixel_offset_x+1, subpixel_offset_y+1, cam.aabb.dims.x*8, cam.aabb.dims.y*8);
  //console.log(`${cam.aabb.origin.x},${cam.aabb.origin.y}`)
  cam.transform();
  abilities.placer.highlight_grid_pos();
  level_editor.render_selection();  
  //cam.camera_debug_draw();
}

function keyPressed() {
  if(key === 'u') {
    if(abilities.placer.active) {
      abilities.placed_array.pop();
    } else if(level_editor.active) {
      if(level_editor.placing === "scene_items") level.scene_items.pop();
    } else {
      player.respawn();
    }
  }
  if(key === 'l') {
    level_editor.active = !level_editor.active;
    if(level_editor.active) {
      cam.freecam_enable();
      player.ignoreInput = true;
    } else {
      cam.freecam_disable();
      player.ignoreInput = false;
    }
  }
  if(key === 'j') {
    if(abilities.placer.can_enter) {
      if(abilities.placer.active) {
        abilities.placer.exit();
      } else {
        abilities.placer.enter();
      }
    } else {
      abilities.activate();
    }
  }
  if(keyCode === RIGHT_ARROW) {
    if(abilities.placer.active) {
      abilities.placer.selected_ability = abilities.Climb;
    } else if(level_editor.active) {
      level_editor.selected_index = Math.min(level_editor.selected_index + 1, level_editor.placing === "blocks" ? level.block_names.length-1 : SceneItems.nameMap.size-1);
    }
    
  }
  if(keyCode === LEFT_ARROW) {
    if(abilities.placer.active) {
      abilities.placer.selected_ability = abilities.Dash;
    } else if(level_editor.active) {
      level_editor.selected_index = Math.max(level_editor.selected_index - 1, level_editor.placing === "blocks" ? 1 : 0);
    }
  }
  if(keyCode === UP_ARROW && level_editor.active) {
    level_editor.placing = "scene_items";
    level_editor.selected_index = 0;
  }
  if(keyCode === DOWN_ARROW && level_editor.active) {
    level_editor.placing = "blocks";
    level_editor.selected_index = 1;
  }
  if(key - "0" >= 0 && key - "0" < 9) {
    level_manager.level = key - "0";
    level_manager.load();
  }
}
function mousePressed() {
  abilities.placer.onLeftClick();
  level_editor.onMouseClick();
}

function mouseReleased(event) {
  abilities.placer.onLeftRelease();
  level_editor.onMouseRelease(event.button === 0);
}

function mouseWheel(event) {
  cam.zoom += event.delta / 100;
  cam.calculateCameraStartPos(cam.followMode);
}

function pixelAlignVector(coords) {
  const x = Math.floor(coords.x * 8) / 8;
  const y = Math.floor(coords.y * 8) / 8;
  return createVector(x, y);
}

// taken from monacle game engine
function approach(val, target, maxChange) {
  return val > target ? Math.max(val - maxChange, target) : Math.min(val + maxChange, target);
}
