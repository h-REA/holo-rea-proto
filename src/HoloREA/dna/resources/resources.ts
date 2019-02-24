// <reference path="../common/common"/>
// <reference path="../agents/agents"/>
// <reference path="../events/events"/>
//* IMPORT
//import { LinkRepo, VfObject, QuantityValue, Hash, QVlike, notError, CrudResponse, PhysicalLocation, HoloThing, entryOf, hashOf } from "../../../lib/ts/common";
import {
  VfObject, QuantityValue, Hash, QVlike, notError, CrudResponse,
  PhysicalLocation, HoloThing, entryOf, hashOf, deepAssign, Initializer, Fixture, reader, creator, callZome, TrackTrace, ResourceClasses, ResourceRelationships, AgentProperty
} from "../common/common";
import {LinkRepo, LinkSet} from "../common/LinkRepo";
import events from "../events/events";
import agents from "../agents/agents";
/*/
/**/

/* TYPE-SCOPE
import "../common/common";
import "../common/holochain-proto";
import "../events/events";
import "../agents/agents";
//import "LinkRepo";
import { LinkRepo } from "../common/LinkRepo";
/*/
/**/

// <links>
// <imported from events>

// </imported from agents/>




// </imported>

// <own> links

// </own> </links>

// <classes>
interface RcEntry {
  /**
   * New instances of the resource will have these units unless overriden on
   * the instance itself.  Non-standard.
   * @type {string}
   */
  defaultUnits: string;
}

/**
 * Represents a category of resources.  For now, it merely provides the default unit
 * for quantities of resources in this class.
 * @extends HoloObject
 */
class ResourceClassification<T = {}> extends VfObject<T & RcEntry & typeof VfObject.entryType> {
  static className = "ResourceClassification";
  className = "ResourceClassification";
  static entryType: RcEntry & typeof VfObject.entryType;
  static entryDefaults = deepAssign({}, VfObject.entryDefaults, <Initializer<RcEntry>> {
      defaultUnits: ''
    });

  static get(hash: Hash<ResourceClassification>): ResourceClassification {
    return <ResourceClassification> super.get(hash);
  }
  static create(entry: RcEntry & typeof VfObject.entryType): ResourceClassification {
    return <ResourceClassification> super.create(entry);
  }
  constructor(entry?: T & RcEntry & typeof VfObject.entryType, hash?: Hash<ResourceClassification>) {
    super(entry, hash);
  }

  instance(properties: typeof EconomicResource.entryType): EconomicResource {
    let {units, quantity} = properties.currentQuantity,
      my = this.myEntry;
    if (!units) {
      units = my.defaultUnits;
    } else if (!!my.defaultUnits && units !== my.defaultUnits) {
      throw new TypeError(`Quantity of resources of class ${my.name || my.url} is expressed in ${my.defaultUnits}, not ${units}`);
    }
    return EconomicResource.create({
      resourceClassifiedAs: this.hash,
      currentQuantity: {units, quantity},
      underlyingResource: properties.underlyingResource,
      contains: properties.contains,
      trackingIdentifier: properties.trackingIdentifier,
      owner: properties.owner
    });
  }

  get defaultUnits(): string {
    return this.myEntry.defaultUnits;
  }
  set defaultUnits(to: string) {
    this.myEntry.defaultUnits = to;
  }

  instances(): EconomicResource[] {
    return ResourceClasses.get(this.myHash)
      .tags<resources.EconomicResource>(`classifies`)
      .hashes().map(erh => EconomicResource.get(erh));
  }

}



interface ErEntry {
  currentQuantity: QVlike;
  resourceClassifiedAs: Hash<ResourceClassification>; //Hash<ResourceClassification>;
  underlyingResource?: Hash<EconomicResource>;
  contains?: Hash<EconomicResource>;
  trackingIdentifier?: string;
  //quantityLastCalculated: number;
  // TODO agent resource roles when they are established
  owner: Hash<agents.Agent>
}

class EconomicResource<T = {}> extends VfObject<T & ErEntry & typeof VfObject.entryType> {
  // <mandatory overrides>
  className:string = "EconomicResource";
  static className = "EconomicResource";
  static entryType: typeof VfObject.entryType & ErEntry;

