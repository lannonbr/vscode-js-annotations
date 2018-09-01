import * as vscode from "vscode";
import Commands from "./commands";
import { decorateFunctionCall } from "./decorator";
import { getDefinitions, getFunctionCalls } from "./parser";

const decType = vscode.window.createTextEditorDecorationType({});

export function activate(context: vscode.ExtensionContext) {
  console.log("extension is now active!");

  // Update when a file opens
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    run(editor);
  });

  // Update when a file saves
  vscode.workspace.onWillSaveTextDocument((event) => {
    const openEditor = vscode.window.visibleTextEditors.filter((editor) => editor.document.uri === event.document.uri)[0];

    run(openEditor);
  });

  // Update if the config was changed
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("jsannotations")) {
      run(vscode.window.activeTextEditor);
    }
  });

  Commands.registerCommands();
}

export function deactivate() {
  console.log("DONE");
}

async function run(editor: vscode.TextEditor | undefined): Promise<void> {
  if (!editor) {
    return;
  }

  const supportedLanguages = ["javascript", "typescript"];

  if (supportedLanguages.indexOf(editor.document.languageId) === -1) {
    return;
  }

  const isEnabled = vscode.workspace.getConfiguration("jsannotations").get("enabled");

  if (!isEnabled) {
    editor.setDecorations(decType, []);
    return;
  }

  const decArray: vscode.DecorationOptions[] = [];

  // Get all of the text in said editor
  const sourceCode = editor.document.getText();

  // get an array of all said function calls in the file
  let fcArray = getFunctionCalls(sourceCode, editor);

  // grab the definitions for any of the function calls which can find a definition
  fcArray = await getDefinitions(fcArray, editor.document.uri);

  // cache for documents so they aren't loaded for every single call
  const documentCache: any = {};

  // filter down to function calls which actually have a definition
  const callsWithDefinitions = fcArray.filter((item) => item.definitionLocation !== undefined);

  for (const fc of callsWithDefinitions) {
    await decorateFunctionCall(editor, documentCache, decArray, fc);
  }

  editor.setDecorations(decType, decArray);
}
