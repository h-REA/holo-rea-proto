// <reference path="../common/common"/>
// <reference path="../agents/agents"/>
// <reference path="../resources/resources"/>
//* IMPORTS
//import { Hash, QuantityValue, LinkRepo, VfObject, QVlike, HoloObject, CrudResponse, bisect, HoloThing, hashOf, notError, HoloClass } from "../../../lib/ts/common";
import {
  Hash, QuantityValue, VfObject, QVlike, HoloObject, CrudResponse, bisect,
  HoloThing, hashOf, notError, HoloClass, deepAssign, Fixture, Initializer,
  reader, entryOf, creator, callZome, EventLinks, Classifications, TrackTrace
} from "../common/common";
import resources from "../resources/resources";
import agents from "../agents/agents";
import { LinkRepo } from "../common/LinkRepo";
import { LinkSet } from "../common/LinkRepo";
/*/
/**/

/* TYPE-SCOPE
import "../common/holochain-proto";
import "../agents/agents";
import "../resources/resources";
import "../common/common";
import { LinkRepo, LinkSet } from "../common/LinkRepo";
/*/
/**/


// <imports>
type Agent = agents.Agent;
type EconomicResource = resources.EconomicResource;

// </imports>

// <links>


// </links>

interface ActEntry {
  name?: string;
  behavior: '+'|'-'|'0';
}

class Action<T = {}> extends VfObject<ActEntry & T & typeof VfObject.entryType> {
  className = "Action";
  static className = "Action";
  static entryType: ActEntry & typeof VfObject.entryType;
  //protected myEntry: T & typeof Action.entryType;
  static entryDefaults = deepAssign({}, VfObject.entryDefaults, <Initializer<ActEntry>> {
      behavior: '0'
    });

  static get(hash: Hash<Action>): Action {
    return <Action> super.get(hash);
  }
  static create(entry: ActEntry  & typeof VfObject.entryType): Action {
    return <Action> super.create(entry);
  }
  constructor(entry?: T & ActEntry & typeof VfObject.entryType, hash?: Hash<Action>) {
    super(entry, hash);
  }

  isIncrement(): boolean {
    return this.myEntry.behavior === '+';
  }

  isDecrement(): boolean {
    return this.myEntry.behavior === '-';
  }

  isNoEffect(): boolean {
    return this.myEntry.behavior === '0';
  }

  get behavior(): typeof Action.entryType.behavior {
    return this.myEntry.behavior;
  }

  set behavior(to: typeof Action.entryType.behavior) {
    this.myEntry.behavior = to;
  }

  get sign(): number {
    let behavior = this.myEntry.behavior;
    switch (behavior) {
      case "+": return 1;
      case "-": return -1;
      case "0": return 0;
    }
  }

  toString(): string {
    const sigil = this.behavior === '0' ? '' : this.behavior;
    return `${this.name} ${sigil}`;
  }

  get events(): EconomicEvent[] {
    return EventLinks.get(this.myHash, `actionOf`).hashes().map((hash) => EconomicEvent.get(hash));
  }
}

interface ProcClass {
  label: string;
}

class ProcessClassification<T = {}> extends VfObject<T & ProcClass & typeof VfObject.entryType> {
  static className = "ProcessClassification";
  className = "ProcessClassification";
  static entryType: ProcClass & typeof VfObject.entryType;
  static entryDefaults = Object.assign({}, VfObject.entryDefaults, <Initializer<ProcClass>> {

    });

  static get(hash: Hash<ProcessClassification>): ProcessClassification {
    return <ProcessClassification> super.get(hash);
  }
  static create(entry: ProcClass & typeof VfObject.entryType): ProcessClassification {
    return <ProcessClassification> super.create(entry);
  }
  constructor(entry?: T & ProcClass & typeof VfObject.entryType, hash?: Hash<ProcessClassification>) {
    super(entry, hash);
  }

}

interface ProcEntry {
  name: string;
  plannedStart: number;
  plannedDuration: number;
  isFinished: boolean;
  note: string;
  processClassifiedAs: Hash<ProcessClassification>;
}

type VfProc = ProcEntry & typeof VfObject.entryType & {
  inputs?: Hash<EconomicEvent>[];
  outputs?: Hash<EconomicEvent>[];
}

interface ProcLinks {
  processClassifiedAs: LinkRepo<ProcEntry, ProcClass, "classifiedAs"|"classifies">,
  inputs: LinkRepo<ProcEntry, typeof EconomicEvent.entryType, "inputs"|"inputOf">,
  outputs: LinkRepo<ProcEntry, typeof EconomicEvent.entryType, "outputs"|"outputOf">
}

