import * as vscode from "vscode";
import functionCallObject from './functionCallObject';

export function activate(context: vscode.ExtensionContext) {
  console.log('extension is now active!');
  decorate();
}

async function decorate(): Promise<void> {
  // Grab the visible editor
  const editor = vscode.window.activeTextEditor;

  if (!editor) return;

  // Get all of the text in said editor
  let sourceCode = editor.document.getText();

  // get an array of all said function calls in the file
  let fcArray = getFunctionCalls(sourceCode, editor);

  // grab the definitions for any of the function calls which can find a definition
  fcArray = await getDefinitions(fcArray, editor.document.uri);

  // cache for documents so they aren't loaded for every single call
  var documentCache: any = {};

  // filter down to function calls which actually have a definition
  let callsWithDefinitions = fcArray.filter(item => {
    return item.definitionLocation !== undefined;
  })

  for (let fc of callsWithDefinitions) {
    let document: vscode.TextDocument;

    if (fc.definitionLocation === undefined) continue;

    // Currently index documentCache by the filename (TODO: Figure out better index later)
    let pathNameArr = fc.definitionLocation.uri.fsPath.split("/");
    let pathName = pathNameArr[pathNameArr.length - 1];

    // If the document is not present in the cache, load it from the filesystem, otherwise grab from the cache
    if (documentCache[pathName] === undefined) {
      document = await vscode.workspace.openTextDocument(fc.definitionLocation.uri);
      documentCache[pathName] = document;
    } else {
      document = documentCache[pathName];
    }

    // create a Range on the line of the definition location with characters 0-1000 which should suffice for most definitions
    let lineRange = new vscode.Range(new vscode.Position(fc.definitionLocation.range.start.line, 0), new vscode.Position(fc.definitionLocation.range.start.line, 1000));

    console.log({ call: fc.functionName, def: document.getText(lineRange) });
  }
}

function getFunctionCalls(sourceCode: string, editor: vscode.TextEditor): functionCallObject[] {
  let fcArray: functionCallObject[] = [];

  // Regex to match function calls
  let regex = /(\w+)?\.?(\w+)\((([\"A-Za-z\]\[\{\}0-9, ]*)*)\)/;

  // Split the source code into an array of each line
  let sourceCodeArray = sourceCode.split("\n");

  let lineNumber = 0;

  for (let line of sourceCodeArray) {
    let functionCallMatch = line.match(regex);

    if (functionCallMatch !== null && functionCallMatch.index !== undefined) {
      let caller = functionCallMatch[1]; // function caller (i.e. document.getElementById has a caller of document)

      // Get location of function in source code
      let wordRange = editor.document.getWordRangeAtPosition(new vscode.Position(lineNumber, functionCallMatch.index + (caller ? caller.length + 1 : 0)));

      let newFunctionCallObject = {
        lineNumber,
        fullMatch: functionCallMatch,
        functionCaller: caller ? caller : undefined,
        functionName: functionCallMatch[2],
        functionRange: wordRange,
        params: functionCallMatch[3] ? functionCallMatch[3].split(",") : undefined
      };

      fcArray.push(newFunctionCallObject);
    }

    lineNumber++;
  }

  return fcArray;
}

async function getDefinitions(fcArray: functionCallObject[], uri: vscode.Uri): Promise<functionCallObject[]> {
  return new Promise<functionCallObject[]>(async function (resolve, reject) {
    for (let fc of fcArray) {
      if (fc.functionRange === undefined) continue;

      // grab an array of locations for the definitions of a function call
      let locations = await vscode.commands.executeCommand<vscode.Location[]>("vscode.executeDefinitionProvider", uri, fc.functionRange.start);

      // If it exists, set the definitionLocation to the first result
      if (locations !== undefined && locations.length > 0) {
        fc.definitionLocation = locations[0];
      }
    }

    resolve(fcArray);
  })

}