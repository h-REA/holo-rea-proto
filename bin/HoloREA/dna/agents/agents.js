/**
 * I guess typescript can't honor my ES5 target here?!  Ok...
 * It really only needs to implement the functions I use: constructor, get, set, add, has
 * And the key types I use: just string, I think.
 */
var Set, Map;

(function shimmy() {
  Set = (function (_super) {

    function Set(items) {
      this._keys = {};
      this.size = 0;
      var len;
      if (items && items.length) {
        len = items.length;
        for (var i = 0; i < len; i++) {
          this.add(items[i]);
          this.size++;
        }
      }
    }

    var proto = Set.prototype = Object.create(_super.prototype);
    proto.add = function (item) {
      if (!this._keys[''+item]) this.size++;
      this._keys[''+item] = true;
      return this;
    };
    proto.delete = function (item) {
      if (delete this._keys[''+item]) this.size--;
      return this;
    };
    proto.has = function (item) {
      return this._keys.hasOwnProperty(''+item);
    };

    proto.keys = proto.values = function () {
      var keys = this._keys;
      return Object.keys(keys).filter(function (key) {
        return keys[key] === true;
      });
    };

    proto.forEach = function (cb, thisVal) {
      thisVal = thisVal || this;
      var keys = this.keys();
      var i = keys.length;
      while (i--) {
        cb.call(thisVal, keys[i], this);
      }
    };

    proto.clear = function () {
      this._keys = {};
      this.size = 0;
    };

    proto.union = function (other) {
      var u = new Set();
      var size = -this.values().filter(function (v) {
        return other.has(v);
      }).length;
      Object.assign(u._keys, this._keys, other._keys);
      u.size = size + this.size + other.size;
      return u;
    };

    proto.intersect = function (that) {
      return new Set(this.values().filter(function (v) {
        return that.has(v);
      }));
    };

    proto.disjunct = function (other) {
      return new Set(this.values().filter(function (v) {
        return !other.has(v);
      }));
    }

    return Set;
  })(Object);

  Map = (function (_super) {

    function Map(items) {
      this._entries = this._keys = {};
      this.size = 0;
      var len = items && items.length;
      for (i = 0; i < len; i++) {
        this.set(items[0], items[1]);
      }
    }

    var proto = Map.prototype = Object.create(_super.prototype);
    proto.add = null;
    proto.set = function (what, to) {
      if (!(what in this._entries)) this.size++;
      this._entries[''+what] = to;
      return this;
    }
    proto.get = function (what) {
      return this._entries[''+what];
    }

    proto.keys = function () {
      return Object.keys(this._entries);
    }
    proto.values = function () {
      return this.keys().map(function (key) {
        return this._entries[key];
      });
    }
    proto.entries = function () {
      var entries = this._entries;
      return this.keys().map(function (key) {
        return [key, entries[key]];
      });
    }
    proto.forEach = function (cb, that) {
      var entries = this._entries;
      var me = this;
      that = that || this;
      this.keys().forEach(function (key) {
        cb.call(that, entries[key], key, me);
      });
    }

    return Map;
  })(Set)

  /**
   * It also doesn't know about Object.assign.....
   */

  Object.assign = function (dest, src) {
    if (!dest || typeof dest !== "object") throw new TypeError("Can't assign to non-object");
    if (src && typeof src === "object") {

      var keys = Object.keys(src);
      var i = keys.length;
      var key;

      while (i--) {
        key = keys[i];
        dest[key] = src[key];
      }

    }
    if (arguments.length > 2) {
      var more = [].slice.call(arguments, 2);
      return Object.assign(dest, more);
    }
    return dest;
  };

  /**
   * Man, I really forgot what it was like to ES5
   */
  (function (sp) {
    sp.bold = function () {
      return "<b>" + this + "</b>";
    }
    sp.italics = function () {
      return "<i>" + this + "</i>";
    }
    sp.fixed = function () {
      return "<tt>" + this + "</tt>";
    }
  })(String.prototype);
})();

function ExArray() {
  Array.apply(this);
  this.push.apply(this, arguments);
}
ExArray.prototype = Object.create(Array.prototype);
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// no. , "__esModule", { value: true });
// no. ("./holochain-proto");
// no. ("./shims");
// no. ("./ex-array-shim");
/**
 * Either throw the error or return the desired result.  The type parameter
 * should usually be inferred from the argument, which will have better warnings
 * downstream.
 */
function notError(maybeErr) {
    if (isErr(maybeErr)) {
        throw new Error("That was an error! " + ("" + maybeErr));
    }
    else {
        return maybeErr;
    }
}
// no. notError = notError;
/**
 * Tool for getting what you need from linkRepo.get() and preserving Hash types
 * and iterating with for...of
 * The type parameter is the type of the Link elements
 * It provides filter methods (tags, types, sources) to narrow your results,
 * and the output will be another LinkSet.
 * Get an array of entries (data()) or hashes (hashes())
 * It wants to be a Set, but targetting compilation to ES5 will only allow
 * arrays to be for..of'ed
 *
 */
