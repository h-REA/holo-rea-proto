/**
 * Queries related to resource classifications
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-16
 */

import {
  GraphQLList,
  GraphQLString,
} from 'graphql'

import { GraphQLFieldDef } from '../queries'
import { ResourceClassification } from '../types'

import {
  CrudResponse,
  resources,
} from '@holorea/zome-api-wrapper'

type ResourceClassificationId = keyof resources.ResourceClassificationFixture
type ResourceClassificationResponse = { [k in ResourceClassificationId]?: CrudResponse<resources.ResourceClassification> }

export const resourceClassification: GraphQLFieldDef = {
  resultType: ResourceClassification,
  args: { id: GraphQLString },
  async resolve(_1, { id }: { id: string }): Promise<CrudResponse<resources.ResourceClassification>> {
    const records = await resources.readResourceClasses([id])
    return records[0]
  }
}

// :TODO: merge these and other filtering methods with different names
// into single method with more flexible filter args
export const allResourceClassifications: GraphQLFieldDef = {
  resultType: new GraphQLList(ResourceClassification),
  async resolve(): Promise<ResourceClassificationResponse> {
    const { ResourceClassification: classifications } = await resources.getFixtures()

    const classificationIds = Object.keys(classifications) as ResourceClassificationId[]
    const records = await resources.readResourceClasses(Object.values(classifications))

    return classificationIds.reduce((res: ResourceClassificationResponse, id: ResourceClassificationId, idx: number) => {
      res[id] = records[idx]
      return res
    }, {})

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
