// <reference path="./es6.d.ts"/>
// <reference path="./holochain-proto.d.ts"/>
//* IMPORT
//import "./es6";
import "./holochain-proto";
import "./LinkRepo";
import { LinkRepo, Set, Map } from "./LinkRepo";
/*/
/**/

// Now commenting out everything now defined in LinkRepo

/**
 * We aren't going to be able to pass real Maps around between zomes and agents.
 * So old-school, morally wrong dictionary objects will have to do.
 */
//* EXPORT
export/**/type Dict<T> = {[key: string]: T};

/**
 * Some dicts need both a key type and a value type.
 */
//* EXPORT
export /**/type Catalog<K extends string, T> = {[key: string]: T}

/**
 * I believe Location was taken.  Don't need any additional detail for now.
 */
//* EXPORT
export /**/type PhysicalLocation = string[];

//* EXPORT
export/**/type Fixture<T> = { [k:string]: Hash<T>};

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
//* EXPORT
export /**/function bisect(array: number[], min: number): number {
  let b = 0, t = array.length;
  while (t > b) {
    let i = (t + b) >> 1,
      v = array[i];
    if (v < min) {
      b = i;
    } else if (v > min) {
      t = i;
    } else {
      return i;
    }
  }
  return t;
}

/**
 * For when you don't know what you want or need to pass between zomes.
 * @interface
 */
//* EXPORT
export /**/interface CrudResponse<T extends object> {
  /** @prop {Error} this error is why you can't have the other fields */
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  /** @prop {Hash} the hash of a T; if there is an entry, this is its hash */
  hash?: Hash<T>;
  /** @prop {T} this is the T you asked for/gave */
  entry?: T;
  /** @prop {string} this is the name of T as specified in the DNA. */
  type?: string;
}

//* EXPORT
export/**/function reader<
  I extends HoloObject<T["entryType"]>,
  T extends HoloClass<I,E> = HoloClass<I,E>,
  E extends holochain.JsonEntry = T["entryType"]
>( Hc: T ): (hashes: Hash<E>[]) => CrudResponse<E>[] {
  function crudR(hashes: Hash<E>[]): CrudResponse<E>[] {
    try {
      return hashes.map(hash => {
        try {
          return Hc.get(hash).portable();
        } catch (e) {
          return { hash, error: e }
        }
      });

    } catch (e) {
      return [{error:e}];
    }
  }

  return crudR;
}

//* EXPORT
export/**/function creator<
  I extends HoloObject<T["entryType"]>,
  T extends HoloClass<I, E>,
  E extends holochain.JsonEntry
