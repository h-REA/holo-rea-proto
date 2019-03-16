var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "./chai/chai";
import "./zomes";
console.log('Chai inited:', chai);
const expect = chai.expect;
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
                return Promise.reject(`can't make ${cups} cups of coffee with less than ${beansNeeded} kg coffee beans (had ${beansHad} kg)`);
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
function checkAllInventory(invs) {
    function checkInv(person, inv) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let resName of Object.keys(inv)) {
                let resHash = person[resName].hash;
                let [res] = yield resources.readResources([resHash]);
                expectGoodCrud(res, `EconomicResource`, `inventory crud: ${person.agent.entry.name} ${resName}`);
                expect(res.entry.currentQuantity, `inventory quantity: ${person.agent.entry.name} ${resName}`)
                    .to.have.property(`quantity`, inv[resName]);
            }
        });
    }
    return (sc) => Promise.all(Object.keys(invs).map((name) => checkInv(sc[name], invs[name]))).then(() => sc);
}
function expectGoodCrud(crud, type, name) {
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
export function ready() {
    return __awaiter(this, void 0, void 0, function* () {
        let prep;
        {
            prep = agents.createAgent({
                name: `Al`,
                note: `a note`,
                primaryLocation: [`1 roady street`, `placeville, XX 12345`]
            }).then((al) => {
                // TEST agents.createAgent
                expectGoodCrud(al, `Agent`, `Al`);
                let expectData = expect(al.entry, `Al`);
                expectData.to.have.property(`name`, `Al`);
                expectData.to.have.property(`note`, `a note`);
                expectData.to.have.property(`primaryLocation`)
                    .that.deep.eq([`1 roady street`, `placeville, XX 12345`]);
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
            ]).then(() => my)).then((my) => __awaiter(this, void 0, void 0, function* () {
                // TEST agents.readAgents
                let { al, bea, chloe } = my;
                let people = {
                    al: al.agent,
                    bea: bea.agent,
                    chloe: chloe.agent
                };
                let keys = Object.keys(people);
                let hashes = keys.map(key => people[key].hash);
                const them = yield agents.readAgents(hashes);
                let expectData = expect(them, `readAgents results`);
                const hashMap = them.reduce((dict, resp, i) => {
                    dict[resp.hash] = i;
                    return dict;
                }, {});
                expectData.to.be.instanceOf(Array);
                for (let person of Object.keys(people)) {
                    let hash = people[person].hash;
                    expect(them[hashMap[hash]], `entry for agent ${person}`)
                        .to.deep.equal(people[person], `previous agent data`);
                }
                return my;
            }));
        }
        {
            prep = Promise.all([
                prep,
                // TEST resources.createResourceClassification
                resources.createResourceClassification({
                    name: `apples`,
                    defaultUnits: ``
                }).then((apples) => {
                    expectGoodCrud(apples, `ResourceClassification`, `resource class apples crud`);
                    let expectData = expect(apples.entry, `apples resource class`);
                    expectData.to.have.property(`name`).that.equals(`apples`);
                    expectData.to.have.property(`defaultUnits`).that.equals(``);
                    return apples;
                }),
                resources.createResourceClassification({
                    name: `coffee beans`,
                    defaultUnits: `kg`
                }).then((beans) => __awaiter(this, void 0, void 0, function* () {
                    // TEST resources.readResourceClasses
                    let hash = beans.hash;
                    let [readBeans] = yield resources.readResourceClasses([hash]);
                    expect(readBeans, `The read beans resource class`)
                        .to.deep.equal(beans);
                    return beans;
                })),
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
        // TEST resources.getResourcesInClass *returning none
        prep = prep.then((my) => __awaiter(this, void 0, void 0, function* () {
            let emptyRes = yield resources.getResourcesInClass({
                classification: my.types.resource.apples.hash
            });
            let expectRes = expect(emptyRes, `resources of class apples before they exist`);
            expectRes.to.be.an(`array`).that.is.empty;
            return my;
        }));
        let stub;
        prep = prep.then((my) => __awaiter(this, void 0, void 0, function* () {
            // TEST events.getFixtures
            let evFix = yield events.getFixtures(null);
            let tc = evFix.TransferClassification;
            let act = evFix.Action;
            let pc = evFix.ProcessClassification;
            events.getFixtures({}).then((fix) => {
                expect(fix, `The second read of the event fixtures`)
                    .to.deep.equal(evFix);
            });
            // TEST events.readTransferClasses & readProcessClasses
            let p = Promise.all([
                events.readTransferClasses([tc.stub]).then(([stub]) => {
                    expect(stub.entry, `The stub transfer class`).to.have.property(`name`)
                        .that.is.a(`string`);
                    my.types.transfer.stub = stub;
                }),
                events.readProcessClasses([pc.stub]).then(([stub]) => {
                    expectGoodCrud(stub, `ProcessClassification`, `The process class stub crud`);
                    expect(stub.entry, `The stub process class`).to.have.property(`label`)
                        .that.is.a(`string`);
                    my.types.process.stub = stub;
                })
            ]);
            // TEST events.readActions
            let [give, take, adjust, produce, consume] = yield events.readActions([
                act.give, act.receive, act.adjust, act.produce, act.consume
            ]);
            my.actions = { give, take, adjust, produce, consume, receive: take };
            expect(take.entry, `action fixture take`).to.have.property(`behavior`, '+');
            expect(give.entry, `action fixture give`).to.have.property(`behavior`, '-');
            expect(adjust.entry, `action fixture adjust`).to.have.property(`behavior`, '+');
            // TEST events.createAction
            let [pick, gather] = yield Promise.all([
                events.createAction({ name: `pick`, behavior: '+' }).then((pick) => {
                    expectGoodCrud(pick, `Action`, `Action pick crud`);
                    let expectPick = expect(pick.entry, `Action pick`);
                    expectPick.to.have.property(`name`, `pick`);
                    expectPick.to.have.property(`behavior`, '+');
                    return pick;
                }),
                events.createAction({ name: `gather`, behavior: '+' })
            ]);
            Object.assign(my.actions, { pick, gather });
            // TEST events.readActions
            ([consume] = yield events.readActions([consume.hash]));
            expectGoodCrud(consume);
            expect(consume.entry, `read-back action consume`).to.have.property(`behavior`, '-');
            // TEST events.createTransferClass
            let trade = my.types.transfer.trade = yield events.createTransferClass({ name: `trade` });
            expectGoodCrud(trade, `TransferClassification`, `crud from creation of trade transfer type`);
            expect(trade.entry, `Transfer class trade`)
                .to.have.property(`name`)
                .a(`string`)
                .that.equals(`trade`);
            // TEST events.createProcessClass
            let [bake, brew] = yield Promise.all([
                events.createProcessClass({ name: `bake`, label: `bake` }).then((bake) => {
                    expectGoodCrud(bake, `ProcessClassification`, `Bake process class`);
                    expect(bake.entry).to.have.property(`name`, `bake`);
                    expect(bake.entry).to.have.property(`label`, `bake`);
                    return bake;
                }),
                events.createProcessClass({ name: `brew`, label: `brew` })
            ]);
            {
                let pcs = new Set([bake.hash, brew.hash, pc.stub]);
                expect(pcs.size === 3, `all PC hashes should be unique`).to.be.true;
            }
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
            }).then((alApples) => __awaiter(this, void 0, void 0, function* () {
                // TEST resources.createResource (events.createEvent, resources.affect)
                expectGoodCrud(alApples);
                let expectEm = expect(alApples.entry, `Al's apples`);
                expectEm.to.have.property(`owner`).that.equals(al.hash);
                expectEm.to.have.property(`currentQuantity`).an(`object`)
                    .that.does.exist
                    .that.deep.equals({ quantity: 100, units: '' }, `x100`);
                expectEm.to.have.property(`resourceClassifiedAs`)
                    .a(`string`)
                    .that.equals(apples.hash, `apples`);
                // TEST resources.getAffectingEvents
                let pickings = yield resources.getAffectingEvents({ resource: alApples.hash });
                expect(pickings).to.be.an(`array`).that.has.length(1);
                // TEST events.readEvents
                let [picking] = yield events.readEvents(pickings);
                expectGoodCrud(picking);
                let expectIt = expect(picking.entry, `the first apple picking event`);
                expectIt.to.have.property(`action`)
                    .that.is.a(`string`).that.equals(pick.hash, `pick`);
                expectIt.to.have.property(`receiver`).that.equals(al.hash, `Al`);
                expectIt.to.have.property(`start`).that.equals(time);
                expectIt.to.have.property(`duration`).that.equals(1);
                expectIt.to.have.property(`affectedQuantity`).an(`object`)
                    .that.deep.equals({ units: ``, quantity: 100 });
                return my.al.apples = alApples;
            }));
            let beaBeans = yield resources.createResource({
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
                    start: yield tick(),
                    duration: 1
                }
            }).then((bb) => (my.bea.beans = bb));
            // TEST events.resourceCreationEvent
            let chloeCoffee = yield events.resourceCreationEvent({
                resource: {
                    currentQuantity: { units: `mL`, quantity: 300 },
                    resourceClassifiedAs: coffee.hash,
                    trackingIdentifier: `Chloe's coffee`,
                    owner: chloe.hash
                },
                dates: {
                    start: yield tick()
                }
            }).then((adjustEv) => __awaiter(this, void 0, void 0, function* () {
                expectGoodCrud(adjustEv, `EconomicEvent`, `crud of adjust event for Chloe's coffee`);
                let expectIt = expect(adjustEv.entry, `The adjust event for Chloe's coffee`);
                expectIt.to.have.property(`affects`).that.is.a(`string`)
                    .that.has.length.gt(1);
                expectIt.to.have.property(`affectedQuantity`).that.is.an(`object`)
                    .that.does.exist
                    .that.deep.equals({ units: `mL`, quantity: 300 });
                // TEST resources.readResources
                let [res] = yield resources.readResources([adjustEv.entry.affects]);
                expectGoodCrud(res);
                expectIt = expect(res.entry, `Chloe's coffee resource`);
                expectIt.to.have.property(`currentQuantity`).an(`object`)
                    .that.does.exist
                    .that.deep.equals({ units: `mL`, quantity: 300 }, `300 mL`);
                expectIt.to.have.property(`resourceClassifiedAs`, coffee.hash, `coffee`);
                expectIt.to.have.property(`owner`, chloe.hash, `Chloe`);
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
            let facts = my.facts;
            // before packing things up into functions to consume, do a complete scenario run
            // [x] al has apples
            // [x] bea has beans
            // [x] chloe has some initial coffee
            // [x] everyone has a complete inventory with 0 quantities where appropriate
            // [ ] al trades apples for coffee
            return verbify(my);
        })).then((my) => __awaiter(this, void 0, void 0, function* () {
            // TODO: This is kind of a secondary function, consider moving it out of sequence
            // namespace freshening
            let { al, bea, chloe } = my;
            let { apples, turnovers } = my.types.resource;
            // TEST agents.getOwnedResources
            let invs = yield agents.getOwnedResources({
                agents: [al.agent.hash, bea.agent.hash, chloe.agent.hash],
                types: [apples.hash, turnovers.hash]
            });
            console.log(invs);
            for (let agent of [al, bea, chloe]) {
                let inventory = invs[agent.agent.hash];
                let turnoverRes = inventory[turnovers.hash];
                yield resources.readResources(turnoverRes).then(([crud]) => {
                    expectGoodCrud(crud, `EconomicResource`, `turnover res crud`);
                    expect(crud.entry.currentQuantity.quantity, `turnovers in inventory`)
                        .to.equal(0);
                });
            }
            let [alApples] = yield resources.readResources([invs[al.agent.hash][apples.hash][0]]);
            expect(alApples.entry.currentQuantity.quantity, `al's quantity of apples`)
                .to.equal(100);
            return my;
        })).then((my) => __awaiter(this, void 0, void 0, function* () {
            // namespace freshening
            // Al arrives with 3 apples. He gives them to Chloe, Chloe receives them.
            let { al, chloe } = my;
            let trade = my.types.transfer.trade;
            let { give, take } = my.actions;
            const AL_ARRIVES = yield tick();
            let [giveEv, takeEv] = yield Promise.all([
                events.createEvent({
                    action: give.hash,
                    provider: al.agent.hash,
                    receiver: chloe.agent.hash,
                    affects: al.apples.hash,
                    start: AL_ARRIVES,
                    duration: 1,
                    affectedQuantity: { units: ``, quantity: 3 }
                }),
                events.createEvent({
                    action: take.hash,
                    provider: al.agent.hash,
                    receiver: chloe.agent.hash,
                    affects: chloe.apples.hash,
                    start: AL_ARRIVES,
                    duration: 1,
                    affectedQuantity: { units: ``, quantity: 3 }
                })
            ]);
            // TEST createEvent affects resource
            let [src, dest] = yield resources.readResources([al.apples.hash, chloe.apples.hash]).then(([src, dest]) => {
                expectGoodCrud(src, `EconomicResource`, `Al's apples crud after first give`);
                expectGoodCrud(dest, `EconomicResource`, `Chloe's apples crud after first give`);
                expect(src.entry, `Al's apples after exchange`)
                    .to.have.property(`currentQuantity`)
                    .that.is.an(`object`)
                    .that.does.exist
                    .that.has.property(`quantity`)
                    .that.is.a(`number`)
                    .that.equals(97);
                expect(dest.entry, `Chloe's apples after first trade`)
                    .to.have.property(`currentQuantity`)
                    .that.is.an(`object`)
                    .that.does.exist
                    .that.has.property(`quantity`)
                    .that.is.a(`number`)
                    .that.equals(3);
                return [src, dest];
            });
            // TEST events.createTransfer(Transfer)
            let p1 = events.createTransfer({
                transferClassifiedAs: trade.hash,
                inputs: giveEv.hash,
                outputs: takeEv.hash
            }).then((xfer) => __awaiter(this, void 0, void 0, function* () {
                expectGoodCrud(xfer, `Transfer`, `First exchange crud`);
                // Can't expect the events to have the same hashes; instead make sure they target
                // the same other instances.
                let [inputs, outputs] = yield events.readEvents([xfer.entry.inputs, xfer.entry.outputs]);
                expectGoodCrud(inputs, `EconomicEvent`);
                expectGoodCrud(outputs, `EconomicEvent`);
                expect(inputs.entry, `inputs`).to.have.property(`provider`, al.agent.hash);
                expect(inputs.entry, `inputs`).to.have.property(`receiver`, chloe.agent.hash);
                expect(inputs.entry, `inputs`).to.have.property(`affects`, src.hash);
                expect(inputs.entry, `inputs`).to.have.property(`inputOf`, xfer.hash);
                expect(outputs.entry, `outputs`).to.have.property(`provider`, al.agent.hash);
                expect(outputs.entry, `outputs`).to.have.property(`receiver`, chloe.agent.hash);
                expect(outputs.entry, `outputs`).to.have.property(`affects`, dest.hash);
                expect(outputs.entry, `outputs`).to.have.property(`outputOf`, xfer.hash);
                return xfer;
            }));
            // Chloe gives Al a 300 mL cup of coffee. Al receives it.
            // TEST events.createTransfer(Transfer(event, event))
            let p2 = events.createTransfer({
                transferClassifiedAs: my.types.transfer.trade.hash,
                inputs: {
                    action: my.actions.give.hash,
                    provider: chloe.agent.hash,
                    receiver: al.agent.hash,
                    affects: chloe.coffee.hash,
                    affectedQuantity: { units: `mL`, quantity: 300 },
                    start: AL_ARRIVES + 100,
                    duration: 1
                },
                outputs: {
                    action: my.actions.take.hash,
                    provider: chloe.agent.hash,
                    receiver: al.agent.hash,
                    affects: al.coffee.hash,
                    affectedQuantity: { units: `mL`, quantity: 300 },
                    start: AL_ARRIVES + 100,
                    duration: 1
                }
            }).then((xfer) => __awaiter(this, void 0, void 0, function* () {
                expectGoodCrud(xfer, `Transfer`, `crud from transfer chloe coffee => al coffee`);
                let [inputs, outputs] = yield events.readEvents([xfer.entry.inputs, xfer.entry.outputs]);
                expectGoodCrud(inputs, `EconomicEvent`, `chloe give coffee to al crud`);
                expectGoodCrud(outputs, `EconomicEvent`, `al take coffee from chloe crud`);
                expect(inputs.entry, `chloe give coffee to al`).to.deep.include({
                    action: my.actions.give.hash,
                    provider: chloe.agent.hash,
                    receiver: al.agent.hash,
                    inputOf: xfer.hash
                });
                expect(outputs.entry, `al take coffee from chloe`).to.deep.include({
                    action: my.actions.take.hash,
                    provider: chloe.agent.hash,
                    receiver: al.agent.hash,
                    outputOf: xfer.hash
                });
                return xfer;
            }));
            return Promise.all([p1, p2]).then(() => my);
        })).then(checkAllInventory({
            al: { apples: 97, coffee: 300 },
            bea: { beans: 2 },
            chloe: { apples: 3, coffee: 0 }
        })).then((my) => __awaiter(this, void 0, void 0, function* () {
            let { chloe } = my;
            // Chloe consumes 3 apples to bake 1 turnover
            let time = my.timeline.firstBake = yield tick();
            // TEST events.createProcess
            let [inputs, outputs] = yield Promise.all([
                events.createEvent({
                    action: my.actions.consume.hash,
                    provider: chloe.agent.hash,
                    receiver: chloe.agent.hash,
                    affects: chloe.apples.hash,
                    affectedQuantity: { units: ``, quantity: 3 },
                    start: time,
                    duration: my.facts.bakeTime
                }),
                events.createEvent({
                    action: my.actions.produce.hash,
                    provider: chloe.agent.hash,
                    receiver: chloe.agent.hash,
                    affects: chloe.turnovers.hash,
                    affectedQuantity: { units: ``, quantity: 1 },
                    start: time,
                    duration: my.facts.bakeTime
                })
            ]);
            let ihash = inputs.hash;
            let ohash = outputs.hash;
            let proc = yield events.createProcess({
                processClassifiedAs: my.types.process.bake.hash,
                inputs: [ihash],
                outputs: [ohash],
                plannedStart: time,
                plannedDuration: my.facts.bakeTime,
                isFinished: true
            });
            expectGoodCrud(proc, `Process`, `chloe's first bake process crud`);
            [inputs, outputs] = yield events.readEvents([ihash, ohash]);
            expect(inputs.entry).to.have.property(`inputOf`, proc.hash);
            expect(outputs.entry).to.have.property(`outputOf`, proc.hash);
            return my;
        })).then(checkAllInventory({
            chloe: { apples: 0, turnovers: 1 }
        })).then((my) => __awaiter(this, void 0, void 0, function* () {
            let { chloe, bea, facts } = my;
            yield my.verbs.trade({ units: ``, quantity: 1 }, chloe.turnovers.hash, bea.turnovers.hash, yield tick());
            yield my.verbs.trade({ units: `kg`, quantity: 0.5 }, bea.beans.hash, chloe.coffee.hash, yield tick());
            yield my.verbs.brewCoffee(1000 / facts.mlPerCup, yield tick());
            return my;
        })).then(checkAllInventory({
            al: { apples: 97, beans: 0, coffee: 300, turnovers: 0 },
            bea: { apples: 0, beans: 1.5, coffee: 0, turnovers: 1 },
            chloe: { apples: 0, coffee: 1000, turnovers: 0 }
        }));
        return prep;
    });
}
/*
export var ready: () => Promise<Scenario> = () => prep;
/**/
// Come back to:
//  resources.getResourcesInClass
//  resources.getFixtures?
// Come back to: agents.getOwnedResources
