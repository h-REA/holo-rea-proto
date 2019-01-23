/**
 * Queries related to resource classifications
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-16
 */

import {
  GraphQLList,
  GraphQLString
} from 'graphql'

import { GraphQLFieldDef } from './'
import {
  readSingleEntry, readMultipleEntries,
  // :NOTE: you don't REALLY need to define return types on these functions, the
  // helpers will handle it for you. I'm just doing it for one case, in case
  // something in the helpers breaks so that the compiler will alert about it.
  GraphRecord
} from '../utils'
import { ResourceClassification } from '../types'
import { getAllResourceClassificationHashes } from '../dummyData'

import { resources } from '@holorea/zome-api-wrapper'

const readResourceClassification = readSingleEntry(resources.readResourceClasses)
const readResourceClassifications = readMultipleEntries(resources.readResourceClasses)

export const resourceClassification: GraphQLFieldDef = {
  resultType: ResourceClassification,
  args: { id: GraphQLString },
  async resolve (_1, { id }: { id: string }): Promise<GraphRecord<resources.ResourceClassification>> {
    return readResourceClassification(id)
  }
}

// :TODO: merge these and other filtering methods with different names
// into single method with more flexible filter args
export const allResourceClassifications: GraphQLFieldDef = {
  resultType: new GraphQLList(ResourceClassification),
  async resolve (): Promise<GraphRecord<resources.ResourceClassification>[]> {
    return readResourceClassifications(await getAllResourceClassificationHashes())
  }
}
/*
export const resourceClassificationsByProcessCategory: GraphQLFieldDef = {
  resultType: new GraphQLList(ResourceClassification),
  args: { category: EconomicResourceProcessCategory },
  resolve(category: EconomicResourceProcessCategory): ResourceClassification[] {
  }
}

export const resourceClassificationsByAction: GraphQLFieldDef = {
  resultType: new GraphQLList(),
  args: { action: Action },
  resolve(action: Action): ResourceClassification[] {
  }
}

export const resourceClassificationsByFacetValues: GraphQLFieldDef = {
  resultType: new GraphQLList(ResourceClassification),
  args: { facetValues: GraphQLString },
  resolve(facetValues: String): ResourceClassification[] {
  }
}
*/