>( Hc: T ): (props: E) => CrudResponse<E> {

  return function crudC(props: E): CrudResponse<E> {
    let it: I;
    try {
      it = Hc.create(props);
      it.commit();
      return it.portable();
    } catch (e) {
      return {
        error: e || null,
        hash: it && it.hash,
        entry: it && it.entry,
        type: Hc.className
      };
    }
  }
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
//* EXPORT
export /**/function deepAssign<T extends object, U extends object>(dest: T, src: U, ...more: object[]): T & U {
  for (let p of Object.keys(src)) {
    let v: any; // FIXME: this makes me want to cry.
    if (typeof src[p] == `object`) {
      if (src[p] instanceof Array) {
        let d = dest[p];
        if (d && d instanceof Array) {
          v = d.concat(src[p]);
        } else {
          v = [].concat(src[p]);
        }
      } else {
        v = deepAssign(dest[p] || {}, src[p]);
      }
    } else {
      v = src[p];
    }
    dest[p] = v;
  }

  if (more.length) {
    let [u, ...rest] = more;
    return deepAssign(<T&U>dest, u, ...rest);
  } else {
    return <T&U>dest;
  }
}

//* EXPORT
export/**/ type Initializer<T, U = T> =
  (
    T extends Array<infer V> ? Array<V> :
    T extends object
      ? { [K in keyof T]?: Initializer<T[K], T> }
      : T
  ) | (
    (it:U) => T
  );

//* EXPORT
export/**/ function deepInit<T extends holochain.JsonEntry>(
  target: Partial<T>,
  ...inits: Initializer<T>[]
): T {
  target = target || {};

  for (let init of inits) {

    for (let key of Object.keys(init)) {

      let val = init[key];
      while (typeof val === `function` && !(key in target)) {
        val = val.call(target, target);
      }
      if (typeof val === `object`) {
        let over = target[key];
        if (val instanceof Array) {
          val = over || val;
        } else if (over && typeof over === `object`) {
          val = deepInit({}, over, val);
        } else if (over !== undefined) {
          val = over;
        }
      } else if (key in target) {
        val = target[key];
      }
      target[key] = val;
    }
  }
  return <T>target;
}

/**
 * For when you're REALLY unsure what you are getting from some other zome.
 * @type
 */
//* EXPORT
export /**/type HoloThing<T extends object> = HoloObject<T> | CrudResponse<T> | Hash<T> | T;

function isCrud<T extends object>(thing: HoloThing<T>): thing is CrudResponse<T> {
  if (typeof thing !== `object`) return false;
  let resp = <CrudResponse<T>>thing;
  return (
    typeof resp.hash == `string` &&
    (typeof resp.entry == `object` || typeof resp.type == `string`)
  ) || (
    typeof resp.entry == `object` && typeof resp.type == `string`
  );
}

/**
 * Gets the hash of an object, no matter what it is.
 * @arg {interface} T the type of the object you want a hash of.
 * @param {HoloThing<T>} thing You don't really know what this is.
 * @returns {Hash<T>}
 * @throws {Error} if thing really is a T, then it doesn't know its class name,
 *  and without that, it can't be hashed.
 */
//* EXPORT
export /**/function hashOf<T extends object>(thing: HoloThing<T>, type?: string): Hash<T> {
  if (typeof thing == `string`) {
    return thing;
  } else if (thing instanceof HoloObject) {
    return thing.hash;
  } else if (isCrud(thing)) {
    if (!thing.hash) {
      thing.hash = notError(makeHash(thing.type, thing.entry));
    }
    return thing.hash;
  } else if (type && typeof thing === `object`) {
    return notError(commit(type, thing));
  } else {
    throw new Error(`hashOf can't hash ${thing} without a typename`);
  }
}

/**
 * Get the actual data structure from something related, no matter what it is.
 * @param {HoloThing<T>} thing It has something to do with a T, but you don't
 *  really know what it is because you didn't read the documentation on that
 *  exported zome function or bridge.
 * @returns {T}
 */
//* EXPORT
export /**/function entryOf<T extends object>(thing: HoloThing<T>): T {
  if (typeof thing == `string`) {
    let got: holochain.CanError<T> = get(thing);
    return isErr(got) ? null : got;
  } else if (thing instanceof HoloObject) {
    return thing.entry;
  } else if (isCrud(thing)) {
    if (!thing.entry) {
      let entry = get(thing.hash);
      if (!isErr(entry)) thing.entry = entry;
    }
    return thing.entry;
  } else {
    return thing;
  }
}

/**
 * Get a bunch of information related to something, whatever it is.
 * @param {HoloThing<T>} thing - whatever that is.
 * @returns {CrudResponse<T>}
 */
//* EXPORT
export /**/function responseOf<T extends object>(thing: HoloThing<T>): CrudResponse<T> {
  const response: CrudResponse<T> = { error: null, hash: null, entry: null }
  try {
    let hash = response.hash = hashOf(thing);
    let entry = response.entry = entryOf(thing);
    if (isCrud(thing)) {
      response.type = thing.type;
    }
  } catch (e) {
    response.error = e;
  }
  return response;
}

/**
 * This is for type safety when you need assurance that get(Hash) will return the correct type.
 * But I don't think it's working; it all comes out strings.
 */
//* EXPORT
export /**/declare type Hash<T> = holochain.Hash;

//* EXPORT
export /**/type HoloClass<T,U> = (new (o:U, h:Hash<T>) => T) &
  {
    create: (o:U) => T,
    get: (h:Hash<T>) => T,
    className: string,
    entryType: U
  };

//* EXPORT
export/**/function debugRet<T>(it: T): T {
  debug(''+it);
  return it;
}

/**
 * It's just as good as a QuantityValue as far as a real QV knows, and it can
 * cross zomes or machines, but you can't do math on it by itself.
 */
//* EXPORT
export /**/interface QVlike {units: string, quantity: number};

/**
 * A pretty robust implementation of QuantityValue that will some day enable
 * unit conversions and derived units (e.g. Newtons = kg*m^2*s^2)
 * some of the hard work is done, but clearly not all of it.
 */
//* EXPORT
export /**/class QuantityValue implements QVlike {
  /**
   * There are two special values of units: "" is like "Each", and "%" is a unitless percentage
   * "" only comes into play when multiplying and dividing
   * "%" can be used to add/subtract/multiply/divide in proportion to what is already there
   */
  units: string;
  quantity: number;
  /**
   * Construct a QV from a POO QVlike.
   * @param {string} units
   */
  constructor({units, quantity}: QVlike) {
    this.units = units;
    this.quantity = quantity;
  }

  toString() {
    return `${this.quantity} ${this.units}`
  }

  /**
   * Check unit compatibility and return the sum of two QVs
   * if a % is added (not to a %) the addition is relative to the original quantity
   */
  add({units, quantity}: QVlike): QuantityValue {
    //debug(`${''+this} + ${quantity} ${units} =>`);
    if (units === this.units) {
      return new QuantityValue({units: this.units, quantity: this.quantity + quantity});
    } else if (units === `%`) {
      return this.mul({units: `%`, quantity: 100 + quantity});
    }
    throw new TypeError(`Can't add quantity in ${units} to quantity in ${this.units}`);
  }

  /**
   * Return a QV that is the product of this and another QV, complete with derived
   * units if necessary.  Multiplying by a % or unitless quantity will return
   * a QV with the same units.  Multiplying by the inverse units will return
   * a unitless ratio.
   */
  mul({units, quantity}: QVlike): QuantityValue {
    //debug(`${''+this} * ${quantity} ${units} =>`)
    if (units === `%`) {
      quantity /= 100;
      units = ``;
    }
    if (units) {
      let decomp = QuantityValue.decomposeUnits(units),
        mine = QuantityValue.decomposeUnits(this.units);
      units = QuantityValue.recomposeUnits(QuantityValue.mulUnits(decomp, mine));
    } else {
      units = this.units;
    }

    return new QuantityValue({units, quantity: quantity*this.quantity});
  }

  /**
   * Returns the difference between this and another QV.  If a % is given, the
   * subtraction will be proportional to the original value.  Otherwise, the
   * units must match.
   */
  sub({units, quantity}: QVlike): QuantityValue {
    //debug(`${''+this} - ${quantity} ${units} =>`)
    if (units === `%`) {
      quantity = 100 - quantity;
      return this.mul({units, quantity});
    } else if (units === this.units) {
      return new QuantityValue({units, quantity: this.quantity - quantity});
    } else {
      throw new TypeError(`Can't subtract ${units} from ${this.units}`);
    }
  }

  /**
   * Returns the quotient of two this and another QV, deriving units if needed.
   * Unitless or % units will be treated as ratios and the output unit will be
   * the same as the input.
   */
  div({units, quantity}: QVlike): QuantityValue {
    //debug(`${''+this} / ${quantity} ${units} =>`)
    if (!quantity) throw new Error(`Can't divide by 0 ${units}`);
    if (units === `%`) {
      units = ``;
      quantity = 100/quantity;
    }
    if (units) {
      units = QuantityValue.recomposeUnits(QuantityValue.mulUnits(
        QuantityValue.invertUnits(QuantityValue.decomposeUnits(units)),
        QuantityValue.decomposeUnits(this.units)
      ));
    } else {
      units = this.units;
    }
    return new QuantityValue({units, quantity: this.quantity/quantity});
  }

  static decomposeUnits(units: string): {[key: string]: number} {
    if (!units) return {};

    let decomp: string[] = units.split(`*`),
      dict: {[key: string]: number} = {};

      for (let unit of decomp) {
        let [match, unitName, expo] = /^([^\^]*)(?:\^(\d+(?:\.\d+)?))?$/.exec(unit);
        let n: number = parseFloat(expo || "1");

        if (dict.hasOwnProperty(unitName)) {
          n += dict[unitName];
          if (n === 0) {
            delete dict[unitName];
          } else {
            dict[unitName] = n;
          }
        } else {
          dict[unitName] = n;
        }

      }

      return dict;
  }

  static mulUnits(...decomps: {[key: string]: number}[]): {[key: string]: number} {
    let [dict, ...dicts] = decomps;
    dict = Object.assign({}, dict);

    for (let decomp of dicts) {
      for (let unit of Object.keys(decomp)) {
        let n = decomp[unit];

        if (dict.hasOwnProperty(unit)) {
          n += dict[unit];
        }

        if (n === 0) {
          delete dict[unit];
        } else {
          dict[unit] = n;
        }
      }
    }

    return dict;
  }

  static invertUnits(decomp: {[key: string]: number}): {[key: string]: number} {
    let dict: {[key: string]: number} = {};

    for (let unit of Object.keys(decomp)) {
      dict[unit] = -decomp[unit];
    }

    return dict;
  }

  static recomposeUnits(decomp: {[key: string]: number}): string {
    return Object.keys(decomp).map((unit) => {
      let expo = decomp[unit];
      if (expo === 1) {
        return unit;
      } else {
        return `${unit}^${expo}`;
      }
    }).join(`*`);
  }

  static isEqualUnits(a: string, b: string): boolean {
    const adict = this.decomposeUnits(a);
    const bdict = this.decomposeUnits(b);

    for (let key of Object.keys(adict)) {
      if (adict[key] !== bdict[key]) return false;
    }

    const aset = new Set(Object.keys(adict));
    const bset = new Set(Object.keys(bdict));
    if (bset.disjunct(aset).size) return false;

    return true;
  }

  isCount(): boolean {
    return this.units === "";
  }

}

/**
 * Either throw the error or return the desired result.  The type parameter
 * should usually be inferred from the argument, which will have better warnings
 * downstream.
 */
//* EXPORT
export /**/function notError<T>(maybeErr: holochain.CanError<T>): T {
  if (isErr(maybeErr)) {
    throw new Error(`That was an error! ${``+maybeErr}`);
  } else {
    return (<T> maybeErr);
  }
}

/**
 * The hash you get when commiting a holochain.LinksEntry
 */
//* EXPORT
export /**/type LinkHash = Hash<holochain.LinksEntry>

// LinkRepo was here


interface Named {
  className: string;
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
//* EXPORT
export /**/class HoloObject<tE extends holochain.JsonEntry = {}> implements Named {
  /**
   * You must delcare an override of static className to reflect the name of the entry type
   * as listed in the DNA.  Yes, both static and instance className.
   * @static
   * @type {string}
   * @abstract
   */
  static className:string;

  /**
   * You must override className to the identical string as the static className,
   * which is the entry type as listed in the DNA.  Yes, both.
   * @type {string}
   * @abstract
   */
  className: string;

  private openCount: number = 0;
  private openError: Error = null;

  private isCommitted: boolean = false;

  /**
   * Subclasses may call hasChanged() to determine whether their entry has been
   * changed since the last update() or commit()
   */
  protected hasChanged(): boolean {
    if (this.lastHash) {
      return this.lastHash !== this.makeHash();
    } else {
      return true;
    }
  }
  /**
   * Subclasses may call committed() to determine whether any version of the entry
   * is in the DHT.
   */
  protected committed(): boolean {
    if (this.isCommitted) return true;
    return !!this.lastHash || !!this.originalHash;
  }

  /**
   * static entryType must be overriden to be an instance of your entry type or
   * typed as one.
   * Unfortunately it is not possible to include a type parameter, so the static
   * version will always be missing the entry type parameter you gave.  Merge it
   * with the superclass's entryType with an & expression.  See example.
   * @static
   * @abstract
   * @example static entryType: typeof Superclass.entryType & MyEntryType
   */
  static entryType: holochain.JsonEntry;

  /**
   * These are the default values that will be assigned to the entry when not
   * specified to the constructor or create().
   * @abstract
   * @static
   */
  static entryDefaults: Initializer<holochain.JsonEntry> = {};

  /**
   * Create a brand new entry and return the HoloObject that handles it.
   * Override this to get the argument type (typeof MyClass.entryType) and the
   * return type (MyClass) right.  You can also hook in here for object initialization
   * @static
   * @abstract
   * @param {holochain.JsonEntry} entryProps The new entry properties
   * @returns {HoloObject}
   */
  static create(entryProps?: holochain.JsonEntry): HoloObject<holochain.JsonEntry> {
    //let entry: typeof entryProps = {};
    let defs = this.entryDefaults;
    let entry = deepInit({}, entryProps, defs);
    let it = new this(entry);
    // must test for existing entry here.
    let hash = notError(it.makeHash());
    let old = get(hash);
    if (old && !isErr(old)) {
      it.originalHash = hash;
      it.myHash = hash;
      it.lastHash = notError(makeHash(it.className, old));
      it.isCommitted = true;
    }
    return it;
  }

  /**
   * If you extended correctly, your subclass entry type should already be there
   * and your own T as well.  Theoretically you can skip overriding this.
   * @example protected myEntry: T & MyEntryType & typeof Superclass.entryType
   * @protected
   */
  protected myEntry: tE & holochain.JsonEntry;

  // This formal definition is long overdue.  HoloObject keeps 3 hashes.
  /**
   * myHash is the hash that is intended to be used as the base/target of
   * any links.  It's left undefined if the object has no record on the DHT yet,
   * as the base of a link must be an object on the DHT.
   * @protected
   */
  protected myHash: Hash<this>;
  /**
   * originalHash is the hash that was given to fetch this object from links,
   * the user, or other objects.  In addition, if a HoloObject is created as new
   * but already has an identical record on the DHT, originalHash will be the
   * hash it was stored as first.  If the object truly doesn't correspond to any
   * DHT object, the originalHash will be undefined until it is saved.
   * @protected
   */
  protected originalHash: Hash<this>;
  /**
   * lastHash is the computed hash of the data returned when you
   * get(this.originalHash).  If the object has been modified before, this is
   * the hash of the object as it was most recently update()ed.  lastHash is
   * undefined if the object is not stored on the DHT yet.
   */
  protected lastHash: Hash<this>;
  /**
   * Returns the POD struct that is stored in the DHT. Modifying the object
   * will have no effect.
   * @returns {tE & typeof Superclass.entryType} the entry
   */
  get entry(): typeof HoloObject.entryType & tE {
    return deepAssign({}, this.myEntry);
  }

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
  static get(hash: Hash<holochain.JsonEntry>): HoloObject<holochain.JsonEntry> {
    let it = new this(null, hash);
    if (it && it.myEntry) {
      it.isCommitted = true;
      it.myHash = hash;
      it.originalHash = hash;
      it.lastHash = notError(makeHash(this.className, it.myEntry));
    } else {
      throw new RangeError(`Hash of ${this.className} ${hash} not found`);
    }
    return it;
  }

  /**
   * Public accessor to get the hash of the entry.
   * @throws {holochain.HolochainError} if the entry is not loaded or created
   *  AND it doesn't exist on the DHT.
   * @returns {Hash<this>} the hash.
   */
  get hash(): Hash<this> {
    if (this.myHash) return this.myHash;
    let hash = makeHash(this.className, this.myEntry);
    if (isErr(hash)) {
      throw new TypeError(`entry type mismatch`);
    } else {
      return <Hash<this>>notError(hash);
    }
  }

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
  protected constructor(entry?: tE|null, hash?: Hash<tE>) {
    if (!entry == !hash) throw new Error(`use either entry or hash arguments; can't use both or none`)

    if (entry) {
      this.myEntry = entry;
      // can't do any makeHash here because the subclass constructor hasn't yet
      // assigned className.  It has to be moved into create() and get()

    } else {
      this.myEntry = <tE>notError(get(hash));

    }

  }

  /**
   * Retrieve a hypothetical hash of the entry.  Note that this hash is not
   * necessarily in the DHT.
   * @returns {Hash<this>} that hypothetically, the entry would have if committed.
   */
  makeHash(): Hash<this> {
    return notError<Hash<this>>(makeHash(this.className, this.entry));
  }

  private _commit(): Hash<this> {

    let hash = commit(this.className, <holochain.JsonEntry>this.myEntry);
    if (!hash || isErr(hash)) {
      throw new TypeError(`Failed to commit: ${JSON.stringify(hash)}`);
    } else {
      this.isCommitted = true;
      this.originalHash = this.originalHash || hash;
      this.lastHash = hash;
      this.myHash = hash;
      return hash;
    }

  }

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
  commit(): Hash<this> {
    if (!!this.openCount) return this.myHash;
    if (this.openError) throw this.openError;

    if (this.committed() && this.hasChanged()) {
      return this._update();
    } else {
      return this._commit();
    }
  }

  private _update(): Hash<this> {
    return this.myHash = notError<Hash<this>>(update(this.className, this.entry, this.myHash));
  }

  /**
   * Checks whether changes were made since the last commit, updates them if they
   * have.  Updates the local hash property as well.
   * @returns {Hash<this>}
   */
  update(): Hash<this> {
    if (!!this.openCount) return this.myHash;
    if (this.openError) throw this.openError;

    if (!this.committed()) {
      return this._commit();
    } else if (this.hasChanged()) {
      return this._update();
    } else {
      return this.myHash
    }
  }

  /**
   * Remove the entry from the DHT.  Chainable.  It is possible to screw up your
   * links this way, so override the method to manage those yourself (for now)
   * @param {string} msg The reason the entry is being deleted.  optional.
   * @returns {this}
   */
  remove(msg = ""): this {
    if (!!this.myHash && this.committed()) {
      remove(this.myHash, msg);
      this.isCommitted = false;
      this.myHash = null;
      return this;
    }
    return this;
  }

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
  open(mutator: (t: tE) => tE|null): this {
    const stack = this.openCount++;
    let mutant: tE = Object.assign({}, this.myEntry),
      error: Error = null;
    try {
      let r: tE = mutator(mutant);
      if (r) {
        this.myEntry = Object.assign({}, this.myEntry, r);
      } else {
        this.myEntry = Object.assign({}, this.myEntry, mutant);
      }

      if (--this.openCount === stack) this.openError = null;
    } catch (e) {
      error = this.openError = e;
    }

    return this;
  }

  /**
   * If the recent open() operation threw, examine the error to determine
   * whether the entry should be updated anyway.  If there was no error, update
   * the entry unless it is holding for another open call.
   * @param {(Error) => boolean} fn This is a catch function that will receive
   *  the recent error if it exists.  It should return true if the error is not
   *  unforgivable.
   * @returns {ThisType}
   */
  close(fn?: (e: Error) => boolean): this {
    let shouldUpdate = !this.openError;
    if (this.openError && fn) {
      shouldUpdate = fn(this.openError) && !!this.openCount--;
    }
    if (shouldUpdate) {
      this.update();
    }
    return this;
  }

  /**
   * Returns a CrudResponse for the entry.
   * @returns {CrudResponse<this.entryType>}
   */
  portable(): CrudResponse<tE> {
    return {
      hash: this.commit(),
      entry: this.entry,
      error: this.openError && deepAssign({}, this.openError),
      type: this.className
    };
  }

  /* Experimental (toggle comment by adding/removing slash) */
  /*
  readonly links: LinkDict<tE, this> = {};
  protected updateLinks(values: LinkVals<tE>) {
    let my = this.myEntry,
      hash = this.myHash,
      {links} = this,
      key: string;

    for (key of Object.keys(links)) {
      let link = links[key],
        tag = link.alias || key,
        repo: LinkRepo<this, object> = link.repo,
        old = values[key];
      if (old && old !== my[key]) {
        repo.remove(hash, old, tag).put(hash, values[key], tag);
      }
    }
  }

}

type LinkDict<E, T = E> = {
  [P in keyof E]?:
    (P extends string ?
      (E[P] extends Hash<infer L> ?
        (E[P] extends { alias: infer A } ?
          A extends string ? { alias: A, repo: LinkRepo<T, L, A> } : { repo: LinkRepo<T, L, P> }
        : never)
      : never)
    : never)
};

type LinkVals<E> = {
  [P in keyof E]?:
    P extends string ?
      E[P] extends Hash<infer L> ? Hash<L> : never
    : never
};

/*/
}
/**/

/**
 * VfEntry and VfObject are a base class for entities that have to do with VF.
 * The standard says that there are a few fields that any object could have.
 */
interface VfEntry {
  name?: string;
  image?: string;
  note?: string;
  url?: string;
}

/**
 * A base class for all VF entities that enable them to carry the optional
 * properties any VF entity can have.  See docs on HoloObject on how to extend.
 * @see HoloObject
 * @arg T Use this type argument to convey the entry type of a subclass.
 */
//* EXPORT
export /**/class VfObject<T extends object = {}> extends HoloObject<VfEntry & typeof HoloObject.entryType & T> {
  static entryType: VfEntry & typeof HoloObject.entryType;
  protected myEntry: VfEntry & typeof HoloObject.entryType & T;
  static className = "VfObject";
  className: string = "VfObject";
  static entryDefaults: VfEntry & typeof HoloObject.entryDefaults = {};

  static create(entry: VfEntry & typeof HoloObject.entryType): VfObject {
    return <VfObject> super.create(entry);
  }
  static get(hash: Hash<VfObject>): VfObject {
    return <VfObject>super.get(hash);
  }
  constructor(entry: T|null, hash?: string) {
    super(entry, hash);
  }

  get name(): string {
    return this.myEntry.name;
  }
  set name(to: string) {
    this.myEntry.name = to;
  }

  get image(): string {
    return this.myEntry.image;
  }
  set image(to: string) {
    this.myEntry.image = to;
  }

  get note(): string {
    return this.myEntry.note;
  }
  set note(to:string) {
    this.myEntry.note = to;
  }

  get url(): string {
    return this.myEntry.url;
  }
  set url(to:string) {
    this.myEntry.url = to;
  }
}

//* HOLO-SCOPE
function wtf<T extends holochain.JsonEntry>(crud: CrudResponse<T>): CrudResponse<object>[] {

  return [];
}
/**/
//* EXPORT
export/**/function callZome(zome: string, fn: string, arg: holochain.JsonEntry): holochain.JsonEntry {
  return JSON.parse(call(zome, fn, arg));
}

// Now moving all the link definitions here.
//* EXPORT
export/**/const AgentProperty: LinkRepo<
  agents.Agent|resources.EconomicResource,
  resources.EconomicResource|agents.Agent,
  "owns"|"owner"
> = new LinkRepo("AgentProperty");
AgentProperty
  .linkBack(`owns`, `owner`)
  .linkBack(`owner`, `owns`)
  .singular(`owner`);

//* EXPORT
export/**/const Classifications: LinkRepo<
  events.Transfer|events.TransferClassification|events.Process|events.ProcessClassification,
  events.Transfer|events.TransferClassification|events.Process|events.ProcessClassification,
  "classifiedAs"|"classifies"
> = new LinkRepo("Classifications");
Classifications
  .linkBack("classifiedAs", "classifies")
  .linkBack("classifies", "classifiedAs")
  .singular("classifiedAs");


//* EXPORT
export/**/const EventLinks: LinkRepo<
  events.EconomicEvent|events.Transfer|events.Process|events.Action,
  events.EconomicEvent|events.Transfer|events.Process|events.Action,
  "inputs"|"inputOf"|"outputs"|"outputOf"|"actionOf"|"action"
> = new LinkRepo("EventLinks");
EventLinks.linkBack("inputs", "inputOf")
  .linkBack("outputs", "outputOf")
  .linkBack("inputOf", "inputs")
  .linkBack("outputOf", "outputs")
  .linkBack("action", "actionOf")
  .linkBack("actionOf", "action")
  .singular(`inputOf`)
  .singular(`outputOf`)
  .singular(`action`);

//* EXPORT
export/**/const ResourceClasses: LinkRepo<
  resources.EconomicResource|resources.ResourceClassification,
  resources.EconomicResource|resources.ResourceClassification,
  "classifiedAs"|"classifies"
> = new LinkRepo("ResourceClasses");
ResourceClasses
  .linkBack("classifiedAs","classifies")
  .linkBack("classifies", "classifiedAs")
  .singular("classifiedAs");

//* EXPORT
export/**/const ResourceRelationships: LinkRepo<
  resources.EconomicResource,
  resources.EconomicResource,
  "underlyingResource"|"contains"|"underlies"|"inside"
> = new LinkRepo("ResourceRelationships");
ResourceRelationships
  .linkBack(`underlyingResource`, `underlies`)
  .linkBack(`underlies`, `underlyingResource`)
  .singular(`underlies`)
  .singular(`underlyingResource`)
  .linkBack(`contains`, `inside`)
  .linkBack(`inside`, `contains`)
  .singular(`inside`);

//* EXPORT
export/**/const TrackTrace: LinkRepo<
  resources.EconomicResource|events.EconomicEvent,
  events.EconomicEvent|resources.EconomicResource,
"affects"|"affectedBy">
= new LinkRepo("TrackTrace");
TrackTrace
  .linkBack("affects", "affectedBy")
  .linkBack("affectedBy", "affects")
  .singular("affects");
