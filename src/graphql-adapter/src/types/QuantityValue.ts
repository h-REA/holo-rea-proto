/**
 * Structure for defining measurements along with their semantic meaning
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-19
 */

import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLFloat
} from 'graphql'

import { QuantityValue as IQuantityValue } from '@holorea/zome-api-wrapper'

import { Unit, UnitInput, inflateUnit } from './Unit'

function resolveUnit (qv: IQuantityValue) {
  return inflateUnit(qv.units)
}

const baseFieldDef = {
  name: 'QuantityValue',
  description: 'Some measured quantity, recorded against a particular measurement unit',
  fields: ({
    // :TODO: update NRP API, `numericValue` -> `quantity`
    quantity: { type: GraphQLFloat },
    unit: { type: Unit, resolve: resolveUnit }
  })
}

export const QuantityValue = new GraphQLObjectType(baseFieldDef)
export const QuantityValueInput = new GraphQLInputObjectType({
  ...baseFieldDef,
  name: 'InputQuantityValue',
  fields: {
    ...baseFieldDef.fields,
    unit: { type: UnitInput }
  }
})
