/**
 * GraphQL query entrypoints for an REA economic network
 *
 * @see https://github.com/FreedomCoop/valuenetwork/tree/71b0868/valuenetwork/api
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-03
 */

import {
  GraphQLOutputType,
  GraphQLInputType,
  // GraphQLInt,
  // GraphQLBoolean,
  // GraphQLEnumType,
  // GraphQLID,
  GraphQLArgumentConfig
} from 'graphql'

export interface GraphQLArgumentConfigWithIndex extends GraphQLArgumentConfig {
  [key: string]: any,
}

export type GraphQLArgDef = GraphQLInputType | GraphQLArgumentConfigWithIndex

export interface GraphQLFieldDef {
  resultType: GraphQLOutputType,
  resolve: (...args: any[]) => any,
  args?: {
    [id: string]: GraphQLInputType | GraphQLArgumentConfigWithIndex
  }
}

// network configuration

export * from './actionType'

// classifications & taxonomies

export * from './resourceClassification'
export * from './processClassification'

// actuals layer

export * from './agent'
export * from './economicResource'
export * from './economicEvent'

// network globals & configuration
/*
export const unit: GraphQLFieldDef = {
  resultType: Unit,
  args: { id: GraphQLID },
  resolve(id: string): typeof Unit {
  }
}
export const allUnits: GraphQLFieldDef = {
  resultType: new GraphQLList(Unit),
  resolve(): Unit[] {
  }
}

export const quantityValue: GraphQLFieldDef = {
  resultType: QuantityValue,
  args: { id: GraphQLID },
  resolve(id: string): QuantityValue {
  }
}

export const agentResourceClassification: GraphQLFieldDef = {
  resultType: AgentResourceClassification,
  args: { id: GraphQLID },
  resolve(id: string): AgentResourceClassification {
  }
}
export const allAgentResourceClassifications: GraphQLFieldDef = {
  resultType: new GraphQLList(AgentResourceClassification),
  resolve(): AgentResourceClassification[] {
  }
}

export const organizationClassification: GraphQLFieldDef = {
  resultType: OrganizationClassification,
  args: { id: GraphQLID },
  resolve(id: string): OrganizationClassification {
  }
}
export const allOrganizationClassifications: GraphQLFieldDef = {
  resultType: new GraphQLList(),
  resolve(): OrganizationClassification[] {
  }
}

export const agentRelationshipRole: GraphQLFieldDef = {
  resultType: AgentRelationshipRole,
  args: { id: GraphQLID },
  resolve(id: string): AgentRelationshipRole {
  }
}
export const allAgentRelationshipRoles: GraphQLFieldDef = {
  resultType: new GraphQLList(AgentRelationshipRole),
  resolve(): AgentRelationshipRole[] {
  }
}

export const organizationTypes: GraphQLFieldDef = {
  resultType: new GraphQLList(OrganizationType),
  resolve(): OrganizationType[] {
  }
}

export const facet: GraphQLFieldDef = {
  resultType: Facet,
  args: { id: GraphQLID },
  resolve(id: string): Facet {
  }
}
export const allFacets: GraphQLFieldDef = {
  resultType: new GraphQLList(Facet),
  resolve(): Facet[] {
  }
}

export const place: GraphQLFieldDef = {
  resultType: Place,
  args: { id: GraphQLID },
  resolve(id: string): Place {
  }
}
export const allPlaces: GraphQLFieldDef = {
  resultType: new GraphQLList(Place),
  resolve(): Place[] {
  }
}

// system queries

export const userIsAuthorizedToCreate: GraphQLFieldDef = {
  resultType: GraphQLBoolean,
  args: { scopeId: GraphQLID },
  resolve(scopeId: string): Boolean {
  }
}

// planning layer

export const allRecipes: GraphQLFieldDef = {
  resultType: new GraphQLList(ResourceClassification),  // :TODO: why not a 'Recipe' type?
  resolve(): ResourceClassification[] {
  }
}

export const plan: GraphQLFieldDef = {
  resultType: Plan,
  args: { id: GraphQLID },
  resolve(id: string): Plan {
  }
}
export const allPlans: GraphQLFieldDef = {
  resultType: new GraphQLList(Plan),
  resolve(): Plan[] {
  }
}

export const commitment: GraphQLFieldDef = {
  resultType: Commitment,
  args: { id: GraphQLID },
  resolve(id: string): Commitment {
  }
}
export const allCommitments: GraphQLFieldDef = {
  resultType: new GraphQLList(Commitment),
  resolve(): Commitment[] {
  }
}

export const exchangeAgreement: GraphQLFieldDef = {
  resultType: ExchangeAgreement,
  args: { id: GraphQLID },
  resolve(id: string): ExchangeAgreement {
  }
}
export const allExchangeAgreements: GraphQLFieldDef = {
  resultType: new GraphQLList(ExchangeAgreement),
  resolve(): ExchangeAgreement[] {
  }
}

// actuals layer

export const process: GraphQLFieldDef = {
  resultType: Process,
  args: { id: GraphQLID },
  resolve(id: string): Process {
  }
}
export const allProcesses: GraphQLFieldDef = {
  resultType: new GraphQLList(Process),
  resolve(): Process[] {
  }
}

export const transfer: GraphQLFieldDef = {
  resultType: Transfer,
  args: { id: GraphQLID },
  resolve(id: string): Transfer {
  }
}
export const allTransfers: GraphQLFieldDef = {
  resultType: new GraphQLList(Transfer),
  resolve(): Transfer[] {
  }
}

export const validation: GraphQLFieldDef = {
  resultType: Validation,
  args: { id: GraphQLID },
  resolve(id: GraphQLID): Validation {
  }
}
export const allValidations: GraphQLFieldDef = {
  resultType: new GraphQLList(Validation),
  resolve(): Validation[] {
  }
}

// agents

export const myAgent: GraphQLFieldDef = {
  resultType: Agent,
  resolve(): Agent {
  }
}

export const agentRelationship: GraphQLFieldDef = {
  resultType: AgentRelationship,
  args: { id: GraphQLID },
  resolve(id: string): AgentRelationship {
  }
}
export const allAgentRelationships: GraphQLFieldDef = {
  resultType: new GraphQLList(AgentRelationship),
  resolve(): AgentRelationship[] {
  }
}

export const organization: GraphQLFieldDef = {
  resultType: Organization,
  args: { id: GraphQLID },
  resolve(id: string): Organization {
  }
}
export const allOrganizations: GraphQLFieldDef = {
  resultType: new GraphQLList(Organization),
  resolve(): Organization[] {
  }
}
// :TODO: think about org information architecture & consolidate with diverged Valuenetwork codebase
// export const fcOrganizations: GraphQLFieldDef = {
//   resultType: new GraphQLList(Organization),
//   args: { joiningStyle: GraphQLString, visibility: GraphQLString },
//   resolve(joiningStyle: string, visibility: string): Organization[] {
//   }
// }

export const person: GraphQLFieldDef = {
  resultType: Person,
  args: { id: GraphQLID },
  resolve(id: string): Person {
  }
}
export const allPeople: GraphQLFieldDef = {
  resultType: new GraphQLList(Person),
  resolve(): Person[] {
  }
}
*/