var LinkSet = /** @class */ (function (_super) {
    __extends(LinkSet, _super);
    /**
     * Don't new this.
     * @param {holochain.GetLinksResponse[]} array the links that exist on the DHT
     * @param {LinkRepo} origin The repo creating this object
     * @param {Hash} baseHash The hash of the object that is the base of these links
     * @param {string} onlyTag Vestigial
     * @param {boolean} loaded Are the entries loaded? default true
     * @param {boolean} sync Do mutations to this object happen on the DHT?  default true
     * @constructor
     */
    function LinkSet(array, origin, baseHash, onlyTag, loaded, sync) {
        if (loaded === void 0) { loaded = true; }
        if (sync === void 0) { sync = true; }
        var _this = _super.apply(this, array) || this;
        _this.origin = origin;
        _this.baseHash = baseHash;
        _this.loaded = loaded;
        _this.sync = true;
        _this.sync = sync;
        return _this;
    }
    /**
     * Filter by any number of tags.  Returns a new LinkSet of the same type.
     * @param {string[]} narrowing An array of the tag names wanted.
     */
    LinkSet.prototype.tags = function () {
        var narrowing = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            narrowing[_i] = arguments[_i];
        }
        var uniques = new Set(narrowing);
        return new LinkSet(this.filter(function (_a) {
            var Tag = _a.Tag;
            return uniques.has(Tag);
        }), this.origin, this.baseHash);
    };
    /**
     * Filter by any number of entryTypes, which you should probably get from HoloObj.className
     * returns a new LinkSet.
     * if you like typesafety, use the type parameter to narrow the types, too.
     * @arg C Type or union of types that the result should contain.  These are classes, not names.
     * @params {string} typeNames is the list of types that the result should have.
     *  these are the type names, not the classes.
     * @returns {LinkSet<C>}
     */
    LinkSet.prototype.types = function () {
        var typeNames = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            typeNames[_i] = arguments[_i];
        }
        var uniques = new Set(typeNames);
        return new LinkSet(this.filter(function (_a) {
            var EntryType = _a.EntryType;
            return uniques.has(EntryType);
        }), this.origin, this.baseHash);
    };
    /**
     * Returns an array of Hashes from the LinkSet, typed appropriately
     * @returns {Hash} Hash<T>[]
     */
    LinkSet.prototype.hashes = function () {
        return this.map(function (_a) {
            var Hash = _a.Hash;
            return Hash;
        });
    };
    /**
     * Returns the entries in the LinkSet as a typesafe array.
     */
    LinkSet.prototype.data = function () {
        return this.map(function (_a) {
            var Hash = _a.Hash;
            return notError(get(Hash));
        });
    };
    /**
     * Filters by source.
     * @param {Hash} allowed... sources to be allowed
     * @returns {LinkSet} LinkSet
     */
    LinkSet.prototype.sources = function () {
        var allowed = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            allowed[_i] = arguments[_i];
        }
        var uniques = new Set(allowed);
        return new LinkSet(this.filter(function (_a) {
            var Source = _a.Source;
            return uniques.has(Source);
        }), this.origin, this.baseHash);
    };
    /**
     * All links in this set will be removed from the DHT.  Note that this is not
     * chainable, and the original object will be empty as well.
     */
    LinkSet.prototype.removeAll = function () {
        var _this = this;
        //*
        if (this.sync)
            this.forEach(function (link, index) {
                var target = link.Hash, tag = link.Tag;
                try {
                    _this.origin.remove(_this.baseHash, target, tag);
                }
                catch (e) {
                    // don't care, just keep deleting them.
                }
            });
        this.splice(0, this.length);
        /*/// Why did I think this would work?
        if (this.sync) {
          commit(
            this.origin.name,
            {
              Links: this.map(link => ({
                Base: this.baseHash,
                Link: link.Hash,
                Tag: link.Tag,
                LinkAction: HC.LinkAction.Del
              }))
            }
          );
        } else {
          this.splice(0);
        }
        /**/
    };
    /**
     * Filters and replaces elements of the set.  Provide a function that accepts
     * a LinkReplace ({hash, tag, type, entry}) and returns a LinkReplacement
     * ({hash, tag, type}).  Return undefined or the unmodified argument to leave
     * the link alone.  Return null to have the link deleted, both from the set
     * and the DHT.  Return false to remove the link from the set without deleting
     * on the DHT.  Otherwise, return the new {hash, tag, type}.
     * @param {Function} fn ({hash, tag, type, entry}) => {hash, tag, type} | null | undefined | false
     * @returns {this} LinkSet
     */
    LinkSet.prototype.replace = function (fn) {
        var _a = this, length = _a.length, origin = _a.origin;
        var removals = [];
        for (var i = 0; i < length; i++) {
            var type = this[i].EntryType;
            var hash = this[i].Hash;
            var tag = this[i].Tag;
            var entry = get(hash);
            if (!isErr(entry)) {
                var rep = fn({ hash: hash, tag: tag, type: type, entry: entry }, i, this);
                if (rep === null) {
                    if (this.sync)
                        origin.remove(this.baseHash, hash, tag);
                    removals.push(i);
                }
                else if (rep === false) {
                    removals.push(i);
                }
                else if (rep && (tag !== rep.tag || hash !== rep.hash)) {
                    if (hash === rep.hash && type !== rep.type) {
                        throw new TypeError("can't link to " + type + " " + hash + " as type " + rep.type);
                    }
                    origin.remove(this.baseHash, hash, tag);
                    tag = rep.tag;
                    hash = rep.hash;
                    origin.put(this.baseHash, hash, tag);
                    this[i] = {
                        EntryType: rep.type,
                        Tag: tag,
                        Hash: hash
                    };
                }
            }
            else {
                removals.push(i);
            }
        }
        for (var _i = 0, removals_1 = removals; _i < removals_1.length; _i++) {
            var i = removals_1[_i];
            this.splice(i, 1);
        }
        return this;
    };
    /**
     * Go through the set link by link, accepting or rejecting them for a new
     * LinkSet as you go.  The callback should accept a {type, entry, hash, tag}
     * and return a boolean.
     * @param fn  Callback function
     * @returns {LinkSet} LinkSet
     */
    LinkSet.prototype.select = function (fn) {
        var chosen = new LinkSet([], this.origin, this.baseHash, undefined, this.loaded, this.sync);
        var _loop_1 = function (response) {
            var type = response.EntryType, hash = response.Hash;
            var tag = response.Tag;
            var lr = {
                hash: hash, tag: tag, type: type,
                get entry() {
                    return notError(get(hash));
                }
            };
            if (fn(lr))
                chosen.push(response);
        };
        for (var _i = 0, _a = this; _i < _a.length; _i++) {
            var response = _a[_i];
            _loop_1(response);
        }
        return chosen;
    };
    /**
     * Removes links with duplicate hashes and tags
     * @param {Boolean} cleanDht should the duplicates be removed from the DHT,
     *  too?  Defaults to the value of this.sync
     * @returns {LinkSet} LinkSet
     */
    LinkSet.prototype.unique = function (cleanDht) {
        if (cleanDht === void 0) { cleanDht = this.sync; }
        var inSet = new Set();
        var result = new LinkSet([], this.origin, this.baseHash, undefined, this.loaded, this.sync);
        for (var _i = 0, _a = this; _i < _a.length; _i++) {
            var link = _a[_i];
            var desc = this.descEntry(link);
            if (!inSet.has(desc)) {
                inSet.add(desc);
                result.push(link);
            }
            else if (cleanDht) {
                this.origin.remove(this.baseHash, link.Hash, link.Tag);
            }
        }
        return result;
    };
    /**
     * Is this link in my LinkSet?
     * @param {Tags} tag The tag to search
     * @param {Hash} hash The hash to search
     * @returns {Boolean} Boolean
     */
    LinkSet.prototype.has = function (tag, hash) {
        var i = this.length;
        while (i--) {
            var link = this[i];
            if (link.Tag === tag && link.Hash === hash)
                return true;
        }
        return false;
    };
    LinkSet.prototype.descEntry = function (args) {
        var Hash = args.Hash, Tag = args.Tag, EntryType = args.EntryType;
        return (Tag || "no-tag") + " " + Hash + ":" + (EntryType || "no-type");
    };
    LinkSet.prototype.desc = function () {
        return this.map(this.descEntry);
    };
    /**
     * Return this LinkSet without the links that are present in another LinkSet.
     * Useful to negate the other filtering methods, e.g. foo.notIn(foo.tags(`not this tag`))
     * If the LinkSet is not from the same LinkRepo or isn't the same link base,
     * the returned object will have the same elements.
     * @param {LinkSet} ls The disjoint LinkSet
     * @returns {LinkSet} A LinkSet with all elements of this linkset except those
     *  in the provided disjoint LinkSet.
     */
    LinkSet.prototype.notIn = function (ls) {
        var _this = this;
        if (ls.origin !== this.origin || ls.baseHash !== this.baseHash) {
            return new LinkSet(this, this.origin, this.baseHash);
        }
        var inLs = new Set(ls.desc());
        return new LinkSet(this.filter(function (link) {
            return !inLs.has(_this.descEntry(link));
        }), this.origin, this.baseHash, undefined, this.loaded, this.sync);
    };
    /**
     * Returns the links that are in both this linkset and another.  Useful if
     * you have two independent filtering operations.
     * @param {LinkSet} ls The intersecting LinkSet
     * @returns {LinkSet} LinkSet with elements in both this and ls
     */
    LinkSet.prototype.andIn = function (ls) {
        var _this = this;
        if (this.baseHash !== ls.baseHash) {
            return new LinkSet([], this.origin, this.baseHash);
        }
        var inLs = new Set(ls.desc());
        return new LinkSet(this.filter(function (link) { return inLs.has(_this.descEntry(link)); }), this.origin, this.baseHash, undefined, this.loaded, this.sync);
    };
    /**
     * Add additional links to the set.  If this.sync, it will be added to the DHT too
     * @param {Tags} tag The tag of the link
     * @param {Hash} hash The hash of the object to be added with that tag
     * @param {String} type The type name of the entry
     * @returns {LinkSet} LinkSet
     */
    LinkSet.prototype.add = function (tag, hash, type) {
        if (this.sync)
            this.origin.put(this.baseHash, hash, tag);
        this.push({
            Hash: hash,
            Tag: tag,
            EntryType: type,
            Source: App.Agent.Hash
        });
        return this;
    };
    /**
     * Pushes the current set to the DHT if it isn't synced already
     * @param {Boolean} add Should additional links be added to the DHT?  Default true
     * @param {Boolean} rem Should missing links be deleted from the DHT?  Default false
     * @returns {LinkSet} LinkSet for chaining
     */
    LinkSet.prototype.save = function (add, rem) {
        if (add === void 0) { add = true; }
        if (rem === void 0) { rem = false; }
        if (this.sync)
            return this;
        var tags = new Set(this.map(function (_a) {
            var Tag = _a.Tag;
            return Tag;
        }));
        for (var _i = 0, _a = tags.values(); _i < _a.length; _i++) {
            var tag = _a[_i];
            var existing = this.origin.get(this.baseHash, tag);
            if (add)
                for (var _b = 0, _c = this.notIn(existing).hashes(); _b < _c.length; _b++) {
                    var hash = _c[_b];
                    this.origin.put(this.baseHash, hash, tag);
                }
            if (rem) {
                existing.notIn(this).removeAll();
            }
        }
        return this;
    };
    return LinkSet;
}(ExArray));
// no. LinkSet = LinkSet;
/**
 * LinkRepo encapsulates all kinds of links.  Used for keeping track of reciprocal
 * links, managing DHT interactions that are otherwise nuanced, producing
 * LinkSet objects, maintaining type-safe Hash types, and defending against
 * recursive reciprocal links.
 * @arg {object} B The union of types that can be the Base of the Links
 * @arg {object} L The union of types that can be the Link of the Links
 *  If there are reciprocal links within this LinkRepo, it's safest for B and L
 *  to be identical.
 * @arg {string} T.  This is a union of the tag strings used in this repo.
 *  If you don't want to know when you put the wrong tag in the wrong Repo, go
 *  ahead and let it default to string.  Do not use tags that include the pipe
 *  character, '|'; union the strings themselves like "foo"|"bar"|"baz"
 */
