/**
 * Agent-related mutations
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-02-05
 */

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull
} from 'graphql'

import { GraphQLFieldDef } from '../queries'
import { Agent } from '../types'
import { normaliseRecord } from '../utils'
import { agents } from '@holorea/zome-api-wrapper'

interface CreateArgs {
  name: string,
  type?: string,
  image?: string,
  note?: string
}

export const createPerson: GraphQLFieldDef = {
  resultType: new GraphQLObjectType({
    name: 'CreatePersonResult',
    description: 'Result structure for singular human agent (person) creation mutations',
    fields: () => ({
      person: { type: Agent }  // :TODO: should eventually be Person subtype
    })
  }),
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    type: { type: GraphQLString },
    image: { type: GraphQLString },
    note: { type: GraphQLString },
// email: { type: GraphQLString },
// primaryPhone: { type: GraphQLString },
// primaryLocationId: { type: GraphQLID }
  },
  async resolve (_1: any, args: CreateArgs) {
    const agent = await agents.createAgent(args)
    return { person: normaliseRecord(agent) }
  }
}
