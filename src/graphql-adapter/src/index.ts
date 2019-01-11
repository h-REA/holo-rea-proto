/**
 * HoloREA GraphQL adapter for standard Holochain zome REST APIs
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-03
 */

import {
  GraphQLFieldConfig,
  GraphQLType,
  GraphQLInputType,
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLArgumentConfig,
  GraphQLFieldConfigArgumentMap
} from 'graphql'

import {
  GraphQLArgDef,
  GraphQLArgumentConfigWithIndex
} from './queries'
import * as queries from './queries'
import * as types from './types'

type QueriesType = typeof queries
type QueryId = keyof QueriesType

interface GraphQLFieldsDef {
  [fieldName: string]: GraphQLFieldConfig<any, any, any>
}

interface ArgsDef {
  [arg: string]: GraphQLArgDef,
}

function isRawArgumentConfig (object: GraphQLArgDef): object is GraphQLArgumentConfigWithIndex {
  return 'type' in object
}

function isSimpleArgumentConfig (object: GraphQLArgDef): object is GraphQLInputType {
  return !('type' in object)
}

function queryFieldsReducer (f: GraphQLFieldsDef, query: QueryId) {
  const { resultType, args, resolve } = queries[query]
  // assign field / return value type and resolution logic
  f[query] = {
    type: resultType,
    resolve: resolve
  }
  if (args) {
    // inflate arg values to reduce verbosity in declaration
    f[query]['args'] = Object.keys(args).reduce((a: ArgsDef, arg: string) => {
      const argData = args[arg]
      if (isRawArgumentConfig(argData)) {
        const typedArg: GraphQLArgumentConfig = argData
        a[arg] = typedArg  // may also have `defaultValue` and `description`
      } else if (isSimpleArgumentConfig(argData)) {
        const typedArg: GraphQLArgumentConfig = { type: argData }
        a[arg] = typedArg  // simple type, inflate to `type` subkey
      }
      return a
    }, {})
  }
  return f
}

const QueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'The root of all REA queries',
  fields: () => Object.keys(queries)
    .map((query: string): QueryId => query as QueryId)
    .reduce(queryFieldsReducer, {})
})

export default new GraphQLSchema({
  query: QueryType
})
