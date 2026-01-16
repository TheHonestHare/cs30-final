const level0 = {
  block_array: (() => {
    let res = [];
    for(let y = 0; y < 100; y++) {
      for(let x = 0; x < 100; x++) {
        res.push((Math.sin(x / 10) * 3 - 10) + y > 30 ? 1 : 0);
      }
    }
    return res;
  })(),
  block_names: [
    "air",
    "wood",
    "left_grip",
    "right_grip"
  ],
  w: 100,
  h: 100,
  spawnx: 1,
  spawny: 1,
  scene_items: [
    {
      type: "SignalTower",
      data: {
        x: 10,
        y: 31,
        energy_level: 3
      }
    }
  ]

};