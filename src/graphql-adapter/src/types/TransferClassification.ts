/**
 * TransferClassification schema type
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-24
 */

import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID
} from 'graphql'

export const TransferClassification = new GraphQLObjectType({
  name: 'TransferClassification',
  description: 'A classification for organising types of transfers within an economic network',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    note: { type: GraphQLString }
  })
})
