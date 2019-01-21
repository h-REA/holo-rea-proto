/**
 * Mutations related to economic events
 *
 * :TODO: lots of field names, field types & mandatory flags to resolve with NRP here
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-21
 */

import {
  GraphQLObjectType,
  GraphQLInt,
  // GraphQLBoolean,
  GraphQLString,
  GraphQLNonNull
} from 'graphql'

import { GraphQLFieldDef } from '../queries'
import { EconomicEvent, QuantityValueInput } from '../types'
import { events, QuantityValue as IQuantityValue } from '@holorea/zome-api-wrapper'

interface CreateArgs {
  action: string,
  inputOfId?: string,
  outputOfId?: string,
  affectsId: string,
  providerId: string,
  receiverId: string,
  affectedQuantity: IQuantityValue,
  scopeId?: string,
  start: number,
  duration: number,  // no equivalent in NRP

  // not yet implemented:

  // resourceImage?: string,
  // affectedResourceClassifiedAsId?: number,
  // note?: string,
  // requestDistribution?: boolean,
  // resourceTrackingIdentifier?: string,
  // affectedUnitId?: number,
  // createResource?: boolean,
  // url?: string,
  // resourceNote?: string,
  // resourceCurrentLocationId?: number,
  // resourceUrl?: string,
  // fulfillsCommitmentId?: number,
}

export const createEconomicEvent: GraphQLFieldDef = {
  resultType: new GraphQLObjectType({
    name: 'CreateEconomicEventResult',
    description: 'Result structure for event creation mutations',
    fields: () => ({
      economicEvent: { type: EconomicEvent }
    })
  }),
  args: {
    action: { type: GraphQLString },
    inputOfId: { type: GraphQLString },
    outputOfId: { type: GraphQLString },
    affectsId: { type: new GraphQLNonNull(GraphQLString) },
    providerId: { type: GraphQLString },
    receiverId: { type: GraphQLString },
    // :TODO: nest parameters in sub-object in NRP API
    // affectedResourceClassifiedAsId: { type: GraphQLInt },
    // affectedNumericValue: { type: new GraphQLNonNull(GraphQLString) },
    // affectedUnitId: { type: GraphQLInt },
    affectedQuantity: { type: QuantityValueInput },
    scopeId: { type: GraphQLString },
    start: { type: GraphQLInt },
    duration: { type: GraphQLInt }

    // resourceImage: { type: GraphQLString },
    // note: { type: GraphQLString },
    // requestDistribution: { type: GraphQLBoolean },
    // resourceTrackingIdentifier: { type: GraphQLString },
    // createResource: { type: GraphQLBoolean },
    // url: { type: GraphQLString },
    // resourceNote: { type: GraphQLString },
    // resourceCurrentLocationId: { type: GraphQLInt },
    // resourceUrl: { type: GraphQLString },
    // fulfillsCommitmentId: { type: GraphQLInt }
    // token: String!
  },
  async resolve (_1: any, args: CreateArgs) {
    return events.createEvent({
      action: args.action,
      inputOf: args.inputOfId,
      outputOf: args.outputOfId,
      affects: args.affectsId,
      provider: args.providerId,
      receiver: args.receiverId,
      affectedQuantity: args.affectedQuantity,
      scope: args.scopeId,
      start: args.start,
      duration: args.duration
    })
  }
}