class Process<T = {}>
extends VfObject<T & ProcEntry & typeof VfObject.entryType>
implements Funcable {
  static className = "Process";
  className = "Process";
  static entryType: ProcEntry & typeof VfObject.entryType;
  static entryDefaults = deepAssign({}, VfObject.entryDefaults,
    <Initializer<ProcEntry>> {
      processClassifiedAs: () => (getFixtures({}).ProcessClassification.stub),
      plannedStart: 0,
      plannedDuration: 0,
      isFinished: false,
      note: ``
    });

  private static readonly links: ProcLinks = {
    processClassifiedAs: new LinkRepo<ProcEntry, ProcClass, "classifies"|"classifiedAs">(`Classifications`)
      .linkBack(`classifiedAs`, `classifies`)
      .linkBack(`classifies`, `classifiedAs`)
      .singular(`classifiedAs`),
    inputs: new LinkRepo<ProcEntry, typeof EconomicEvent.entryType, "inputs"|"inputOf">(`EventLinks`)
      .linkBack(`inputs`, `inputOf`)
      .linkBack(`inputOf`, `inputs`)
      .singular(`inputOf`),
    outputs: new LinkRepo<ProcEntry, typeof EconomicEvent.entryType, "outputs"|"outputOf">(`EventLinks`)
      .linkBack(`outputs`, `outputOf`)
      .linkBack(`outputOf`, `outputs`)
      .singular(`outputOf`)
  }

  private readonly links: typeof Process.links = Process.links;

  private loadLinks() {
    if (this.committed()) {
      this.myEntry.processClassifiedAs = this.links.processClassifiedAs
        .get(this.myHash, `classifiedAs`).hashes()[0] || this.myEntry.processClassifiedAs;

      this.inputs = this.links.inputs.get(this.myHash, `inputs`).types(`EconomicEvent`);
      this.inputs.forEach(({Hash}, i, inputs) => {
        inputs[i].Entry = EconomicEvent.get(Hash);
      });
      this.inputs.sync = false;

      this.outputs = this.links.outputs.get(this.myHash, `outputs`).types(`EconomicEvent`);
      this.outputs.forEach(({Hash}, i, outputs) => {
        outputs[i].Entry = EconomicEvent.get(Hash);
      });
      this.outputs.sync = false;
    } else {
      this.inputs = this.links.inputs.emptySet(this.hash);
      this.inputs.sync = false;

      this.outputs = this.links.outputs.emptySet(this.hash);
      this.outputs.sync = false;
    }
  }
  private saveLinks(hash: Hash<ProcEntry>): Hash<ProcEntry> {
    this.links.processClassifiedAs.put(this.myHash, this.myEntry.processClassifiedAs, `classifiedAs`);

    this.inputs.save(true, true);

    this.outputs.save(true, true);

    return hash;
  }

  static get(hash: Hash<Process>): Process {
    let proc = <Process> super.get(hash);
    proc.loadLinks();
    return proc;
  }

  static create(entry: ProcEntry  & typeof VfObject.entryType): Process {
    let proc = <Process> super.create(entry);
    proc.loadLinks();
    return proc;
  }
  constructor(entry?: T & ProcEntry  & typeof VfObject.entryType, hash?: Hash<Process>) {
    super(entry, hash);
  }

  asFunction(): EconomicFunction {
    return new EconomicFunction(this.myEntry);
  }

  inputs: LinkSet<ProcEntry, EeEntry, "inputs"|"inputOf">;
  outputs: LinkSet<ProcEntry, EeEntry, "outputs"|"outputOf">;

  protected linksChanged(): boolean {
    let {inputs, outputs, hash} = this;
    let oldInputs = this.links.inputs.get(hash, `inputs`);
    let oldOutputs = this.links.outputs.get(hash, `outputs`);
    if (inputs.notIn(oldInputs).length || oldInputs.notIn(inputs).length) {
      return true;
    }
    if (outputs.notIn(oldOutputs).length || oldOutputs.notIn(outputs).length) {
      return true;
    }
    return false;
  }

  protected hasChanged(): boolean {
    return super.hasChanged() || this.linksChanged();
  }

  get processClassifiedAs(): ProcessClassification {
    return ProcessClassification.get(this.myEntry.processClassifiedAs);
  }

  set processClassifiedAs(to: ProcessClassification) {
    this.myEntry.processClassifiedAs = to.hash;
  }

  get plannedDuration(): number {
    return this.myEntry.plannedDuration;
  }

  set plannedDuration(to: number) {
    this.myEntry.plannedDuration = to;
  }

  get plannedStart(): number {
    return this.myEntry.plannedStart;
  }
  set plannedStart(to: number) {
    this.myEntry.plannedStart = to;
  }

  get plannedEnd(): number {
    let my = this.myEntry;
    return my.plannedStart + (my.plannedDuration || Infinity);
  }
  set plannedEnd(to: number) {
    let my = this.myEntry;
    if (!to || to === Infinity) {
      my.plannedDuration = 0;
    } else {
      my.plannedDuration = to - my.plannedStart;
    }
  }

  get isFinished(): boolean {
    return this.myEntry.isFinished;
  }
  set isFinished(to: boolean) {
    this.myEntry.isFinished = to;
  }

  get start(): number {
    let now = Date.now();
    let t = this.inputs.data().concat(this.outputs.data()).reduce(
      ((early, {start}) => (start < early ? start : early)),
      now
    );
    if (t === now) {
      return 0;
    } else {
      return t;
    }
  }

  get end(): number {
    if (!this.myEntry.isFinished) return 0;

    let then = 0;

    let t = this.inputs.data().concat(this.outputs.data()).reduce(
      ((later, {start, duration}) => {
        if (duration === 0) return later;
        let end = start + duration;
        return end > later ? end : later;
      }),
      then
    );

    return t;
  }

  addInputs(...events: EconomicEvent[]): this {
    for (let event of events) {
      this.inputs.add(`inputs`, event.hash, event.className);
    }
    return this;
  }

  addOutputs(...events: EconomicEvent[]): this {
    for (let event of events) {
      this.outputs.add(`outputs`, event.hash, event.className);
    }
    return this;
  }

  getInputs(): EconomicEvent[];
  getInputs(i: number): EconomicEvent;
  getInputs(i?: number) {
    if (!i && i !== 0) {
      return this.inputs.hashes().map(EconomicEvent.get);
    } else {
      let len = this.inputs.length;
      if (i >= len || i < 0) throw new RangeError(`invalid index ${i} for length ${len}`);

      return EconomicEvent.get(this.inputs[i].Hash);
    }
  }

  getOutputs(): EconomicEvent[];
  getOutputs(i: number): EconomicEvent;
  getOutputs(i?: number) {
    if (!i && i !== 0) {
      return this.outputs.hashes().map(EconomicEvent.get);
    } else {
      let len = this.outputs.length;
      if (i >= len || i < 0) throw new RangeError(`invalid index ${i} for length ${len}`);

      return EconomicEvent.get(this.outputs[i].Hash);
    }
  }

  netEffectOn(res: HoloThing<resources.EconomicResource>): QuantityValue {
    let resHash: Hash<resources.EconomicResource> = hashOf(res);
    return this.getOutputs().concat(this.getInputs())
      .filter((ev) => ev.affects === resHash)
      .reduce(
        (sum: QuantityValue, ev) => {
          let term = ev.quantity.mul({quantity: ev.action.sign, units: ``});
          if (sum) term = term.add(sum);
          return term;
        },
        null
      );
  }

  commit(): Hash<Process> {
    return this.saveLinks(super.commit());
  }

  update(): Hash<Process> {
    return this.saveLinks(super.update());
  }

  remove(): this {
    this.links.inputs.get(this.myHash, `inputs`).removeAll();
    this.links.outputs.get(this.myHash, `outputs`).removeAll();
    this.links.processClassifiedAs.remove(this.myHash, this.myEntry.processClassifiedAs, `classifiedAs`);
    return super.remove();
  }

  portable(): CrudResponse<T & VfProc> {
    let crud = super.portable();
    let entry: VfProc & T = deepAssign(crud.entry, {
      inputs: this.inputs.hashes(),
      outputs: this.outputs.hashes()
    });
    let {error, hash, type} = crud;
    return { error, hash, type, entry };
  }
}

