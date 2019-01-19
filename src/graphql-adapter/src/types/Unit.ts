/**
 * Unit schema type
 *
 * At present, mainly exists for translation / compatibility with NRP unit structure
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-19
 */

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID
} from 'graphql'

export const Unit = new GraphQLObjectType({
  name: 'Unit',
  description: 'A measurement unit for quantifying resources',
  fields: () => ({
    id: { type: GraphQLID },
    // :TODO: i18n
    name: { type: GraphQLString },
    symbol: { type: GraphQLString }
  })
})

// temporary interface, should come from zome API types in a final implementation
export interface IUnit {
  id: string,
  name: string,
  symbol: string
}

// temporary method to translate GFD string values into NRP-compatible unit objects
export function inflateUnit (GFDunit: string): IUnit {
  switch (GFDunit) {
    default:
      throw new Error(`Unit ${GFDunit} not implemented!`)
  }
}
