/**
 * Agent-related queries
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-21
 */

import {
  GraphQLList,
  GraphQLID
} from 'graphql'

import { agents } from '@holorea/zome-api-wrapper'

import { GraphQLFieldDef } from './'
import { readSingleEntry, readMultipleEntries } from '../utils'
import { Agent } from '../types'

import { getAllAgentHashes } from '../dummyData'

const readAgent = readSingleEntry(agents.readAgents)
const readAgents = readMultipleEntries(agents.readAgents)

export const agent: GraphQLFieldDef = {
  resultType: Agent,
  args: { id: GraphQLID },
  async resolve (_1, { id }: { id: string }) {
    return readAgent(id)
  }
}

export const allAgents: GraphQLFieldDef = {
  resultType: new GraphQLList(Agent),
  async resolve () {
    return readAgents(await getAllAgentHashes())
  }
}
