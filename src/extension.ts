import * as vscode from "vscode";
import Commands from "./commands";
import * as decorator from "./decorator";
import * as parser from "./parser";

const decType = vscode.window.createTextEditorDecorationType({});
const errDecType = vscode.window.createTextEditorDecorationType({
  fontWeight: "800"
});

let diagCollection;
let diagnostics: vscode.Diagnostic[];

export function activate(ctx: vscode.ExtensionContext) {
  console.log("extension is now active!");

  // Update when a file opens
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    run(ctx, editor);
  });

  // Update when a file saves
  vscode.workspace.onWillSaveTextDocument((event) => {
    const openEditor = vscode.window.visibleTextEditors.filter((editor) => editor.document.uri === event.document.uri)[0];

    run(ctx, openEditor);
  });

  // Update if the config was changed
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("jsannotations")) {
      run(ctx, vscode.window.activeTextEditor);
    }
  });

  Commands.registerCommands();
}

export function deactivate() {
  console.log("DONE");
}

async function run(ctx: vscode.ExtensionContext, editor: vscode.TextEditor | undefined): Promise<void> {
  if (!editor) {
    return;
  }

  const supportedLanguages = ["javascript", "typescript"];

  if (supportedLanguages.indexOf(editor.document.languageId) === -1) {
    return;
  }

  // Setup variables for diagnostics when loading JS file
  if (editor.document.languageId === "javascript") {
    diagCollection = vscode.languages.createDiagnosticCollection("js-annot");
    diagnostics = [];
  }

  const isEnabled = vscode.workspace.getConfiguration("jsannotations").get("enabled");

  if (!isEnabled) {
    editor.setDecorations(decType, []);
    return;
  }

  // Get all of the text in said editor
  const sourceCode = editor.document.getText();

  diagnostics = [];

  const [decArray, errDecArray] = await createDecorations(editor, sourceCode);

  if (editor.document.languageId === "javascript") {
    diagCollection.set(editor.document.uri, diagnostics);
    ctx.subscriptions.push(diagCollection);
  }

  editor.setDecorations(decType, decArray);
  editor.setDecorations(errDecType, errDecArray);
}

export async function createDecorations(editor: vscode.TextEditor, sourceCode: string): Promise<vscode.DecorationOptions[][]> {
  const decArray: vscode.DecorationOptions[] = [];
  const errDecArray: vscode.DecorationOptions[] = [];

  // get an array of all said function calls in the file
  let fcArray = parser.getFunctionCalls(sourceCode, editor);

  // grab the definitions for any of the function calls which can find a definition
  fcArray = await parser.getDefinitions(fcArray, editor.document.uri);

  // cache for documents so they aren't loaded for every single call
  const documentCache: any = {};

  // filter down to function calls which actually have a definition
  const callsWithDefinitions = fcArray.filter((item) => item.definitionLocation !== undefined);

  for (const fc of callsWithDefinitions) {
    await decorator.decorateFunctionCall(editor, documentCache, decArray, errDecArray, fc, diagnostics);
  }

  return [decArray, errDecArray];
}
