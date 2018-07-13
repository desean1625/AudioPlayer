import * as EventEmitter from "eventemitter3";
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, {
          [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
export class PluginBase extends EventEmitter {
  constructor(options) {
    super();
    this.setOptions({ refreshOnOptionChange: false });
    this.setOptions(options);
  }
  onAdd(plot) {
    console.log("Abstract onAdd Method what to do when added to plot");
  }
  refresh(canvas) {
    console.log("Abstract refresh Method what to do when asked to be redrawn");
  }
  removeFrom(plot) {
    this.enabled = false;
    plot.removePlugin(this);
  }
  onRemove(plot) {
    console.log("Abstract destructor Method");
  }
  addTo(plot) {
    this.enabled = true;
    this._plot = plot;
    plot.addPlugin(this);
  }
  setOptions(options) {
    this.options = this.options || {};
    mergeDeep(this.options, options);
    this.emit("settingsChange", this.options);
    if (this.options.refreshOnOptionChange && this._plot) {
      this._plot.refreshPlugin(this);
    }
  }
}
