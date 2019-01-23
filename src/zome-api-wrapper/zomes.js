/**
 * Zome API helper
 *
 * @package: HoloREA
 * @author:  David Hand <sqykly@users.noreply.github.com>
 * @since:   2018-11-21
 * @flow
 */

const HTTP_HOST = `${process.env.DHT_HOSTNAME}`;

// clone response and attempt decoding JSON
// (needed in both success and error cases)
async function tryParseJson(response) {
  const responseCopy = response.clone();
  try {
    const result = await responseCopy.json();

    // :SHONK: fix `null` error causing problems in `scenario.ts`
    if (result.error === null) {
      delete result['error'];
    }
    if (Array.isArray(result)) {
      result.forEach((r) => {
        if (r.error === null) {
          delete r['error'];
        }
      });
    }

    return result;
  } catch (err) {
    if (err instanceof SyntaxError) {
      return responseCopy.text();
    } else {
      throw err;
    }
  }
}

function Zome(name, fnTypes) {
  function send(fnName, data) {
    // all HC functions take and return the same type: either string or json.
    let t;
    switch (typeof data) {
      case "string":
        t = "text";
        break;
      default:
        t = "json";
        data = JSON.stringify(data);
        break;
    }

    return fetch(`${HTTP_HOST}/fn/${name}/${fnName}`, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': `application/${t}`
      },
      body: data
    }).then(async response => {
      if (!response.ok) {
        // handle Zome API handler errors
        let content = null
        try {
          content = await tryParseJson(response)
        } catch (e) { /* swallow unhandled parse errors, server msg is not always required */ }
        if (content && content.errorMessage) {
          return Promise.reject(new Error(`[DHT] ${content.errorMessage}`));
        }

        // handle HTTP errors
        const resultErr = new Error(`HTTP error ${response.status}`);
        resultErr.context = response;
        return Promise.reject(resultErr);
      }

      return await tryParseJson(response)
    });
  }

  for (let fn of fnTypes) {
    this[fn] = (arg) => send(fn, arg);
  }
}

export const agents = new Zome(`agents`, [
  `createAgent`,
  `readAgents`, `getOwnedResources`
]);

export const resources = new Zome(`resources`, [
  `createResourceClassification`, `createResource`,
  `getFixtures`, `readResources`, `readResourceClasses`,
  `getResourcesInClass`, `getAffectingEvents`, `affect`
]);

export const events = new Zome(`events`, [
  `createEvent`, `createAction`, `createTransfer`, `createTransferClass`,
  `getFixtures`, `readActions`, 'readProcessClasses', 'readTransferClasses', 'readEvents',
  `traceEvents`, `trackEvents`, `traceTransfers`, `trackTransfers`,
  `eventSubtotals`, `eventsStartedAfter`, `eventsStartedBefore`, `eventsEndedAfter`,
  `eventsEndedBefore`, `sortEvents`, `resourceCreationEvent`
]);
