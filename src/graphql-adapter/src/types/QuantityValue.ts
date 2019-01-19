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

import { Unit } from './Unit'

export const QuantityValue = new GraphQLObjectType({
  name: 'QuantityValue',
  description: 'Some measured quantity, recorded against a particular measurement unit',
  fields: () => ({
    // :TODO: update NRP API, `numericValue` -> `quantity`
    quantity: { type: GraphQLFloat },
    unit: { type: Unit }
  })
})
