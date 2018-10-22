"use strict";
exports.__esModule = true;
var os = require("os");
var capitalize = require("capitalize");
var camelCase = require("camelcase");
var refmt = require("reason");
function getTypeFromGraphQLType(type) {
    if (type === "Int") {
        return "int";
    }
    if (type === "Float") {
        return "float";
    }
    if (type === "Boolean") {
        return "bool";
    }
    if (type === "String" || type === "ID" || type === "DateTime") {
        return "string";
    }
    return "nonScalar";
}
function format(code) {
    try {
        return refmt.printRE(refmt.parseRE(code));
    }
    catch (e) {
        console.log("There is a syntax error in generated code, unformatted code printed, error: " + JSON.stringify(e));
        return code;
    }
}
exports.format = format;
function printFieldLikeType(field) {
    if (getTypeFromGraphQLType(field.type.name) !== "nonScalar") {
        return getTypeFromGraphQLType(field.type.name) + ",";
    }
    if (field.type.isArray) {
        return "Js.Array.t(Data." + camelCase(field.type.name) + "),";
    }
    return "Data." + camelCase(field.type.name) + ",";
}
function generate(args) {
    console.log("Reason binding is experimental");
    return "\n  module Data = {\n    " + args.types
        .map(function (type) { return "\n      type " + camelCase(type.name) + " = {\n        .\n        " + type.fields
        .filter(function (field) {
        return getTypeFromGraphQLType(field.type.name) !==
            "nonScalar";
    })
        .map(function (field) { return "\n          \"" + field.name + "\": " + printFieldLikeType(field) + "\n        "; })
        .join(os.EOL) + "\n      }\n    "; })
        .join(os.EOL) + "\n\n      " + args.unions
        .map(function (union) { return "\n        type " + camelCase(union.name) + " =\n          " + union.types.map(function (t) { return "| " + t.name; }).join(os.EOL) + "  \n      "; })
        .join(os.EOL) + "\n\n      " + args.enums
        .map(function (e) { return "\n        type " + camelCase(e.name) + " =\n          " + e.values.map(function (v) { return "| " + v; }).join(os.EOL) + "  \n      "; })
        .join(os.EOL) + "\n  };\n\n\n  " + args.types
        .map(function (type) { return "\n    module " + capitalize(type.name) + " = {\n      \n      " + type.fields
        .filter(function (field) { return field.arguments.length > 0; })
        .map(function (field) { return "\n          type " + field.name + "Argument = {\n            .\n            " + field.arguments
        .map(function (arg) { return "\n              \"" + arg.name + "\": " + printFieldLikeType(field) + "\n            "; })
        .join(os.EOL) + "\n          }\n        "; })
        .join(os.EOL) + "\n\n      type parent;\n      type args;\n      type context;\n      type info;\n      \n      type resolvers = {\n        .\n        " + type.fields
        .filter(function (field) {
        return getTypeFromGraphQLType(field.type.name) ===
            "nonScalar";
    })
        .map(function (field) { return "\n          \"" + field.name + "\": (parent, " + (field.arguments.length > 0 ? field.name + "Argument" : "args") + ", context, info) => " + printFieldLikeType(field) + "\n        "; })
        .join(os.EOL) + "\n      }\n    }\n  "; })
        .join(os.EOL) + "\n\n  ";
}
exports.generate = generate;
