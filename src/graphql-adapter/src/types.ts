/**
 * type schemas for GraphQL query layer
 *
 * @see https://github.com/FreedomCoop/valuenetwork/tree/71b0868/valuenetwork/api/types
 *
 * Incompatibilities with the above API (fork of Sensorica's NRP) are noted in
 * the comments as :TODO: items to resolve in order to resolve discrepancies in future.
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-03
 */

import fecha from 'fecha'

import {
  // GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  // GraphQLEnumType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLFloat,
  // GraphQLBoolean,
  // GraphQLInt,
  GraphQLID
} from 'graphql'
import { Kind } from 'graphql/language'

// Frontend <> DHT REST API bindings
import {
  // resources,
  // events,
  agents
} from '@holorea/zome-api-wrapper'

// Types from DHT code, to bridge hardcoded code gaps
// :TODO: get compilation working
// import { getFixtures } from '../../HoloREA/dna/events/events'

// import {
//   VfObject, QuantityValue as coreQV, Hash, QVlike, notError, CrudResponse,
//   PhysicalLocation, HoloThing, entryOf, hashOf, deepAssign, Initializer, Fixture, reader
// } from "../../HoloREA/dna/common/common";

// base types

const isoDateRegex = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+-]\d\d:\d\d$/
const parseDate = (val: string) => fecha.parse(val, 'YYYY-MM-DDTHH:mm:ssZZ')

// :TODO: check date field compat with ValueNetwork API

export const StringDate = new GraphQLScalarType({
  name: 'Date (ISO8601)',
  serialize: parseDate,
  parseValue: parseDate,
  parseLiteral (ast) {
    if (ast.kind === Kind.STRING && ast.value.match(isoDateRegex)) {
      return parseDate(ast.value)
    }
    return null
  }
})

// predefined (hardcoded) taxonomies

/*
export const EconomicResourceCategory = new GraphQLEnumType({
  name: 'Economic resource categories',
  values: {
    NONE: { value: 0 },
    CURRENCY: { value: 1 },
    INVENTORY: { value: 2 },
    WORK: { value: 3 }
  }
})
export type IEconomicResourceCategory = "NONE" | "CURRENCY" | "INVENTORY" | "WORK"

export const EconomicResourceProcessCategory = new GraphQLEnumType({
  name: 'Economic resource process categories',
  values: {
    NONE: { value: 0 },
    CITED: { value: 1 },
    CONSUMED: { value: 2 },
    PRODUCED: { value: 3 },
    USED: { value: 4 }
  }
})
*/

// config / system layer

export const Action = new GraphQLObjectType({
  name: 'Action',
  description: 'Defines an action type and what "kind" of action it is.',
  fields: () => ({
    name: { type: GraphQLString },
    behavior: { type: GraphQLString }, // :TODO: indicate allowable options of '+'|'-'|'0'
  })
})

export const Unit = new GraphQLObjectType({
  name: 'Unit',
  description: 'A measurement unit for quantifying resources',
  fields: () => ({
    id: { type: GraphQLID },
    // :TODO: i18n
    name: { type: GraphQLString },
    symbol: { type: GraphQLString }
  })
})

export const QuantityValue = new GraphQLObjectType({
  name: 'QuantityValue',
  description: 'Some measured quantity, recorded against a particular measurement unit',
  fields: () => ({
    // :TODO: update NRP API, `numericValue` -> `quantity`
    quantity: { type: GraphQLFloat },
    unit: { type: Unit }
  })
})

export const ResourceClassification = new GraphQLObjectType({
  name: 'ResourceClassification',
  description: 'A classification for a group of related resources within an economic network',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    // :TODO: update NRP API, `unit` -> `defaultUnits`
    // unit: { type: Unit },
    defaultUnits: { type: Unit },
    image: { type: GraphQLString },
    note: { type: GraphQLString },
    // category: { type: GraphQLString },
    processCategory: { type: GraphQLString },
    // classificationResources: [EconomicResource]
  })
})

export const ProcessClassification = new GraphQLObjectType({
  name: 'ProcessClassification',
  description: 'A classification for grouping types of processes within an economic network',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    note: { type: GraphQLString },
    // scope: { type: Agent },
    estimatedDuration: { type: GraphQLString }
  })
})

/*
export const AgentResourceClassification = new GraphQLObjectType({
})

export const OrganizationClassification = new GraphQLObjectType({
})

export const AgentRelationshipRole = new GraphQLObjectType({
})

export const OrganizationType = new GraphQLObjectType({
})

export const Facet = new GraphQLObjectType({
})
*/
export const Place = new GraphQLObjectType({
  name: 'Place',
  description: 'A physical location',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    address: { type: GraphQLString },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    note: { type: GraphQLString },
    // placeResources: [EconomicResource]
    // placeAgents: [Agent]
  })
})
/*
// planning layer

export const Plan = new GraphQLObjectType({
})

export const Commitment = new GraphQLObjectType({
})

export const ExchangeAgreement = new GraphQLObjectType({
})

// actuals layer

export const Process = new GraphQLObjectType({
})
*/
export const EconomicResource = new GraphQLObjectType({
  name: 'Resource',
  description: 'An economic resource in an REA-based economic network',
  fields: () => ({
    id: { type: GraphQLID },
    url: { type: GraphQLString },
    resourceClassifiedAs: { type: ResourceClassification },
    trackingIdentifier: { type: GraphQLString },
    image: { type: GraphQLString },
    currentQuantity: { type: QuantityValue },
    note: { type: GraphQLString },
    category: { type: GraphQLString },
    currentLocation: { type: Place },
    createdDate: { type: GraphQLString },
    // transfers: {
    //   type: new GraphQLList(Transfer), resolve(resource, {
    //   }: {
    //   }) => {

    //   }
    // },
    // resourceContacts: {
    //   type: new GraphQLList(Agent), resolve(resource, {
    //   }: {
    //   }) => {

    //   }
    // },
    // owners: {
    //   type: new GraphQLList(Agent), resolve(resource, {
    //   }: {
    //   }) => {

    //   }
    // }
  })
})
/*
export const EconomicEvent = new GraphQLObjectType({
})

export const Exchange = new GraphQLObjectType({
})

export const Transfer = new GraphQLObjectType({
})

export const Validation = new GraphQLObjectType({
})

// agents

export const AgentRelationship = new GraphQLObjectType({
})
*/
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
/*
export const Organization = new GraphQLObjectType({
})

export const Person = new GraphQLObjectType({
})
*/
