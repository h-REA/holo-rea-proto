var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//import chai from "./chai/chai";
import "./zomes.js";
//console.log('Chai inited:', chai)
//const expect = chai.expect;
/**
 * Web API tests
 * Agents
 */
export class Person {
}
function scenario() {
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
class TreeGraphNode {
    constructor(element, branch = new Set()) {
        this.element = element;
        this.branch = branch;
    }
}
class TreeGraph {
    constructor(step, ...topLevel) {
        this.step = step;
        this.done = false;
        const nodes = topLevel.map((el) => new TreeGraphNode(el));
        this.topLevel = new Set(nodes);
        this.visited = new Map();
        for (let node of nodes) {
            this.visited.set(node.element.hash, node);
        }
    }
    notVisited(set) {
        const { visited } = this;
        return new Set([...set].filter(el => !visited.has(el.hash)));
    }
    existing(set) {
        const { visited } = this;
        return new Set([...set].filter((el) => visited.has(el.hash)));
    }
    grow() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.done)
                return this;
            const visited = this.visited;
            let deck = new Set(this.topLevel);
            while (deck.size) {
                for (let node of [...deck]) {
                    let branch = yield this.step(node.element);
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
        });
    }
    get(hash) {
        return this.visited.get(hash);
    }
}
function ms(n) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, n);
        });
    });
}
function tick() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = Date.now();
        if (now === tick.last) {
            return ms(1).then(tick);
        }
        else {
            tick.last = now;
            return now;
        }
    });
}
(function (tick) {
    tick.last = Date.now();
})(tick || (tick = {}));
export function verbify(my) {
    let [al, bea, chloe] = [my.al, my.bea, my.chloe].map((person) => person.agent);
    let { facts, types, actions } = my;
    let { pick, gather, produce, consume } = actions;
    let trade = types.transfer.trade;
    let { brew, bake } = types.process;
    function pickApples(howMany, when = 0, resource = my.al.apples.hash) {
        return __awaiter(this, void 0, void 0, function* () {
            when = when || (yield tick());
            return events.createEvent({
                action: pick.hash,
                provider: al.hash,
                receiver: al.hash,
                start: when,
                duration: howMany * 1000 * facts.secondsPerHour / facts.applesPerHour,
                affects: resource,
                affectedQuantity: { units: ``, quantity: howMany }
            });
        });
    }
    function gatherBeans(howMuch, when = 0, resource = my.bea.beans.hash) {
        return __awaiter(this, void 0, void 0, function* () {
            when = when || (yield tick());
            return events.createEvent({
                action: gather.hash,
                provider: bea.hash,
                receiver: bea.hash,
                start: when,
                duration: howMuch * 1000 * facts.secondsPerHour / facts.beansPerHour,
                affects: resource,
                affectedQuantity: { units: `kg`, quantity: howMuch }
            });
        });
    }
    function transfer(howMuch, fromHash, toHash, when) {
        return __awaiter(this, void 0, void 0, function* () {
            when = when || (yield tick());
            let [from, to] = yield resources.readResources([fromHash, toHash]);
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
        });
    }
    function brewCoffee(cups, when = 0, beanRes = my.chloe.beans.hash, coffeeRes = my.chloe.coffee.hash) {
        return __awaiter(this, void 0, void 0, function* () {
            when = when || (yield tick());
            let beansNeeded = facts.spoonsPerCup * facts.gramsPerSpoon * cups / 1000;
            let beansHad = (yield resources.readResources([beanRes]))[0]
                .entry.currentQuantity.quantity;
            if (beansHad < beansNeeded) {
                return Promise.reject(`can't make ${cups} cups of coffee with only ${beansHad} kg of coffee beans`);
            }
            let [consumeEv, brewEv] = yield Promise.all([
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
                    duration: Math.ceil(1000 * cups * facts.mlPerCup * facts.secondsPerHour / facts.coffeePerHour),
                    affects: coffeeRes,
                    affectedQuantity: { units: `mL`, quantity: cups * facts.mlPerCup }
                })
            ]);
            return events.createProcess({
                processClassifiedAs: brew.hash,
                inputs: [consumeEv.hash],
                outputs: [brewEv.hash],
                plannedStart: when,
                plannedDuration: 1000 * cups * facts.mlPerCup * facts.secondsPerHour / facts.coffeePerHour,
                isFinished: true
            });
        });
    }
    function bakeTurnovers(howMany, when, appleRes = my.chloe.apples.hash, turnoverRes = my.chloe.turnovers.hash) {
        return __awaiter(this, void 0, void 0, function* () {
            when = when || (yield tick());
            let usedApples = howMany * facts.applesPerTurnover;
            let [currentApples] = yield resources.readResources([appleRes]);
            if (!currentApples || !currentApples.entry || currentApples.error || currentApples.entry.currentQuantity.quantity < usedApples) {
                throw new Error(`can't make ${howMany} turnovers with ${currentApples.entry.currentQuantity.quantity}/${usedApples} apples`);
            }
            let [consumeEv, produceEv] = yield Promise.all([
                events.createEvent({
                    action: my.actions.consume.hash,
                    provider: chloe.hash,
                    receiver: chloe.hash,
                    affects: appleRes,
                    start: when,
                    duration: facts.bakeTime * 1000,
                    affectedQuantity: { units: ``, quantity: usedApples }
                }),
                events.createEvent({
                    action: my.actions.produce.hash,
                    provider: chloe.hash,
                    receiver: chloe.hash,
                    affects: turnoverRes,
                    start: when,
                    duration: facts.bakeTime * 1000,
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
        });
    }
    function inventory(who) {
        return __awaiter(this, void 0, void 0, function* () {
            let { apples, beans, coffee, turnovers } = who;
            [apples, beans, coffee, turnovers] = yield resources.readResources([apples, beans, coffee, turnovers].map((r) => r.hash));
            let res = {};
            let [qa, qb, qc, qt] = [apples, beans, coffee, turnovers].map((r) => {
                let q = r.entry.currentQuantity;
                return q;
            });
            if (qa)
                res.apples = qa;
            if (qb)
                res.beans = qb;
            if (qc)
                res.coffee = qc;
            if (qt)
                res.turnovers = qt;
            return res;
        });
    }
    function traceStep(after) {
        return __awaiter(this, void 0, void 0, function* () {
            const before = new Set();
            switch (after.type) {
                case "EconomicEvent":
                    {
                        const event = after.entry;
                        if (event.inputOf) {
                            let [res] = yield resources.readResources([event.affects]);
                            before.add(res);
                        }
                        if (event.outputOf) {
                            const fns = yield events.traceEvents([after.hash]);
                            for (let fn of fns)
                                before.add(fn);
                        }
                    }
                    break;
                case "Process":
                case "Transfer":
                    {
                        const ev = yield events.traceTransfers([after.hash]);
                        for (let e of ev)
                            before.add(e);
                    }
                    break;
                case "EconomicResource": {
                    const hashes = yield resources.getAffectingEvents({ resource: after.hash });
                    const evs = yield events.readEvents(hashes);
                    evs.filter((ev) => !!ev.entry.outputOf || !ev.entry.inputOf).forEach((ev) => before.add(ev));
                }
            }
            return before;
        });
    }
    function trackStep(before) {
        return __awaiter(this, void 0, void 0, function* () {
            const after = new Set();
            switch (before.type) {
                case "EconomicEvent":
                    {
                        const ev = before.entry;
                        if (ev.outputOf) {
                            const [res] = yield resources.readResources([ev.affects]);
                            after.add(res);
                        }
                        if (ev.inputOf) {
                            (yield events.trackEvents([before.hash])).forEach((fn) => after.add(fn));
                        }
                    }
                    break;
                case "Transfer":
                case "Process":
                    {
                        (yield events.trackTransfers([before.hash])).forEach((ev) => after.add(ev));
                    }
                    break;
                case "EconomicResource": {
                    const hashes = yield resources.getAffectingEvents({ resource: before.hash });
                    const evts = yield events.readEvents(hashes);
                    evts.filter((ev) => !!ev.entry.inputOf).forEach((ev) => after.add(ev));
                }
            }
            return after;
        });
    }
    my.verbs = {
        pickApples, gatherBeans, trade: transfer, bakeTurnovers, brewCoffee,
        inventory,
        traceStep: function (...elements) {
            return __awaiter(this, void 0, void 0, function* () {
                const map = new Map();
                for (let element of elements) {
                    let set = yield traceStep(element);
                    map.set(element, set);
                }
                return map;
            });
        },
        trackStep: function (...elements) {
            return __awaiter(this, void 0, void 0, function* () {
                const map = new Map();
                for (let element of elements) {
                    let set = yield trackStep(element);
                    map.set(element, set);
                }
                return map;
            });
        },
        trace(...elements) {
            return __awaiter(this, void 0, void 0, function* () {
                return new TreeGraph(traceStep, ...elements).grow();
            });
        },
        track(...elements) {
            return __awaiter(this, void 0, void 0, function* () {
                return new TreeGraph(trackStep, ...elements).grow();
            });
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
export function ready() {
    return __awaiter(this, void 0, void 0, function* () {
        let prep;
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
                agents.createAgent({ name: `Bea` }).then((bea) => {
                    my.bea.agent = bea;
                    return my;
                }),
                agents.createAgent({ name: `Chloe` }).then((chloe) => {
                    my.chloe.agent = chloe;
                    return my;
                })
            ]).then(() => my));
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
                my.types.resource = { apples, beans, turnovers, coffee };
                return my;
            });
        }
        let stub;
        prep = prep.then((my) => __awaiter(this, void 0, void 0, function* () {
            // TEST events.getFixtures
            let evFix = yield events.getFixtures(null);
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
            let [give, take, adjust, produce, consume] = yield events.readActions([
                act.give, act.receive, act.adjust, act.produce, act.consume
            ]);
            my.actions = { give, take, adjust, produce, consume, receive: take };
            // TEST events.createAction
            let [pick, gather] = yield Promise.all([
                events.createAction({ name: `pick`, behavior: '+' }),
                events.createAction({ name: `gather`, behavior: '+' })
            ]);
            Object.assign(my.actions, { pick, gather });
            // TEST events.createTransferClass
            let trade = my.types.transfer.trade = yield events.createTransferClass({ name: `trade` });
            // TEST events.createProcessClass
            let [bake, brew] = yield Promise.all([
                events.createProcessClass({ name: `bake`, label: `bake` }),
                events.createProcessClass({ name: `brew`, label: `brew` })
            ]);
            my.types.process = Object.assign(my.types.process, { bake, brew });
            return p.then(() => my);
        }));
        // Time to start making events and resources
        prep = prep.then((my) => __awaiter(this, void 0, void 0, function* () {
            let time = yield tick();
            my.timeline.begin = time;
            let al = my.al.agent, bea = my.bea.agent, chloe = my.chloe.agent;
            let { apples, beans, turnovers, coffee } = my.types.resource, { pick, gather, give, take, adjust, produce, consume } = my.actions, { bake, brew } = my.types.process, { trade } = my.types.transfer;
            function setupInventory(person) {
                return __awaiter(this, void 0, void 0, function* () {
                    let name = person.agent.entry.name, hash = person.agent.hash, when = yield tick();
                    if (!person.apples) {
                        person.apples = yield resources.createResource({
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
                    person.beans = person.beans || (yield events.resourceCreationEvent({
                        resource: {
                            resourceClassifiedAs: beans.hash,
                            owner: hash,
                            currentQuantity: { units: `kg`, quantity: 0 },
                            trackingIdentifier: `${name}:beans`
                        },
                        dates: { start: when }
                    })
                        .then((ev) => resources.readResources([ev.entry.affects]))
                        .then(([res]) => res));
                    person.coffee = person.coffee || (yield events.resourceCreationEvent({
                        resource: {
                            resourceClassifiedAs: coffee.hash,
                            owner: hash,
                            currentQuantity: { units: `mL`, quantity: 0 },
                            trackingIdentifier: `${name}:coffee`
                        },
                        dates: { start: when }
                    })
                        .then((ev) => resources.readResources([ev.entry.affects]))
                        .then(([res]) => res));
                    person.turnovers = person.turnovers || (yield events.resourceCreationEvent({
                        resource: {
                            resourceClassifiedAs: turnovers.hash,
                            owner: hash,
                            currentQuantity: { units: ``, quantity: 0 },
                            trackingIdentifier: `${name}:turnovers`
                        },
                        dates: { start: when }
                    })
                        .then((ev) => resources.readResources([ev.entry.affects]))
                        .then(([res]) => res));
                });
            }
            // Too many requests, it seems.
            let alApples = yield resources.createResource({
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
                    start: my.timeline.beaGetsBeans = yield tick(),
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
                    start: my.timeline.chloeGetsCoffee = yield tick()
                }
            }).then((adjustEv) => __awaiter(this, void 0, void 0, function* () {
                let [res] = yield resources.readResources([adjustEv.entry.affects]);
                return my.chloe.coffee = res;
            }));
            yield Promise.all([my.al, my.bea, my.chloe].map(person => setupInventory(person)));
            my.facts = (() => {
                let gramsPerSpoon = 2.5;
                let spoonsPerCup = 1;
                let mlPerCup = 236.588;
                let applesPerTurnover = 3;
                let secondsPerHour = 3600;
                // not sure where this ranks him, but Al can pick an apple every 5 seconds.
                let applesPerHour = (1 / 5) * secondsPerHour;
                let kgPerLb = 0.453592;
                // Bea is a "good picker" by NCAUSA.org standards.
                let beansPerHour = 30 * kgPerLb / 8;
                let coffeePerHour = (12 / 10) * mlPerCup * 60;
                let bakeTime = 25 * 60;
                return {
                    gramsPerSpoon, spoonsPerCup, mlPerCup, applesPerTurnover,
                    secondsPerHour, applesPerHour, kgPerLb, beansPerHour,
                    coffeePerHour, bakeTime
                };
            })();
            return verbify(my);
        }));
        return prep;
    });
}
