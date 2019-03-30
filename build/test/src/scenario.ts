//import chai from "./chai/chai";
import "./zomes.js";
//import {window, localStorage} from "dom";

//console.log('Chai inited:', chai)
//const expect = chai.expect;

/**
 * Web API tests
 * Agents
 */

export class Person {
  agent: CrudResponse<agents.Agent>;
  apples: CrudResponse<resources.EconomicResource>;
  beans: CrudResponse<resources.EconomicResource>;
  coffee: CrudResponse<resources.EconomicResource>;
  turnovers: CrudResponse<resources.EconomicResource>;
}
export interface Verbs {

  pickApples(
    howMany: number,
    when?: IntDate,
    inventory?: Hash<resources.EconomicResource>
  ): Promise<CrudResponse<events.EconomicEvent>>;

  gatherBeans(
    howMany: number,
    when?: IntDate,
    inventory?: Hash<resources.EconomicResource>
  ): Promise<CrudResponse<events.EconomicEvent>>;

  brewCoffee(
    howMuch: number,
    when?: IntDate,
    useBeans?: Hash<resources.EconomicResource>,
    inventory?: Hash<resources.EconomicResource>
  ): Promise<CrudResponse<events.Process>>;

  bakeTurnovers(
    howMany: number,
    when?: IntDate,
    useApples?: Hash<resources.EconomicResource>,
    inventory?: Hash<resources.EconomicResource>
  ): Promise<CrudResponse<events.Process>>;

  trade(
    howMuch: QuantityValue,
    from: Hash<resources.EconomicResource>,
    to: Hash<resources.EconomicResource>,
    when?: IntDate
  ): Promise<CrudResponse<events.Transfer>>

  inventory(who: Person): Promise<Inventory<QuantityValue>>;


  traceStep(...elements: TraceElement[]): Promise<Map<TraceElement, Set<TraceElement>>>;
  trackStep(...elements: TraceElement[]): Promise<Map<TraceElement, Set<TraceElement>>>;

  trace(...elements: TraceElement[]): Promise<TreeGraph>;
  track(...elements: TraceElement[]): Promise<TreeGraph>;

}

export interface Scenario {

  al: Person,
  bea: Person,
  chloe: Person,

  types: {
    resource: { [name:string]: CrudResponse<resources.ResourceClassification> },
    process: { [name:string]: CrudResponse<events.ProcessClassification> },
    transfer: { [name:string]: CrudResponse<events.TransferClassification> }
  },
  actions: { [name:string]: CrudResponse<events.Action> },
  verbs: Verbs,
  facts: { [name:string]: number },
  timeline: { [name:string]: number }
}

function scenario(): Scenario {
  return {
    al: new Person(),
    bea: new Person(),
    chloe: new Person(),
    types: {
      resource: {},
      transfer: {},
      process: {}
    },
    actions: {},
    //events: {},
    facts: {},
    verbs: null,
    //transfers: {},
    //processes: {},
    timeline: {}
  };
}

interface Inventory<T extends string|number|QuantityValue> {
  apples?: T;
  beans?: T;
  coffee?: T;
  turnovers?: T;
}

type TraceElement = CrudResponse<events.EconomicEvent | events.Process | events.Transfer | resources.EconomicResource>;

class TreeGraphNode {
  constructor(public element: TraceElement, public branch: Set<TreeGraphNode> = new Set<TreeGraphNode>()) {}
}

class TreeGraph {
  public topLevel: Set<TreeGraphNode>;
  private visited: Map<Hash<TraceElement>, TreeGraphNode>;
  private done = false;

  constructor(public step: (e:TraceElement) => Promise<Set<TraceElement>>, ...topLevel: TraceElement[]) {
    const nodes = topLevel.map((el) => new TreeGraphNode(el));
    this.topLevel = new Set(nodes);
    this.visited = new Map();
    for (let node of nodes) {
      this.visited.set(node.element.hash, node);
    }
  }

  notVisited(set: Set<TraceElement>): Set<TraceElement> {
    const {visited} = this;
    return new Set<TraceElement>([...set].filter(el => !visited.has(el.hash)));
  }

