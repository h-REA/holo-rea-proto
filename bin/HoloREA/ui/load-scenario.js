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

  let using;
  if (needReload) {
    using = ready().then((it) => {
      window.scenario = it;
      let saving = Object.assign({}, it, { verbs: null });
      localStorage.setItem("gfdScenario", JSON.stringify(saving));
      return saving;
    });
  } else {
    window.scenario = verbify(storage);
    using = Promise.resolve(storage);
  }

  using.then((scenario) => {
    // set up help and story.
    window.al = scenario.al;
    window.bea = scenario.bea;
    window.chloe = scenario.chloe;

    function *story () {
      function a(fnTxt) {
        return `<a href="#input" onclick="$('#input').get(0).value = &quot;${fnTxt}&quot;">${fnTxt}</a>`;
      }

      yield `
        <p>Al is the owner of Al's apples.  He has picked 100 apples recently.</p>
        <output>
          ${a(`scenario.verbs.inventory(scenario.al)`)}<br/>
          ${a(`resources.getAffectingEvents({resource: scenario.al.apples.hash}).then((it) => hashes = it)`)}<br/>
          ${a(`events.readEvents(hashes)`)}<br/>
        </output>
      `;

      yield `
        <p>
          Bea has a company called Bea's Beans. She just got done gathering 2 kg
          of coffee beans.
        </p>
        <output>
          ${a(`scenario.verbs.inventory(scenario.bea)`)}<br/>
          ${a(`resources.getAffectingEvents({resource: scenario.bea.beans.hash}).then((it) => hashes = it)`)}<br/>
          ${a(`events.readEvents(hashes)`)}<br/>
        </output>
      `;

      yield `
        <p>
          Chloe runs a shop called Chloe's Coffee.  She just got done entering
          her inventory of 300 mL of coffee into HoloREA.
        </p>
        <output>
          ${a(`scenario.verbs.inventory(scenario.chloe)`)}<br/>
          ${a(`resources.getAffectingEvents({resource: scenario.chloe.coffee.hash}).then((it) => hashes = it)`)}<br/>
          ${a(`events.readEvents(hashes)`)}<br/>
        </output>
      `;

      while (true) {
        yield `
          <p>
            Al brings his apples to Chloe's Coffee.
          </p>
          <p>
            <b>Al:</b><q>I'd like some coffee, please, say, 300 mL.</q>
          </p>

          <code>
            ${a(`scenario.verbs.trade({quantity: 300, units: 'mL'}, chloe.coffee.hash, al.coffee.hash).then((it) => transfer = it)`)}<br/>
          </code>
          <output>
            ${a(`scenario.verbs.inventory(scenario.chloe)`)}<br/>
            ${a(`scenario.verbs.inventory(scenario.al)`)}<br/>
            ${a(`events.readEvents([transfer.entry.inputs, transfer.entry.outputs])`)}<br/>
          </output>
        `;

        yield `
          <p>
            <b>Chloe:</b><q>In exchange, I need 3 apples.  Thank you!</q>
          </p>

          <code>
            ${a(`scenario.verbs.trade({quantity: 3, units: ''}, scenario.al.apples.hash, scenario.chloe.apples.hash).then((it) => transfer = it)`)}<br/>
          </code>
        `;

        yield `
          <p>
            Chloe knows that her other customer, Bea, enjoys a good apple turnover,
            so she bakes one with her 3 apples.
          </p>

          <code>
            ${a(`scenario.verbs.bakeTurnovers(1).then((it) => process = it)`)}<br/>
          </code>
        `

        yield `
          <p>As predicted, Bea arrives shortly with her stock of coffee beans.</p>
          <p>
            <b>Bea:</b><q>One apple turnover please.</q>
          </p>

          <code>
            ${a(`scenario.verbs.trade({quantity: 1, units: ''}, scenario.chloe.turnovers.hash, scenario.bea.turnovers.hash).then((it) => transfer = it)`)}<br/>
          </code>
        `;

        yield `
          <p>
            <b>Chloe:</b><q>And I'll take 1/2 kg of your finest coffee beans.</q>
          </p>

          <code>
            ${a(`scenario.verbs.trade({quantity: 0.5, units: 'kg'}, scenario.bea.beans.hash, scenario.chloe.beans.hash).then((it) => transfer = it)`)}<br/>
          </code>
        `;

        yield `
          <p>
            To reward herself for her hard day's work, Chloe brews 6 cups of coffee
            for herself with those beans, saving some for Al.
          </p>

          <code>
            ${a(`scenario.verbs.brewCoffee(6).then((it) => process = it)`)}<br/>
          </code>
        `;

        yield `
          <p>
            Content with the fruits of their labor, Al, Bea, and Chloe all pack it
            in for the day.  They all hope that tomorrow will be just the same.
          <p>
        `;

        yield `
          <p>
            Another day, another apple.  Al goes out to pick some more.
          </p>

          <code>
            ${a(`scenario.verbs.pickApples(3)`)}<br/>
          </code>
        `;

        yield `
          <p>Bea likes to gather her beans in the cool of dawn.</p>

          <code>
            ${a(`scenario.verbs.gatherBeans(0.5)`)}<br/>
          </code>
        `;
      }
    }

    let storyState = story();

    window.story = function () {
      return storyState.next().value;
    }

    let verbs = scenario.verbs;
    let h = window.h;
    scenario.verbs.pickApples.help = h(
      `pickApples(howMany, when?, inventory?) => EconomicEvent: adds howMany apples to inventory at
       when with an apple-picking event.  Returns the event that was created.`,
      {
        howMany: h(`unsigned integer howMany: the number of apples to pick`),
        when: h(`unsigned integer when?: the time at which the apple-picking
          begins. Defaults to right now.`),
        inventory: h(`Hash inventory?: the hash of the resource of type apples
          to which the apples should be added.  Defaults to Al's apples.`)
      }
    );
    scenario.verbs.gatherBeans.help = h(
      `gatherBeans(howMany, when?, inventory?) => EconomicEvent: adds howMuch kg
       of beans to inventory with a gather event at time = when.  Returns the
       gather event.`,
      {
        howMany: h(`unsigned number howMany: The number of kg beans to gather.`),
        when: h(`unsigned integer when?: The DateTime when the event should
          start.  Defaults to right now.`),
        inventory: h(`Hash inventory?:  The resource of type beans to which the
          beans will be added.  Defaults to Bea's beans.`)
      }
    );
    scenario.verbs.brewCoffee.help = h(
      `brewCoffee(howMuch, when?, useBeans?, inventory?) => Process`
    );
    scenario.verbs.bakeTurnovers.help = h(
      `bakeTurnovers(howMany, when?, useApples?, inventory?) => Process`
    );
    scenario.verbs.trade.help = h(
      `trade(howMuchQuantity, fromResource, toResource, when?) => Transfer`
    );
    scenario.verbs.inventory.help = h(
      `inventory(person) => Inventory`
    );

    return scenario;
  });

  return using;
});