var LinkRepo = /** @class */ (function () {
    /**
     * @param {string} name the exact dna.zomes[].Entries.Name that this repo will
     *  represent.
     */
    function LinkRepo(name) {
        this.name = name;
        this.backLinks = new Map();
        /*
        protected recurseGuard = new Map<T, number>();
        /*/
        this.recurseGuard = new Set();
        /**/
        this.selfLinks = new Map();
        this.predicates = new Map();
        this.exclusive = new Set();
    }
    LinkRepo.prototype.guard = function (base, link, tag, op, fn) {
        var descript = base + " " + op + tag + " " + link;
        if (!this.recurseGuard.has(descript)) {
            this.recurseGuard.add(descript);
            fn();
            this.recurseGuard.delete(descript);
        }
    };
    LinkRepo.prototype.tag = function (t) {
        return { tag: t, repo: this };
    };
    /**
     * Sets up an empty LinkSet that can interact with this repo.
     * @param {Hash} base Any added links will use this hash as the base
     * @returns {LinkSet} an empty LinkSet
     */
    LinkRepo.prototype.emptySet = function (base) {
        return new LinkSet([], this, base, undefined);
    };
    /**
     * Produce a LinkSet including all parameter-specified queries.
     * @param {Hash<B>} base this is the Base entry  whose outward links will
     *  be recovered.
     * @param {string} ...tags this is the tag or tags you want to filter by.  If
     *  omitted, all tags will be included - including those from other repos, so
     *  consider filtering the result by type or source afterward.
     * @param {holochain.LinksOptions} options options that will be passed to getLinks
     *  Be aware that the LinkSet will NOT know about these.  Defaults to the default
     *  LinksOptions.
     * @returns {LinkSet<B>} containing the query result.
     */
    LinkRepo.prototype.get = function (base) {
        var tags = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            tags[_i - 1] = arguments[_i];
        }
        var options = { Load: true };
        if (tags.length === 0) {
            return new LinkSet(notError(getLinks(base, '', options)), this, base);
        }
        var responses = [];
        for (var _a = 0, tags_1 = tags; _a < tags_1.length; _a++) {
            var tag = tags_1[_a];
            var response = getLinks(base, tag, options);
            for (var _b = 0, response_1 = response; _b < response_1.length; _b++) {
                var lnk = response_1[_b];
                lnk.Tag = tag;
            }
            responses = responses.concat(response);
        }
        return new LinkSet(responses, this, base);
    };
    /**
     * Commits a new link to the DHT.
     * @param {Hash<B>} base the base of the link.  This is the object you can query by.
     * @param {Hash<L>} link the linked object of the link.  This is the object you
     *  CAN'T query by, which is the object of the tag.
     * @param {T} tag the tag for the link, of which base is the object.
     * @param {LinkRepo<L, B>?} backRepo optional repo that will contain a reciprocal
     *  link.  Any reciprocals already registered via linkBack() are already covered;
     *  Use that method instead when possible.
     * @param {string?} backTag optional but mandatory if backRepo is specified.
     *  this is the tag used for the reciprocal link in addition to those already
     *  entered into the repo; there is no need to repeat this information if
     *  the reciprocal has been entered already via linkBack
     * @returns {LinkHash} a hash of the link, but that's pretty useless, so I'll probably end up changing
     *  it to be chainable.
     */
    LinkRepo.prototype.put = function (base, link, tag, backRepo, backTag) {
        var _this = this;
        /*
        const rg = this.recurseGuard;
        let rgv = rg.has(tag) ? rg.get(tag) : 1;
    
        if (!rgv--) return this;
    
        if (this.exclusive.has(tag)) {
          this.get(base, tag).removeAll();
        }
        rg.set(tag, rgv);
    
    
    
        if (this.predicates.has(tag)) {
          this.addPredicate(tag, base, link);
        }
    
        const hash = commit(this.name, { Links: [{Base: base, Link: link, Tag: tag}] });
    
    
        if (this.backLinks.has(tag)) {
          for (let backLink of this.backLinks.get(tag)) {
            let {repo, tag: revTag} = backLink;
            repo.put(link, base, revTag);
          }
        }
        if (this.selfLinks.has(tag)) {
          for (let revTag of this.selfLinks.get(tag)) {
            this.put(link, base, revTag);
          }
        }
        if (backRepo && backTag) {
          backRepo.put(link, base, backTag);
        }
    
        rg.set(tag, ++rgv);
        /*/
        this.guard(base, link, tag, '+', function () {
            if (_this.exclusive.has(tag)) {
                _this.get(base, tag).removeAll();
            }
            if (_this.predicates.has(tag)) {
                _this.addPredicate(tag, base, link);
            }
            var hash = commit(_this.name, { Links: [{ Base: base, Link: link, Tag: tag }] });
            if (_this.backLinks.has(tag)) {
                for (var _i = 0, _a = _this.backLinks.get(tag); _i < _a.length; _i++) {
                    var backLink = _a[_i];
                    var repo = backLink.repo, revTag = backLink.tag;
                    repo.put(link, base, revTag);
                }
            }
            if (_this.selfLinks.has(tag)) {
                for (var _b = 0, _c = _this.selfLinks.get(tag); _b < _c.length; _b++) {
                    var revTag = _c[_b];
                    _this.put(link, base, revTag);
                }
            }
            if (backRepo && backTag) {
                backRepo.put(link, base, backTag);
            }
        });
        /**/
        return this;
    };
    /**
     * Adds a reciprocal to a tag that, when put(), will trigger an additional
     * put() from the linked object from the base object.
     * @param {T} tag the tag that will trigger the reciprocal to be put().
     * @param {LinkRepo<L,B,string>} repo The repo that will contain the reciprocal.
     * @param {string} backTag the tag that will be used for the reciprocal link.
     * @returns {ThisType}
     */
    LinkRepo.prototype.linkBack = function (tag, backTag, repo) {
        if (backTag === void 0) { backTag = tag; }
        backTag = backTag || tag;
        if (!repo || repo === this) {
            return this.internalLinkback(tag, backTag);
        }
        var entry = { repo: repo, tag: backTag };
        if (this.backLinks.has(tag)) {
            var existing = this.backLinks.get(tag);
            existing.push(entry);
        }
        else {
            this.backLinks.set(tag, [entry]);
        }
        //this.recurseGuard.set(tag, 1);
        return this;
    };
    // box example:
    // on A -insideOf B, for N: B contains N { N -nextTo A; A -nextTo N }
    // on A +insideOf B, for N: B contains N { N +nextTo A; A +nextTo N }
    /**
     * Expresses a rule between 3 tags that ensures that any A triggerTag B,
     * all C where B query.tag C, also C dependent.tag A
     * The reverse should also be true; if not A triggerTag B, any C where
     * B query.tag C, not C dependent.tag A
     */
    LinkRepo.prototype.predicate = function (triggerTag, query, dependent) {
        var predicates = this.predicates;
        if (!query.repo)
            query.repo = this;
        if (!dependent.repo)
            dependent.repo = this;
        if (predicates.has(triggerTag)) {
            predicates.get(triggerTag).push({ query: query, dependent: dependent });
        }
        else {
            predicates.set(triggerTag, [{ query: query, dependent: dependent }]);
        }
        return this;
    };
    /**
     * When adding a link with the given tag, this repo will first remove any links
     * with the same tag.  This is for one-to-one and one end of a one-to-many.
     * @param {T} tag The tag to become singular
     * @returns {this} Chainable.
     */
    LinkRepo.prototype.singular = function (tag) {
        this.exclusive.add(tag);
        return this;
    };
    LinkRepo.prototype.addPredicate = function (trigger, subj, obj) {
        var triggered = this.predicates.get(trigger);
        for (var _i = 0, triggered_1 = triggered; _i < triggered_1.length; _i++) {
            var _a = triggered_1[_i], query_1 = _a.query, dependent = _a.dependent;
            var queried = query_1.repo.get(obj, query_1.tag).hashes();
            for (var _b = 0, queried_1 = queried; _b < queried_1.length; _b++) {
                var q = queried_1[_b];
                dependent.repo.put(q, subj, dependent.tag);
            }
        }
    };
    LinkRepo.prototype.removePredicate = function (trigger, subj, obj) {
        var triggered = this.predicates.get(trigger);
        for (var _i = 0, triggered_2 = triggered; _i < triggered_2.length; _i++) {
            var _a = triggered_2[_i], query_2 = _a.query, dependent = _a.dependent;
            var queried = query_2.repo.get(obj, query_2.tag).hashes();
            for (var _b = 0, queried_2 = queried; _b < queried_2.length; _b++) {
                var q = queried_2[_b];
                dependent.repo.remove(q, subj, dependent.tag);
            }
        }
    };
    LinkRepo.prototype.internalLinkback = function (fwd, back) {
        var mutual = fwd === back;
        if (this.selfLinks.has(fwd)) {
            this.selfLinks.get(fwd).push(back);
        }
        else {
            this.selfLinks.set(fwd, [back]);
        }
        /*
        if (mutual) {
          this.recurseGuard.set(fwd, 2);
        } else {
          this.recurseGuard.set(fwd, 1).set(back, 1);
        }
        */
        return this;
    };
    LinkRepo.prototype.toLinks = function (base, link, tag) {
        return { Links: [{ Base: base, Link: link, Tag: tag }] };
    };
    LinkRepo.prototype.unLinks = function (links) {
        var _a = links.Links[0], Base = _a.Base, Link = _a.Link, Tag = _a.Tag;
        return { Base: Base, Link: Link, Tag: Tag };
    };
    /**
     * Gets the hash that a link would have if it existed.  Good to know if you use
     * update() and remove()
     * @param {Hash<B>} base the subject of the hypothetical link.
     * @param {Hash<L>} link the object of the hypothetical link.
     * @param {T} tag the tag of the hypothetical link.
     * @returns {LinkHash} if the list does or will exist, this is the hash it
     *  would have.
     */
    LinkRepo.prototype.getHash = function (base, link, tag) {
        return notError(makeHash(this.name, this.toLinks(base, link, tag)));
    };
    // FIXME this looks pretty gnarly
    /**
     * Remove the link with the specified base, link, and tag.  Reciprocal links
     * entered by linkBack() will also be removed.
     * @param {Hash<B>} base the base of the link to remove.
     * @param {Hash<L>} link the base of the link to remove.
     * @param {T} tag the tag of the link to remove
     * @returns {LinkHash} but not really useful.  Expect to change.
     */
    LinkRepo.prototype.remove = function (base, link, tag) {
        var _this = this;
        var presentLink = this.toLinks(base, link, tag);
        // Not going to happen.  makeHash doesn't work out for links.  Nor get.
        //let hash = notError<LinkHash>(makeHash(this.name, presentLink));
        // ADD THIS BACK ONCE THE TEST SYSTEM ISSUE IS WORKED OUT
        //if (get(hash) === HC.HashNotFound) return this;
        /*
        const rg = this.recurseGuard;
        let rgv = rg.has(tag) ? rg.get(tag) : 1;
        if (!rgv--) {
          return this;
        }
    
        //if (get(hash) === HC.HashNotFound) return this;
    
        presentLink.Links[0].LinkAction = HC.LinkAction.Del;
        hash = notError<LinkHash>(commit(this.name, presentLink));
    
        rg.set(tag, rgv);
    
        if (this.backLinks.has(tag)) {
          for (let {repo, tag: backTag} of this.backLinks.get(tag)) {
            repo.remove(link, base, backTag);
          }
        }
        if (this.selfLinks.has(tag)) {
          for (let back of this.selfLinks.get(tag)) {
            this.remove(link, base, back);
          }
        }
        if (this.predicates.has(tag)) {
          this.removePredicate(tag, base, link);
        }
    
        rg.set(tag, ++rgv);
        /*/
        this.guard(base, link, tag, '-', function () {
            presentLink.Links[0].LinkAction = HC.LinkAction.Del;
            var hash = notError(commit(_this.name, presentLink));
            if (_this.backLinks.has(tag)) {
                for (var _i = 0, _a = _this.backLinks.get(tag); _i < _a.length; _i++) {
                    var _b = _a[_i], repo = _b.repo, backTag = _b.tag;
                    repo.remove(link, base, backTag);
                }
            }
            if (_this.selfLinks.has(tag)) {
                for (var _c = 0, _d = _this.selfLinks.get(tag); _c < _d.length; _c++) {
                    var back = _d[_c];
                    _this.remove(link, base, back);
                }
            }
            if (_this.predicates.has(tag)) {
                _this.removePredicate(tag, base, link);
            }
        });
        /**/
        return this;
    };
    /**
     * If the old link exists, remove it and replace it with the new link.  If
     * the old link doesn't exist, put() the new one.  As always, reciprocal links
     * are managed with no additional work.  Note that both arguments are the
     * holochain.Links type, complete with CamelCaseNames.
     * @param {holochain.Link} old The link to be replaced.
     * @param {holochain.Link} update The link to replace it with.
     * @returns {LinkHash} A hash that you can't use for much.  Expect to change.
     */
    LinkRepo.prototype.replace = function (old, update) {
        var oldHash = this.getHash(old.Base, old.Link, old.Tag);
        if (get(oldHash) === HC.HashNotFound) {
            return this.put(update.Base, update.Link, update.Tag);
        }
        this.remove(old.Base, old.Link, old.Tag);
        return this.put(update.Base, update.Link, update.Tag);
    };
    return LinkRepo;
}());
// no. LinkRepo = LinkRepo;
// <reference path="./es6.d.ts"/>
// <reference path="./holochain-proto.d.ts"/>
/* IMPORT
//import "./es6";
import "./holochain-proto";
import "./LinkRepo";
import { LinkRepo, Set, Map } from "./LinkRepo";
/*/
/**/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * I can write a good bisect of a sorted list in my sleep.  And I think I did,
 * here.  Takes a sorted list of numbers and a number to compare them to, min.
 * It returns an index in that array; all numbers with >= indexes are >= min,
 * all numbers with < indexes are < min.  Runs in log N time, so if you are
 * running filters related to your sort axis, this is going to be better.
 * @param {number[]} array A list of numbers.
 * @param {number} min the index returned is == the index of min, if it exists.
 * @returns {number}
 */