  existing(set: Set<TraceElement>): Set<TraceElement> {
    const {visited} = this;
    return new Set<TraceElement>([...set].filter((el) => visited.has(el.hash)));
  }

  async grow(): Promise<this> {
    if (this.done) return this;

    const visited = this.visited;
    let deck = new Set(this.topLevel);

    while (deck.size) {
      for (let node of [...deck]) {
        let branch = await this.step(node.element);

        this.notVisited(branch).forEach((el) => {
          let tgn = new TreeGraphNode(el);
          node.branch.add(tgn);
          deck.add(tgn);
          visited.set(el.hash, tgn);
        });

        this.existing(branch).forEach((el) => {
          node.branch.add(visited.get(el.hash));
        });

        deck.delete(node);
      }
    }
    this.done = true;
    return this;
  }

  get(hash: Hash<TraceElement>): TreeGraphNode {
    return this.visited.get(hash);
  }
}

async function ms(n: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, n);
  });
}

async function tick(): Promise<number> {
  const now = Date.now();
  if (now === tick.last) {
    return ms(1).then(tick);
  } else {
    tick.last = now;
    return now;
  }
}
namespace tick {
  export var last = Date.now();
}

export function verbify(my: Scenario) {
  let [al, bea, chloe] = [my.al, my.bea, my.chloe].map((person) => person.agent);
  let {facts, types, actions} = my;
  let {pick, gather, produce, consume} = actions;
  let trade = types.transfer.trade;
  let {brew, bake} = types.process;

  async function pickApples(
    howMany: number,
    when: number = 0,
    resource: Hash<resources.EconomicResource> = my.al.apples.hash
  ): Promise<CrudResponse<events.EconomicEvent>> {
    when = when || await tick();

    return await events.createEvent({
      action: pick.hash,
      provider: al.hash,
      receiver: al.hash,
      start: when,
      duration: howMany*1000*facts.secondsPerHour/facts.applesPerHour,
      affects: resource,
      affectedQuantity: { units: ``, quantity: howMany }
    });
  }


  async function gatherBeans(
    howMuch: number,
    when: number = 0,
    resource: Hash<resources.EconomicResource> = my.bea.beans.hash
  ): Promise<CrudResponse<events.EconomicEvent>> {
    when = when || await tick();

    return await events.createEvent({
      action: gather.hash,
      provider: bea.hash,
      receiver: bea.hash,
      start: when,
      duration: howMuch*1000*facts.secondsPerHour/facts.beansPerHour,
      affects: resource,
      affectedQuantity: { units: `kg`, quantity: howMuch }
    });
  }

  async function transfer(
    howMuch: QuantityValue,
    fromHash: Hash<resources.EconomicResource>,
    toHash: Hash<resources.EconomicResource>,
    when?: IntDate
  ): Promise<CrudResponse<events.Transfer>> {
    when = when || await tick();

    let [from, to] = await resources.readResources([fromHash, toHash]);

    return await events.createTransfer({
      transferClassifiedAs: trade.hash,
      inputs: {
        action: my.actions.give.hash,
        provider: from.entry.owner,
        receiver: to.entry.owner,
        affects: from.hash,
        start: when,
        duration: 1,
        affectedQuantity: howMuch
      },
      outputs: {
        action: my.actions.take.hash,
        provider: from.entry.owner,
        receiver: to.entry.owner,
        affects: to.hash,
        start: when,
        duration: 1,
        affectedQuantity: howMuch
      }
    });
  }

  async function brewCoffee(
    cups: number,
    when: number = 0,
    beanRes: Hash<resources.EconomicResource> = my.chloe.beans.hash,
    coffeeRes: Hash<resources.EconomicResource> = my.chloe.coffee.hash
  ): Promise<CrudResponse<events.Process>> {
    when = when || await tick();

    let beansNeeded = facts.spoonsPerCup*facts.gramsPerSpoon*cups/1000;
    let beansHad =
      (await resources.readResources([beanRes]))[0]
      .entry.currentQuantity.quantity;

    if (beansHad < beansNeeded) {
      return Promise.reject(
        `can't make ${cups} cups of coffee with only ${beansHad} kg of coffee beans`
      );
    }

    let [consumeEv, brewEv] = await Promise.all([
      events.createEvent({
        action: consume.hash,
        provider: chloe.hash,
        receiver: chloe.hash,
        start: when,
        duration: 1,
        affects: beanRes,
        affectedQuantity: { units: `kg`, quantity: beansNeeded }
      }),
      events.createEvent({
        action: produce.hash,
        provider: chloe.hash,
        receiver: chloe.hash,
        start: when,
        duration: Math.ceil(1000*cups*facts.mlPerCup*facts.secondsPerHour/facts.coffeePerHour),
        affects: coffeeRes,
        affectedQuantity: { units: `mL`, quantity: cups*facts.mlPerCup }
      })
    ]);

    return await events.createProcess({
      processClassifiedAs: brew.hash,
      inputs: [consumeEv.hash],
      outputs: [brewEv.hash],
      plannedStart: when,
      plannedDuration: 1000*cups*facts.mlPerCup*facts.secondsPerHour/facts.coffeePerHour,
      isFinished: true
    })

  }

  async function bakeTurnovers(
    howMany: number,
    when?: IntDate,
    appleRes: Hash<resources.EconomicResource> = my.chloe.apples.hash,
    turnoverRes: Hash<resources.EconomicResource> = my.chloe.turnovers.hash
  ): Promise<CrudResponse<events.Process>> {
    when = when || await tick();

    let usedApples = howMany*facts.applesPerTurnover;

    let [currentApples] = await resources.readResources([appleRes]);
    if (!currentApples || !currentApples.entry || currentApples.error || currentApples.entry.currentQuantity.quantity < usedApples) {
      throw new Error(`can't make ${howMany} turnovers with ${currentApples.entry.currentQuantity.quantity}/${usedApples} apples`);
    }

    let [consumeEv, produceEv] = await Promise.all([
      events.createEvent({
        action: my.actions.consume.hash,
        provider: chloe.hash,
        receiver: chloe.hash,
        affects: appleRes,
        start: when,
        duration: facts.bakeTime*1000,
        affectedQuantity: { units: ``, quantity: usedApples }
      }),
      events.createEvent({
        action: my.actions.produce.hash,
        provider: chloe.hash,
        receiver: chloe.hash,
        affects: turnoverRes,
        start: when,
        duration: facts.bakeTime*1000,
        affectedQuantity: { units: ``, quantity: howMany }
      })
    ]);

    return await events.createProcess({
      processClassifiedAs: bake.hash,
      plannedStart: when,
      plannedDuration: facts.bakeTime,
      inputs: [consumeEv.hash],
      outputs: [produceEv.hash],
      isFinished: true
    });
  }

  async function inventory(who: Person): Promise<Inventory<QuantityValue>> {
    let {apples, beans, coffee, turnovers} = who;

    [apples, beans, coffee, turnovers] = await resources.readResources(
      [apples, beans, coffee, turnovers].map((r) => r.hash)
    );

    let res: Inventory<QuantityValue> = {};
    let [qa, qb, qc, qt] = [apples, beans, coffee, turnovers].map((r) => {
      let q = r.entry.currentQuantity;
      return q;
    });

    if (qa) res.apples = qa;
    if (qb) res.beans = qb;
    if (qc) res.coffee = qc;
    if (qt) res.turnovers = qt;

    return res;
  }



  async function traceStep(after: TraceElement): Promise<Set<TraceElement>> {
    const before = new Set<TraceElement>();

    switch (after.type) {
      case "EconomicEvent": {
        const event = <events.EconomicEvent> after.entry;
        if (event.inputOf) {
          let [res] = await resources.readResources([event.affects]);
          before.add(res);
        }
        if (event.outputOf) {
          const fns = await events.traceEvents([after.hash]);
          for (let fn of fns) before.add(fn);
        }
      } break;

      case "Process":
      case "Transfer": {
        const ev = await events.traceTransfers([after.hash]);
        for (let e of ev) before.add(e);
      } break;

      case "EconomicResource": {
        const hashes = await resources.getAffectingEvents({resource: after.hash});
        const evs = await events.readEvents(hashes);
        evs.filter((ev) => !!ev.entry.outputOf || !ev.entry.inputOf).forEach((ev) => before.add(ev));
      }
    }

    return before;
  }

  async function trackStep(before: TraceElement): Promise<Set<TraceElement>> {
    const after = new Set<TraceElement>();

    switch (before.type) {
      case "EconomicEvent": {
        const ev = <events.EconomicEvent> before.entry;
        if (ev.outputOf) {
          const [res] = await resources.readResources([ev.affects]);
          after.add(res);
        }
        if (ev.inputOf) {
          (await events.trackEvents([before.hash])).forEach((fn) => after.add(fn));
        }
      } break;

      case "Transfer":
      case "Process": {
        (await events.trackTransfers([before.hash])).forEach((ev) => after.add(ev));
      } break;

      case "EconomicResource": {
        const hashes = await resources.getAffectingEvents({resource: before.hash});
        const evts = await events.readEvents(hashes);
        evts.filter((ev) => !!ev.entry.inputOf).forEach((ev) => after.add(ev));
      }
    }

    return after;
  }

  my.verbs = {
    pickApples, gatherBeans, trade: transfer, bakeTurnovers, brewCoffee,
    inventory,
    traceStep: async function (...elements: TraceElement[]): Promise<Map<TraceElement, Set<TraceElement>>> {
      const map = new Map<TraceElement, Set<TraceElement>>();
      for (let element of elements) {
        let set = await traceStep(element);
        map.set(element, set);
      }
      return map;
    },
    trackStep: async function (...elements: TraceElement[]): Promise<Map<TraceElement, Set<TraceElement>>> {
      const map = new Map<TraceElement, Set<TraceElement>>();
      for (let element of elements) {
        let set = await trackStep(element);
        map.set(element, set);
      }
      return map;
    },
    async trace(...elements: TraceElement[]): Promise<TreeGraph> {
      return new TreeGraph(traceStep, ...elements).grow();
    },
    async track(...elements: TraceElement[]): Promise<TreeGraph> {
      return new TreeGraph(trackStep, ...elements).grow();
    }
  };

  return my;
}
/*
function checkAllInventory(
  invs: Partial<{
    [name in "al"|"bea"|"chloe"]: Inventory<number>
  }>
): (sc: Scenario) => Promise<Scenario> {

  async function checkInv(person: Person, inv: Inventory<number>) {
    for (let resName of Object.keys(inv)) {
      let resHash: Hash<resources.EconomicResource> = person[resName].hash;
      let [res] = await resources.readResources([resHash]);
      expectGoodCrud(res, `EconomicResource`, `inventory crud: ${person.agent.entry.name} ${resName}`);
      expect(res.entry.currentQuantity, `inventory quantity: ${person.agent.entry.name} ${resName}`)
        .to.have.property(`quantity`, inv[resName]);
    }
  }

  return (sc) => Promise.all(Object.keys(invs).map(
    (name) => checkInv(sc[name], invs[name])
  )).then(() => sc);
}
*/
/*
function expectGoodCrud<T>(
  crud: CrudResponse<T>, type?: string, name?: string
): CrudResponse<T> {
  name = name || "(CRUD)";
  expect(crud).to.be.an(`object`);

  expect(crud.error, `${name}'s error`).to.not.exist;

  if (type) {
    expect(crud.type, `type of ${name}`).to.be.a(`string`).equals(type);
  }

  expect(crud, name).to.have.property(`hash`)
    .a(`string`)
    .that.does.exist
    .that.has.length.gt(1);

  expect(crud, name).to.have.property(`entry`)
    .an(`object`)
    .that.does.exist;

  return crud;
}
*/