  static get(hash: Hash<EconomicResource>): EconomicResource {
    const it = <EconomicResource> super.get(hash);
    const my = it.myEntry;

    it.pullLinks();
    return it;

    const owners = AgentProperty.get(my.owner, `owns`).select(({hash}) => hash === it.myHash);
    if (my.owner && !owners.length) {
      throw new Error(`resource was re-assigned ownership, but can't recover new owner`);
    }

    const underlying = ResourceRelationships.get(hash, `underlyingResource`);
    if (underlying.length) {
      const mine = underlying.select(({hash: link}) => link === my.underlyingResource);
      let more = underlying.select(({hash: link}) => link !== my.underlyingResource);
      if (more.length) {
        mine.removeAll();
        let pop: Hash<EconomicResource> = more.hashes()[0];
        more.select(({hash: link}) => link !== pop).removeAll();
        my.underlyingResource = pop;
      } else if (!mine.length) {
        my.underlyingResource = null;
      }
    }

    const contains = ResourceRelationships.get(hash, `contains`);
    if (contains.length) {
      const mine = contains.select(({hash: link}) => link === my.contains);
      let more = contains.select(({hash: link}) => link !== my.contains);
      if (more.length) {
        mine.removeAll();
        let pop = more.hashes()[0];
        more.select(({hash: link}) => link !== pop).removeAll();
        my.contains = pop;
      } else if (!mine.length) {
        my.contains = null;
      }
    }

    const classy = ResourceClasses.get(hash, `classifiedAs`);
    if (classy.length) {
      const mine = classy.select(({hash: link}) => link === my.resourceClassifiedAs);
      let more = classy.select(({hash: link}) => link !== my.resourceClassifiedAs);
      if (more.length) {
        mine.removeAll();
        let pop = more.hashes()[0];
        more.select(({hash: link}) => link !== pop).removeAll();
        my.resourceClassifiedAs = pop;
      } else if (!mine.length) {
        my.resourceClassifiedAs = null;
      }
    }

    it.update();
    return it;
  }

  protected pullLinks() {
    if (this.committed()) {
      const my = this.myEntry, myHash = this.myHash;

      let underlying = ResourceRelationships.get(myHash, `underlyingResource`);
      ([my.underlyingResource] = underlying.hashes());

      let contains = ResourceRelationships.get(myHash, `contains`);
      ([my.contains] = contains.hashes());

      let type = ResourceClasses.get(myHash, `classifiedAs`);
      ([my.resourceClassifiedAs] = type.hashes());

      //let owner = AgentProperty.get(myHash, `owner`)
      if (this.hasChanged()) this.update();
    }
  }

  static create(entry: ErEntry & typeof VfObject.entryType): EconomicResource {
    let rc = notError(ResourceClassification.get(entry.resourceClassifiedAs));

    if (entry.currentQuantity) {
      if (!entry.currentQuantity.units) {
        entry.currentQuantity.units = rc.defaultUnits;
      }
    } else {
      entry.currentQuantity = {units: rc.defaultUnits, quantity: 0};
    }

    let it = <EconomicResource> super.create(entry);
    // I'm thinking this is fundamentally wrong.  2 reasons.
    //  (1) See how there is no hash argument?  Unless a guess happened, the
    //    object has no hash and no links.
    //  (2) A freshly created object shouldn't have any side effects if not
    //    committed.  It's too early to do this.
    // Changed to new function, pullLinks, which does check on its hash.
    it.pullLinks();

    return it;
  }
  constructor(entry: T & ErEntry & typeof VfObject.entryType | null, hash?: Hash<EconomicResource>) {
    super(entry, hash);
  }
  static entryDefaults = deepAssign({}, VfObject.entryDefaults, <Initializer<ErEntry>>{
    resourceClassifiedAs: () => getFixtures(null).ResourceClassification.currency,
    owner: ``
  }, <Initializer<ErEntry>> {
    currentQuantity(it): QVlike {
      if (it.resourceClassifiedAs) {
        let rc = ResourceClassification.get(it.resourceClassifiedAs);
        return { units: rc.defaultUnits, quantity: 0 };
      } else {
        return { units: '', quantity: 0 };
      }
    }
  });

  // </mandatory overrides>

  get underlyingResource(): EconomicResource {
    return EconomicResource.get(this.myEntry.underlyingResource);
  }
  set underlyingResource(to: EconomicResource) {
    this.myEntry.underlyingResource = to && to.hash;
  }

