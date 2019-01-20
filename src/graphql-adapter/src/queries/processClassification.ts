/**
 * Queries related to process classifications
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-19
 */

import {
  GraphQLList,
  GraphQLString
} from 'graphql'

import { GraphQLFieldDef } from './'
import { readSingleEntry, readNamedEntries } from '../utils'
import { ProcessClassification } from '../types'

import { events } from '@holorea/zome-api-wrapper'

const readProcessClassification = readSingleEntry(events.readProcessClasses)
const readProcessClassifications = readNamedEntries(events.readProcessClasses)

export const processClassification: GraphQLFieldDef = {
  resultType: ProcessClassification,
  args: { id: GraphQLString },
  async resolve (_1, { id }: { id: string }) {
    return readProcessClassification(id)
  }
}

export const allProcessClassifications: GraphQLFieldDef = {
  resultType: new GraphQLList(ProcessClassification),
  async resolve () {
    const { ProcessClassification: classifications } = await events.getFixtures()
    return readProcessClassifications(classifications)
  }
}