function initTypes(): Promise<Scenario> {
  let prep: Promise<Scenario>;

  {
    prep = agents.createAgent({
      name: `Al`,
      note: `a note`,
      primaryLocation: [`1 roady street`, `placeville, XX 12345`]
    }).then((al) => {
      let my = scenario();
      my.al.agent = al;
      return my;
    }).then((my) => Promise.all([
        agents.createAgent({name: `Bea`}).then((bea) => {
          my.bea.agent = bea;
          return my;
        }),
        agents.createAgent({name: `Chloe`}).then((chloe) => {
          my.chloe.agent = chloe;
          return my;
        })
      ]).then(() => my)
    );
  }

  {
    prep = Promise.all([
      prep,
      // TEST resources.createResourceClassification
      resources.createResourceClassification({
        name: `apples`,
        defaultUnits: ``
      }),

      resources.createResourceClassification({
        name: `coffee beans`,
        defaultUnits: `kg`
      }),

      resources.createResourceClassification({
        name: `apple turnovers`,
        defaultUnits: ``
      }),

      resources.createResourceClassification({
        name: `coffee`,
        defaultUnits: `mL`
      })
    ]).then(([my, apples, beans, turnovers, coffee]) => {
      my.types.resource = {apples, beans, turnovers, coffee};
      return my;
    });
  }

  let stub: CrudResponse<events.TransferClassification>;
  prep = prep.then(async (my) => {
    // TEST events.getFixtures
    let evFix = await events.getFixtures(null);

    let tc = evFix.TransferClassification;
    let act = evFix.Action;
    let pc = evFix.ProcessClassification;

    // TEST events.readTransferClasses & readProcessClasses
    let p = Promise.all([

      events.readTransferClasses([tc.stub]).then(([stub]) => {
        my.types.transfer.stub = stub;
      }),

      events.readProcessClasses([pc.stub]).then(([stub]) => {
        my.types.process.stub = stub;
      })
    ]);

    // TEST events.readActions
    let [give, take, adjust, produce, consume] = await events.readActions([
      act.give, act.receive, act.adjust, act.produce, act.consume
    ]);
    my.actions = { give, take, adjust, produce, consume, receive: take };

    // TEST events.createAction
    let [pick, gather] = await Promise.all([
      events.createAction({name: `pick`, behavior: '+'}),
      events.createAction({name: `gather`, behavior: '+'})
    ]);

    Object.assign(my.actions, {pick, gather});

    // TEST events.createTransferClass
    let trade = my.types.transfer.trade = await events.createTransferClass({name: `trade`});


    // TEST events.createProcessClass
    let [bake, brew] = await Promise.all([
      events.createProcessClass({name: `bake`, label: `bake`}),
      events.createProcessClass({name: `brew`, label: `brew`})
    ]);

    my.types.process = Object.assign(my.types.process, {bake, brew});

    return p.then(() => my);
  });

  return prep;
}

