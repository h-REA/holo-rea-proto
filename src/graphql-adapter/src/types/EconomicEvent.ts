/**
 * Schema type for REA economic events
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-21
 */

import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLID
} from 'graphql'

import { agents, resources } from '@holorea/zome-api-wrapper'
import { resolveSingleEntry } from '../utils'

import { Agent } from './Agent'
import { QuantityValue } from './QuantityValue'
import { EconomicResource } from './EconomicResource'

const readAgentRef = resolveSingleEntry(agents.readAgents)
const resolveProvider = readAgentRef('provider')
const resolveReceiver = readAgentRef('receiver')
const resolveScope = readAgentRef('scope')

const resolveAffectedResource = resolveSingleEntry(resources.readResources)('affects')

export const EconomicEvent = new GraphQLObjectType({
  name: 'EconomicEvent',
  description: 'An economic event within an REA economic network',
  fields: () => ({
    id: { type: GraphQLID },
    action: { type: GraphQLString },
    // inputOf: Process
    // outputOf: Process
    provider: { type: Agent, resolve: resolveProvider },
    receiver: { type: Agent, resolve: resolveReceiver },
    scope: { type: Agent, resolve: resolveScope },
    affects: { type: EconomicResource, resolve: resolveAffectedResource },
    affectedQuantity: { type: QuantityValue },
    start: { type: GraphQLString },
    url: { type: GraphQLString },
    requestDistribution: { type: GraphQLBoolean },
    note: { type: GraphQLString },
    // fulfills: [Fulfillment]
    // validations: [Validation]
    isValidated: { type: GraphQLBoolean },
    userIsAuthorizedToUpdate: { type: GraphQLBoolean },
    userIsAuthorizedToDelete: { type: GraphQLBoolean }
  })
})
