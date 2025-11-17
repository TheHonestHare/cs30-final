const level0 = {
  block_array: (() => {
    let res = [];
    for(let y = 0; y < 30; y++) {
      for(let x = 0; x < 100; x++) {
        res.push((Math.sin(x / 10) * 3 - 10) + y > 5 ? 1 : 0);
      }
    }
    return res;
  })(),
  w: 100,
  h: 30,
  spawnx: 1,
  spawny: 1,
  scene_items: [
    {
      type: "SignalTower",
      data: {
        x: 10,
        y: 6,
        energy_level: 3
      }
    }
  ]

};