async function initEvents(prep: Promise<Scenario>): Promise<Scenario> {
  // Time to start making events and resources
  return prep.then(async (my) => {

    let time = await tick();
    my.timeline.begin = time;

    let al = my.al.agent,
      bea = my.bea.agent,
      chloe = my.chloe.agent;
    let { apples, beans, turnovers, coffee } = my.types.resource,
      { pick, gather, give, take, adjust, produce, consume } = my.actions,
      { bake, brew } = my.types.process,
      { trade } = my.types.transfer;

    async function setupInventory(person: Person) {
      let name = person.agent.entry.name,
        hash = person.agent.hash,
        when = await tick();
      if (!person.apples) {
        person.apples = await resources.createResource({
          resource: {
            resourceClassifiedAs: apples.hash,
            owner: hash,
            currentQuantity: { units: '', quantity: 0 },
            trackingIdentifier: `${name}:apples`
          },
          event: {
            action: adjust.hash,
            provider: hash,
            receiver: hash,
            start: when,
            duration: 1
          }
        });
      }

      console.log(`before inventory setup, ${person.agent.entry.name}'s beans was ${person.beans && person.beans.entry.trackingIdentifier}'`);

      person.beans = person.beans || await events.resourceCreationEvent({
        resource: {
          resourceClassifiedAs: beans.hash,
          owner: hash,
          currentQuantity: { units: `kg`, quantity: 0 },
          trackingIdentifier: `${name}:beans`
        },
        dates: { start: when }
      })
      .then((ev) => resources.readResources([ev.entry.affects]))
      .then(([res]) => res);

      person.coffee = person.coffee || await events.resourceCreationEvent({
        resource: {
          resourceClassifiedAs: coffee.hash,
          owner: hash,
          currentQuantity: { units: `mL`, quantity: 0 },
          trackingIdentifier: `${name}:coffee`
        },
        dates: { start: when }
      })
      .then((ev) => resources.readResources([ev.entry.affects]))
      .then(([res]) => res);

      person.turnovers = person.turnovers || await events.resourceCreationEvent({
        resource: {
          resourceClassifiedAs: turnovers.hash,
          owner: hash,
          currentQuantity: { units: ``, quantity: 0 },
          trackingIdentifier: `${name}:turnovers`
        },
        dates: { start: when }
      })
      .then((ev) => resources.readResources([ev.entry.affects]))
      .then(([res]) => res);
    }

    // Too many requests, it seems.
    let alApples = await resources.createResource({
      properties: {
        resourceClassifiedAs: apples.hash,
        owner: al.hash,
        currentQuantity: { units: '', quantity: 100 },
        trackingIdentifier: `Al's apples`
      },
      event: {
        action: pick.hash,
        provider: al.hash,
        receiver: al.hash,
        start: time,
        duration: 1
      }
    }).then((alApples) => {
      return my.al.apples = alApples;
    });

    let beaBeans = await resources.createResource({
      properties: {
        resourceClassifiedAs: beans.hash,
        owner: bea.hash,
        currentQuantity: { units: 'kg', quantity: 2 },
        trackingIdentifier: `Bea's Beans`
      },
      event: {
        action: gather.hash,
        provider: bea.hash,
        receiver: bea.hash,
        start: my.timeline.beaGetsBeans = await tick(),
        duration: 1
      }
    }).then((bb) => (my.bea.beans = bb));

    // TEST events.resourceCreationEvent
    let chloeCoffee = await events.resourceCreationEvent({
      resource: {
        currentQuantity: { units: `mL`, quantity: 300 },
        resourceClassifiedAs: coffee.hash,
        trackingIdentifier: `Chloe's coffee`,
        owner: chloe.hash
      },
      dates: {
        start: my.timeline.chloeGetsCoffee = await tick()
      }
    }).then(async (adjustEv) => {

      let [res] = await resources.readResources([adjustEv.entry.affects]);

      return my.chloe.coffee = res;
    });

    await Promise.all([my.al, my.bea, my.chloe].map(person => setupInventory(person)));
    console.log(`after setup, Bea's beans are ${my.bea.beans.entry.trackingIdentifier}`);

    my.facts = (() => {
      let gramsPerSpoon: number = 2.5;
      let spoonsPerCup: number = 1;
      let mlPerCup: number = 236.588;
      let applesPerTurnover: number = 3;
      let secondsPerHour: number = 3600;
      // not sure where this ranks him, but Al can pick an apple every 5 seconds.
      let applesPerHour: number = (1/5)*secondsPerHour;
      let kgPerLb: number = 0.453592;
      // Bea is a "good picker" by NCAUSA.org standards.
      let beansPerHour: number = 30*kgPerLb/8;
      let coffeePerHour: number = (12/10)*mlPerCup*60;
      let bakeTime: number = 25*60;

      return {
        gramsPerSpoon, spoonsPerCup, mlPerCup, applesPerTurnover,
        secondsPerHour, applesPerHour, kgPerLb, beansPerHour,
        coffeePerHour, bakeTime
      };
    })();

    return verbify(my);
  });

  return prep;
}

