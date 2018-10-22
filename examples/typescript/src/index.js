"use strict";
exports.__esModule = true;
var graphql_yoga_1 = require("graphql-yoga");
var Query_1 = require("./resolvers/Query");
var Freelancer_1 = require("./resolvers/Freelancer");
var Employee_1 = require("./resolvers/Employee");
var Todo_1 = require("./resolvers/Todo");
var resolvers = {
    Query: Query_1.Query,
    Freelancer: Freelancer_1.Freelancer,
    Employee: Employee_1.Employee,
    Todo: Todo_1.Todo
};
var server = new graphql_yoga_1.GraphQLServer({
    typeDefs: "./src/schema.graphql",
    resolvers: resolvers,
    context: {
        db: {}
    }
});
server.start(function () { return console.log("Server is running on localhost:4000"); });
