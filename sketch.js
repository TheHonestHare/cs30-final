/*
Dracen Lim
Computer Science 30
Grid based game

This is a platformer where you need to place down abilities in order to use them

Controls:
L: toggle level editor. Use left click to place wood and right click to place air
K: when at the signal tower, deletes the ability sequence
   when not at the signal tower, resets the ability sequence
J: activates the next ability in the sequence. There is currently only one ability: dash
   J + WASD will cause the player to dash in the respective direction if they are touching a dash orb
   Pressing J multiple times will move through the ability sequence.
Left click (at signal tower) places a dash orb. The order in which the dash orbs are placed forms the ability sequence

2d grid:
Technically I didn't use a 2d grid but I think it still counts bc I used a 1d grid and indexed it with the formula [x * cols + y]
  Check level_editor.js, level.js for example usage
Extra for experts:
  I explored static variables as seen in abilities.js for example
*/

let level;
let player;
let pixelatedBuffer;

let blockSpriteSheet;
let blockSprites = new Map();

let defaultBlockTileSet;

let miscSpriteSheet;
let playerSprite;

function preload() {
  blockSpriteSheet = new material.SpriteSheet("blocks.png");
  blockSprites.set("wood", new material.Sprite(blockSpriteSheet, 0, 0, 8, 8));
  blockSprites.set("left_grip", new material.Sprite(blockSpriteSheet, 8, 0, 8, 8));
  blockSprites.set("right_grip", new material.Sprite(blockSpriteSheet, 16, 0, 8, 8));
  blockSprites.set("default_tile", new material.Tileset("test_tileset.png"));


  miscSpriteSheet = new material.SpriteSheet("misc.png");
  playerSprite = new material.Sprite(miscSpriteSheet, 0, 0, 8, 8);

  SceneItems.preload();

  abilities.preload();
}
function setup() {
  setAttributes("antialias", false);
  createCanvas(floor(windowWidth/cam.zoom)*cam.zoom, floor(windowHeight/cam.zoom)*cam.zoom, WEBGL);
  player = new Player(4, -4, playerSprite);
  level = level_manager.load(0);
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
  if(key === 'k') {
    if(abilities.placer.active) {
      abilities.placed_array = [];
    } else {
      abilities.index = null;
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
  if(key === 'j') abilities.activate();
  if(keyCode === RIGHT_ARROW && level_editor.active) {
    if(level_editor.selected_block < level.block_names.length - 1) {
      level_editor.selected_block += 1;
    }
  }
  if(keyCode === LEFT_ARROW && level_editor.active) {
    if(level_editor.selected_block > 1) {
      level_editor.selected_block -= 1;
    }
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
