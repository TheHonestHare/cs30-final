const cam = {
  "pos": undefined,
  "zoom": 1.2,
  "calculateCameraStartPos": function (spawn, level_w, level_h) {
    let y = height - level_h * this.zoom * 8;
    if(y < 0) y = height - spawn.y * this.zoom * 8 - height / 2;
    this.pos = createVector(0, y);
  },
  "transform": function () {
    translate(this.pos);
    scale(this.zoom * 8);
  }
};