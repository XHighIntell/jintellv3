import type * as TS from "typescript";
import type * as Uglify from "uglify-js";

const NODE_PATH = 'C:/node/node_modules';
const node = {
    fs: await import("fs"),
    path: await import("path"),
    module: await import("node:module"),
};
const require = node.module.createRequire(NODE_PATH);
const ts = require('typescript') as typeof import("typescript");
const uglifyjs = require('uglify-js') as typeof import("uglify-js");


namespace builder {
    interface TypeScriptConfigBuildJob {
        type: 'tsconfig';
        name: string;
        config: string;
        minify?: boolean;
    }
    interface StyleSheetBuildJob {
        type: 'css';
        name: string;
        src: string[]; // 'portal.css'
        dest: {
            name: 'portal.css';
        }
    }
    interface GenerateDocumentJob {
        type: 'docs';
        name: string;
        /** The path to the '.d.ts' file. */
        src: string;
    }
    export type BuildJob = TypeScriptConfigBuildJob | StyleSheetBuildJob | GenerateDocumentJob;

    /** Gets build jobs by the specified target mode. */
    export function getJobs(target: string): BuildJob[] {
        if (target == 'development') {
            return [
                { type: 'tsconfig', name: 'intell.js', config: '../src/tsconfig.json', minify: false },
            ];
        }
        else if (target == 'production') {
            return [
                { type: 'tsconfig', name: 'intell.js', config: '../src/tsconfig.production.json', minify: true },
            ];
        }
        else if (target == 'docs') {
            return [
                { type: 'tsconfig', name: 'src/tsconfig.json', config: '../src/tsconfig.json', minify: true },
                { type: 'tsconfig', name: 'docs_src/tsconfig.json', config: '../docsrc/tsconfig.json', minify: true },
                { type: 'tsconfig', name: 'docs/tsconfig.json', config: '../docs/tsconfig.json', minify: true },
            ];
        }
        else throw new Error(`Unknow ${target} target mode.`)

    }
    export function tsc(configPath: string, minify?: boolean) {
        const cc = new TSCompiler(configPath);
        cc.emit(minify ?? false);
        cc.write();
    }

    function getErrorMessageFromDiagnostic(diagnostic: TS.Diagnostic): string {
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\r\n");

        if (diagnostic.file && diagnostic.start !== undefined) {
            let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            return `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
        }
        else return message;
    }
    function getFileNameWithoutExtension(path: string) {
        const name = node.path.basename(path)
        const index = name.lastIndexOf('.');
        if (index == -1) return name;

        return name.substring(0, index);
    }

    interface EmittedFile {
        filename: string;
        content: string;
    }
    export class TSCompiler {
        constructor(configPath: string) {
            // 1. read & parse the tsconfig.json
            // 2. Create the program

            if (node.fs.existsSync(configPath) == false) throw new Error(`The tsconfig file was not found at '${configPath}'.`);

            const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
            if (configFile.error) throw new Error(getErrorMessageFromDiagnostic(configFile.error));

            const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, node.path.dirname(configPath));
            if (parsedConfig.errors.length > 0) throw new Error(parsedConfig.errors.map(getErrorMessageFromDiagnostic).join('\r\n'));

            this.config = parsedConfig;
        }

        /** Gets or sets the tsconfig.json. */
        config: TS.ParsedCommandLine

        /** Gets or sets the emitted files. */
        emittedFiles: EmittedFile[] = [];

        /** Gets the emitted file by its filename. */
        getEmittedFile(filename: string): EmittedFile | undefined {
            return this.emittedFiles.find(file => file.filename == filename);
        }

        /** Emits TypeScript output to memory. */
        emit(minify: boolean) {
            const options = this.config.options;
            const host = ts.createCompilerHost(options); // Creates custom compiler host
            host.writeFile = (filename, content) => this.emittedFiles.push({ filename, content });

            const program = ts.createProgram({ rootNames: this.config.fileNames, options, host });
            const emitResult = program.emit(); // Emits to memory

            if (emitResult.emitSkipped == true) {
                const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
                throw new Error(allDiagnostics.map(getErrorMessageFromDiagnostic).join('\r\n'));
            }

            if (minify == true) this.minify();
        }

        /** Minifies JavaScript and transforms source maps. */
        minify() {
            const enabledSourceMap = this.config.options.sourceMap ?? false;

            // Transforms .js and .js.map
            this.emittedFiles.forEach(fileJs => {
                if (fileJs.filename.endsWith('.js') == false) return;

                const jsFileName = fileJs.filename;             // C:/output/intell.js
                const sourceMapFileName = `${jsFileName}.map`;  // C:/output/intell.js.map
                const sourceMapFile = this.getEmittedFile(sourceMapFileName);

                const output = uglifyjs.minify(fileJs.content, {
                    sourceMap: enabledSourceMap == false ? undefined : {
                        content: sourceMapFile != null ? JSON.parse(sourceMapFile.content) : undefined as any,
                        includeSources: true,
                        url: node.path.basename(sourceMapFileName),
                    }
                });
                if (output.error != null) throw new Error(output.error.message);

                let code = output.code;
                let sourcemap = output.map;


                if (fileJs) fileJs.content = code;
                if (sourceMapFile) sourceMapFile.content = sourcemap!;
            });
        }

        /** Writes all output to disk. */
        write() {
            this.emittedFiles.forEach(file => {
                node.fs.mkdirSync(node.path.dirname(file.filename), { recursive: true });
                node.fs.writeFileSync(file.filename, file.content, { encoding: "utf8" });
            });
        }
    }
}
namespace builder.colors {
    export const reset = '\x1b[0m';

    /**Generates a foreground color code.*/
    export function fg(number: number) { return '\x1b[38;5;' + number + 'm' }

    /**Generates a background color code.*/
    export function bg(number: number) { return '\x1b[48;5;' + number + 'm' }
}

const action = global.process.env["action"] ?? "build";
const target = global.process.env["target"] ?? "production";

console.log("build action = '" + builder.colors.fg(201) + action + builder.colors.reset + "'");
console.log("build target = '" + builder.colors.fg(226) + target + builder.colors.reset + "'");
console.log();

if (action == "build") {
    builder.getJobs(target).forEach((job, index) => {
        process.stdout.write(`${(index + 1).toString().padStart(2)}. build ${builder.colors.fg(39) + job.name + builder.colors.reset}...`);

        const now = Date.now();

        if (job.type == 'tsconfig') {
            builder.tsc(node.path.resolve(job.config), job.minify);
        }

        const elapsed = Date.now() - now;
        console.log("done in " + builder.colors.fg(128) + elapsed + "ms" + builder.colors.reset);
    });
}