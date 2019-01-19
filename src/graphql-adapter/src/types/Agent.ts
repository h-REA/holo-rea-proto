/**
 * Agent schema type
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

import { agents } from '@holorea/zome-api-wrapper'

import { EconomicResource } from './EconomicResource'

export interface IAgent {
  id: string,
  name: string,
  type: string,
  image: string,
  note: string,
  primaryLocation: string,
  primaryPhone: string,
  email: string,
  // :TODO:
}

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
      type: new GraphQLList(EconomicResource), resolve: (agent: IAgent, {
        // category,
        // resourceClassificationId,
        // page
      }: {
        // category?: IEconomicResourceCategory,
        // resourceClassificationId?: string,
        // page?: number
      }) => {
        // :TODO: externally-exposed resource classification IDs?
        // const resourceClassifications = {}

        return agents.getOwnedResources({
          agents: [agent.id],
          // types: [
          //   await ResourceClassification.get(resourceClassificationId)
          // ]
        })
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
