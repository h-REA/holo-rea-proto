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
import { ProcessClassification } from '../types'

import {
  DHTResponse,
  events
} from '@holorea/zome-api-wrapper'

type ProcessClassificationId = keyof events.ProcessClassificationFixture
type ProcessClassificationResponse = { [k in ProcessClassificationId]?: DHTResponse<events.ProcessClassification> }

export const processClassification: GraphQLFieldDef = {
  resultType: ProcessClassification,
  args: { id: GraphQLString },
  async resolve (_1, { id }: { id: string }): Promise<DHTResponse<events.ProcessClassification>> {
    const records = await events.readProcessClasses([id])
    return records[0]
  }
}

export const allProcessClassifications: GraphQLFieldDef = {
  resultType: new GraphQLList(ProcessClassification),
  async resolve (): Promise<ProcessClassificationResponse> {
    const { ProcessClassification: classifications } = await events.getFixtures()

    const classificationIds = Object.keys(classifications) as ProcessClassificationId[]
    const records = await events.readProcessClasses(Object.values(classifications))

    return classificationIds.reduce((res: ProcessClassificationResponse, id: ProcessClassificationId, idx: number) => {
      res[id] = records[idx]
      return res
    }, {})
  }
}
