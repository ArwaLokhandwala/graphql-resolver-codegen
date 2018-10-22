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
        return prettier.format(code, __assign({}, options, { parser: 'typescript' }));
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
    if (field.type.isInput) {
        return "" + field.type.name + (field.type.isArray ? '[]' : '') + (!field.type.isRequired ? '| null' : '');
    }
    return lookupType
        ? "T['" + field.type.name + (field.type.isEnum || field.type.isUnion ? '' : 'Parent') + "']" + (field.type.isArray ? '[]' : '') + (!field.type.isRequired ? '| null' : '')
        : "" + field.type.name + (field.type.isEnum || field.type.isUnion ? '' : 'Parent') + (field.type.isArray ? '[]' : '') + (!field.type.isRequired ? '| null' : '');
}
exports.printFieldLikeType = printFieldLikeType;
function generate(args) {
    // TODO: Maybe move this to source helper
    var inputTypesMap = args.types
        .filter(function (type) { return type.type.isInput; })
        .reduce(function (inputTypes, type) {
        var _a;
        return __assign({}, inputTypes, (_a = {}, _a["" + type.name] = type, _a));
    }, {});
    // TODO: Type this
    var typeToInputTypeAssociation = args.types
        .filter(function (type) {
        return type.type.isObject &&
            type.fields.filter(function (field) { return field.arguments.filter(function (arg) { return arg.type.isInput; }).length > 0; }).length > 0;
    })
        .reduce(function (types, type) {
        var _a;
        return __assign({}, types, (_a = {}, _a["" + type.name] = [].concat.apply([], type.fields.map(function (field) {
            return field.arguments
                .filter(function (arg) { return arg.type.isInput; })
                .map(function (arg) { return arg.type.name; });
        })), _a));
    }, {});
    return "\n/* DO NOT EDIT! */\nimport { GraphQLResolveInfo } from 'graphql'\n\nexport interface ITypeMap {\nContext: any\n" + args.enums.map(function (e) { return e.name + ": any"; }).join(os.EOL) + "\n" + args.unions.map(function (union) { return union.name + ": any"; }).join(os.EOL) + "\n" + args.types
        .filter(function (type) { return type.type.isObject; })
        .map(function (type) { return type.name + "Parent: any"; })
        .join(os.EOL) + "\n}\n\n  " + args.types
        .filter(function (type) { return type.type.isObject; })
        .map(function (type) { return "export namespace " + type.name + "Resolvers {\n\n        " + (typeToInputTypeAssociation[type.name] ? "export interface " + inputTypesMap[typeToInputTypeAssociation[type.name]].name + " {\n          " + inputTypesMap[typeToInputTypeAssociation[type.name]].fields.map(function (field) { return field.name + ": " + getTypeFromGraphQLType(field.type.name); }) + "\n        }" : "") + "  \n\n  " + type.fields
        .map(function (field) { return (field.arguments.length > 0
        ? "export interface Args" + capitalize(field.name) + " {\n      " + field.arguments
            .map(function (arg) { return arg.name + ": " + printFieldLikeType(arg); })
            .join(os.EOL) + "\n    }"
        : '') + "\n\n  export type " + capitalize(field.name) + "Resolver<T extends ITypeMap> = (\n    parent: T['" + type.name + (type.type.isEnum || type.type.isUnion ? '' : 'Parent') + "'],\n    args: " + (field.arguments.length > 0 ? "Args" + capitalize(field.name) : '{}') + ",\n    ctx: T['Context'],\n    info: GraphQLResolveInfo,\n  ) => " + printFieldLikeType(field) + " | Promise<" + printFieldLikeType(field) + ">\n  "; })
        .join(os.EOL) + "\n\n  export interface Type<T extends ITypeMap> {\n  " + type.fields
        .map(function (field) { return field.name + ": (\n      parent: T['" + type.name + (type.type.isEnum || type.type.isUnion ? '' : 'Parent') + "'],\n      args: " + (field.arguments.length > 0 ? "Args" + capitalize(field.name) : '{}') + ",\n      ctx: T['Context'],\n      info: GraphQLResolveInfo,\n    ) => " + printFieldLikeType(field) + " | Promise<" + printFieldLikeType(field) + ">"; })
        .join(os.EOL) + "\n  }\n}\n"; })
        .join(os.EOL) + "\n\nexport interface IResolvers<T extends ITypeMap> {\n  " + args.types
        .filter(function (type) { return type.type.isObject; })
        .map(function (type) { return type.name + ": " + type.name + "Resolvers.Type<T>"; })
        .join(os.EOL) + "\n}\n\n  ";
}
exports.generate = generate;
