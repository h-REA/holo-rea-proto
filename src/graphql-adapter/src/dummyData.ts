/**
 * Wrapper for isolating all bindings to test scenario data in a single location.
 *
 * This mainly services "all" queries, by bringing in lists of hashes that are
 * created in the demo and returning them for use by GraphQL queries.
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-21
 */

import { resources, events, agents } from '@holorea/zome-api-wrapper'

// note: TS isn't strict enough to import, so use JS
import { ready } from '../../../bin/HoloREA/ui/scenario'

// add these things as window globals 'cos that's what the scenario does
// @ts-ignore
window.resources = resources
// @ts-ignore
window.events = events
// @ts-ignore
window.agents = agents

// cache it
let scenario: any

function getScenario () {
  if (scenario) {
    return scenario
  }
  scenario = ready()
  return scenario
}

// load immediately so that test data is inited for querying
getScenario()

// methods for hash retrieval

export const getAllAgentHashes = async () => {
  const s = await getScenario()

  return [
    s.al.agent.hash,
    s.bea.agent.hash,
    s.chloe.agent.hash,
    s.david.agent.hash
  ]
}

export const getAllResourceClassificationHashes = async () => {
  const s = await getScenario()

  return [
    s.types.resource.apples.hash,
    s.types.resource.beans.hash,
    s.types.resource.turnovers.hash,
    s.types.resource.coffee.hash
  ]
}
