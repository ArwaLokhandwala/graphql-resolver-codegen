"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var graphql_1 = require("graphql");
exports.GraphQLScalarTypeArray = [
    "Boolean",
    "Int",
    "Float",
    "String",
    "ID"
];
function extractTypeDefinition(schema, fromNode) {
    var typeLike = {
        isObject: false,
        isInput: false,
        isEnum: false,
        isUnion: false,
        isScalar: false,
        isInterface: false
    };
    graphql_1.visit(schema, {
        ObjectTypeDefinition: function (node) {
            if (fromNode.name === node.name.value) {
                typeLike.isObject = true;
            }
        },
        InputObjectTypeDefinition: function (node) {
            if (fromNode.name === node.name.value) {
                typeLike.isInput = true;
            }
        },
        EnumTypeDefinition: function (node) {
            if (fromNode.name === node.name.value) {
                typeLike.isEnum = true;
            }
        },
        UnionTypeDefinition: function (node) {
            if (fromNode.name === node.name.value) {
                typeLike.isUnion = true;
            }
        },
        ScalarTypeDefinition: function (node) {
            if (fromNode.name === node.name.value) {
                typeLike.isScalar = true;
            }
        },
        InterfaceTypeDefinition: function (node) {
            if (fromNode.name === node.name.value) {
                typeLike.isInterface = true;
            }
        }
    });
    // Handle built-in scalars
    if (exports.GraphQLScalarTypeArray.indexOf(fromNode.name) > -1) {
        typeLike.isScalar = true;
    }
    return typeLike;
}
function extractTypeLike(schema, node) {
    var typeLike = {};
    graphql_1.visit(node.type, {
        NonNullType: function () {
            typeLike.isRequired = true;
        },
        ListType: function () {
            typeLike.isArray = true;
        },
        NamedType: function (namedTypeNode) {
            typeLike.name = namedTypeNode.name.value;
        }
    });
    var typeDefinitionLike = extractTypeDefinition(schema, typeLike);
    return __assign({}, typeLike, typeDefinitionLike);
}
function extractTypeFields(schema, node) {
    var fields = [];
    if (node.kind === "ObjectTypeDefinition") {
        graphql_1.visit(node, {
            FieldDefinition: function (fieldNode) {
                var fieldType = extractTypeLike(schema, fieldNode);
                var fieldArguments = [];
                graphql_1.visit(fieldNode, {
                    InputValueDefinition: function (inputValueDefinitionNode) {
                        var argumentType = extractTypeLike(schema, inputValueDefinitionNode);
                        fieldArguments.push({
                            name: inputValueDefinitionNode.name.value,
                            type: argumentType
                        });
                    }
                });
                fields.push({
                    name: fieldNode.name.value,
                    type: fieldType,
                    arguments: fieldArguments
                });
            }
        });
    }
    else {
        // Is input type based on current code/types!
        graphql_1.visit(node, {
            InputValueDefinition: function (inputValueDefinitionNode) {
                var argumentType = extractTypeLike(schema, inputValueDefinitionNode);
                fields.push({
                    name: inputValueDefinitionNode.name.value,
                    type: argumentType,
                    arguments: []
                });
            }
        });
    }
    return fields;
}
function extractGraphQLTypes(schema) {
    var types = [];
    graphql_1.visit(schema, {
        ObjectTypeDefinition: function (node) {
            var fields = extractTypeFields(schema, node);
            types.push({
                name: node.name.value,
                type: {
                    name: node.name.value,
                    isObject: true,
                    isInput: false,
                    isEnum: false,
                    isUnion: false,
                    isScalar: false,
                    isInterface: false
                },
                fields: fields
            });
        },
        InputObjectTypeDefinition: function (node) {
            var fields = extractTypeFields(schema, node);
            types.push({
                name: node.name.value,
                type: {
                    name: node.name.value,
                    isObject: false,
                    isInput: true,
                    isEnum: false,
                    isUnion: false,
                    isScalar: false,
                    isInterface: false
                },
                fields: fields
            });
        }
    });
    return types;
}
exports.extractGraphQLTypes = extractGraphQLTypes;
function extractEnumValues(node) {
    var values = [];
    graphql_1.visit(node, {
        EnumValueDefinition: function (node) {
            values.push(node.name.value);
        }
    });
    return values;
}
function extractGraphQLEnums(schema) {
    var types = [];
    graphql_1.visit(schema, {
        EnumTypeDefinition: function (node) {
            var values = extractEnumValues(node);
            types.push({
                name: node.name.value,
                type: {
                    name: node.name.value,
                    isObject: false,
                    isInput: false,
                    isEnum: true,
                    isUnion: false,
                    isScalar: false,
                    isInterface: false
                },
                values: values
            });
        }
    });
    return types;
}
exports.extractGraphQLEnums = extractGraphQLEnums;
function extractUnionTypes(node, types) {
    var unionTypesStrings = [];
    graphql_1.visit(node, {
        NamedType: function (node) {
            unionTypesStrings.push(node.name.value);
        }
    });
    return types.filter(function (type) { return unionTypesStrings.indexOf(type.name) > -1; });
}
function extractGraphQLUnions(schema) {
    var types = [];
    graphql_1.visit(schema, {
        UnionTypeDefinition: function (node) {
            var allTypes = extractGraphQLTypes(schema);
            var unionTypes = extractUnionTypes(node, allTypes);
            types.push({
                name: node.name.value,
                type: {
                    name: node.name.value,
                    isObject: false,
                    isInput: false,
                    isEnum: false,
                    isUnion: true,
                    isScalar: false,
                    isInterface: false
                },
                types: unionTypes
            });
        }
    });
    return types;
}
exports.extractGraphQLUnions = extractGraphQLUnions;
