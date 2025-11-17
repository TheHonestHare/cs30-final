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

let blockSpriteSheet;
let blockSprites = [];

let miscSpriteSheet;
let playerSprite;

function preload() {
  blockSpriteSheet = new material.SpriteSheet("blocks.png");
  blockSprites.push(new material.Sprite(blockSpriteSheet, 0, 0, 64, 64));

  miscSpriteSheet = new material.SpriteSheet("misc.png");
  playerSprite = new material.Sprite(miscSpriteSheet, 0, 0, 8, 8);

  SceneItems.preload();

  abilities.preload();
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player(4, -4, playerSprite);
  level = level_manager.load(0);
  cam.calculateCameraStartPos(level.spawnPos, level.w, level.h);
}

function draw() {
  noStroke();
  noSmooth();
  player.process_input();
  player.physics_tick(deltaTime / 1000);
  abilities.physics_tick(deltaTime / 1000);
  cam.transform();
  bg.draw();
  level.draw();
  player.draw();
  abilities.placer.highlight_grid_pos();
  level_editor.render_selection();
  abilities.draw();
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
  }
  if(key === 'j') abilities.activate();

}
function mousePressed() {
  abilities.placer.onLeftClick();
  level_editor.onMouseClick();
}

function mouseReleased(event) {
  level_editor.onMouseRelease(event.button === 0);
}

function mouseWheel(event) {
  cam.zoom += event.delta / 100;
  cam.calculateCameraStartPos(level.spawnPos, level.w, level.h);
}