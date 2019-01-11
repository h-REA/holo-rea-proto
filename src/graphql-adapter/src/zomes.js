/**
 * Zome API helper
 *
 * @package: HoloREA
 * @author:  David Hand <sqykly@users.noreply.github.com>
 * @since:   2018-11-21
 * @flow
 */

function Zome(name, fnTypes) {
  function send(fnName, data) {
    // all HC functions take and return the same type: either string or json.
    let t;
    switch (typeof data) {

      case "string":
        t = "text";
      break;

      case "object":
        t = "json";
      break;

      default:
      t = "json";
      data = JSON.stringify(data);

    }
    return fetch(`fn/${name}/${fnName}`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': `application/${t}`
      },
      body: data
    });
  }

  for (let fn of fnTypes) {
    this[fn] = (arg) => send(fn, arg);
  }
}

const agents = new Zome(`agents`, [`createAgent`, `getOwnedResources`]);

const resources = new Zome(`resources`, [
  `createResourceClassification`, `createResource`, `getFixtures`,
  `getResourcesInClass`, `getAffectingEvents`, `affect`
]);

const events = new Zome(`events`, [
  `createEvent`, `createAction`, `createTransfer`, `createTransferClass`,
  `getFixtures`, `traceEvents`, `trackEvents`, `traceTransfers`, `trackTransfers`,
  `eventSubtotals`, `eventsStartedAfter`, `eventsStartedBefore`, `eventsEndedAfter`,
  `eventsEndedBefore`, `sortEvents`, `resourceCreationEvent`
]);

export default {agents, resources, events};
