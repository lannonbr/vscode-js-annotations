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
  } else if (editor.document.languageId === "javascriptreact") {
    options.parser = require("recast/parsers/babel");
  } else if (editor.document.languageId === "typescriptreact") {
    options.parser = {
      parse(source) {
        const babelParser = require("recast/parsers/babel").parser;
        const opts = {
          allowImportExportEverywhere: true,
          allowReturnOutsideFunction: true,
          plugins: [
            "asyncGenerators",
            "bigInt",
            "classPrivateMethods",
            "classPrivateProperties",
            "classProperties",
            "decorators-legacy",
            "doExpressions",
            "dynamicImport",
            "exportDefaultFrom",
            "exportExtensions",
            "exportNamespaceFrom",
            "functionBind",
            "functionSent",
            "importMeta",
            "nullishCoalescingOperator",
            "numericSeparator",
            "objectRestSpread",
            "optionalCatchBinding",
            "optionalChaining",
            ["pipelineOperator", { proposal: "minimal" }],
            "throwExpressions",
            "typescript",
            "jsx"
          ],
          sourceType: "unambiguous",
          startLine: 1,
          strictMode: false,
          tokens: true
        };

        return babelParser.parse(source, opts);
      }
    };
  }

  sourceCode = removeShebang(sourceCode);

  let ast;

  try {
    ast = recast.parse(sourceCode, options);
  } catch (err) {
    console.log(err.message);
  }

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
    // Loop through all keys in the current node
    for (const key in astNode) {
      if (astNode.hasOwnProperty(key)) {
        const item = astNode[key];

        if (item === undefined || item === null) {
          continue;
        }

        if (Array.isArray(item)) {
          // If the current node is an array of nodes, loop through each
          item.forEach((subItem) => nodeArr = getNodes(subItem, nodeArr));
        } else if (item.loc !== undefined) {
          // If is a proper node and has a location in the source, push it into the array and recurse on that for nodes inside this node
          nodeArr.push(item);
          nodeArr = getNodes(item, nodeArr);
        }
      }
    }

    return nodeArr;
  }

  arr = getNodes(body, arr);

  const nodes = arr.filter((node) => node.type === "CallExpression" || node.type === "NewExpression");

  const calls = [];

  nodes.forEach((node) => {
    if (node.type === "NewExpression") {
      calls.push(node, ...node.arguments);
    } else {
      calls.push(node);
    }
  });

  for (const call of calls) {
    if (call.callee && call.callee.loc) {

      let startArr;
      let endArr;

      if (call.callee.type === "MemberExpression" && call.callee.property.loc) {
        const { start, end } = call.callee.property.loc;

        startArr = [start.line - 1, start.column];
        endArr = [end.line - 1, end.column];
      } else if (call.callee.type === "CallExpression") {
        const { start, end } = call.callee.arguments[0].loc;

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
        calleeCallee: call.callee.type === "CallExpression",
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

      // TSTypeAssertions are off by one for some reason so subtract the column by one.
      if (arg.type === "TSTypeAssertion") {
        startArr[1] -= 1;
      }

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
        if (arg.object.name !== undefined) {
          // Single depth access & array
          paramNamesArr.push(arg.object.name);
        } else {
          // multi-depth access
          paramNamesArr.push(arg.property.name);
        }
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

      if (locations !== undefined && locations.length > 0) {
        // If one location, only return if it has some function definition of some sort
        if (locations.length === 1) {
          const document = await vscode.workspace.openTextDocument(locations[0].uri);
          let line;

          if (fc.calleeCallee) {
            const text = document.getText().split("\n");

            let num;
            for (num = 0; num < text.length; num++) {
              if (text[num].includes("module.exports") && (text[num].includes("=>") || text[num].includes("function"))) {
                line = document.lineAt(num).text;
                break;
              }
            }

            const defLocation = new vscode.Location(locations[0].uri, new vscode.Position(num, 0));
            fc.definitionLocation = defLocation;
            continue;
          } else {
            line = document.lineAt(locations[0].range.start).text;
          }

          if (line.includes("constructor")) {
            fc.definitionLocation = locations[0];
            continue;
          }

          if (line.includes("function ") || line.includes("=>") || (line.includes("(") && line.includes(")") && !line.includes("require"))) {
            fc.definitionLocation = locations[0];
          }
          continue;
        }

        // Otherwise, look through each location and find one with a function definition
        for (const location of locations) {
          const document = await vscode.workspace.openTextDocument(location.uri);
          const line = document.lineAt(location.range.start).text;

          if (line.includes("constructor")) {
            fc.definitionLocation = locations[0];
            break;
          }

          if (line.includes("function ") || line.includes("=>") || (line.includes("(") && line.includes(")") && !line.includes("require"))) {
            fc.definitionLocation = location;
            break;
          }
        }
      }
    }

    resolve(fcArray);
  });
}