/* EXPORT
export /**/ function bisect(array, min) {
    var b = 0, t = array.length;
    while (t > b) {
        var i = (t + b) >> 1, v = array[i];
        if (v < min) {
            b = i;
        }
        else if (v > min) {
            t = i;
        }
        else {
            return i;
        }
    }
    return t;
}
/* EXPORT
export/**/ function reader(Hc) {
    function crudR(hashes) {
        try {
            return hashes.map(function (hash) {
                try {
                    return Hc.get(hash).portable();
                }
                catch (e) {
                    return { hash: hash, error: e };
                }
            });
        }
        catch (e) {
            return [{ error: e }];
        }
    }
    return crudR;
}
/* EXPORT
export/**/ function creator(Hc) {
    return function crudC(props) {
        var it;
        try {
            it = Hc.create(props);
            it.commit();
            return it.portable();
        }
        catch (e) {
            return {
                error: e || null,
                hash: it && it.hash,
                entry: it && it.entry,
                type: Hc.className
            };
        }
    };
}
/**
 * merges an object, src, into another object, dest.  It's like Object.assign,
 * but it doesn't copy over inner objects.  Instead, it copies properties over,
 * so that the inner object's properties are not all lost.
 * @arg {class} T the type of dest (will be inferred)
 * @arg {class} U the type of src (will be inferred)
 * @param {T} dest This object will receive the fields and inner fields of the
 *  rest of the arguments.
 * @param {U} src This is the first object to have its properties copied to dest
 * @param {object} [...] More objects to copy onto dest, in order.
 * @returns {T & U}
 */
