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
  GraphQLObjectType,
  GraphQLList,
  // GraphQLInt,
  // GraphQLBoolean,
  GraphQLString,
  // GraphQLEnumType,
  // GraphQLID,
  GraphQLArgumentConfig
} from 'graphql'

import {
  CrudResponse,
  resources,
  events,
  // agents
} from '@holorea/zome-api-wrapper'

import {
  Action,
  // Agent,
  // AgentRelationship,
  // AgentRelationshipRole,
  // AgentResourceClassification,
  // Organization,
  // OrganizationType,
  // OrganizationClassification,
  // Person,
  // EconomicResource,
  // Process,
  // ExchangeAgreement,
  // Transfer,
  // EconomicEvent,
  // QuantityValue,
  // Unit,
  ResourceClassification,
  // Facet,
  // ProcessClassification,
  // Commitment,
  // Plan,
  // Place,
  // Validation,
  // StringDate
} from './types'

// shared types

export interface GraphQLArgumentConfigWithIndex extends GraphQLArgumentConfig {
  [key: string]: any,
}

export type GraphQLArgDef = GraphQLInputType | GraphQLArgumentConfigWithIndex

interface GraphQLFieldDef {
  resultType: GraphQLOutputType,
  resolve: (...args: any[]) => any,
  args?: {
    [id: string]: GraphQLInputType | GraphQLArgumentConfigWithIndex
  }
}

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
*/

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

    return classificationIds.reduce((res: ActionTypesResponse, id: ResourceClassificationId, idx: number) => {
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

export const processClassification: GraphQLFieldDef = {
  resultType: ProcessClassification,
  args: { id: GraphQLID },
  resolve(id: string): ProcessClassification {
  }
}
export const allProcessClassifications: GraphQLFieldDef = {
  resultType: new GraphQLList(ProcessClassification),
  resolve(): ProcessClassification[] {
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
*/

// introspection

type ActionTypeId = keyof events.ActionsFixture
type ActionTypesResponse = { [k in ActionTypeId]?: CrudResponse<events.Action> }

export const allActionTypes: GraphQLFieldDef = {
  resultType: new GraphQLObjectType({
    name: 'AllActionTypes',
    description: 'All available action type descriptions, keyed by type ID',
    fields: () => ({
      // :TODO: make this dynamic somehow
      give: { type: Action },
      receive: { type: Action },
      adjust: { type: Action },
      produce: { type: Action },
      consume: { type: Action }
    })
  }),
  async resolve(): Promise<ActionTypesResponse> {
    const { Action } = await events.getFixtures()

    const actionTypes = Object.keys(Action) as ActionTypeId[]
    const actionRecords = await events.readActions(Object.values(Action))

    return actionTypes.reduce((res: ActionTypesResponse, type: ActionTypeId, idx: number) => {
      res[type] = actionRecords[idx]
      return res
    }, {})
  }
}

/*
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

export const economicResource: GraphQLFieldDef = {
  resultType: EconomicResource,
  args: { id: GraphQLID },
  resolve(id: string): EconomicResource {
  }
}
export const allEconomicResources: GraphQLFieldDef = {
  resultType: new GraphQLList(EconomicResource),
  resolve(): EconomicResource[] {
  }
}

export const economicEvent: GraphQLFieldDef = {
  resultType: EconomicEvent,
  args: { id: GraphQLID },
  resolve(id: string): EconomicEvent {
  }
}
export const allEconomicEvents: GraphQLFieldDef = {
  resultType: new GraphQLList(EconomicEvent),
  resolve(): EconomicEvent[] {
  }
}
export const filteredEconomicEvents: GraphQLFieldDef = {
  resultType: new GraphQLList(EconomicEvent),
  args: {
    providerId: GraphQLID,
    receiverId: GraphQLID,
    resourceClassifiedAsId: GraphQLID,
    action: GraphQLString,
    startDate: StringDate,
    endDate: StringDate
  },
  resolve(
    providerId: string,
    receiverId: string,
    resourceClassifiedAsId: string,
    action: string,
    startDate: Date,
    endDate: Date
  ): EconomicEvent[] {
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
export const agent: GraphQLFieldDef = {
  resultType: Agent,
  args: { id: GraphQLID },
  resolve(id: string): Agent {
  }
}
export const allAgents: GraphQLFieldDef = {
  resultType: new GraphQLList(Agent),
  resolve(): Agent[] {
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
