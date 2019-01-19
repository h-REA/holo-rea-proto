/**
 * Economic resource schema type
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

import { Place } from './Place'
import { QuantityValue } from './QuantityValue'
import { ResourceClassification } from './ResourceClassification'

export const EconomicResource = new GraphQLObjectType({
  name: 'Resource',
  description: 'An economic resource in an REA-based economic network',
  fields: () => ({
    id: { type: GraphQLID },
    url: { type: GraphQLString },
    resourceClassifiedAs: { type: ResourceClassification },
    trackingIdentifier: { type: GraphQLString },
    image: { type: GraphQLString },
    currentQuantity: { type: QuantityValue },
    note: { type: GraphQLString },
    category: { type: GraphQLString },
    currentLocation: { type: Place },
    createdDate: { type: GraphQLString },
    // transfers: {
    //   type: new GraphQLList(Transfer), resolve(resource, {
    //   }: {
    //   }) => {

    //   }
    // },
    // resourceContacts: {
    //   type: new GraphQLList(Agent), resolve(resource, {
    //   }: {
    //   }) => {

    //   }
    // },
    // owners: {
    //   type: new GraphQLList(Agent), resolve(resource, {
    //   }: {
    //   }) => {

    //   }
    // }
  })
})