/* EXPORT
export /**/ function deepAssign(dest, src) {
    var more = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        more[_i - 2] = arguments[_i];
    }
    for (var _a = 0, _b = Object.keys(src); _a < _b.length; _a++) {
        var p = _b[_a];
        var v = void 0; // FIXME: this makes me want to cry.
        if (typeof src[p] == "object") {
            if (src[p] instanceof Array) {
                var d = dest[p];
                if (d && d instanceof Array) {
                    v = d.concat(src[p]);
                }
                else {
                    v = [].concat(src[p]);
                }
            }
            else {
                v = deepAssign(dest[p] || {}, src[p]);
            }
        }
        else {
            v = src[p];
        }
        dest[p] = v;
    }
    if (more.length) {
        var u = more[0], rest = more.slice(1);
        return deepAssign.apply(void 0, [dest, u].concat(rest));
    }
    else {
        return dest;
    }
}
/* EXPORT
export/**/ function deepInit(target) {
    var inits = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        inits[_i - 1] = arguments[_i];
    }
    target = target || {};
    for (var _a = 0, inits_1 = inits; _a < inits_1.length; _a++) {
        var init = inits_1[_a];
        for (var _b = 0, _c = Object.keys(init); _b < _c.length; _b++) {
            var key = _c[_b];
            var val = init[key];
            while (typeof val === "function" && !(key in target)) {
                val = val.call(target, target);
            }
            if (typeof val === "object") {
                var over = target[key];
                if (val instanceof Array) {
                    val = over || val;
                }
                else if (over && typeof over === "object") {
                    val = deepInit({}, over, val);
                }
                else if (over !== undefined) {
                    val = over;
                }
            }
            else if (key in target) {
                val = target[key];
            }
            target[key] = val;
        }
    }
    return target;
}
function isCrud(thing) {
    if (typeof thing !== "object")
        return false;
    var resp = thing;
    return (typeof resp.hash == "string" &&
        (typeof resp.entry == "object" || typeof resp.type == "string")) || (typeof resp.entry == "object" && typeof resp.type == "string");
}
/**
 * Gets the hash of an object, no matter what it is.
 * @arg {interface} T the type of the object you want a hash of.
 * @param {HoloThing<T>} thing You don't really know what this is.
 * @returns {Hash<T>}
 * @throws {Error} if thing really is a T, then it doesn't know its class name,
 *  and without that, it can't be hashed.
 */
/* EXPORT
export /**/ function hashOf(thing, type) {
    if (typeof thing == "string") {
        return thing;
    }
    else if (thing instanceof HoloObject) {
        return thing.hash;
    }
    else if (isCrud(thing)) {
        if (!thing.hash) {
            thing.hash = notError(makeHash(thing.type, thing.entry));
        }
        return thing.hash;
    }
    else if (type && typeof thing === "object") {
        return notError(commit(type, thing));
    }
    else {
        throw new Error("hashOf can't hash " + thing + " without a typename");
    }
}
/**
 * Get the actual data structure from something related, no matter what it is.
 * @param {HoloThing<T>} thing It has something to do with a T, but you don't
 *  really know what it is because you didn't read the documentation on that
 *  exported zome function or bridge.
 * @returns {T}
 */
/* EXPORT
export /**/ function entryOf(thing) {
    if (typeof thing == "string") {
        var got = get(thing);
        return isErr(got) ? null : got;
    }
    else if (thing instanceof HoloObject) {
        return thing.entry;
    }
    else if (isCrud(thing)) {
        if (!thing.entry) {
            var entry = get(thing.hash);
            if (!isErr(entry))
                thing.entry = entry;
        }
        return thing.entry;
    }
    else {
        return thing;
    }
}
/**
 * Get a bunch of information related to something, whatever it is.
 * @param {HoloThing<T>} thing - whatever that is.
 * @returns {CrudResponse<T>}
 */
/* EXPORT
export /**/ function responseOf(thing) {
    var response = { error: null, hash: null, entry: null };
    try {
        var hash = response.hash = hashOf(thing);
        var entry = response.entry = entryOf(thing);
        if (isCrud(thing)) {
            response.type = thing.type;
        }
    }
    catch (e) {
        response.error = e;
    }
    return response;
}
/* EXPORT
export/**/ function debugRet(it) {
    debug('' + it);
    return it;
}
;
/**
 * A pretty robust implementation of QuantityValue that will some day enable
 * unit conversions and derived units (e.g. Newtons = kg*m^2*s^2)
 * some of the hard work is done, but clearly not all of it.
 */
