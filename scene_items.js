const SceneItems = {
  nameMap: (() => {
    const res = new Map();
    res.set("SignalTower", SignalTower);
    res.set("EnergyBottle", EnergyBottle);
    res.set("LevelExitTrigger", LevelExitTrigger);
    res.set("SceneItems", Button);
    res.set("Gate", Gate);
    return res;
  })(),

  preload() {
    SceneItems.nameMap.forEach((value) => {
      value.preload();
    });
  },

  // all scene items should have the following functions:
  // tick()
  // draw()
  // preload()
  // reset()
  // static createDefaultObj(x, y)
  processEntry(entry) {
    if(entry.type === undefined) return null;
    if(!SceneItems.nameMap.has(entry.type)) return null;
    return new (SceneItems.nameMap.get(entry.type))(entry);
  },
  getNthItem(n) {
    return Array.from(this.nameMap.values())[n];
  }

};