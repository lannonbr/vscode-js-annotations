import * as vscode from "vscode";
import functionCallObject from './functionCallObject';
import { Annotations } from './annotationProvider';

let decType = vscode.window.createTextEditorDecorationType({});

export function activate(context: vscode.ExtensionContext) {
  console.log('extension is now active!');

  // Update when a file opens
  vscode.window.onDidChangeActiveTextEditor(editor => {
    decorateEditor(editor).catch(console.log);
  });

  // Update when a file saves
  vscode.workspace.onWillSaveTextDocument(event => {
    let openEditor = vscode.window.visibleTextEditors.filter(editor => editor.document.uri === event.document.uri)[0];

    decorateEditor(openEditor).catch(console.log);
  })
}

export function deactivate() {
  console.log("DONE");
}

async function decorateEditor(editor: vscode.TextEditor | undefined): Promise<void> {
  if (!editor) return;

  let decArray: vscode.DecorationOptions[] = [];

  // Get all of the text in said editor
  let sourceCode = editor.document.getText();

  // get an array of all said function calls in the file
  let fcArray = getFunctionCalls(sourceCode, editor);

  // grab the definitions for any of the function calls which can find a definition
  fcArray = await getDefinitions(fcArray, editor.document.uri);

  // cache for documents so they aren't loaded for every single call
  var documentCache: any = {};

  // filter down to function calls which actually have a definition
  let callsWithDefinitions = fcArray.filter(item => item.definitionLocation !== undefined);

  for (let fc of callsWithDefinitions) {
    await decorateFunctionCall(editor, documentCache, decArray, fc);
  }

  editor.setDecorations(decType, decArray);
}

function getFunctionCalls(sourceCode: string, editor: vscode.TextEditor): functionCallObject[] {
  let fcArray: functionCallObject[] = [];

  // Regex to match function calls
  let regex = /(\w+)?\.?(\w+)\((([\"A-Za-z:\]\[\{\}0-9,\- ]*)*)\)/;

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

async function decorateFunctionCall(currentEditor: vscode.TextEditor, documentCache: any, decArray: vscode.DecorationOptions[], fc: functionCallObject): Promise<void> {
  let document: vscode.TextDocument;

  if (fc === undefined || fc.definitionLocation === undefined) return;

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

  let defObj = {
    call: fc.functionName,
    defFile: fc.definitionLocation.uri.toJSON(),
    defLine: document.lineAt(fc.definitionLocation.range.start.line).text
  };

  // regex to search for function call arguments. Regex found at https://stackoverflow.com/a/13952890
  let paramRegex = /\( *([^)]+?) *\)/;

  let definitionParamRegexMatches = defObj.defLine.match(paramRegex);

  if (definitionParamRegexMatches) {
    if (fc.functionRange === undefined) return;

    let paramList = definitionParamRegexMatches[1].split(/\s*,\s*/);

    paramList = paramList.map(param => {
      // Extract identifiers
      let identifiers = param.match(/([a-zA-Z0-9]+):?/);

      if (identifiers && identifiers.length > 1) {
        return identifiers[1];
      }
      return "";
    }).filter(param => param !== "");

    let functionCallLine = currentEditor.document.lineAt(fc.lineNumber).text;

    // If the line that is extracted is a function definition rather than call, continue on without doing anything
    if (functionCallLine.includes('function ')) return;

    // Matches for arguments
    let functionCallArgumentsMatches = functionCallLine.match(paramRegex);

    if (functionCallArgumentsMatches) {
      let argList = functionCallArgumentsMatches[1].split(/\s*,\s*/);

      let lineNum = fc.lineNumber;

      for (let idx in argList) {
        let startPos = functionCallLine.indexOf(argList[idx]);
        let endPos = startPos + argList[idx].length

        // Location where the annotation will be placed before
        let paramRange = new vscode.Range(
          new vscode.Position(lineNum, startPos),
          new vscode.Position(lineNum, endPos)
        );

        let decoration = Annotations.paramAnnotation(paramList[idx] + ": ", paramRange);
        decArray.push(decoration);
      }
    }
  }
}