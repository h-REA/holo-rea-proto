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

import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

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

// system layer

export * from './Action'

export * from './Unit'
export * from './QuantityValue'

// config layer

export * from './Place'

export * from './ResourceClassification'
export * from './ProcessClassification'
export * from './TransferClassification'

// actuals layer

export * from './Agent'
export * from './EconomicResource'
export * from './EconomicEvent'

// [unstarted types follow]

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

// config layer

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

export const Exchange = new GraphQLObjectType({
})

export const Transfer = new GraphQLObjectType({
})

export const Validation = new GraphQLObjectType({
})

// agents

export const AgentRelationship = new GraphQLObjectType({
})

export const Organization = new GraphQLObjectType({
})

export const Person = new GraphQLObjectType({
})
*/