/* EXPORT
export /**/ var QuantityValue = /** @class */ (function () {
    /**
     * Construct a QV from a POO QVlike.
     * @param {string} units
     */
    function QuantityValue(_a) {
        var units = _a.units, quantity = _a.quantity;
        this.units = units;
        this.quantity = quantity;
    }
    QuantityValue.prototype.toString = function () {
        return this.quantity + " " + this.units;
    };
    /**
     * Check unit compatibility and return the sum of two QVs
     * if a % is added (not to a %) the addition is relative to the original quantity
     */
    QuantityValue.prototype.add = function (_a) {
        var units = _a.units, quantity = _a.quantity;
        //debug(`${''+this} + ${quantity} ${units} =>`);
        if (units === this.units) {
            return new QuantityValue({ units: this.units, quantity: this.quantity + quantity });
        }
        else if (units === "%") {
            return this.mul({ units: "%", quantity: 100 + quantity });
        }
        throw new TypeError("Can't add quantity in " + units + " to quantity in " + this.units);
    };
    /**
     * Return a QV that is the product of this and another QV, complete with derived
     * units if necessary.  Multiplying by a % or unitless quantity will return
     * a QV with the same units.  Multiplying by the inverse units will return
     * a unitless ratio.
     */
    QuantityValue.prototype.mul = function (_a) {
        var units = _a.units, quantity = _a.quantity;
        //debug(`${''+this} * ${quantity} ${units} =>`)
        if (units === "%") {
            quantity /= 100;
            units = "";
        }
        if (units) {
            var decomp = QuantityValue.decomposeUnits(units), mine = QuantityValue.decomposeUnits(this.units);
            units = QuantityValue.recomposeUnits(QuantityValue.mulUnits(decomp, mine));
        }
        else {
            units = this.units;
        }
        return new QuantityValue({ units: units, quantity: quantity * this.quantity });
    };
    /**
     * Returns the difference between this and another QV.  If a % is given, the
     * subtraction will be proportional to the original value.  Otherwise, the
     * units must match.
     */
    QuantityValue.prototype.sub = function (_a) {
        var units = _a.units, quantity = _a.quantity;
        //debug(`${''+this} - ${quantity} ${units} =>`)
        if (units === "%") {
            quantity = 100 - quantity;
            return this.mul({ units: units, quantity: quantity });
        }
        else if (units === this.units) {
            return new QuantityValue({ units: units, quantity: this.quantity - quantity });
        }
        else {
            throw new TypeError("Can't subtract " + units + " from " + this.units);
        }
    };
    /**
     * Returns the quotient of two this and another QV, deriving units if needed.
     * Unitless or % units will be treated as ratios and the output unit will be
     * the same as the input.
     */
    QuantityValue.prototype.div = function (_a) {
        var units = _a.units, quantity = _a.quantity;
        //debug(`${''+this} / ${quantity} ${units} =>`)
        if (!quantity)
            throw new Error("Can't divide by 0 " + units);
        if (units === "%") {
            units = "";
            quantity = 100 / quantity;
        }
        if (units) {
            units = QuantityValue.recomposeUnits(QuantityValue.mulUnits(QuantityValue.invertUnits(QuantityValue.decomposeUnits(units)), QuantityValue.decomposeUnits(this.units)));
        }
        else {
            units = this.units;
        }
        return new QuantityValue({ units: units, quantity: this.quantity / quantity });
    };
    QuantityValue.decomposeUnits = function (units) {
        if (!units)
            return {};
        var decomp = units.split("*"), dict = {};
        for (var _i = 0, decomp_1 = decomp; _i < decomp_1.length; _i++) {
            var unit = decomp_1[_i];
            var _a = /^([^\^]*)(?:\^(\d+(?:\.\d+)?))?$/.exec(unit), match = _a[0], unitName = _a[1], expo = _a[2];
            var n = parseFloat(expo || "1");
            if (dict.hasOwnProperty(unitName)) {
                n += dict[unitName];
                if (n === 0) {
                    delete dict[unitName];
                }
                else {
                    dict[unitName] = n;
                }
            }
            else {
                dict[unitName] = n;
            }
        }
        return dict;
    };
    QuantityValue.mulUnits = function () {
        var decomps = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            decomps[_i] = arguments[_i];
        }
        var dict = decomps[0], dicts = decomps.slice(1);
        dict = Object.assign({}, dict);
        for (var _a = 0, dicts_1 = dicts; _a < dicts_1.length; _a++) {
            var decomp = dicts_1[_a];
            for (var _b = 0, _c = Object.keys(decomp); _b < _c.length; _b++) {
                var unit = _c[_b];
                var n = decomp[unit];
                if (dict.hasOwnProperty(unit)) {
                    n += dict[unit];
                }
                if (n === 0) {
                    delete dict[unit];
                }
                else {
                    dict[unit] = n;
                }
            }
        }
        return dict;
    };
    QuantityValue.invertUnits = function (decomp) {
        var dict = {};
        for (var _i = 0, _a = Object.keys(decomp); _i < _a.length; _i++) {
            var unit = _a[_i];
            dict[unit] = -decomp[unit];
        }
        return dict;
    };
    QuantityValue.recomposeUnits = function (decomp) {
        return Object.keys(decomp).map(function (unit) {
            var expo = decomp[unit];
            if (expo === 1) {
                return unit;
            }
            else {
                return unit + "^" + expo;
            }
        }).join("*");
    };
    QuantityValue.isEqualUnits = function (a, b) {
        var adict = this.decomposeUnits(a);
        var bdict = this.decomposeUnits(b);
        for (var _i = 0, _a = Object.keys(adict); _i < _a.length; _i++) {
            var key = _a[_i];
            if (adict[key] !== bdict[key])
                return false;
        }
        var aset = new Set(Object.keys(adict));
        var bset = new Set(Object.keys(bdict));
        if (bset.disjunct(aset).size)
            return false;
        return true;
    };
    QuantityValue.prototype.isCount = function () {
        return this.units === "";
    };
    return QuantityValue;
}());
/**
 * Either throw the error or return the desired result.  The type parameter
 * should usually be inferred from the argument, which will have better warnings
 * downstream.
 */
/* EXPORT
export /**/ function notError(maybeErr) {
    if (isErr(maybeErr)) {
        throw new Error("That was an error! " + ("" + maybeErr));
    }
    else {
        return maybeErr;
    }
}
/**
 * Abstraction to manage the relationship between the DHT, entry types, and the
 * feature-rich classes that enhance them with methods.
 * This is, unfortunately, a bit of work to subclass, but without it there is
 * no hope of easily classing up your json-type entries.
 * First, distinguish between the class that extends this one and the data actually
 * stored in the DHT.  Entries are purely POD structs, classes can have methods
 * to enrich their utility and future-proofness.  The entry type itself is one
 * that matches the EntryType.json schema and is given by the tE type parameter.
 * All subclasses need a type parameter as well to preserve that capability.
 * Overriding certain properties is also very important.
 * @see HoloObject.className
 * @see className
 * @see HoloObject.entryType
 * @arg tE this is the type of the POD structs that the DHT knows about.  I find
 *  it easier to declare an interface since you will need to repeat it several
 *  times.  When you extend the class, it is VITAL that the inheritor specifies
 *  the entry type in the extends clause.
 * @example class MyHoloObject<T> extends HoloObject<MyEntryType>
 * @example class LayeredSubclass<T> extends SubclassOfHoloObject<MyEntryType>
 */
