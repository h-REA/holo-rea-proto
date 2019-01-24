/**
 * Query endpoints for reading transfer classifications
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-24
 */

import {
  GraphQLList,
  GraphQLID
} from 'graphql'

import { GraphQLFieldDef } from './'
import { readSingleEntry, readMultipleEntries } from '../utils'
import { TransferClassification } from '../types'
import { getAllTransferClassificationHashes } from '../dummyData'

import { events } from '@holorea/zome-api-wrapper'

const readTransferClassification = readSingleEntry(events.readTransferClasses)
const readTransferClassifications = readMultipleEntries(events.readTransferClasses)

export const transferClassification: GraphQLFieldDef = {
  resultType: TransferClassification,
  args: { id: GraphQLID },
  async resolve (_1, { id }: { id: string }) {
    return readTransferClassification(id)
  }
}

export const allTransferClassifications: GraphQLFieldDef = {
  resultType: new GraphQLList(TransferClassification),
  async resolve () {
    return readTransferClassifications(await getAllTransferClassificationHashes())
  }
}
