const level0 = {
  block_array: (() => {
    let res = [];
    for(let y = 0; y < 48; y++) {
      for(let x = 0; x < 27; x++) {
        res.push((Math.sin(x / 10) * 3 - 10) + y > 0 ? 1 : 0);
      }
    }
    return res;
  })(),
  block_names: [
    "air",
    "wood",
    "left_grip",
    "right_grip",
    "default_tile",
    "up_spike",
    "left_spike",
    "down_spike",
    "right_spike",
    "metal_tile",
    "oxidized_tile",
    "metal_pole",
    "cobble_tile",
  ],
  w: 48,
  h: 27,
  spawnx: 10,
  spawny: 0,
  scene_items: [
    {
      type: "SignalTower",
      x: 10,
      y: 31,
      energy_level: 3
    }
  ]

};