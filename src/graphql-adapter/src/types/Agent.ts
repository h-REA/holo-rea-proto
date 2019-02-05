/**
 * Agent schema type
 *
 * Partial implementation for GFD, various fields and criteria from NRP missing
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-19
 */

import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLID
} from 'graphql'

import { agents, resources } from '@holorea/zome-api-wrapper'
import { readMultipleEntries } from '../utils'
import { EconomicResource } from './EconomicResource'

export interface IAgent {
  id: string,
  name: string,
  type: string,
  image: string,
  note: string,
  primaryLocation: string,  // :TODO: use a Place record and update NRP to match
  // primaryPhone: string,
  // email: string,
}

const readResources = readMultipleEntries(resources.readResources)

export const Agent = new GraphQLObjectType({
  name: 'Agent',
  description: 'An agent in an REA-based economic network',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    type: { type: GraphQLString },
    image: { type: GraphQLString },
    note: { type: GraphQLString },
    primaryLocation: { type: GraphQLString },
    // :TODO: confirm & implement if desired
    // primaryPhone: { type: GraphQLString },
    // email: { type: GraphQLString },
    ownedEconomicResources: {
      type: new GraphQLList(EconomicResource),
      args: {
        // category: {},
        resourceClassificationId: { type: new GraphQLList(GraphQLID) }
        // page: {}
      },
      resolve: async (agent: IAgent, {
        // category,
        resourceClassificationId
        // page
      }: {
        // category?: IEconomicResourceCategory,
        resourceClassificationId?: string[],
        // page?: number
      }) => {
        const res = await agents.getOwnedResources({
          agents: [agent.id],
          types: resourceClassificationId
        })

        // flatten response
        const hashes = Object.values(res).reduce((hashes: string[], group: { [l: string]: string }) => {
          return hashes.concat(Object.values(group).reduce((a: string[], g: string) => a.concat(g), []))
        }, [])

        // read ref'd records
        return readResources(hashes)
      }
    },
/*
    searchOwnedInventoryResources
    : { type: new GraphQLList(EconomicResource), resolve: (agent, args) => {
      //(searchString: String)

    } },
    agentProcesses
    : { type: new GraphQLList(Process), resolve: (agent, args) => {
      //(isFinished: Boolean)

    } },
    searchAgentProcesses
    : { type: new GraphQLList(Process), resolve: (agent, args) => {
      //(searchString: StringisFinished: Boolean)

    } },
    agentPlans
    : { type: new GraphQLList(Plan), resolve: (agent, args) => {
      //(isFinished: Booleanyear: Intmonth: Int)

    } },
    searchAgentPlans
    : { type: new GraphQLList(Plan), resolve: (agent, args) => {
      //(searchString: StringisFinished: Boolean)

    } },
    agentEconomicEvents
    : { type: new GraphQLList(EconomicEvent), resolve: (agent, args) => {
      //(latestNumberOfDays: IntrequestDistribution: Booleanaction: Stringyear: Intmonth: Int)

    } },
    agentCommitments
    : { type: new GraphQLList(Commitment), resolve: (agent, args) => {
      //(latestNumberOfDays: Int)

    } },
    searchAgentCommitments
    : { type: new GraphQLList(Commitment), resolve: (agent, args) => {
      //(searchString: StringisFinished: Boolean)

    } },
    agentRelationships
    : { type: new GraphQLList(AgentRelationship), resolve: (agent, args) => {
      //(roleId: Intcategory: AgentRelationshipCategory)

    } },
    agentRelationshipsAsSubject
    : { type: new GraphQLList(AgentRelationship), resolve: (agent, args) => {
      //(roleId: Intcategory: AgentRelationshipCategory)

    } },
    agentRelationshipsAsObject
    : { type: new GraphQLList(AgentRelationship), resolve: (agent, args) => {
      //(roleId: Intcategory: AgentRelationshipCategory)

    } },
    agentRoles
    : { type: new GraphQLList(AgentRelationshipRole), resolve: agent => {

    } },
    agentRecipes
    : { type: new GraphQLList(ResourceClassification), resolve: agent => {

    } },
    // :TODO: rethink account addresses & standardise FreedomCoop additions in valuenetwork
    // faircoinAddress: { type: GraphQLString },
    memberRelationships
    : { type: new GraphQLList(AgentRelationship), resolve: agent => {

    } },
    agentSkills
    : { type: new GraphQLList(ResourceClassification), resolve: agent => {

    } },
    agentSkillRelationships
    : { type: new GraphQLList(AgentResourceClassification), resolve: agent => {

    } },
    commitmentsMatchingSkills
    : { type: new GraphQLList(Commitment), resolve: agent => {

    } },
    validatedEventsCount
    : { type: GraphQLInt, resolve: (agent, args) => {
      //(month: Int, year: Int) :TODO: why is this backwards?

    } },
    eventsCount
    : { type: GraphQLInt, resolve: (agent, args) => {
      //(year: Int, month: Int)

    } },
    eventHoursCount
    : { type: GraphQLInt, resolve: (agent, args) => {
      //(year: Int, month: Int)

    } },
    eventPeopleCount
    : { type: GraphQLInt, resolve: (agent, args) => {
      //(year: Int, month: Int)

    } },
*/
  })
})
