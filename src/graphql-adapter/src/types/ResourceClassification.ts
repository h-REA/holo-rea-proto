/**
 * ResourceClassification schema type
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

import { GraphRecord } from '../utils'
import { resources } from '@holorea/zome-api-wrapper'

import { Unit, IUnit, inflateUnit } from './Unit'

function resolveDefaultUnits (classification: GraphRecord<resources.ResourceClassification>): IUnit {
  return inflateUnit(classification.defaultUnits)
}

export const ResourceClassification = new GraphQLObjectType({
  name: 'ResourceClassification',
  description: 'A classification for a group of related resources within an economic network',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    // :TODO: update NRP API, `unit` -> `defaultUnits`
    // unit: { type: Unit },
    defaultUnits: { type: Unit, resolve: resolveDefaultUnits },
    image: { type: GraphQLString },
    note: { type: GraphQLString },
    // category: { type: GraphQLString },
    processCategory: { type: GraphQLString }
    // classificationResources: [EconomicResource]
  })
})
