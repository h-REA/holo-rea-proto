import "./chai/chai";
import "./zomes";

const expect = chai.expect;

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
}

export interface Scenario {

  al: Person,
  bea: Person,
  chloe: Person,
  david: Person,

  types: {
    resource: { [name:string]: CrudResponse<resources.ResourceClassification> },
    process: { [name:string]: CrudResponse<events.ProcessClassification> },
    transfer: { [name:string]: CrudResponse<events.TransferClassification> }
  },

  actions: { [name:string]: CrudResponse<events.Action> },
  /*
  events: { [name:string]: CrudResponse<events.EconomicEvent> },
  transfers: { [name:string]: CrudResponse<events.Transfer> },
  processes: { [name:string]: CrudResponse<events.Process> },
  */
  verbs: Verbs,
  facts: { [name:string]: number },
  timeline: { [name:string]: number }
}

function scenario(): Scenario {
  return {
    al: new Person(),
    bea: new Person(),
    chloe: new Person(),
    david: new Person(),
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

    return events.createEvent({
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

    return events.createEvent({
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

    return events.createTransfer({
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
        duration: 1000*cups*facts.mlPerCup*facts.secondsPerHour/facts.coffeePerHour,
        affects: coffeeRes,
        affectedQuantity: { units: `mL`, quantity: cups*facts.mlPerCup }
      })
    ]);

    return events.createProcess({
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

    return events.createProcess({
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

  my.verbs = {
    pickApples, gatherBeans, trade: transfer, bakeTurnovers, brewCoffee,
    inventory
  };

  return my;
}

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

export async function ready(): Promise<Scenario> {

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



  // Time to start making events and resources
  prep = prep.then(async (my) => {

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

    let beaBeans = resources.createResource({
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
    let chloeCoffee = events.resourceCreationEvent({
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
