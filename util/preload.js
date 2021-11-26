const _setImmediate = setImmediate;
const _clearImmediate = clearImmediate;
const _process = process;
process.once("loaded", () => {
  global.setImmediate = _setImmediate;
  global.clearImmediate = _clearImmediate;
  global.process = _process;
  window.process = _process;
});
