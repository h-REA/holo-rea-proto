/**
 * Action schema type
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-19
 */

import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql'

export const Action = new GraphQLObjectType({
  name: 'Action',
  description: 'Defines an action type and what "kind" of action it is.',
  fields: () => ({
    name: { type: GraphQLString },
    behavior: { type: GraphQLString } // :TODO: indicate allowable options of '+'|'-'|'0'
  })
})
