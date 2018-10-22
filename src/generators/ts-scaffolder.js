"use strict";
exports.__esModule = true;
var os = require("os");
var ts_generator_1 = require("./ts-generator");
var ts_generator_2 = require("./ts-generator");
exports.format = ts_generator_2.format;
function printFieldLikeTypeEmptyCase(field) {
    if (!field.type.isRequired || field.type.name === "ID") {
        return "null";
    }
    if (field.type.isRequired && field.type.isArray && field.type.isScalar) {
        return "[]";
    }
    if (field.type.isRequired &&
        field.type.name === "String" &&
        field.type.isScalar) {
        return "''";
    }
    if (field.type.isRequired &&
        (field.type.name === "Int" || field.type.name === "Float") &&
        field.type.isScalar) {
        return "0";
    }
    if (field.type.isRequired &&
        field.type.name === "Boolean" &&
        field.type.isScalar) {
        return "false";
    }
    if (field.type.isRequired && !field.type.isScalar) {
        return "{ throw new Error('Resolver not implemented') }";
    }
}
function isParentType(name) {
    var parentTypes = ["Query", "Mutation", "Subscription"];
    return parentTypes.indexOf(name) > -1;
}
function generate(args) {
    var files = args.types
        .filter(function (type) { return type.type.isObject; })
        .filter(function (type) { return !isParentType(type.name); })
        .map(function (type) {
        var code = "\n    import { " + type.name + "Resolvers } from '[TEMPLATE-INTERFACES-PATH]'\n    import { TypeMap } from './types/TypeMap'\n    " + Array.from(new Set(type.fields
            .filter(function (field) { return !field.type.isEnum && !field.type.isUnion; })
            .filter(function (field) { return !field.type.isScalar; })
            .map(function (field) { return "import { " + field.type.name + "Parent } from './" + field.type.name + "'\n  "; }))).join(";") + "\n      " + args.unions
            .filter(function (u) { return type.fields.map(function (f) { return f.type.name; }).indexOf(u.name) > -1; })
            .map(function (u) { return u.types
            .map(function (type) { return "import { " + type.name + "Parent } from './" + type.name + "'"; })
            .join(";") + "\n        \n            export type " + u.name + " = " + u.types
            .map(function (type) { return type.name + "Parent"; })
            .join("|") + "\n        "; })
            .join(os.EOL) + "\n\n        " + args.enums
            .filter(function (e) { return type.fields.map(function (f) { return f.type.name; }).indexOf(e.name) > -1; })
            .map(function (e) { return "\n        export type " + e.name + " = " + e.values.map(function (v) { return "\"" + v + "\""; }).join("|") + "\n        "; })
            .join(os.EOL) + "\n\n    export interface " + type.name + "Parent {\n      " + type.fields
            .map(function (field) { return "\n      " + field.name + (!field.type.isRequired ? "?" : "") + ": " + ts_generator_1.printFieldLikeType(field, false).replace("| null", "") + "\n      "; })
            .join(";") + "\n    }\n\n    export const " + type.name + ": " + type.name + "Resolvers.Type<TypeMap> = {\n      " + type.fields.map(function (field) { return "\n        " + field.name + ": (parent" + (field.arguments.length > 0 ? ", args" : "") + ") => parent." + field.name + "\n      "; }) + "\n    }\n    ";
        return {
            path: type.name + ".ts",
            force: false,
            code: code
        };
    });
    files = files.concat(args.types
        .filter(function (type) { return type.type.isObject; })
        .filter(function (type) { return isParentType(type.name); })
        .map(function (type) {
        var code = "\n      import { " + type.name + "Resolvers } from '[TEMPLATE-INTERFACES-PATH]'\n      import { TypeMap } from './types/TypeMap'\n\n      export interface " + type.name + "Parent { }\n      \n      export const " + type.name + ": " + type.name + "Resolvers.Type<TypeMap> = {\n        " + type.fields.map(function (field) {
            return field.name + ": (parent" + (field.arguments.length > 0 ? ", args" : "") + ") => " + printFieldLikeTypeEmptyCase(field);
        }) + "\n      }\n      ";
        return {
            path: type.name + ".ts",
            force: false,
            code: code
        };
    }));
    files.push({
        path: "types/Context.ts",
        force: false,
        code: "\n    export interface Context { }\n    "
    });
    files.push({
        path: "types/TypeMap.ts",
        force: true,
        code: "\nimport { ITypeMap } from '../[TEMPLATE-INTERFACES-PATH]'\n\n" + args.types
            .filter(function (type) { return type.type.isObject; })
            .map(function (type) { return "import { " + type.name + "Parent } from '../" + type.name + "'"; })
            .join(";") + "\n\nimport { Context } from './context'\n\nexport interface TypeMap extends ITypeMap {\n  Context: Context\n  " + args.types
            .filter(function (type) { return type.type.isObject; })
            .map(function (type) {
            return "" + type.name + (type.type.isEnum || type.type.isUnion ? "" : "Parent") + ": " + type.name + (type.type.isEnum || type.type.isUnion ? "" : "Parent");
        })
            .join(";") + "\n}\n    "
    });
    files.push({
        path: "index.ts",
        force: false,
        code: "\n    import { IResolvers } from '[TEMPLATE-INTERFACES-PATH]'\n    import { TypeMap } from './types/TypeMap'\n    " + args.types
            .filter(function (type) { return type.type.isObject; })
            .map(function (type) { return "\n      import { " + type.name + " } from './" + type.name + "'\n    "; })
            .join(";") + "\n\n    export const resolvers: IResolvers<TypeMap> = {\n      " + args.types
            .filter(function (type) { return type.type.isObject; })
            .map(function (type) { return "" + type.name; })
            .join(",") + "\n    }\n    "
    });
    return files;
}
exports.generate = generate;