async function recoverInventory(scenario: Scenario): Promise<Scenario> {
  const { al, bea, chloe } = scenario;
  const types = scenario.types.resource;
  const typeHashes = Object.keys(types).map(key => types[key].hash);
  const stuff = await agents.getOwnedResources({
    agents: [al, bea, chloe].map(who => who.agent.hash),
    types: typeHashes
  });

  for (let person of [al, bea, chloe]) {
    const own = stuff[person.agent.hash];
    [person.apples] = await resources.readResources(own[types.apples.hash]);
    [person.beans] = await resources.readResources(own[types.beans.hash]);
    [person.coffee] = await resources.readResources(own[types.coffee.hash]);
    [person.turnovers] = await resources.readResources(own[types.turnovers.hash]);
  }

  return scenario;
}

export async function ready (): Promise<Scenario> {

  return initTypes().then(async (scenario) => {
    let owned = await agents.getOwnedResources({ agents: [scenario.al.agent.hash], types: [scenario.types.resource.apples.hash] });
    console.log(`Al's inventory from DHT =>`);
    console.log(owned);

    if (!owned) {
      console.log(`nothing returned by getOwnedResources.  Initializing inventories. (this probably shouldn't happen)`);
      return initEvents(Promise.resolve(scenario));
    }

    let alStuff = owned[scenario.al.agent.hash];
    if (!alStuff) {
      console.log(`Al had no stuff.  Initializing.`);
      return initEvents(Promise.resolve(scenario));
    }

    let apples = alStuff[scenario.types.resource.apples.hash];

    if (!apples || apples.length === 0) {
      console.log(`No apples in Al's inventory.  Initializing.`);
      return initEvents(Promise.resolve(scenario));
    } else if (apples.length > 1) {
      throw new Error(`Al has ${apples.length} piles of apples.  He should have exactly 1.  Restart the DHT server and try again.`);
    }

    // be sure that the apples we found are good first.
    let [apple] = await resources.readResources(apples);
    console.log(`Al's apples on the DHT:`);
    console.log(apple);
    if (!apple) {
      console.warn(`Fishy disappearing apples from Al's pocket.  Initializing anyway.`);
      return initEvents(Promise.resolve(scenario));
    } else if (apple.error) {
      throw new Error(`Al's apples are illegitimate due to ${apple.error}; restart the DHT server to continue.`);
    }

    let eventHashes = await resources.getAffectingEvents({resource: apple.hash});
    console.log(`Events affecting Al's apples: ${eventHashes}`);

    if (!eventHashes || eventHashes.length === 0) {
      console.log(`No events set up Al's apples in the DHT.  Initializing.`);
      return initEvents(Promise.resolve(scenario));
    } else if (eventHashes.length > 1) {
      console.warn(`WARNING: found ${eventHashes.length} events acting on Al's apples.  There should be only 1.  Restart the DHT server unless you intended to join an existing scenario.`);
      return recoverInventory(verbify(scenario));
    } else {
      console.log(`DHT appears to be initialized normally already.`);
      return recoverInventory(verbify(scenario));
    }
  });
  /*
  let scenarioP = initTypes();
  let scenario = await scenarioP;

  let [apples] = await resources.readResources([scenario.al.apples.hash]);
  if (!apples || apples.error) {
    return await initEvents(scenario)
  }

  let storage = localStorage.getItem("gfdScenario");
  storage = storage && JSON.parse(storage);
  let needReload = false;

  if (!storage) {
    console.log(`scenario is not in storage.`);
    needReload = true;
  } else {
    console.log(`storage has a scenario; checking Al's apples`);
    let [apples] = await resources.readResources([storage.al.apples.hash]);
    console.log(apples);
    if (!apples || apples.error) {
      console.log(`DHT did not have Al's apples under the previous hash.`);
      needReload = true;
    } else {
      console.log(`DHT has Al's apples; checking related events`);
      let events = await resources.getAffectingEvents({ resource: apples.hash });
      console.log(events);
      if (!events || !events.length) {
        console.log(`No events on Al's apples; re-initializing`);
        needReload = true;
      } else if (events.length > 1) {
        console.warn(`WARNING: scenario is not pristine (too many events)`);
      }
    }
  }

  let using;
  if (needReload) {
    using = init().then((it) => {
      window.scenario = it;
      let saving = Object.assign({}, it, { verbs: null });
      localStorage.setItem("gfdScenario", JSON.stringify(saving));
      return it;
    });
  } else {
    let scenario = window.scenario = verbify(storage);
    using = Promise.resolve(scenario);
  }

  return using;
  */
}
