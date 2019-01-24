/**
 * Queries for loading units, eg. for populating enum inputs in the UI
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
import { Unit } from '../types'
import { allowableUnits, inflateUnit } from '../types/Unit'

export const unit: GraphQLFieldDef = {
  resultType: Unit,
  args: { id: GraphQLID },
  async resolve (_1, { id }: { id: string }) {
    return inflateUnit(id)
  }
}

export const allUnits: GraphQLFieldDef = {
  resultType: new GraphQLList(Unit),
  async resolve () {
    return Object.values(allowableUnits)
  }
}