interface XferClassEntry {
  name: string;
}

class TransferClassification<T = {}> extends VfObject<T & XferClassEntry & typeof VfObject.entryType> {
  static className = "TransferClassification";
  className = "TransferClassification";
  static entryType: XferClassEntry & typeof VfObject.entryType;
  static entryDefaults = deepAssign({}, VfObject.entryDefaults, <Initializer<XferClassEntry>> {

    });

  static get(hash: Hash<TransferClassification>): TransferClassification {
    return <TransferClassification> super.get(hash);
  }
  static create(entry: XferClassEntry & typeof VfObject.entryType): TransferClassification {
    return <TransferClassification> super.create(entry);
  }
  constructor(entry?: T & XferClassEntry & typeof VfObject.entryType, hash?: Hash<TransferClassification>) {
    super(entry, hash);
  }

}

// Can't have DHT functions at the top level like this.

interface XferEntry {
  transferClassifiedAs: Hash<TransferClassification>;
  inputs: Hash<EconomicEvent>;
  outputs: Hash<EconomicEvent>;
}

class Transfer<T = {}>
extends VfObject<T & typeof VfObject.entryType & XferEntry>
implements Funcable {
  className = "Transfer";
  static className = "Transfer";
  static entryType: XferEntry & typeof VfObject.entryType;
  static entryDefaults = deepAssign({}, VfObject.entryDefaults, <Initializer<XferEntry>> {
    transferClassifiedAs: ``,
    inputs: ``,
    outputs: ``
  });
  //protected myEntry: T & XferEntry & typeof VfObject.entryType;
  static get(hash: Hash<Transfer>): Transfer {
    const it = <Transfer> super.get(hash);
    it.loadLinks();
    return it;
  }
  static create(entry?: XferEntry & typeof VfObject.entryType): Transfer {
    const it = <Transfer> super.create(entry);
    it.loadLinks();
    return it;
  }
  constructor(entry?: T & XferEntry & typeof VfObject.entryType, hash?: Hash<Transfer>) {
    super(entry, hash);
  }
  loadLinks(): void {
    if (this.committed()) {
      const hash = this.myHash;
      const my = this.myEntry;

      const type = Classifications.get(hash, `classifiedAs`);
      if (type.length) my.transferClassifiedAs = type.hashes()[0];

      const inputs = EventLinks.get(hash, `inputs`);
      if (inputs.length) my.inputs = inputs.hashes()[0];

      const outputs = EventLinks.get(hash, `outputs`);
      if (outputs.length) my.outputs = outputs.hashes()[0];
    }
  }

  asFunction(): EconomicFunction {
    return new EconomicFunction(this.myEntry);
  }

  get input(): EconomicEvent {
    return EconomicEvent.get(this.myEntry.inputs);
  }
  set input(to: EconomicEvent) {
    this.myEntry.inputs = to.hash;
  }

  get output(): EconomicEvent {
    return EconomicEvent.get(this.myEntry.outputs);
  }
  set output(to: EconomicEvent) {
    this.myEntry.outputs = to.hash;
  }

  get classification(): TransferClassification {
    return TransferClassification.get(this.myEntry.transferClassifiedAs);
  }
  set classification(to: TransferClassification) {
    this.myEntry.transferClassifiedAs = to.hash;
  }

  remove(msg:string): this {
    let {inputs, outputs, transferClassifiedAs: classy} = this.myEntry;
    if (inputs) {
      EventLinks.remove(this.hash, inputs, `inputs`);
    }
    if (outputs) {
      EventLinks.remove(this.hash, outputs, `outputs`);
    }
    if (classy) {
      Classifications.remove(this.hash, classy, `classifiedAs`);
    }
    return super.remove(msg);
  }

  private saveLinks(hash: Hash<this>) {
    let my = this.myEntry;
    let links = EventLinks.get(hash).tags(`inputs`, `outputs`);

    let inputs = links.tags(`inputs`);
    if (!inputs.has(`inputs`, my.inputs)) {
      inputs.removeAll();
      if (my.inputs) EventLinks.put(hash, my.inputs, `inputs`);
    }

    let outputs = links.tags(`outputs`);
    if (!outputs.has(`outputs`, my.outputs)) {
      outputs.removeAll();
      if (my.outputs) EventLinks.put(hash, my.outputs, `outputs`);
    }

    let cl = Classifications.get(this.myHash, `classifiedAs`);
    if (!cl.has(`classifiedAs`, my.transferClassifiedAs)) {
      Classifications.put(hash, my.transferClassifiedAs, `classifiedAs`);
    }

    return hash;
  }

  commit(): Hash<this> {
    return this.saveLinks(super.commit());
  }

  update(): Hash<this> {
    return this.saveLinks(super.update());
  }
}

