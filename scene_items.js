const SceneItems = {
  nameMap: (() => {
    const res = new Map();
    res.set("SignalTower", SignalTower);
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
  processEntry(entry) {
    if(entry.type === undefined) return null;
    if(entry.data === undefined) return null;
    if(!SceneItems.nameMap.has(entry.type)) return null;
    return new (SceneItems.nameMap.get(entry.type))(entry.data);
  }

};