  get contains(): EconomicResource {
    return EconomicResource.get(this.myEntry.contains);
  }
  set contains(to: EconomicResource) {
    this.myEntry.contains = to && to.hash;
  }

  get classification(): ResourceClassification {
    return ResourceClassification.get(this.myEntry.resourceClassifiedAs);
  }
  set classification(to: ResourceClassification) {
    this.myEntry.resourceClassifiedAs = to && to.hash;
  }

  get owner(): Hash<agents.Agent> {
    return this.myEntry.owner;
  }
  set owner(to: Hash<agents.Agent>) {
    this.owner = to || null;
  }

  // This seems to be pushing links, not pulling them.
  protected updateLinks(hash?: Hash<this>): Hash<this> {
    hash = hash || this.myHash;
    const my = this.myEntry;

    let relationships = ResourceRelationships.get(hash);

    let underlying = relationships.tags(`underlyingResource`);
    if (my.underlyingResource && !underlying.has(`underlyingResource`, my.underlyingResource)) {
      ResourceRelationships.put(hash, my.underlyingResource, `underlyingResource`);
      underlying.removeAll();
    }

    let contains = relationships.tags(`contains`);
    if (my.contains && !contains.has(`contains`, my.contains)) {
      ResourceRelationships.put(hash, my.contains, `contains`);
      contains.removeAll();
    }

    let classy = ResourceClasses.get(hash, `classifiedAs`);
    let myClass = my.resourceClassifiedAs;
    if (myClass && (!classy.length || classy.hashes()[0] !== myClass)) {
      ResourceClasses.put(hash, myClass, `classifiedAs`);
      classy.removeAll();
    }

    let owner = AgentProperty.get(hash, `owner`);
    if (!(owner.length && owner.has(`owner`, my.owner))) {
      AgentProperty.put(this.myHash, my.owner, `owner`);
      owner.removeAll();
    }

    return hash;
  }

  remove(msg?: string): this {
    const my = this.myEntry;
    if (my.resourceClassifiedAs) {
      ResourceClasses.remove(this.myHash, my.resourceClassifiedAs, `classifiedAs`);
    }
    TrackTrace.get(this.myHash, `affectedBy`).removeAll();

    let relations = ResourceRelationships.get(this.myHash);
    let internal = relations.tags(`underlyingResource`, `contains`);
    let external = relations.tags(`underlies`, `inside`);
    internal.removeAll();

    for (let underlies of external.tags(`underlies`).hashes()) {
      let res = EconomicResource.get(underlies);
      res.underlyingResource = null;
    }
    for (let inside of external.tags(`inside`).hashes()) {
      let res = EconomicResource.get(inside);
      res.contains = null;
    }

    return super.remove(msg);
  }

  update(): Hash<this> {
    return this.updateLinks(super.update());
  }

  commit(): Hash<this> {
    return this.updateLinks(super.commit());
  }

  trace(): Hash<events.EconomicEvent>[] {
    let links = TrackTrace.get(this.myHash, `affectedBy`);
    let eEvents = links.types<events.EconomicEvent>("EconomicEvent");
    // I hate this a lot.
    return <Hash<events.EconomicEvent>[]> callZome(`events`, `sortEvents`, {events: eEvents.hashes(), order: `up`, by: `end` });
  }

  get currentQuantity(): QuantityValue {
    return new QuantityValue(this.myEntry.currentQuantity);
  }
  set currentQuantity(to: QuantityValue) {
    let {units, quantity} = to;
    this.myEntry.currentQuantity = {units, quantity};
  }
}
// </classes>

// <export>

//* TYPE-SCOPE
declare global {
/*/
/**/
namespace resources {
  export type EconomicResource = typeof EconomicResource.entryType;
  export type ResourceClassification = typeof ResourceClassification.entryType;
  //export type TrackTrace = typeof TrackTrace;
  //export type ResourceClasses = typeof ResourceClasses;
  //export type ResourceRelationships = typeof ResourceRelationships;
}
//* TYPE-SCOPE
}
/*/
/**/
//* EXPORT
export default resources;
/*/
/**/

// </export>

// <fixtures>

// </fixtures>

// public <zome> functions

/**
 * Retrieves the hashes of all EconomicResource instances classified as given.
 * @param {Hash<ResourceClassification>} classification the classification to
 *  get instances of.
 * @returns {Hash<EconomicResource>[]}
 */