type FuncEntry = typeof Process.entryType | typeof Transfer.entryType;

class EconomicFunction<T = {}> extends VfObject<T & FuncEntry> implements Funcable {
  static className = "EconomicFunction";
  className = "EconomicFunction";
  static entryType: FuncEntry & typeof VfObject.entryType;
  static entryDefaults = Object.assign({}, VfObject.entryDefaults,
    <Initializer<FuncEntry>> {

    }
  );

  static get(hash: Hash<EconomicFunction>): EconomicFunction {
    return <EconomicFunction> super.get(hash);
  }
  static create(entry: FuncEntry & typeof VfObject.entryType): EconomicFunction {
    return <EconomicFunction> super.create(entry);
  }
  constructor(entry?: T & FuncEntry & typeof VfObject.entryType, hash?: Hash<EconomicFunction>) {
    super(entry, hash);
    if (this.isProcess()) {
      this.className = Process.className;
    } else if (this.isTransfer) {
      this.className = Transfer.className;
    }
  }

  asFunction(): EconomicFunction {
    return this;
  }

  get inputs(): EconomicEvent[] {
    return EventLinks.get(this.myHash, `inputs`).hashes().map((hash) => EconomicEvent.get(hash));
  }

  get outputs(): EconomicEvent[] {
    return EventLinks.get(this.myHash, `outputs`).hashes().map((hash) => EconomicEvent.get(hash));
  }

  isTransfer(): boolean {
    return `transferClassifiedAs` in this.myEntry;
  }

  transfer(): Transfer {
    return this.isTransfer() ? Transfer.create(<XferEntry> this.myEntry) : null;
  }

  isProcess(): boolean {
    return `processClassifiedAs` in this.myEntry;
  }

  process(): Process {
    return this.isProcess() ? Process.create(<ProcEntry> this.myEntry) : null;
  }

  portable(): CrudResponse<T & typeof EconomicFunction.entryType> {
    let crud = super.portable();
    if (this.isTransfer()) {
      crud.type = Transfer.className;
    } else if (this.isProcess()) {
      crud.type = Process.className;
    }
    return crud;
  }

  commit(): Hash<this> {
    throw new Error(`Can't commit directly from EconomicFunction; convert to Process or Transfer first`);
  }

  update(): Hash<this> {
    throw new Error(`Can't update directly from EconomicFunction; convert to Process or Transfer first`);
  }

}

interface Funcable {
  asFunction(): EconomicFunction;
}

interface EeEntry {
  action: Hash<Action>;
  outputOf?: Hash<Transfer|Process>;
  inputOf?: Hash<Transfer|Process>;
  affects: Hash<EconomicResource>;
  receiver: string; //receiver?: Hash<Agent>;
  provider: string; //provider?: Hash<Agent>;
  scope?: Hash<any>;
  affectedQuantity: QVlike;
  start?: number;
  duration?: number;
}

class EconomicEvent<T = {}> extends VfObject<EeEntry & T & typeof VfObject.entryType> {
  // begin mandatory overrides
  static className = "EconomicEvent";
  className = "EconomicEvent";
  static entryType: EeEntry & typeof VfObject.entryType;
  static entryDefaults = deepAssign({}, VfObject.entryDefaults, <Initializer<EeEntry>>{

    action: () => getFixtures(null).Action.adjust,
    affects: ``,
    affectedQuantity: { units: ``, quantity: 0 },
    start: 0,
    duration: 0,
    provider: ``,
    receiver: ``
  });
  static get(hash: Hash<EconomicEvent>): EconomicEvent {
    const it = <EconomicEvent> super.get(hash);
    it.loadLinks();
    return it;

  }
  static create(entry: EeEntry & typeof VfObject.entryType): EconomicEvent {
    const it = <EconomicEvent> super.create(entry);
    it.loadLinks();
    return it;
  }
  constructor(entry?: EeEntry & T & typeof VfObject.entryType, hash?: Hash<EconomicEvent>) {
    super(entry, hash);
    entry = this.myEntry;
    if (!entry.start) this.myEntry.start = Date.now();
    if (!entry.duration) this.myEntry.duration = 0;
  }

