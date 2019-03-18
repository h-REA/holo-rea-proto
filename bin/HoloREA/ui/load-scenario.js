import { ready, verbify } from "./scenario.js";
import { resources, agents, events } from "./zomes.js";

window.agents = agents;
window.resources = resources;
window.events = events;

repl(async function loading () {
  let storage = localStorage.getItem("gfdScenario");
  storage = storage && JSON.parse(storage);
  let needReload = false;

  if (!storage) {
    needReload = true;
  } else {
    let [apples] = await resources.readResources([storage.types.resource.apples.hash]);
    if (!apples || apples.error) {
      needReload = true;
    } else {
      let events = await resources.getAffectingEvents({ resource: apples.hash });
      if (!events || !events.length) {
        needReload = true;
      }
    }
  }

  if (needReload) {
    return ready().then((it) => {
      window.scenario = it;
      let saving = Object.assign({}, it, { verbs: null });
      localStorage.setItem("gfdScenario", JSON.stringify(saving));
      return saving;
    });
  } else {
    window.scenario = verbify(storage);
    return Promise.resolve(storage);
  }
})
