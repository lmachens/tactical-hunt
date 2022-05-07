/**
 * Run program watcher to compile TypeScript to JavaScript and run and restart Node server
 * https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#writing-an-incremental-program-watcher
 * https://nodejs.org/dist/latest-v18.x/docs/api/child_process.html#child_processforkmodulepath-args-options
 */

import ts from "typescript";
import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MAGENTA = "\x1b[36m";
const CYAN = "\x1b[37m";
const formatHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

function watch(configName, onCompileStart, onCompileEnd) {
  const configPath = ts.findConfigFile(
    /*searchPath*/ "./",
    ts.sys.fileExists,
    configName
  );
  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  // TypeScript can use several different program creation "strategies":
  //  * ts.createEmitAndSemanticDiagnosticsBuilderProgram,
  //  * ts.createSemanticDiagnosticsBuilderProgram
  //  * ts.createAbstractBuilder
  // The first two produce "builder programs". These use an incremental strategy
  // to only re-check and emit files whose contents may have changed, or whose
  // dependencies may have changes which may impact change the result of prior
  // type-check and emit.
  // The last uses an ordinary program which does a full type check after every
  // change.
  // Between `createEmitAndSemanticDiagnosticsBuilderProgram` and
  // `createSemanticDiagnosticsBuilderProgram`, the only difference is emit.
  // For pure type-checking scenarios, or when another tool/process handles emit,
  // using `createSemanticDiagnosticsBuilderProgram` may be more desirable.
  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;

  // Note that there is another overload for `createWatchCompilerHost` that takes
  // a set of root files.
  const host = ts.createWatchCompilerHost(
    configPath,
    {},
    ts.sys,
    createProgram,
    reportDiagnostic,
    reportWatchStatusChanged
  );

  // You can technically override any given hook on the host, though you probably
  // don't need to.
  // Note that we're assuming `origCreateProgram` and `origPostProgramCreate`
  // doesn't use `this` at all.
  const origCreateProgram = host.createProgram;

  host.createProgram = (rootNames, options, host, oldProgram) => {
    onCompileStart();
    return origCreateProgram(rootNames, options, host, oldProgram);
  };
  const origPostProgramCreate = host.afterProgramCreate;

  host.afterProgramCreate = (program) => {
    origPostProgramCreate(program);
    onCompileEnd();
  };

  // `createWatchProgram` creates an initial program, watches files, and updates
  // the program over time.
  ts.createWatchProgram(host);
}

function reportDiagnostic(diagnostic) {
  console.error(
    "Error",
    diagnostic.code,
    ":",
    ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      formatHost.getNewLine()
    )
  );
}

/**
 * Prints a diagnostic every time the watch status changes.
 * This is mainly for messages like "Starting compilation" or "Compilation completed".
 */
function reportWatchStatusChanged(diagnostic) {
  console.info(MAGENTA, ts.formatDiagnostic(diagnostic, formatHost));
}

function copyAssets() {
  fs.copyFileSync("src/app/styles.css", "dist/app/styles.css");
  fs.copyFileSync("src/app/index.html", "dist/app/index.html");
  fs.copyFileSync("src/app/favicon.ico", "dist/app/favicon.ico");
}

// Remember AbortController of Node process to close it on file change
let abortController = null;

watch(
  "tsconfig.json",
  () => {
    console.log(MAGENTA, "** Compiling server... **");
    if (abortController) {
      abortController.abort(); // Stops the Node process
    }
  },
  () => {
    console.log(MAGENTA, "** Server compiled 🤘. Starting... **");
    abortController = new AbortController();
    const child = fork(__dirname + "/../dist/index.js", ["child"], {
      signal: abortController.signal,
    });
    child.on("error", () => {
      console.log(MAGENTA, "** Closing Node server **");
    });
  }
);

watch(
  "tsconfig.app.json",
  () => {
    console.log(CYAN, "** Compiling app... **");
    copyAssets();
  },
  () => {
    console.log(CYAN, "** App compiled 🤘. Please reload browser. **");
  }
);
