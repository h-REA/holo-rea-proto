/**
 * Structure for defining measurements along with their semantic meaning
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-19
 */

import {
  GraphQLObjectType,
  GraphQLFloat
} from 'graphql'

import { QuantityValue as IQuantityValue } from '@holorea/zome-api-wrapper'

import { Unit, inflateUnit } from './Unit'

function resolveUnit (qv: IQuantityValue) {
  return inflateUnit(qv.units)
}

export const QuantityValue = new GraphQLObjectType({
  name: 'QuantityValue',
  description: 'Some measured quantity, recorded against a particular measurement unit',
  fields: () => ({
    // :TODO: update NRP API, `numericValue` -> `quantity`
    quantity: { type: GraphQLFloat },
    unit: { type: Unit, resolve: resolveUnit }
  })
})