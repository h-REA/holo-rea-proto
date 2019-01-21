/**
 * HoloREA GraphQL adapter for standard Holochain zome REST APIs
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-03
 */

import {
  GraphQLInputType,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLFieldConfig,
  GraphQLArgumentConfig
} from 'graphql'

import {
  GraphQLArgDef,
  GraphQLArgumentConfigWithIndex
} from './queries'

import * as queries from './queries'
import * as mutations from './mutations'

type QueriesType = typeof queries
type QueryId = keyof QueriesType
type MutationsType = typeof mutations
type MutationId = keyof MutationsType

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

const inflateArgs = (args: { [k: string]: any }, a: ArgsDef, arg: string) => {
  const argData = args[arg]
  if (isRawArgumentConfig(argData)) {
    const typedArg: GraphQLArgumentConfig = argData
    a[arg] = typedArg  // may also have `defaultValue` and `description`
  } else if (isSimpleArgumentConfig(argData)) {
    const typedArg: GraphQLArgumentConfig = { type: argData }
    a[arg] = typedArg  // simple type, inflate to `type` subkey
  }
  return a
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
    f[query]['args'] = Object.keys(args).reduce(inflateArgs.bind(null, args), {})
  }
  return f
}

// yes, code dupe; but TypeScript makes such logic sharing cumbersome
function mutationFieldsReducer (f: GraphQLFieldsDef, query: MutationId) {
  const { resultType, args, resolve } = mutations[query]
  // assign field / return value type and resolution logic
  f[query] = {
    type: resultType,
    resolve: resolve
  }
  if (args) {
    // inflate arg values to reduce verbosity in declaration
    f[query]['args'] = Object.keys(args).reduce(inflateArgs.bind(null, args), {})
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

const MutationType = new GraphQLObjectType({
  name: 'Mutations',
  description: 'All possible REA data modifications',
  fields: () => Object.keys(mutations)
    .map((query: string): MutationId => query as MutationId)
    .reduce(mutationFieldsReducer, {})
})

export default new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
})
