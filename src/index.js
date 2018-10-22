#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var yargs = require("yargs");
var graphql_1 = require("graphql");
var fs = require("fs");
var chalk = require("chalk");
var mkdirp = require("mkdirp");
var prettier = require("prettier");
var os = require("os");
var source_helper_1 = require("./source-helper");
var path_1 = require("path");
var ts_generator_1 = require("./generators/ts-generator");
var reason_generator_1 = require("./generators/reason-generator");
var flow_generator_1 = require("./generators/flow-generator");
var ts_scaffolder_1 = require("./generators/ts-scaffolder");
var reason_scaffolder_1 = require("./generators/reason-scaffolder");
var flow_scaffolder_1 = require("./generators/flow-scaffolder");
var graphql_import_1 = require("graphql-import");
function getGenerator(generator) {
    if (generator === "interfaces-flow") {
        return { generate: flow_generator_1.generate, format: flow_generator_1.format };
    }
    if (generator === "scaffold-flow") {
        return { generate: flow_scaffolder_1.generate, format: flow_generator_1.format };
    }
    if (generator === "interfaces-reason") {
        return { generate: reason_generator_1.generate, format: reason_generator_1.format };
    }
    if (generator === "scaffold-reason") {
        return { generate: reason_scaffolder_1.generate, format: reason_generator_1.format };
    }
    if (generator === "interfaces-typescript") {
        return { generate: ts_generator_1.generate, format: ts_generator_1.format };
    }
    if (generator === "scaffold-typescript") {
        return { generate: ts_scaffolder_1.generate, format: ts_generator_1.format };
    }
    return { generate: ts_generator_1.generate, format: ts_generator_1.format };
}
function generateCode(_a) {
    var _b = _a.schema, schema = _b === void 0 ? undefined : _b, _c = _a.prettify, prettify = _c === void 0 ? true : _c, prettifyOptions = _a.prettifyOptions, _d = _a.generator, generator = _d === void 0 ? "interfaces-typescript" : _d;
    if (!schema) {
        console.error(chalk["default"].red("Please provide a parsed GraphQL schema"));
    }
    var generateArgs = {
        types: source_helper_1.extractGraphQLTypes(schema),
        enums: source_helper_1.extractGraphQLEnums(schema),
        unions: source_helper_1.extractGraphQLUnions(schema)
    };
    var generatorFn = getGenerator(generator);
    var code = generatorFn.generate(generateArgs);
    if (typeof code === "string") {
        if (prettify) {
            return generatorFn.format(code, prettifyOptions);
        }
        else {
            return code;
        }
    }
    else {
        return code.map(function (f) {
            return {
                path: f.path,
                force: f.force,
                code: prettify ? generatorFn.format(f.code, prettifyOptions) : f.code
            };
        });
    }
}
exports.generateCode = generateCode;
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var defaults, argv, command, args, schema, parsedSchema, options, code, didWarn_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    defaults = {
                        outputInterfaces: "src/generated/resolvers.ts",
                        outputScaffold: "src/resolvers/",
                        generator: "typescript",
                        interfaces: "../generated/resolvers.ts",
                        force: false
                    };
                    argv = yargs
                        .usage("Usage: <command> $0 -s [schema-path] -o [output-path] -g [generator] -i [interfaces]")
                        .alias("s", "schema-path")
                        .describe("s", "GraphQL schema file path")
                        .alias("o", "output")
                        .describe("o", "Output file/folder path [default: " + defaults.outputInterfaces + "]")
                        .alias("g", "generator")
                        .describe("g", "Generator to use [default: " + defaults.generator + ", options: reason, flow]")
                        .describe("i", "Path to the interfaces folder used for scaffolding")
                        .alias("i", "interfaces") // TODO: Make this option only be used with scaffold command
                        .describe("f", "Force write files when there is a clash while scaffolding")
                        .alias("f", "force") // TODO: Make this option only be used with scaffold command
                        .demandOption(["s"])
                        .demandCommand(1)
                        .strict().argv;
                    command = argv._[0];
                    if (["scaffold", "interfaces"].indexOf(command.toLowerCase()) <= -1) {
                        console.error("Unknown command provided, please provide either scaffold or interfaces as the command");
                        process.exit(1);
                    }
                    args = {
                        command: command,
                        schemaPath: path_1.resolve(argv.schemaPath),
                        output: argv.output ||
                            "" + (command === "interfaces"
                                ? "" + defaults.outputInterfaces
                                : "" + defaults.outputScaffold),
                        generator: argv.generator || defaults.generator,
                        interfaces: (argv.interfaces || defaults.interfaces)
                            .trim()
                            .replace(".ts", "")
                            .replace(".js", ""),
                        force: Boolean(argv.force) || defaults.force
                    };
                    // TODO: Do a check on interfaces if provided
                    if (!fs.existsSync(args.schemaPath)) {
                        console.error("The schema file " + args.schemaPath + " does not exist");
                        process.exit(1);
                    }
                    schema = undefined;
                    try {
                        schema = graphql_import_1.importSchema(args.schemaPath);
                    }
                    catch (e) {
                        console.error(chalk["default"].red("Error occurred while reading schema: " + e));
                        process.exit(1);
                    }
                    parsedSchema = undefined;
                    try {
                        parsedSchema = graphql_1.parse(schema);
                    }
                    catch (e) {
                        console.error(chalk["default"].red("Failed to parse schema: " + e));
                        process.exit(1);
                    }
                    return [4 /*yield*/, prettier.resolveConfig(process.cwd())];
                case 1:
                    options = (_a.sent()) || {};
                    if (JSON.stringify(options) !== "{}") {
                        console.log(chalk["default"].blue("Found a prettier configuration to use"));
                    }
                    code = generateCode({
                        schema: parsedSchema,
                        generator: args.command + "-" + args.generator,
                        prettify: true,
                        prettifyOptions: options
                    });
                    if (typeof code === "string") {
                        // Create generation target folder, if it does not exist
                        // TODO: Error handling around this
                        mkdirp.sync(path_1.dirname(args.output));
                        try {
                            fs.writeFileSync(args.output, code, { encoding: "utf-8" });
                        }
                        catch (e) {
                            console.error(chalk["default"].red("Failed to write the file at " + args.output + ", error: " + e));
                            process.exit(1);
                        }
                        console.log(chalk["default"].green("Code generated at " + args.output));
                        process.exit(0);
                    }
                    else {
                        // Create generation target folder, if it does not exist
                        // TODO: Error handling around this
                        mkdirp.sync(path_1.dirname(args.output));
                        didWarn_1 = false;
                        code.forEach(function (f) {
                            var writePath = path_1.join(args.output, f.path);
                            if (!args.force &&
                                !f.force &&
                                (fs.existsSync(writePath) ||
                                    (path_1.resolve(path_1.dirname(writePath)) !== path_1.resolve(args.output) &&
                                        fs.existsSync(path_1.dirname(writePath))))) {
                                didWarn_1 = true;
                                console.log(chalk["default"].yellow("Warning: file (" + writePath + ") already exists."));
                                return;
                            }
                            mkdirp.sync(path_1.dirname(writePath));
                            try {
                                fs.writeFileSync(writePath, f.code.replace("[TEMPLATE-INTERFACES-PATH]", args.interfaces), {
                                    encoding: "utf-8"
                                });
                            }
                            catch (e) {
                                console.error(chalk["default"].red("Failed to write the file at " + args.output + ", error: " + e));
                                process.exit(1);
                            }
                            console.log(chalk["default"].green("Code generated at " + writePath));
                        });
                        if (didWarn_1) {
                            console.log(chalk["default"].yellow(os.EOL + "Please us the force flag (-f, --force) to overwrite the files."));
                        }
                        process.exit(0);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Only call run when running from CLI, not when included for tests
if (require.main === module) {
    run();
}