//* HOLO-SCOPE
function getResourcesInClass(
  {classification}:
  {classification: Hash<ResourceClassification>}
): Hash<EconomicResource>[] {
  return ResourceClasses.get(classification, `classifies`).hashes();
}

function getAffectingEvents({resource}: {resource: Hash<EconomicResource>}): Hash<events.EconomicEvent>[] {
  return TrackTrace.get(resource, "affectedBy").types<events.EconomicEvent>("EconomicEvent").hashes();
}

// CRUD

function createResource(
  {
    properties: props,
    event: thing,
    response = `resource`,
    resource
  }: {
    properties?: resources.EconomicResource,
    event: HoloThing<events.EconomicEvent>,
    response?: "event"|"resource",
    resource?: resources.EconomicResource
  }
): CrudResponse<typeof EconomicResource.entryType | events.EconomicEvent> {
  let it: EconomicResource, err: Error;
  let event: events.EconomicEvent;
  let amount: QVlike;
  let action: events.Action;
  let sign: number;

  try {
    props = props || resource;
    if (!props) {
      throw new Error(`resource properties are required`);
    }
    if (thing) {
      event = entryOf(thing);
    }

    if (!event) {
      let crud = <CrudResponse<events.EconomicEvent>>
        callZome(`events`, `resourceCreationEvent`, {
          resource: props
        });
      if (crud.error) {
        return crud;
      }
      event = crud.entry;
      let res = EconomicResource.get(event.affects);
      // that's all we needed to do to sync up its links.
      // or is it?
      // events.resourceCreationEvent calls back here having produced nothing of
      // its own yet
      // during that callback, this function creates the resource and commits it
      // without its event link (and at 0 quantity).
      // this function then calls events.createEvent to make the event
      // createEvent, when it commits the event, attaches the link, which should
      // propagate in its repo without any further action
      // event.commit also calls back into resources.affect *after* the event
      // is actually committed to the DHT
      // affect:
      //  - loads the object again
      //    - pulls down its links, which *will not* necessarily be up-to-date
      //      - affects will be null on the entry and probably still have no link
      //  - modifies the quantity, causing the object to be flagged modified
      //  - updates the DHT entry of the resource
      //  - the new hash is returned from update(), but I don't think the event
      //    cares about that
      // So the affects link is up there already, there is no need to update here.
      //res.update();
      return response === "event" ? crud : res.portable();
    }


    let resQv = props.currentQuantity;
    let evQv = event.affectedQuantity;
    // a dangerous but time-saving assumption (!!action), will crash if violated
    action = notError(get(event.action));
    switch (action.behavior) {
      case '+': sign = 1; break;
      case '-': sign = -1; break;
      case '0': sign = 0; break;
    }

    if (resQv && evQv) {
      if (resQv.units !== evQv.units) {
        if (!resQv.units && resQv.quantity === 0) {
          let {units, quantity} = evQv;
          quantity *= sign;
          amount = {units, quantity};
          //resQv.quantity = evQv.quantity;
          //resQv.units = evQv.units;
        } else if (!evQv.units && evQv.quantity === 0) {
          let {units, quantity} = resQv;
          amount = {units, quantity};
          //evQv.units = resQv.units;
          //evQv.quantity = resQv.quantity;
        } else {
          throw new TypeError(`Can't create resource in ${resQv.units} from event in ${evQv.units}`);
        }
      } else {
        amount = {units: evQv.units, quantity: sign*evQv.quantity + resQv.quantity};
      }
      //props.currentQuantity = resQv;
      //event.affectedQuantity = evQv;
    } else if (resQv) {
      let {units, quantity} = resQv;
      amount = {units, quantity};
    } else if (evQv) {
      let {units, quantity} = evQv;
      quantity *= sign;
      amount = {units, quantity};
    } else {
      amount = { units: notError(get(props.resourceClassifiedAs)).defaultUnits, quantity: 0 };
    }

    event.affectedQuantity = { units: amount.units, quantity: amount.quantity*sign };
    props.currentQuantity = { units: amount.units, quantity: 0 };

    if (!event.receiver) {
      event.receiver = props.owner || event.provider;
    }
    if (!event.provider) {
      event.provider = props.owner || event.receiver;
    }
    if (!props.owner) {
      props.owner = event.receiver || event.provider;
    }
    if (!props.trackingIdentifier) {
      props.trackingIdentifier = new Date().toString();
    }

  } catch (e) {
    return {
      error: e,
      hash: null,
      type: "Error",
      entry: null
    };
  }
  let eventCrud: CrudResponse<events.EconomicEvent>;

  try {
    it = notError<EconomicResource>(EconomicResource.create(props));
    event.affects = it.commit();
    eventCrud = <CrudResponse<events.EconomicEvent>> callZome(`events`, `createEvent`, event);
  } catch (e) {
    err = e;
  }
  err = err || (eventCrud && eventCrud.error) || (!eventCrud ? new Error(`failed to createEvent`) : null);

  let entry = it && it.entry;
  if (it) entry.currentQuantity = amount;

  let resCrud: CrudResponse<typeof EconomicResource.entryType> = {
    error: err,
    hash: err ? null : it.hash,
    entry: err ? null : entry,
    type: err ? "error" : it.className
  };
  if (eventCrud) eventCrud.error = err;
  return response === `event` ? eventCrud : resCrud;
}

