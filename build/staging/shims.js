/**
 * I guess typescript can't honor my ES5 target here?!  Ok...
 * It really only needs to implement the functions I use: constructor, get, set, add, has
 * And the key types I use: just string, I think.
 */

var Set = (function (_super) {

  function Set(items) {
    this.keys = {};
    var len;
    if (items && items.length) {
      len = items.length;
      for (var i = 0; i < len; i++) {
        this.add(items[i]);
      }
    }
  }

  var proto = Set.prototype = Object.create(_super.prototype);
  proto.add = function (item) {
    this.keys[''+item] = true;
    return this;
  };
  proto.delete = function (item) {
    delete this.keys[''+item];
    return this;
  };
  proto.has = function (item) {
    return this.keys.hasOwnProperty(''+item);
  };

  return Set;
})(Object);

var Map = (function (_super) {

  function Map(items) {
    this.entries = this.keys = {};
    var len = items && items.length;
    for (i = 0; i < len; i++) {
      this.set(items[0], items[1]);
    }
  }

  var proto = Map.prototype = Object.create(_super.prototype);
  proto.add = null;
  proto.set = function (what, to) {
    this.entries[''+what] = to;
    return this;
  }
  proto.get = function (what) {
    return this.entries[''+what];
  }

  return Map;
})(Set)
