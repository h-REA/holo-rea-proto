/**
 * type schemas for GraphQL query layer
 *
 * @see https://github.com/FreedomCoop/valuenetwork/tree/71b0868/valuenetwork/api/types
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-03
 */

import fecha from 'fecha'

import {
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLID
} from 'graphql'
import { Kind } from 'graphql/language'

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

export const Action = new GraphQLEnumType({
  name: 'Action',
  values: {
    NONE: { value: 0 },
    ACCEPT: { value: 1 },
    ADJUST: { value: 2 },
    CITE: { value: 3 },
    CONSUME: { value: 4 },
    GIVE: { value: 5 },
    IMPROVE: { value: 6 },
    PRODUCE: { value: 7 },
    TAKE: { value: 8 },
    USE: { value: 9 },
    WORK: { value: 10 }
  }
})

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

// config / system layer

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
  name: 'Quantity value',
  description: 'Some measured quantity, recorded against a particular measurement unit',
  fields: () => ({
    numericValue: { type: GraphQLID },
    unit: { type: Unit }
  })
})

export const NotificationType = new GraphQLObjectType({
  name: 'Notification type',
  description: 'A definition for a notification type, which can be configured to fire in response to various system actions.',
  fields: () => ({
    id: { type: GraphQLID },
    // :TODO: i18n
    label: { type: GraphQLString },
    description: { type: GraphQLString },
    display: { type: GraphQLString }
  })
})
export interface NotificationTypeInterface {
  id: string,
  label: string,
  description: string,
  display: string,
}
/*
export const ResourceClassification = new GraphQLObjectType({
})

export const ProcessClassification = new GraphQLObjectType({
})

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

export const Place = new GraphQLObjectType({
})

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

export const EconomicResource = new GraphQLObjectType({
})

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
    primaryPhone: { type: GraphQLString },
    email: { type: GraphQLString }
/*
    ownedEconomicResources
    : { type: new GraphQLList(EconomicResource), resolve: (agent, args) => {
      //(category: EconomicResourceCategoryresourceClassificationId: Intpage: Int)

    } },
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
    agentNotificationSettings
    : { type: new GraphQLList(NotificationSetting), resolve: agent => {

    } },
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
export interface AgentInterface {
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
export const NotificationSetting = new GraphQLObjectType({
  name: 'Notification setting',
  description: 'Controls user preferences as to whether to enable notifications for a particular subset of REA system functionality.',
  fields: () => ({
    id: { type: GraphQLID },
    send: { type: GraphQLBoolean },
    agent: { type: Agent, resolve: (setting, args) => {
    } },
    notificationType: { type: NotificationType }
  })
})
export interface INotificationSetting {
  id: string,
  send: boolean,
  agent?: AgentInterface,
  notificationType: NotificationTypeInterface
}