/* EXPORT
export /**/ var HoloObject = /** @class */ (function () {
    /**
     * constructs a HoloObject that has the given entry and hash.  Don't call this.
     * use the static create() or get() depending on your needs.
     * Override this with the correct entry types as arguments.
     * @param {tE|null} entry the entry that will be represented by this instance.
     *  Use null if you know the hash.  Do not use both.
     * @param {Hash<object>} hash the hash that you are absolutely sure exists as
     *  this entry type on the DHT.  It can be left out if the entry is given.
     * @constructor
     * @throws {Error} if both entry and hash were given.
     * @throws {Error} if neither entry nor hash are given.
     * @throws {holochain.HolochainError} if making a hash fails when given entry
     * @throws {holochain.HolochainError} if the DHT didn't know about the given hash
     * @throws {TypeError} if the entry doesn't pass the DHT's inspection
     */
    function HoloObject(entry, hash) {
        this.openCount = 0;
        this.openError = null;
        this.isCommitted = false;
        if (!entry == !hash)
            throw new Error("use either entry or hash arguments; can't use both or none");
        if (entry) {
            this.myEntry = entry;
            // can't do any makeHash here because the subclass constructor hasn't yet
            // assigned className.  It has to be moved into create() and get()
        }
        else {
            this.myEntry = notError(get(hash));
        }
    }
    /**
     * Subclasses may call hasChanged() to determine whether their entry has been
     * changed since the last update() or commit()
     */
    HoloObject.prototype.hasChanged = function () {
        if (this.lastHash) {
            return this.lastHash !== this.makeHash();
        }
        else {
            return true;
        }
    };
    /**
     * Subclasses may call committed() to determine whether any version of the entry
     * is in the DHT.
     */
    HoloObject.prototype.committed = function () {
        if (this.isCommitted)
            return true;
        return !!this.lastHash || !!this.originalHash;
    };
    /**
     * Create a brand new entry and return the HoloObject that handles it.
     * Override this to get the argument type (typeof MyClass.entryType) and the
     * return type (MyClass) right.  You can also hook in here for object initialization
     * @static
     * @abstract
     * @param {holochain.JsonEntry} entryProps The new entry properties
     * @returns {HoloObject}
     */
    HoloObject.create = function (entryProps) {
        //let entry: typeof entryProps = {};
        var defs = this.entryDefaults;
        var entry = deepInit({}, entryProps, defs);
        var it = new this(entry);
        // must test for existing entry here.
        var hash = notError(it.makeHash());
        var old = get(hash);
        if (old && !isErr(old)) {
            it.originalHash = hash;
            it.myHash = hash;
            it.lastHash = notError(makeHash(it.className, old));
            it.isCommitted = true;
        }
        return it;
    };
    Object.defineProperty(HoloObject.prototype, "entry", {
        /**
         * Returns the POD struct that is stored in the DHT. Modifying the object
         * will have no effect.
         * @returns {tE & typeof Superclass.entryType} the entry
         */
        get: function () {
            return deepAssign({}, this.myEntry);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Use ThisClass.get() to fetch data that exists on the DHT and construct a
     * class instance based on it.
     * @override if you need to prepare instance properties from the entry data,
     *  or to provide better type safety; it is recommended to get the types right,
     *  even if the body is just returns super.get(hash).  If the entry has aliased
     *  link properties, you should load them up here.
     * @static
     * @abstract
     * @param {Hash<this>} hash the hash of the entry on the DHT
     * @returns {this} an instance of this class
     */
    HoloObject.get = function (hash) {
        var it = new this(null, hash);
        if (it && it.myEntry) {
            it.isCommitted = true;
            it.myHash = hash;
            it.originalHash = hash;
            it.lastHash = notError(makeHash(this.className, it.myEntry));
        }
        else {
            throw new RangeError("Hash of " + this.className + " " + hash + " not found");
        }
        return it;
    };
    Object.defineProperty(HoloObject.prototype, "hash", {
        /**
         * Public accessor to get the hash of the entry.
         * @throws {holochain.HolochainError} if the entry is not loaded or created
         *  AND it doesn't exist on the DHT.
         * @returns {Hash<this>} the hash.
         */
        get: function () {
            if (this.myHash)
                return this.myHash;
            var hash = makeHash(this.className, this.myEntry);
            if (isErr(hash)) {
                throw new TypeError("entry type mismatch");
            }
            else {
                return notError(hash);
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Retrieve a hypothetical hash of the entry.  Note that this hash is not
     * necessarily in the DHT.
     * @returns {Hash<this>} that hypothetically, the entry would have if committed.
     */
    HoloObject.prototype.makeHash = function () {
        return notError(makeHash(this.className, this.entry));
    };
    HoloObject.prototype._commit = function () {
        var hash = commit(this.className, this.myEntry);
        if (!hash || isErr(hash)) {
            throw new TypeError("Failed to commit: " + JSON.stringify(hash));
        }
        else {
            this.isCommitted = true;
            this.originalHash = this.originalHash || hash;
            this.lastHash = hash;
            this.myHash = hash;
            return hash;
        }
    };
    /*
    protected entryChanged(): boolean {
      if (!this.lastHash) return true;
      return this.lastHash !== this.makeHash();
    }
  
    protected linksChanged(hash?: Hash<this>): boolean {
      return false;
    };
  
    protected saveLinks: (hash: Hash<this>) => Hash<this> = null;
    /**/
    /**
     * Commit the entry to the chain.  If it's already up there, update it.
     * Override this method and update if there are link-aliased properties you
     * need to update here.
     * @returns {Hash<this>}
     */
    HoloObject.prototype.commit = function () {
        if (!!this.openCount)
            return this.myHash;
        if (this.openError)
            throw this.openError;
        if (this.committed() && this.hasChanged()) {
            return this._update();
        }
        else {
            return this._commit();
        }
    };
    HoloObject.prototype._update = function () {
        return this.myHash = notError(update(this.className, this.entry, this.myHash));
    };
    /**
     * Checks whether changes were made since the last commit, updates them if they
     * have.  Updates the local hash property as well.
     * @returns {Hash<this>}
     */
    HoloObject.prototype.update = function () {
        if (!!this.openCount)
            return this.myHash;
        if (this.openError)
            throw this.openError;
        if (!this.committed()) {
            return this._commit();
        }
        else if (this.hasChanged()) {
            return this._update();
        }
        else {
            return this.myHash;
        }
    };
    /**
     * Remove the entry from the DHT.  Chainable.  It is possible to screw up your
     * links this way, so override the method to manage those yourself (for now)
     * @param {string} msg The reason the entry is being deleted.  optional.
     * @returns {this}
     */
    HoloObject.prototype.remove = function (msg) {
        if (msg === void 0) { msg = ""; }
        if (!!this.myHash && this.committed()) {
            remove(this.myHash, msg);
            this.isCommitted = false;
            this.myHash = null;
            return this;
        }
        return this;
    };
    /**
     * !!DO NOT USE!!
     * Perform any number of mutation operations as a batch, preventing each of
     * the inner functions from updating the entry until all operations are
     * complete and without error.  This method is chainable, allowing you to
     * call update() or close() immediately.
     * @param {(this.entryType) => this.entryType} mutator A function that will
     *  possibly mutate the entry or throw an error.  It will receive the current
     *  entry.  To make changes, the function may return a new entry of the same
     *  type, change the argument and return nothing, or make changes through the
     *  HoloObject's methods and return nothing.
     * @returns {ThisType}
     */
    HoloObject.prototype.open = function (mutator) {
        var stack = this.openCount++;
        var mutant = Object.assign({}, this.myEntry), error = null;
        try {
            var r = mutator(mutant);
            if (r) {
                this.myEntry = Object.assign({}, this.myEntry, r);
            }
            else {
                this.myEntry = Object.assign({}, this.myEntry, mutant);
            }
            if (--this.openCount === stack)
                this.openError = null;
        }
        catch (e) {
            error = this.openError = e;
        }
        return this;
    };
    /**
     * If the recent open() operation threw, examine the error to determine
     * whether the entry should be updated anyway.  If there was no error, update
     * the entry unless it is holding for another open call.
     * @param {(Error) => boolean} fn This is a catch function that will receive
     *  the recent error if it exists.  It should return true if the error is not
     *  unforgivable.
     * @returns {ThisType}
     */
    HoloObject.prototype.close = function (fn) {
        var shouldUpdate = !this.openError;
        if (this.openError && fn) {
            shouldUpdate = fn(this.openError) && !!this.openCount--;
        }
        if (shouldUpdate) {
            this.update();
        }
        return this;
    };
    /**
     * Returns a CrudResponse for the entry.
     * @returns {CrudResponse<this.entryType>}
     */
    HoloObject.prototype.portable = function () {
        return {
            hash: this.commit(),
            entry: this.entry,
            error: this.openError && deepAssign({}, this.openError),
            type: this.className
        };
    };
    /**
     * These are the default values that will be assigned to the entry when not
     * specified to the constructor or create().
     * @abstract
     * @static
     */
    HoloObject.entryDefaults = {};
    return HoloObject;
}());
/**
 * A base class for all VF entities that enable them to carry the optional
 * properties any VF entity can have.  See docs on HoloObject on how to extend.
 * @see HoloObject
 * @arg T Use this type argument to convey the entry type of a subclass.
 */
/* EXPORT
export /**/ var VfObject = /** @class */ (function (_super) {
    __extends(VfObject, _super);
    function VfObject(entry, hash) {
        var _this = _super.call(this, entry, hash) || this;
        _this.className = "VfObject";
        return _this;
    }
    VfObject.create = function (entry) {
        return _super.create.call(this, entry);
    };
    VfObject.get = function (hash) {
        return _super.get.call(this, hash);
    };
    Object.defineProperty(VfObject.prototype, "name", {
        get: function () {
            return this.myEntry.name;
        },
        set: function (to) {
            this.myEntry.name = to;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VfObject.prototype, "image", {
        get: function () {
            return this.myEntry.image;
        },
        set: function (to) {
            this.myEntry.image = to;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VfObject.prototype, "note", {
        get: function () {
            return this.myEntry.note;
        },
        set: function (to) {
            this.myEntry.note = to;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VfObject.prototype, "url", {
        get: function () {
            return this.myEntry.url;
        },
        set: function (to) {
            this.myEntry.url = to;
        },
        enumerable: true,
        configurable: true
    });
    VfObject.className = "VfObject";
    VfObject.entryDefaults = {};
    return VfObject;
}(HoloObject));
//* HOLO-SCOPE
function wtf(crud) {
    return [];
}
/**/
/* EXPORT
export/**/ function callZome(zome, fn, arg) {
    return JSON.parse(call(zome, fn, arg));
}
// Now moving all the link definitions here.
/* EXPORT
export/**/ var AgentProperty = new LinkRepo("AgentProperty");
AgentProperty
    .linkBack("owns", "owner")
    .linkBack("owner", "owns")
    .singular("owner");
/* EXPORT
export/**/ var Classifications = new LinkRepo("Classifications");
Classifications
    .linkBack("classifiedAs", "classifies")
    .linkBack("classifies", "classifiedAs")
    .singular("classifiedAs");
/* EXPORT
export/**/ var EventLinks = new LinkRepo("EventLinks");
EventLinks.linkBack("inputs", "inputOf")
    .linkBack("outputs", "outputOf")
    .linkBack("inputOf", "inputs")
    .linkBack("outputOf", "outputs")
    .linkBack("action", "actionOf")
    .linkBack("actionOf", "action")
    .singular("inputOf")
    .singular("outputOf")
    .singular("action");
/* EXPORT
export/**/ var ResourceClasses = new LinkRepo("ResourceClasses");
ResourceClasses
    .linkBack("classifiedAs", "classifies")
    .linkBack("classifies", "classifiedAs")
    .singular("classifiedAs");
/* EXPORT
export/**/ var ResourceRelationships = new LinkRepo("ResourceRelationships");
ResourceRelationships
    .linkBack("underlyingResource", "underlies")
    .linkBack("underlies", "underlyingResource")
    .singular("underlies")
    .singular("underlyingResource")
    .linkBack("contains", "inside")
    .linkBack("inside", "contains")
    .singular("inside");
/* EXPORT
export/**/ var TrackTrace = new LinkRepo("TrackTrace");
TrackTrace
    .linkBack("affects", "affectedBy")
    .linkBack("affectedBy", "affects")
    .singular("affects");
var Agent = /** @class */ (function (_super) {
    __extends(Agent, _super);
    function Agent(entry, hash) {
        var _this = _super.call(this, entry, hash) || this;
        _this.className = "Agent";
        return _this;
    }
    Agent.get = function (hash) {
        return _super.get.call(this, hash);
    };
    Agent.create = function (entry) {
        return _super.create.call(this, entry);
    };
    Agent.className = "Agent";
    Agent.entryDefaults = deepAssign({}, VfObject.entryDefaults, {
        primaryLocation: []
    });
    return Agent;
}(VfObject));
/* TYPE-SCOPE
}
/*/
/**/
/* EXPORT
export default agents;
/*/
/**/
// <zome> public functions
//* HOLO-SCOPE
var createAgent = creator(Agent);
function getOwnedResources(_a) {
    var agents = _a.agents, types = _a.types;
    //              [agent][class][resource]
    var agentDicts = {}, typeSet = null;
    if (types) {
        typeSet = new Set(types);
    }
    var _loop_1 = function (agentHash) {
        var classDict = {}, stuffHeHas = AgentProperty.get(agentHash, "owns").tags("owns");
        stuffHeHas.data().forEach(function (resource, index) {
            var type = resource.resourceClassifiedAs;
            if (!types || typeSet.has(type)) {
                var instances = classDict[type] || [];
                instances.push(stuffHeHas[index].Hash);
                classDict[type] = instances;
            }
        });
        agentDicts[agentHash] = classDict;
    };
    // This is going to have to be a query-filter-collate.
    for (var _i = 0, agents_1 = agents; _i < agents_1.length; _i++) {
        var agentHash = agents_1[_i];
        _loop_1(agentHash);
    }
    return agentDicts;
}
var readAgents = reader(Agent);
// callbacks
function genesis() {
    // YAGNI
    return true;
}
function validateCommit(entryType, entry, header, pkg, sources) {
    // check against schema: YAGNI
    return true;
}
function validatePut(entryType, entry, header, pkg, sources) {
    // check for data sanity: YAGNI
    return validateCommit(entryType, entry, header, pkg, sources);
}
function validateMod(entryType, entry, header, replaces, pkg, sources) {
    // messages are immutable for now.
    return true;
}
function validateDel(entryType, hash, pkg, sources) {
    // messages are permanent for now
    return true;
}
function validateLink(entryType, hash, links, pkg, sources) {
    return true;
}
function validatePutPkg(entryType) {
    // don't care.
    return null;
}
function validateModPkg(entryType) {
    // can't happen, don't care
    return null;
}
function validateDelPkg(entryType) {
    // can't happen, don't care
    return null;
}
function validateLinkPkg(entryType) {
    // can't happen, don't care
    return null;
}
/*/
/**/