  get action(): Action {
    return this.entry.action && Action.get(this.entry.action) || null;
  }
  set action(obj: Action) {
    let my = this.myEntry;
    if (!obj) {
      if (my.action) {
        throw new Error(`economicEvent.action is a required field; can't be set to ${obj}`);
      }
    }
    let to = obj.hash;

    my.action = to;
    //EventLinks.put(this.hash, to, `action`);
  }

  get inputOf(): EconomicFunction {
    return this.myEntry.inputOf && EconomicFunction.get(this.myEntry.inputOf) || null;
  }
  set inputOf(to: EconomicFunction) {
    let my = this.myEntry;
    my.inputOf = to && to.hash;
  }
  setInputOf(ef: Funcable) {
    this.inputOf = ef && ef.asFunction();
  }

  get outputOf(): EconomicFunction {
    return this.myEntry.outputOf && EconomicFunction.get(this.myEntry.outputOf) || null;
  }
  set outputOf(ef: EconomicFunction) {
    this.myEntry.outputOf = ef && ef.hash;
  }
  setOutputOf(ef: Funcable) {
    this.outputOf = ef && ef.asFunction();
  }

  get quantity(): QuantityValue {
    return new QuantityValue(this.myEntry.affectedQuantity);
  }
  set quantity(to: QuantityValue) {
    let {units, quantity} = to;
    this.myEntry.affectedQuantity = {units, quantity};
  }

  get start(): number {
    return this.myEntry.start;
  }
  started(when: number|Date): this {
    if (typeof when != `number`) {
      when = when.valueOf();
    }
    this.myEntry.start = when;
    this.update();
    return this;
  }
  get startDate(): Date {
    return new Date(this.start);
  }

  get duration(): number {
    return this.myEntry.duration;
  }

  get end(): number {
    return this.myEntry.start + this.myEntry.duration;
  }
  get endDate(): Date {
    return new Date(this.end);
  }
  ended(when?: number|Date): this {
    if (when === undefined || when === null) {
      when = Date.now();
    } else if (typeof when != `number`) {
      when = when.valueOf();
    }
    let my = this.myEntry;
    my.duration = when - my.start;
    this.update();
    return this;
  }
  instant(): this {
    this.myEntry.duration = 1;
    this.update();
    return this;
  }

  get isComplete(): boolean {
    return !!this.duration;
  }
  get isOngoing(): boolean {
    return !this.isComplete;
  }

  set affects(res: HoloThing<EconomicResource>) {
    let hash = hashOf(res);
    const my = this.myEntry;
    my.affects = hash;
    //this.update();
  }
  get affects(): HoloThing<EconomicResource> {
    return this.myEntry.affects;
  }

  protected loadLinks() {
    const my = this.myEntry, hash = this.myHash;
    if (hash) {
      // think about checking for no links found; nothing to be done about it if
      // it happens, the DHT just doesn't sync fast enough.
      my.action = EventLinks.get(hash, `action`).hashes()[0];

      my.affects = TrackTrace.get(hash, `affects`).hashes()[0];

      let links = EventLinks.get(hash, `inputOf`);
      if (links.length) {
        my.inputOf = links.hashes()[0];
      } else {
        // may need to not set to null for otto
        // I hate this.
        my.inputOf = '';//null;
      }

      links = EventLinks.get(hash, `outputOf`);
      if (links.length) {
        my.outputOf = links.hashes()[0];
      } else {
        // may need to not set to null for otto
        my.outputOf = '';//null;
      }
    }
  }

  protected updateLinks(hash: Hash<this>): Hash<this> {
    // hash is now the OLD hash.  If there was a problem and there was no update
    // or commit, the hash will be the same.
    if (hash === this.myHash) return hash;

    //hash = hash || this.myHash;
    let my = this.myEntry;
    let {myHash} = this;
    let linksOut = hash && EventLinks.get(hash);
    // I don't need to manually removeAll() anymore for fields with singular()
    let action = linksOut && linksOut.tags(`action`);
    if (!action || !action.has(`action`, my.action)) {
      if (my.action) {
        EventLinks.put(myHash, my.action, `action`);
      //} else if (action && action.length) {
      //  action.removeAll();
      }
    }

    let inputOf = linksOut && linksOut.tags(`inputOf`);
    if (!inputOf || !inputOf.has(`inputOf`, my.inputOf)) {
      if (my.inputOf) {
        EventLinks.put(myHash, my.inputOf, `inputOf`);
      //} else if (inputOf && inputOf.length) {
      //  inputOf.removeAll();
      }
    }

    let outputOf = linksOut && linksOut.tags(`outputOf`);
    if (!outputOf || !outputOf.has(`outputOf`, my.outputOf)) {
      if (my.outputOf) {
        EventLinks.put(myHash, my.outputOf, `outputOf`);
      //} else if (outputOf && outputOf.length) {
      //  outputOf.removeAll();
      }
    }

    // not using affect() or unaffect()
    let affects = hash && TrackTrace.get(hash, `affects`);
    if (!affects || !affects.has(`affects`, my.affects)) {
      if (my.affects) {
        //if (affects && affects.length) {
        //  this.unaffect(affects[0].Hash);
        //  affects.removeAll();
        //}
        TrackTrace.put(myHash, my.affects, `affects`);
        //this.affect(my.affects);
      //} else if (affects) {
      //  affects.removeAll();
      }
    }

    return myHash;
  }

