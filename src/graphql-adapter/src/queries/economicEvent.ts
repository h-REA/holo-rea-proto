/**
 * Queries for reading economic events
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-21
 */

import {
  // GraphQLList,
  GraphQLID
} from 'graphql'

import { GraphQLFieldDef } from './'
import { readSingleEntry } from '../utils'
import { EconomicEvent } from '../types'

import { events } from '@holorea/zome-api-wrapper'

const readEconomicEvent = readSingleEntry(events.readEvents)

export const economicEvent: GraphQLFieldDef = {
  resultType: EconomicEvent,
  args: { id: GraphQLID },
  async resolve (_1, { id }: { id: string }) {
    return readEconomicEvent(id)
  }
}

/*
export const allEconomicEvents: GraphQLFieldDef = {
  resultType: new GraphQLList(EconomicEvent),
  resolve(): EconomicEvent[] {
  }
}

export const filteredEconomicEvents: GraphQLFieldDef = {
  resultType: new GraphQLList(EconomicEvent),
  args: {
    providerId: GraphQLID,
    receiverId: GraphQLID,
    resourceClassifiedAsId: GraphQLID,
    action: GraphQLString,
    startDate: StringDate,
    endDate: StringDate
  },
  resolve(
    providerId: string,
    receiverId: string,
    resourceClassifiedAsId: string,
    action: string,
    startDate: Date,
    endDate: Date
  ): EconomicEvent[] {
  }
}
*/