//const readResources = reader(EconomicResource);

function readResources(hashes: Hash<resources.EconomicResource>[]): CrudResponse<resources.EconomicResource>[] {

  return hashes.map((hash) => {
    let err: Error = null;
    let qv: QuantityValue;
    let state: EconomicResource;

    try {
      const events = TrackTrace.get(hash, `affectedBy`);
      state = EconomicResource.get(hash);
      if (!state) throw new ReferenceError(`no resource with hash ${hash}`);
      const units = state.currentQuantity.units;

      qv = events.unique(false).data().reduce((sum: QuantityValue, {action: actHash, affectedQuantity}: events.EconomicEvent) => {
        const action = notError<events.Action>(get(actHash));
        const sign = ({ '+': 1, '-': -1, '0': 0 })[action.behavior];
        const signQv = new QuantityValue({ units: '', quantity: sign });
        const qv = signQv.mul(affectedQuantity);

        return sum.add(qv);
      }, new QuantityValue({ units, quantity: 0 }));
    } catch (e) {
      err = e;
    }
    return {
      error: err,
      hash: state && state.hash,
      type: state && state.className,
      entry: state && state.entry && Object.assign(state.entry, { currentQuantity: qv })
    };
  });
}

const createResourceClassification = creator(ResourceClassification);
/**/
/*
function createResourceClassification(props?: typeof ResourceClassification.entryType): CrudResponse<typeof ResourceClassification.entryType> {
  let it: ResourceClassification, err: Error;
  try {
    it = notError<ResourceClassification>(ResourceClassification.create(props));
  } catch (e) {
    err = e;
  }
  return {
    error: err,
    hash: err ? null : it.commit(),
    entry: err ? null : it.entry,
    type: err ? "error" : it.className
  };
}
*/
//* HOLO-SCOPE
const readResourceClasses = reader(ResourceClassification);
/**/
function getFixtures(dontCare: {}): {ResourceClassification: Fixture<ResourceClassification>} {
  return {
    ResourceClassification: {
      thing: ResourceClassification.create({name: `thing`, defaultUnits: ``}).commit(),
      currency: ResourceClassification.create({name: `currency`, defaultUnits: ``}).commit(),
      work: ResourceClassification.create({name: `work`, defaultUnits: `hours`}).commit(),
      idea: ResourceClassification.create({name: `idea`, defaultUnits: `citations`}).commit()
    }
  }
}
//* HOLO-SCOPE
function affect({resource, quantity}:{
  resource: HoloThing<resources.EconomicResource>,
  quantity: QVlike
}): CrudResponse<resources.EconomicResource> {
  // Unless I really do have to remodel EconomicResource, this is not necessary
  return {
    error: null,
    hash: hashOf(resource),
    entry: entryOf(resource),
    type: `EconomicResource`
  };
  let err: Error = null, hash: Hash<resources.EconomicResource>, res:EconomicResource;
  try {
    res = EconomicResource.get(hashOf(resource));
    res.currentQuantity = res.currentQuantity.add(quantity);
    hash = res.update();
  } catch (e) {
    err = e;
  }

  return {
    error: err,
    hash: hash || (res && res.hash) || '',
    entry: (res && res.entry) || entryOf(resource),
    type: (res && res.className) || `Who knows what this thing is?!`
  };
}

// </zome>

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

// </callbacks>
/*/
/**/