  commit(): Hash<this> {
    let hash = this.myHash;
    super.commit()
    this.updateLinks(hash);
    return this.myHash;
  }

  update(): Hash<this> {
    let hash = this.myHash;
    super.update()
    this.updateLinks(hash);
    return this.myHash;
  }

  private affect(hash: Hash<resources.EconomicResource>) {
    return void 0;
    let qv = this.quantity.mul({units: ``, quantity: this.action.sign });
    let {quantity, units} = qv;
    callZome(`resources`, `affect`, { resource: hash, quantity: {quantity, units} });
  }

  private unaffect(hash: Hash<resources.EconomicResource>) {
    return void 0;
    let my = this.myEntry;
    let resource: resources.EconomicResource = notError(get(hash));

    let sign = this.action.sign;
    let effect = this.quantity.mul({units: '', quantity: sign});
    let old = new QuantityValue(resource.currentQuantity);
    let {units, quantity} = old.sub(effect);

    resource.currentQuantity = {units, quantity};
    update(`EconomicResource`, resource, my.affects);
  }

  toString(): string {
    const action = this.action;
    const resTypeHash: Hash<resources.ResourceClassification> = entryOf(this.affects).resourceClassifiedAs;
    const resType = entryOf<resources.ResourceClassification>(resTypeHash);
    return `${''+action}${''+this.quantity} ${resType.name}`;
  }

  remove(): this {
    const my = this.myEntry;
    const hash = this.myHash;

    // If the event is removed, its effect is also reversed.
    let affects = TrackTrace.get(hash, `affects`);
    if (affects.length) {
      this.unaffect(affects.hashes()[0]);
    }

    EventLinks.get(hash).tags(`action`, `inputOf`, `outputOf`).removeAll();

    return super.remove();
  }
}

/*
 * Because I didn't think before dividing modules, they need to be freeze-dried
 * and thawed all the time to move between domains.  Further, to avoid compiling
 * each zome to a monolith, the only things they can export are type aliases.
 * That means entry types, not classes, and function signatures.  Oddly enough,
 * LinkRepo just needs a name and a type signature to thaw, so those will be ok
 */

//* TYPE-SCOPE
declare global {
/*/
/**/


namespace events {
  export type Action = typeof Action.entryType;
  export type EconomicEvent = typeof EconomicEvent.entryType;
  export type TransferClassification = typeof TransferClassification.entryType;
  export type Transfer = typeof Transfer.entryType;
  export type ProcessClassification = typeof ProcessClassification.entryType;
  export type Process = typeof Process.entryType;
  export type EconomicFunction = typeof EconomicFunction.entryType;
  //export type Classifications = typeof Classifications;
  //export type EventLinks = typeof EventLinks;
  //export type functions =
  //  "traceEvents"|"trackEvents"|"traceTransfers"|"trackTransfers"|
  //  "eventSubtotals"|"eventsEndedBefore"|"eventsStartedBefore"|"eventEndedAfter"|
  //  "eventsStartedAfter"|"createEvent"|"createTransfer"|"createTransferClass"|
  //  "createAction"|"resourceCreationEvent"|"sortEvents";
  //export type trackEvents = typeof trackEvents;
  //export type traceEvents = typeof traceEvents;
  //export type traceTransfers = typeof traceTransfers;
  //export type trackTransfers = typeof trackTransfers;
  //export type eventSubtotals = typeof eventSubtotals;
  //export type eventsStartedBefore = typeof eventsStartedBefore;
  //export type eventsEndedBefore = typeof eventsEndedBefore;
  //export type eventsStartedAfter = typeof eventsStartedAfter;
  //export type eventsEndedAfter = typeof eventsEndedAfter;
  //export type sortEvents = typeof sortEvents;
  //export type resourceCreationEvent = typeof resourceCreationEvent;
}
//* TYPE-SCOPE
}
/*/
/**/

//* EXPORT
export default events;
/*/
/**/


// <Zome exports> (call() functions)
//* HOLO-SCOPE
// TODO Fix trace/track funcs to use EconomicFunction
// for <DRY> purposes
function trackTrace<T, U>(subjects: Hash<T>[], tag: "inputs"|"outputs"|"outputOf"|"inputOf"): Hash<U>[] {
  return subjects.reduce((response: Hash<U>[], subject: Hash<T>) => {
    return response.concat(EventLinks.get(subject, tag).hashes());
  }, []);
}
interface TimeFilter {
  events: Hash<EconomicEvent>[],
  when: number
}
function filterByTime({events, when}: TimeFilter, filter: (ev: EconomicEvent) => boolean): Hash<EconomicEvent>[] {
  return events.map((ev) => EconomicEvent.get(ev))
    .filter(filter)
    .map((ev) => ev.hash);
}
// </DRY>

function traceEvents(events: Hash<EconomicEvent>[]): CrudResponse<typeof EconomicFunction.entryType>[] {
  return trackTrace(events, `outputOf`).map((hash) => {
    let instance = EconomicFunction.get(hash);
    return instance.portable();
  });
}

