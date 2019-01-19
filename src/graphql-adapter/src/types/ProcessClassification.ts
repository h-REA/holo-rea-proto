/**
 * ProcessClassification schema type
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

export const ProcessClassification = new GraphQLObjectType({
  name: 'ProcessClassification',
  description: 'A classification for grouping types of processes within an economic network',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    note: { type: GraphQLString },
    // scope: { type: Agent },
    estimatedDuration: { type: GraphQLString }
  })
})
