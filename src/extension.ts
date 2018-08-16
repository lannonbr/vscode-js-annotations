import * as vscode from "vscode";
import functionCallObject from './functionCallObject';
import { Annotations } from './annotationProvider';
import { parseScript } from 'esprima';

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

  console.log(fcArray)

  // filter down to function calls which actually have a definition
  let callsWithDefinitions = fcArray.filter(item => item.definitionLocation !== undefined);

  for (let fc of callsWithDefinitions) {
    await decorateFunctionCall(editor, documentCache, decArray, fc);
  }

  console.log(decArray);

  editor.setDecorations(decType, decArray);
}

function getFunctionCalls(sourceCode: string, editor: vscode.TextEditor): functionCallObject[] {
  let fcArray: functionCallObject[] = [];

  parseScript(sourceCode, {
    loc: true
  }, function (node) {
    if (node !== null && node !== undefined && node.type === 'CallExpression') {
      if (node.callee && node.callee.loc) {

        console.log(node)

        let startArr
        let endArr

        if (node.callee.type === "MemberExpression" && node.callee.property.loc) {
          let propLoc = node.callee.property.loc;

          startArr = [propLoc.start.line-1, propLoc.start.column];
          endArr = [propLoc.end.line-1, propLoc.end.column];
        } else {
          let calleeLoc = node.callee.loc;

          startArr = [calleeLoc.start.line-1, calleeLoc.start.column];
          endArr = [calleeLoc.end.line-1, calleeLoc.end.column];
        }

        let start = new vscode.Position(startArr[0], startArr[1]);
        let end = new vscode.Position(endArr[0], endArr[1]);

        let newFunctionCallObject: functionCallObject = {
          lineNumber: start.line,
          functionRange: new vscode.Range(start, end)
        }

        let paramLocationsArr: vscode.Range[] = [];

        if (node.arguments) {
          node.arguments.forEach(arg => {
            if (arg.loc) {
              startArr = [arg.loc.start.line-1, arg.loc.start.column];
              endArr = [arg.loc.end.line-1, arg.loc.end.column];

              let argRange = new vscode.Range(
                new vscode.Position(startArr[0], startArr[1]),
                new vscode.Position(endArr[0], endArr[1])
              );

              paramLocationsArr.push(argRange);
            }
          });

          newFunctionCallObject.paramLocations = paramLocationsArr;
        }

        fcArray.push(newFunctionCallObject)
      }
    }
  });

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
        console.log(fc, locations[0])
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

    if (fc.paramLocations) {
      for (let idx in fc.paramLocations) {
        let decoration = Annotations.paramAnnotation(paramList[idx] + ": ", fc.paramLocations[idx]);
        decArray.push(decoration);
      }
    }
  }
}