function trackEvents(events: Hash<EconomicEvent>[]): CrudResponse<typeof EconomicFunction.entryType>[] {
  return trackTrace(events, `inputOf`).map((hash) => {
    let instance = EconomicFunction.get(hash);
    return instance.portable();
  });
}

function traceTransfers(xfers: Hash<Transfer>[]): CrudResponse<events.EconomicEvent>[] {
  return trackTrace(xfers, `inputs`).map((hash) => {
    let instance = EconomicEvent.get(hash);
    return instance.portable();
  });
}

function trackTransfers(xfers: Hash<Transfer>[]): CrudResponse<events.EconomicEvent>[] {
  return trackTrace(xfers, `outputs`).map((hash) => {
    let instance = EconomicEvent.get(hash);
    return instance.portable();
  });
}

function eventsStartedBefore({events, when}: TimeFilter): CrudResponse<events.EconomicEvent>[] {
  return filterByTime({events, when}, ((ev) => when > ev.start)).map(hash => {
    return EconomicEvent.get(hash).portable();
  });
}

function eventsEndedBefore({events, when}: TimeFilter): CrudResponse<events.EconomicEvent>[] {
  return filterByTime({events, when}, ((ev) => ev.end < when)).map(hash => {
    return EconomicEvent.get(hash).portable();
  });
}

function eventsStartedAfter({events, when}: TimeFilter): CrudResponse<events.EconomicEvent>[] {
  return filterByTime({events, when}, ((ev) => when < ev.start)).map(hash => {
    return EconomicEvent.get(hash).portable();
  });
}

function eventsEndedAfter({events, when}: TimeFilter): CrudResponse<events.EconomicEvent>[] {
  return filterByTime({events, when}, ((ev) => ev.end > when)).map(hash => {
    return EconomicEvent.get(hash).portable();
  });
}

function sortEvents(
  {events, by, order, start, end}:
  {events: Hash<EconomicEvent>[], order: "up"|"down", by: "start"|"end", start?: number, end?: number}
): CrudResponse<events.EconomicEvent>[] {
  let objects = events.map((ev) => EconomicEvent.get(ev)),
    orderBy = by === "start" ?
      (ev:EconomicEvent) => ev.start :
      (ev:EconomicEvent) => ev.end;
  objects.sort((a, b) => {
    return Math.sign(orderBy(b) - orderBy(a));
  });

  let times = (!!start || !!end) && objects.map(orderBy);
  if (start) {
    let i = bisect(times, start);
    objects = objects.slice(i);
  }
  if (end) {
    let i = bisect(times, end);
    objects = objects.slice(0, i);
  }
  if (order === "down") objects = objects.reverse();
  return objects.map((ev) => ev.portable());
}
/*/
/**/

/**
 * A structure that details the event and state history of a group of resources
 * @interface
 * @member {object[]} events
 * @member {CrudResponse<EconomicEvent>} events[].event  The event that caused
 *  a state change.
 * @member {Dict<QVlike>} events[].subtotals using the hash of a resource as a key, the
 *  values are QuantityValue-like structs that reflect the state of that resource
 *  before the event occurred.
 * @member {Dict<QVlike>} totals The keys of all resources store the QVlike
 *  state of each resource after all the listed events (and previous)
 */
//* HOLO-SCOPE
interface Subtotals {
  events: {
    event: CrudResponse<typeof EconomicEvent.entryType>,
    subtotals: {[k:string]: QVlike}
  }[];
  resources: Hash<resources.EconomicResource>[];
  totals: {[k:string]: QVlike};
};

function eventSubtotals(hashes: Hash<EconomicEvent>[]): Subtotals {
  const uniqueRes = new Set<Hash<EconomicResource>>();
  let resourceHashes: Hash<resources.EconomicResource>[] = [];

  let events = hashes.map((h) => EconomicEvent.get(h));
  events.sort((a, b) => {
    return b.end - a.end;
  });

  events.forEach((ev) => {
    uniqueRes.add(ev.entry.affects);
  });

  let qvs: {[k:string]: QuantityValue};
  uniqueRes.forEach((ur) => {
    qvs[ur] = new QuantityValue({units: ``, quantity: 0});
    resourceHashes.push(ur);
  });

  let subs = events.map((ev) => {
    let item = {event: ev.portable(), subtotals: qvs},
      sign = ev.action.sign,
      quantity = ev.quantity.mul({units: ``, quantity: sign}),
      res = hashOf(ev.affects);

    qvs = Object.assign({}, qvs, { [res]: qvs[res].add(quantity) });

    return item;
  });

  return {events: subs, totals: qvs, resources: resourceHashes};
}
/**/
// <fixtures>
let fixtures: {
  Action: Fixture<Action>,
  TransferClassification: Fixture<TransferClassification>,
  ProcessClassification: Fixture<ProcessClassification>
};

