/**
 * Queries for economic resources
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-20
 */

import {
  // GraphQLList,
  GraphQLID
} from 'graphql'

import { GraphQLFieldDef } from './'
import { readSingleEntry } from '../utils'
import { EconomicResource } from '../types'

import { resources } from '@holorea/zome-api-wrapper'

const readEconomicResouce = readSingleEntry(resources.readResources)

export const economicResource: GraphQLFieldDef = {
  resultType: EconomicResource,
  args: { id: GraphQLID },
  async resolve (_1, { id }: { id: string }) {
    return readEconomicResouce(id)
  }
}

// export const allEconomicResources: GraphQLFieldDef = {
//   resultType: new GraphQLList(EconomicResource),
//   async resolve () {

//   }
// }
