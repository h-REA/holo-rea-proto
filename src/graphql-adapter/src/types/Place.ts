/**
 * Place schema type
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-19
 */

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLID
} from 'graphql'

export const Place = new GraphQLObjectType({
  name: 'Place',
  description: 'A physical location',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    address: { type: GraphQLString },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    note: { type: GraphQLString },
    // placeResources: [EconomicResource]
    // placeAgents: [Agent]
  })
})
