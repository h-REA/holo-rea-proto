/**
 * Queries related to action types
 *
 * :TODO: update to use helpers in ../utils.ts
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-16
 */

import {
  GraphQLObjectType,
} from 'graphql'

import {
  CrudResponse,
  events,
} from '@holorea/zome-api-wrapper'

import { GraphQLFieldDef } from './'
import { Action } from '../types'

type ActionTypeId = keyof events.ActionsFixture
type ActionTypesResponse = { [k in ActionTypeId]?: CrudResponse<events.Action> }

export const allActionTypes: GraphQLFieldDef = {
  resultType: new GraphQLObjectType({
    name: 'AllActionTypes',
    description: 'All available action type descriptions, keyed by type ID',
    fields: () => ({
      // :TODO: make this dynamic somehow
      give: { type: Action },
      receive: { type: Action },
      adjust: { type: Action },
      produce: { type: Action },
      consume: { type: Action }
    })
  }),
  async resolve(): Promise<ActionTypesResponse> {
    const { Action } = await events.getFixtures()

    const actionTypes = Object.keys(Action) as ActionTypeId[]
    const actionRecords = await events.readActions(Object.values(Action))

    return actionTypes.reduce((res: ActionTypesResponse, type: ActionTypeId, idx: number) => {
      res[type] = actionRecords[idx]
      return res
    }, {})
  }
}
