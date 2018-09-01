
import * as recast from "recast";
import * as vscode from "vscode";
import { Annotations } from "./annotationProvider";
import Commands from "./commands";
import { IFunctionCallObject } from "./functionCallObject";

const decType = vscode.window.createTextEditorDecorationType({});

export function activate(context: vscode.ExtensionContext) {
  console.log("extension is now active!");

  // Update when a file opens
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    decorateEditor(editor).catch(console.log);
  });

  // Update when a file saves
  vscode.workspace.onWillSaveTextDocument((event) => {
    const openEditor = vscode.window.visibleTextEditors.filter((editor) => editor.document.uri === event.document.uri)[0];

    decorateEditor(openEditor).catch(console.log);
  });

  // Update if the config was changed
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("jsannotations")) {
      decorateEditor(vscode.window.activeTextEditor);
    }
  });

  Commands.registerCommands();
}

export function deactivate() {
  console.log("DONE");
}

async function decorateEditor(editor: vscode.TextEditor | undefined): Promise<void> {
  if (!editor) {
    return;
  }

  if (!(editor.document.languageId === "javascript" || editor.document.languageId === "typescript")) {
    return;
  }

  const enabled = vscode.workspace.getConfiguration("jsannotations").get("enabled");

  if (!enabled) {
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

function getFunctionCalls(sourceCode: string, editor: vscode.TextEditor): IFunctionCallObject[] {
  let fcArray: IFunctionCallObject[] = [];

  const options = { parser: null };

  if (editor.document.languageId === "javascript") {
    options.parser = require("recast/parsers/esprima");
  } else if (editor.document.languageId === "typescript") {
    options.parser = require("recast/parsers/typescript");
  }

  const tabSize = editor.options.tabSize as number;

  // Removing shebangs in source code
  const sourceCodeArr = sourceCode.split("\n");
  if (sourceCodeArr[0].substr(0, 2) === "#!") {
    sourceCodeArr[0] = "";
  }
  sourceCode = sourceCodeArr.join("\n");

  const ast = recast.parse(sourceCode, options);

  fcArray = lookForFunctionCalls(editor, fcArray, ast.program.body, tabSize);

  return fcArray;
}

function lookForFunctionCalls(editor: vscode.TextEditor, fcArray: IFunctionCallObject[], body: any, tabSize: number): IFunctionCallObject[] {
  let arr = [];

  function getNodes(astNode, nodeArr) {
    for (const key in astNode) {
      if (astNode.hasOwnProperty(key)) {
        const item = astNode[key];

        if (item !== undefined && item !== null && typeof item !== "string" && typeof item !== "function" && item.length !== undefined) {
          for (const subItem of item) {
            nodeArr = getNodes(subItem, nodeArr);
          }
        } else if (item !== undefined && item !== null && item.loc !== undefined) {
          nodeArr.push(item);
          nodeArr = getNodes(item, nodeArr);
        }
      }
    }

    return arr;
  }

  arr = getNodes(body, arr);

  arr = arr.filter((node) => {
    return node.type === "CallExpression";
  });

  for (const node of arr) {
    if (node.callee && node.callee.loc) {

      let startArr;
      let endArr;

      if (node.callee.type === "MemberExpression" && node.callee.property.loc) {
        const propLoc = node.callee.property.loc;

        startArr = [propLoc.start.line - 1, propLoc.start.column];
        endArr = [propLoc.end.line - 1, propLoc.end.column];
      } else {
        const calleeLoc = node.callee.loc;

        startArr = [calleeLoc.start.line - 1, calleeLoc.start.column];
        endArr = [calleeLoc.end.line - 1, calleeLoc.end.column];
      }

      const start = new vscode.Position(startArr[0], startArr[1]);
      const end = new vscode.Position(endArr[0], endArr[1]);

      let calleeName;

      if (node.callee.type === "MemberExpression") {
        calleeName = node.callee.property.name;
      } else if (node.callee.type === "Identifier") {
        calleeName = node.callee.name;
      }

      const newFunctionCallObject: IFunctionCallObject = {
        functionName: calleeName,
        functionRange: new vscode.Range(start, end),
        lineNumber: start.line
      };

      const paramLocationsArr: vscode.Range[] = [];
      const paramNamesArr: string[] = [];

      if (node.arguments) {
        node.arguments.forEach((arg) => {
          if (arg.loc) {
            startArr = [arg.loc.start.line - 1, arg.loc.start.column];
            endArr = [arg.loc.end.line - 1, arg.loc.end.column];

            const line = editor.document.lineAt(startArr[0]);

            let offset;

            if (editor.options.insertSpaces) {
              offset = 0;
            } else {
              offset = line.firstNonWhitespaceCharacterIndex * 3;
            }

            const argRange = new vscode.Range(
              new vscode.Position(startArr[0], startArr[1] - offset),
              new vscode.Position(endArr[0], endArr[1] - offset)
            );

            if (arg.value) {
              paramNamesArr.push(arg.value);
            } else {
              paramNamesArr.push(arg.name);
            }

            paramLocationsArr.push(argRange);
          }
        });

        newFunctionCallObject.paramLocations = paramLocationsArr;
        newFunctionCallObject.paramNames = paramNamesArr;
      }

      fcArray.push(newFunctionCallObject);
    }
  }

  return fcArray;
}

async function getDefinitions(fcArray: IFunctionCallObject[], uri: vscode.Uri): Promise<IFunctionCallObject[]> {
  return new Promise<IFunctionCallObject[]>(async (resolve) => {
    for (const fc of fcArray) {
      if (fc.functionRange === undefined) {
        continue;
      }

      // grab an array of locations for the definitions of a function call
      const locations = await vscode.commands.executeCommand<vscode.Location[]>("vscode.executeDefinitionProvider", uri, fc.functionRange.start);

      // If it exists, set the definitionLocation to the first result
      if (locations !== undefined && locations.length > 0) {
        fc.definitionLocation = locations[0];
      }
    }

    resolve(fcArray);
  });

}

async function decorateFunctionCall(currentEditor: vscode.TextEditor, documentCache: any, decArray: vscode.DecorationOptions[], fc: IFunctionCallObject): Promise<void> {
  let document: vscode.TextDocument;

  if (fc === undefined || fc.definitionLocation === undefined) {
    return;
  }

  // config option to hide annotations if param and arg names match
  const hideIfEqual = vscode.workspace.getConfiguration("jsannotations").get("hideIfEqual");

  // Currently index documentCache by the filename (TODO: Figure out better index later)
  const pathNameArr = fc.definitionLocation.uri.fsPath.split("/");
  const pathName = pathNameArr[pathNameArr.length - 1];

  // If the document is not present in the cache, load it from the filesystem, otherwise grab from the cache
  if (documentCache[pathName] === undefined) {
    document = await vscode.workspace.openTextDocument(fc.definitionLocation.uri);
    documentCache[pathName] = document;
  } else {
    document = documentCache[pathName];
  }

  const defObj = {
    defFile: fc.definitionLocation.uri.toJSON(),
    defLine: document.lineAt(fc.definitionLocation.range.start.line).text
  };

  // regex to search for function call arguments. Regex found at https://stackoverflow.com/a/13952890
  const paramRegex = /\( *([^)]+?) *\)/;

  const definitionParamRegexMatches = defObj.defLine.match(paramRegex);

  if (definitionParamRegexMatches) {
    if (fc.functionRange === undefined) {
      return;
    }

    let paramList = definitionParamRegexMatches[1].split(/\s*,\s*/);

    paramList = paramList.map((param) => {
      // Extract identifiers
      const identifiers = param.match(/([\.a-zA-Z0-9]+):?/);

      if (identifiers && identifiers.length > 1) {
        return identifiers[1];
      }
      return "";
    }).filter((param) => param !== "");

    const possibleSpread = paramList.findIndex((item) => item.substr(0, 3) === "...");

    if (possibleSpread !== -1) {
      paramList[possibleSpread] = paramList[possibleSpread].slice(3);
    }

    // If the functionName is one of the parameters, don't decorate it
    if (paramList.some((param) => param === fc.functionName)) {
      return;
    }

    const functionCallLine = currentEditor.document.lineAt(fc.lineNumber).text;

    // If the line that is extracted is a function definition rather than call, continue on without doing anything
    if (functionCallLine.includes("function ")) {
      return;
    }

    // Don't decorate if the definition is inside a for loop
    if (defObj.defLine.includes("for (") || defObj.defLine.includes("for (")) {
      return;
    }

    if (fc.paramLocations && fc.paramNames) {
      for (const ix in fc.paramLocations) {
        if (fc.paramLocations.hasOwnProperty(ix)) {
          const idx = parseInt(ix, 10);

          if (hideIfEqual && fc.paramNames[idx] === paramList[idx]) {
            continue;
          }

          let decoration;

          if (possibleSpread !== -1 && idx >= possibleSpread) {
            decoration = Annotations.paramAnnotation(paramList[possibleSpread] + `[${idx - possibleSpread}]: `, fc.paramLocations[idx]);
          } else {
            decoration = Annotations.paramAnnotation(paramList[idx] + ": ", fc.paramLocations[idx]);
          }

          decArray.push(decoration);
        }
      }
    }
  }
}
