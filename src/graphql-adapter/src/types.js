"use strict";
/**
 * type schemas for GraphQL query layer
 *
 * @see https://github.com/FreedomCoop/valuenetwork/tree/71b0868/valuenetwork/api/types
 *
 * @package: HoloREA
 * @author:  pospi <pospi@spadgos.com>
 * @since:   2019-01-03
 */
exports.__esModule = true;
var fecha_1 = require("fecha");
var graphql_1 = require("graphql");
// import {
//   VfObject, QuantityValue as coreQV, Hash, QVlike, notError, CrudResponse,
//   PhysicalLocation, HoloThing, entryOf, hashOf, deepAssign, Initializer, Fixture, reader
// } from "../../HoloREA/dna/common/common";
// base types
var isoDateRegex = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+-]\d\d:\d\d$/;
var parseDate = function (val) { return fecha_1["default"].parse(val, 'YYYY-MM-DDTHH:mm:ssZZ'); };
// :TODO: check date field compat with ValueNetwork API
exports.StringDate = new graphql_1.GraphQLScalarType({
    name: 'Date (ISO8601)',
    serialize: parseDate,
    parseValue: parseDate,
    parseLiteral: function (ast) {
        if (ast.kind === Kind.STRING && ast.value.match(isoDateRegex)) {
            return parseDate(ast.value);
        }
        return null;
    }
});
// predefined (hardcoded) taxonomies
exports.Action = new graphql_1.GraphQLEnumType({
    name: "Action",
    values: {
        NONE: { value: 0 },
        ACCEPT: { value: 1 },
        ADJUST: { value: 2 },
        CITE: { value: 3 },
        CONSUME: { value: 4 },
        GIVE: { value: 5 },
        IMPROVE: { value: 6 },
        PRODUCE: { value: 7 },
        TAKE: { value: 8 },
        USE: { value: 9 },
        WORK: { value: 10 }
    }
});
exports.EconomicResourceProcessCategory = new graphql_1.GraphQLEnumType({
    name: 'Economic resource process categories',
    values: {
        NONE: { value: 0 },
        CITED: { value: 1 },
        CONSUMED: { value: 2 },
        PRODUCED: { value: 3 },
        USED: { value: 4 }
    }
});
// config / system layer
exports.Unit = new graphql_1.GraphQLObjectType({
    name: 'Unit',
    description: 'A measurement unit for quantifying resources',
    fields: function () { return ({
        id: { type: graphql_1.GraphQLID },
        // :TODO: i18n
        name: { type: graphql_1.GraphQLString },
        symbol: { type: graphql_1.GraphQLString }
    }); }
});
exports.QuantityValue = new graphql_1.GraphQLObjectType({
    name: 'Quantity value',
    description: 'Some measured quantity, recorded against a particular measurement unit',
    fields: function () { return ({
        numericValue: { type: graphql_1.GraphQLID },
        unit: { type: exports.Unit }
    }); }
});
exports.NotificationType = new graphql_1.GraphQLObjectType({
    name: 'Notification type',
    description: 'A definition for a notification type, which can be configured to fire in response to various system actions.',
    fields: function () { return ({
        id: { type: graphql_1.GraphQLID },
        // :TODO: i18n
        label: { type: graphql_1.GraphQLString },
        description: { type: graphql_1.GraphQLString },
        display: { type: graphql_1.GraphQLString }
    }); }
});
exports.ResourceClassification = new graphql_1.GraphQLObjectType({});
exports.ProcessClassification = new graphql_1.GraphQLObjectType({});
exports.AgentResourceClassification = new graphql_1.GraphQLObjectType({});
exports.OrganizationClassification = new graphql_1.GraphQLObjectType({});
exports.AgentRelationshipRole = new graphql_1.GraphQLObjectType({});
exports.OrganizationType = new graphql_1.GraphQLObjectType({});
exports.Facet = new graphql_1.GraphQLObjectType({});
exports.Place = new graphql_1.GraphQLObjectType({});
// planning layer
exports.Plan = new graphql_1.GraphQLObjectType({});
exports.Commitment = new graphql_1.GraphQLObjectType({});
exports.ExchangeAgreement = new graphql_1.GraphQLObjectType({});
// actuals layer
exports.Process = new graphql_1.GraphQLObjectType({});
exports.EconomicResource = new graphql_1.GraphQLObjectType({});
exports.EconomicEvent = new graphql_1.GraphQLObjectType({});
exports.Exchange = new graphql_1.GraphQLObjectType({});
exports.Transfer = new graphql_1.GraphQLObjectType({});
exports.Validation = new graphql_1.GraphQLObjectType({});
// agents
exports.AgentRelationship = new graphql_1.GraphQLObjectType({});
exports.Agent = new graphql_1.GraphQLObjectType({
    name: 'Agent',
    description: 'An agent in an REA-based economic network',
    fields: function () { return ({
        id: { type: graphql_1.GraphQLID },
        name: { type: graphql_1.GraphQLString },
        type: { type: graphql_1.GraphQLString },
        image: { type: graphql_1.GraphQLString },
        note: { type: graphql_1.GraphQLString },
        primaryLocation: { type: graphql_1.GraphQLString },
        primaryPhone: { type: graphql_1.GraphQLString },
        email: { type: graphql_1.GraphQLString },
        ownedEconomicResources: { type: new graphql_1.GraphQLList(exports.EconomicResource), resolve: function (agent, args) {
                //(category: EconomicResourceCategoryresourceClassificationId: Intpage: Int)
            } },
        searchOwnedInventoryResources: { type: new graphql_1.GraphQLList(exports.EconomicResource), resolve: function (agent, args) {
                //(searchString: String)
            } },
        agentProcesses: { type: new graphql_1.GraphQLList(exports.Process), resolve: function (agent, args) {
                //(isFinished: Boolean)
            } },
        searchAgentProcesses: { type: new graphql_1.GraphQLList(exports.Process), resolve: function (agent, args) {
                //(searchString: StringisFinished: Boolean)
            } },
        agentPlans: { type: new graphql_1.GraphQLList(exports.Plan), resolve: function (agent, args) {
                //(isFinished: Booleanyear: Intmonth: Int)
            } },
        searchAgentPlans: { type: new graphql_1.GraphQLList(exports.Plan), resolve: function (agent, args) {
                //(searchString: StringisFinished: Boolean)
            } },
        agentEconomicEvents: { type: new graphql_1.GraphQLList(exports.EconomicEvent), resolve: function (agent, args) {
                //(latestNumberOfDays: IntrequestDistribution: Booleanaction: Stringyear: Intmonth: Int)
            } },
        agentCommitments: { type: new graphql_1.GraphQLList(exports.Commitment), resolve: function (agent, args) {
                //(latestNumberOfDays: Int)
            } },
        searchAgentCommitments: { type: new graphql_1.GraphQLList(exports.Commitment), resolve: function (agent, args) {
                //(searchString: StringisFinished: Boolean)
            } },
        agentRelationships: { type: new graphql_1.GraphQLList(exports.AgentRelationship), resolve: function (agent, args) {
                //(roleId: Intcategory: AgentRelationshipCategory)
            } },
        agentRelationshipsAsSubject: { type: new graphql_1.GraphQLList(exports.AgentRelationship), resolve: function (agent, args) {
                //(roleId: Intcategory: AgentRelationshipCategory)
            } },
        agentRelationshipsAsObject: { type: new graphql_1.GraphQLList(exports.AgentRelationship), resolve: function (agent, args) {
                //(roleId: Intcategory: AgentRelationshipCategory)
            } },
        agentRoles: { type: new graphql_1.GraphQLList(exports.AgentRelationshipRole), resolve: function (agent) {
            } },
        agentRecipes: { type: new graphql_1.GraphQLList(exports.ResourceClassification), resolve: function (agent) {
            } },
        // :TODO: rethink account addresses & standardise FreedomCoop additions in valuenetwork
        // faircoinAddress: { type: GraphQLString },
        agentNotificationSettings: { type: new graphql_1.GraphQLList(exports.NotificationSetting), resolve: function (agent) {
            } },
        memberRelationships: { type: new graphql_1.GraphQLList(exports.AgentRelationship), resolve: function (agent) {
            } },
        agentSkills: { type: new graphql_1.GraphQLList(exports.ResourceClassification), resolve: function (agent) {
            } },
        agentSkillRelationships: { type: new graphql_1.GraphQLList(exports.AgentResourceClassification), resolve: function (agent) {
            } },
        commitmentsMatchingSkills: { type: new graphql_1.GraphQLList(exports.Commitment), resolve: function (agent) {
            } },
        validatedEventsCount: { type: graphql_1.GraphQLInt, resolve: function (agent, args) {
                //(month: Int, year: Int) :TODO: why is this backwards?
            } },
        eventsCount: { type: graphql_1.GraphQLInt, resolve: function (agent, args) {
                //(year: Int, month: Int)
            } },
        eventHoursCount: { type: graphql_1.GraphQLInt, resolve: function (agent, args) {
                //(year: Int, month: Int)
            } },
        eventPeopleCount: { type: graphql_1.GraphQLInt, resolve: function (agent, args) {
                //(year: Int, month: Int)
            } }
    }); }
});
exports.Organization = new graphql_1.GraphQLObjectType({});
exports.Person = new graphql_1.GraphQLObjectType({});
exports.NotificationSetting = new graphql_1.GraphQLObjectType({
    name: 'Notification setting',
    description: 'Controls user preferences as to whether to enable notifications for a particular subset of REA system functionality.',
    fields: function () { return ({
        id: { type: graphql_1.GraphQLID },
        send: { type: graphql_1.GraphQLBoolean },
        agent: { type: exports.Agent, resolve: function (setting, args) {
            } },
        notificationType: exports.NotificationType
    }); }
});
