/**
 * Queries related to process classifications
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-19
 */

import {
  GraphQLList,
  GraphQLID
} from 'graphql'

import { GraphQLFieldDef } from './'
import { readSingleEntry, readMultipleEntries } from '../utils'
import { ProcessClassification } from '../types'
import { getAllProcessClassificationHashes } from '../dummyData'

import { events } from '@holorea/zome-api-wrapper'

const readProcessClassification = readSingleEntry(events.readProcessClasses)
const readProcessClassifications = readMultipleEntries(events.readProcessClasses)

export const processClassification: GraphQLFieldDef = {
  resultType: ProcessClassification,
  args: { id: GraphQLID },
  async resolve (_1, { id }: { id: string }) {
    return readProcessClassification(id)
  }
}

export const allProcessClassifications: GraphQLFieldDef = {
  resultType: new GraphQLList(ProcessClassification),
  async resolve () {
    return readProcessClassifications(await getAllProcessClassificationHashes())
  }
}
