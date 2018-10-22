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
var os = require("os");
var capitalize = require("capitalize");
var prettier = require("prettier");
function getTypeFromGraphQLType(type) {
    if (type === 'Int' || type === 'Float') {
        return 'number';
    }
    if (type === 'Boolean') {
        return 'boolean';
    }
    if (type === 'String' || type === 'ID' || type === 'DateTime') {
        return 'string';
    }
    return 'string';
}
function format(code, options) {
    if (options === void 0) { options = {}; }
    try {
        return prettier.format(code, __assign({}, options, { parser: 'flow' }));
    }
    catch (e) {
        console.log("There is a syntax error in generated code, unformatted code printed, error: " + JSON.stringify(e));
        return code;
    }
}
exports.format = format;
function printFieldLikeType(field, lookupType) {
    if (lookupType === void 0) { lookupType = true; }
    if (field.type.isScalar) {
        return "" + getTypeFromGraphQLType(field.type.name) + (field.type.isArray ? '[]' : '') + (!field.type.isRequired ? '| null' : '');
    }
    return lookupType
        ? "$PropertyType<T & ITypeMap, '" + field.type.name + (field.type.isEnum || field.type.isUnion ? '' : 'Parent') + "'>" + (field.type.isArray ? '[]' : '') + (!field.type.isRequired ? '| null' : '')
        : "" + field.type.name + (field.type.isEnum || field.type.isUnion ? '' : 'Parent') + (field.type.isArray ? '[]' : '') + (!field.type.isRequired ? '| null' : '');
}
exports.printFieldLikeType = printFieldLikeType;
function generate(args) {
    return "/* @flow */\nimport { GraphQLResolveInfo } from 'graphql'\n\nexport interface ITypeMap {\nContext: any,\n" + args.enums.map(function (e) { return e.name + ": any"; }).join("," + os.EOL) + (args.enums.length > 0 ? "," : "") + "\n" + args.unions.map(function (union) { return union.name + ": any"; }).join("," + os.EOL) + (args.unions.length > 0 ? "," : "") + "\n" + args.types.map(function (type) { return type.name + "Parent: any"; }).join("," + os.EOL) + "\n}\n\n  " + args.types
        .map(function (type) { return "\n      \n      " + type.fields
        .map(function (field) {
        return "\n\n        " + (field.arguments.length > 0
            ? "// Type for argument\n            export type " + type.name + "_" + capitalize(field.name) + "_Args = {\n          " + field.arguments
                .map(function (arg) {
                return arg.name + ": " + printFieldLikeType(arg) + ",";
            })
                .join("" + os.EOL) + "\n        }"
            : "") + "\n\n          export type " + type.name + "_" + capitalize(field.name) + "_Resolver<T> = (\n            parent: $PropertyType<T & ITypeMap, '" + type.name + (type.type.isEnum || type.type.isUnion ? '' : 'Parent') + "'>,\n            args: " + (field.arguments.length > 0
            ? type.name + "_" + capitalize(field.name) + "_Args"
            : '{}') + ",\n            ctx: $PropertyType<T & ITypeMap, 'Context'>,\n            info: GraphQLResolveInfo,\n          ) => " + printFieldLikeType(field) + "\n        ";
    })
        .join(os.EOL) + "\n\n      export type " + type.name + "_Type<T> = {\n        " + type.fields
        .map(function (field) { return field.name + ": (\n            parent: $PropertyType<T & ITypeMap, '" + type.name + (type.type.isEnum || type.type.isUnion ? '' : 'Parent') + "'>,\n            args: " + (field.arguments.length > 0
        ? type.name + "_" + capitalize(field.name) + "_Args"
        : '{}') + ",\n            ctx: $PropertyType<T & ITypeMap, 'Context'>,\n            info: GraphQLResolveInfo,\n          ) => " + printFieldLikeType(field) + ","; })
        .join("" + os.EOL) + "\n      }\n"; })
        .join(os.EOL) + "\n\nexport type IResolvers<T> = {\n  " + args.types
        .map(function (type) { return type.name + ": " + type.name + "_Type<T>,"; })
        .join(os.EOL) + "\n}\n\n  ";
}
exports.generate = generate;
