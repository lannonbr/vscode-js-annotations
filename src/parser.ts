import * as recast from "recast";
import * as vscode from "vscode";
import { IFunctionCallObject } from "./functionCallObject";

export function getFunctionCalls(sourceCode: string, editor: vscode.TextEditor): IFunctionCallObject[] {
  let fcArray: IFunctionCallObject[] = [];

  const options = { parser: null };

  if (editor.document.languageId === "javascript") {
    options.parser = require("recast/parsers/esprima");
  } else if (editor.document.languageId === "typescript") {
    options.parser = require("recast/parsers/typescript");
  }

  sourceCode = removeShebang(sourceCode);

  const ast = recast.parse(sourceCode, options);

  fcArray = lookForFunctionCalls(editor, fcArray, ast.program.body);

  return fcArray;
}

function removeShebang(sourceCode: string): string {
  const sourceCodeArr = sourceCode.split("\n");
  if (sourceCodeArr[0].substr(0, 2) === "#!") {
      sourceCodeArr[0] = "";
  }
  return sourceCodeArr.join("\n");
}

function lookForFunctionCalls(editor: vscode.TextEditor, fcArray: IFunctionCallObject[], body: any): IFunctionCallObject[] {
  let arr = [];

  function getNodes(astNode, nodeArr) {
    for (const key in astNode) {
      if (astNode.hasOwnProperty(key)) {
        const item = astNode[key];

        if (item !== undefined && item !== null && typeof item !== "string" && typeof item !== "function" && item.length !== undefined) {
          item.forEach((subItem) => nodeArr = getNodes(subItem, nodeArr));
        } else if (item !== undefined && item !== null && item.loc !== undefined) {
          nodeArr.push(item);
          nodeArr = getNodes(item, nodeArr);
        }
      }
    }

    return arr;
  }

  arr = getNodes(body, arr);

  const calls = arr.filter((node) => node.type === "CallExpression");

  for (const call of calls) {
    if (call.callee && call.callee.loc) {

      let startArr;
      let endArr;

      if (call.callee.type === "MemberExpression" && call.callee.property.loc) {
        const { start, end } = call.callee.property.loc;

        startArr = [start.line - 1, start.column];
        endArr = [end.line - 1, end.column];
      } else {
        const { start, end } = call.callee.loc;

        startArr = [start.line - 1, start.column];
        endArr = [end.line - 1, end.column];
      }

      const startPos = new vscode.Position(startArr[0], startArr[1]);
      const endPos = new vscode.Position(endArr[0], endArr[1]);

      let calleeName;

      if (call.callee.type === "MemberExpression") {
        calleeName = call.callee.property.name;
      } else if (call.callee.type === "Identifier") {
        calleeName = call.callee.name;
      }

      const newFunctionCallObject: IFunctionCallObject = {
        functionName: calleeName,
        functionRange: new vscode.Range(startPos, endPos),
        lineNumber: startPos.line
      };

      if (call.arguments) {
        const paramObj = parseParams(call.arguments, editor);

        newFunctionCallObject.paramLocations = paramObj.paramLocationsArr;
        newFunctionCallObject.paramNames = paramObj.paramNamesArr;
      }

      fcArray.push(newFunctionCallObject);
    }
  }

  return fcArray;
}

function parseParams(args: any, editor: vscode.TextEditor): any {
  const paramLocationsArr: vscode.Range[] = [];
  const paramNamesArr: string[] = [];

  args.forEach((arg) => {
    if (arg.loc) {
      const { start, end } = arg.loc;

      const startArr = [start.line - 1, start.column];
      const endArr = [end.line - 1, end.column];

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

      if (arg.type === "MemberExpression") {
        // Array access and item access (foo.bar, baz[3])
        paramNamesArr.push(arg.object.name);
      } else if (arg.value !== undefined) {
        // Literals (false, 4, "foobar")
        paramNamesArr.push(arg.value);
      } else {
        // variables (isTrue, str)
        paramNamesArr.push(arg.name);
      }

      paramLocationsArr.push(argRange);
    }
  });

  return { paramLocationsArr, paramNamesArr };
}

export async function getDefinitions(fcArray: IFunctionCallObject[], uri: vscode.Uri): Promise<IFunctionCallObject[]> {
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