function getFixtures(dontCare: any): typeof fixtures {
  return {
    Action: {
      give: Action.create({name: `give`, behavior: '-'}).commit(),
      receive: Action.create({name: `receive`, behavior: '+'}).commit(),
      adjust: Action.create({name: `adjust`, behavior: '+'}).commit(),
      produce: Action.create({name: `produce`, behavior: '+'}).commit(),
      consume: Action.create({name: `consume`, behavior: '-'}).commit(),
      increment: Action.create({name: `increment`, behavior: '+'}).commit(),
      decrement: Action.create({name: `decrement`, behavior: '-'}).commit(),
      load: Action.create({name: `load`, behavior: '-'}).commit(),
      unload: Action.create({name: `unload`, behavior: '+'}).commit(),
      use: Action.create({name: `use`, behavior: '0'}).commit(),
      work: Action.create({name: `work`, behavior: '0'}).commit(),
      cite: Action.create({name: `cite`, behavior: '0'}).commit(),
      accept: Action.create({name: `accept`, behavior: '0'}).commit(),
      improve: Action.create({name: `improve`, behavior: '0'}).commit()
    },
    TransferClassification: {
      stub: TransferClassification.create({
        name: `Transfer Classification Stub`
      }).commit()
    },
    ProcessClassification: {
      stub: ProcessClassification.create({label: `Process Classification Stub`}).commit()
    }
  };
}

// </fixures>
//* HOLO-SCOPE
function resourceCreationEvent(
  { resource, dates, action }: {
    resource: resources.EconomicResource,
    dates?:{start: number, end?:number},
    action?: Hash<Action>
  }
): CrudResponse<events.EconomicEvent> {
  let error: Error;
  let adjustHash: Hash<Action> = action || getFixtures({}).Action.adjust;
  let qv = resource.currentQuantity;
  let start: number, end: number;
  if (dates) {
    start = dates.start;
    end = dates.end || start + 1;
  } else {
    start = Date.now();
    end = start + 1;
  }
  if (!qv.units) {
    let resClass =
      notError<resources.ResourceClassification>(get(resource.resourceClassifiedAs));
    qv.units = resClass.defaultUnits;
  }
  resource.currentQuantity = { units: qv.units, quantity: 0 };
  const event = callZome(`resources`, `createResource`, {
    properties: resource,
    event: {
      action: adjustHash,
      affectedQuantity: qv,//{ units: qv.units, quantity: 0 },
      start,
      duration: end - start || 1
    },
    response: `event`
  });

  return <CrudResponse<events.EconomicEvent>> event;

}

// CRUD
function createEvent(init: typeof EconomicEvent.entryType): CrudResponse<typeof EconomicEvent.entryType> {
  let it: EconomicEvent = null, err: Error;
  try {
    it = EconomicEvent.create(init);

    // Events affect their resources on commit now
    it.commit();
    return it.portable();
  } catch (e) {
    return {
      error: e,
      hash: it && it.hash,
      entry: it && it.entry,
      type: it && it.className
    };
  }
}

const readEvents = reader(EconomicEvent);

type ExtXfer = typeof VfObject.entryType & {
  transferClassifiedAs: Hash<TransferClassification>,
  inputs: HoloThing<typeof EconomicEvent.entryType>,
  outputs: HoloThing<typeof EconomicEvent.entryType>
};

function createTransfer(init: ExtXfer): CrudResponse<typeof Transfer.entryType> {
  let it: Transfer = null, err: Error;
  try {
    let inputs: Hash<events.EconomicEvent>;
    if (typeof init.inputs === `string`) {
      inputs = init.inputs;
    } else {
      let that = createEvent(entryOf(init.inputs));
      if (that.error) throw that.error;
      inputs = that.hash;
    }

    let outputs: Hash<events.EconomicEvent>
    if (typeof init.outputs === `string`) {
      outputs = init.outputs;
    } else {
      let that = createEvent(entryOf(init.outputs));
      if (that.error) throw that.error;
      outputs = that.hash;
    }

    let props: events.Transfer = {
      transferClassifiedAs: init.transferClassifiedAs,
      inputs, outputs
    };
    it = Transfer.create(props);
    it.commit();
    return it.portable();
  } catch (e) {
    err = e;
    return {
      error: err,
      hash: it && it.hash,
      entry: it && it.entry,
      type: it && it.className
    };
  }
}

const readTransfers = reader(Transfer);

const createTransferClass = creator(TransferClassification);
const readTransferClasses = reader(TransferClassification);

const createAction = creator(Action);
const readActions = reader(Action);

const createProcessClass = creator(ProcessClassification);
const readProcessClasses = reader(ProcessClassification);

function createProcess(init: VfProc): CrudResponse<events.Process> {
  let props = {
    image: init.image,
    isFinished: init.isFinished,
    name: init.name,
    note: init.note,
    plannedStart: init.plannedStart,
    plannedDuration: init.plannedDuration,
    processClassifiedAs: init.processClassifiedAs
  };
  function toEv(hash) {
    return EconomicEvent.get(hash);
  }
  let it: Process;
  try {
    it = Process.create(props);
    it.addInputs(...init.inputs.map(toEv));
    it.addOutputs(...init.outputs.map(toEv));
    it.commit();
    return it.portable();
  } catch (e) {
    return {
      error: e,
      hash: it && it.hash,
      entry: it && it.entry,
      type: it && it.className
    };
  }
}

function readProcesses(hashes: Hash<ProcEntry>[]): CrudResponse<VfProc>[] {
  return hashes.map((hash) => {
    let proc: Process;
    try {

      let proc = Process.get(hash);
      return deepAssign(proc.portable(), {
        entry: {
          inputs: proc.inputs.hashes(),
          outputs: proc.outputs.hashes()
        }
      });

    } catch (e) {

      return {
        error: e,
        hash: proc && proc.hash,
        entry: proc && proc.entry,
        type: proc && proc.className
      }

    }
  });
}

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
