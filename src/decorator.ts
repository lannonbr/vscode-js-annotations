import * as vscode from "vscode";
import { Annotations } from "./annotationProvider";
import { IFunctionCallObject } from "./functionCallObject";

export async function decorateFunctionCall(currentEditor: vscode.TextEditor, documentCache: any, decArray, errDecArray: vscode.DecorationOptions[], fc: IFunctionCallObject, diagnostics: vscode.Diagnostic[]): Promise<void> {
  // Check for existence of functionCallObject and a defintion location
  if (fc === undefined || fc.definitionLocation === undefined) {
    return;
  }

  // config option to hide annotations if param and arg names match
  const hideIfEqual = vscode.workspace.getConfiguration("jsannotations").get("hideIfEqual");

  const document = await loadDefinitionDocument(fc, documentCache);
  const definitionLine = document.lineAt(fc.definitionLocation.range.start.line).text;

  const paramList = grabPossibleParameters(fc, definitionLine);

  if (paramList.length > 0) {
    const functionCallLine = currentEditor.document.lineAt(fc.lineNumber).text;

    if (shouldntBeDecorated(paramList, fc, functionCallLine, definitionLine)) {
      return;
    }

    // Look to see if a param is a rest parameter (ex: console.log has a rest parameter called ...optionalParams)
    const restParamIdx = paramList.findIndex((item) => item.substr(0, 3) === "...");

    // If it exists, remove the triple dots at the beginning
    if (restParamIdx !== -1) {
      paramList[restParamIdx] = paramList[restParamIdx].slice(3);
    }

    if (fc.paramLocations && fc.paramNames) {
      for (const ix in fc.paramLocations) {
        if (fc.paramLocations.hasOwnProperty(ix)) {
          const idx = parseInt(ix, 10);

          // skip when arg and param match and hideIfEqual config is on
          if (hideIfEqual && fc.paramNames[idx] === paramList[idx]) {
            continue;
          }

          let decoration: vscode.DecorationOptions;

          const currentArgRange = fc.paramLocations[idx];

          if (restParamIdx !== -1 && idx >= restParamIdx) {
            decoration = Annotations.paramAnnotation(paramList[restParamIdx] + `[${idx - restParamIdx}]: `, currentArgRange);
          } else {
            if (idx >= paramList.length) {
              if (currentEditor.document.languageId === "javascript" && vscode.workspace.getConfiguration("jsannotations").get("hideDiagnostics") === false) {
                const diag = new vscode.Diagnostic(currentArgRange, "[JS Param Annotations] Invalid parameter", vscode.DiagnosticSeverity.Error);
                diagnostics.push(diag);
              }

              if (vscode.workspace.getConfiguration("jsannotations").get("hideInvalidAnnotation") === false) {
                const errorDecoration = Annotations.errorParamAnnotation(currentArgRange);
                errDecArray.push(errorDecoration);
              }

              continue;
            }
            decoration = Annotations.paramAnnotation(paramList[idx] + ": ", currentArgRange);
          }

          decArray.push(decoration);
        }
      }
    }
  }
}

async function loadDefinitionDocument(fc: IFunctionCallObject, documentCache: any) {
  let document: vscode.TextDocument;

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

  return document;
}

function grabPossibleParameters(fc: IFunctionCallObject, definitionLine: string): string[] {
  let paramList: string[] = [];

  // Grab any params inside the definition line
  const defintionParam = grabDefLineParams(definitionLine);

  if (defintionParam !== "") {
    if (fc.functionRange === undefined) {
      return;
    }

    paramList = defintionParam.split(/\s*,\s*/);

    paramList = squishGenerics(paramList);

    paramList = paramList.map((param) => {
      // Extract identifiers

      const words = param.trim().split(" ");

      // If there are multiple words and the first word doesn't end with a colon, use the 2nd word as the param
      // this will make sure the param name is used and not the access modifier in TS functions
      if (words.length > 1 && !words[0].endsWith(":")) {
        param = words[1];
      }

      const identifiers = param.match(/([\.a-zA-Z0-9]+):?/);

      if (identifiers && identifiers.length > 1) {
        return identifiers[1];
      }
      return "";
    }).filter((param) => param !== "");
  }

  return paramList;
}

// This function will cycle through all of the current strings split by a comma, and combine strings that were of generic types and split incorrectly
function squishGenerics(paramList: string[]): string[] {
  const newParamList = [];

  let currentStr = "";
  let numToGet = 1; // Always grab 1 string at the beginning

  for (const item of paramList) {
     currentStr += item;
     numToGet--;

     // If numToGet is zero, check the difference between '<' and '>' characters
     if (numToGet === 0) {
       const numOfLeftBrackets = currentStr.split("<").length - 1;
       const numOfRightBrackets = currentStr.split(">").length - 1;
       const numOfEqualSigns = currentStr.split("=").length - 1;

       // Diff is |num of left brackets ('<') minus the num of solo right brackets (which is the number of '>' minus the num of '=' signs)|
       const diff = Math.abs(numOfLeftBrackets - (numOfRightBrackets - numOfEqualSigns));

       if ((numOfEqualSigns > 0) || diff === 0) {
        // If the difference is zero, we have a full param, push it to the new params, and start over at the next string
        // Also, do this if there is equal signs in the params which exist with arrow functions.
         newParamList.push(currentStr);
         currentStr = "";
         numToGet = 1;
       } else {
         // Otherwise, set the number of strings to grab to the diff
         numToGet = diff;
       }
     }
  }

  return newParamList;
}

function grabDefLineParams(definitionLine: string): string {
  let startIdx;
  let endIdx;

  startIdx = definitionLine.indexOf("(");

  if (startIdx === -1) {
    return "";
  } else {
    startIdx++;
  }

  let depth = 1;

  for (let i = startIdx; i < definitionLine.length; i++) {
    if (definitionLine[i] === "(") {
      depth++;
    } else if (definitionLine[i] === ")") {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (endIdx === undefined) {
    return "";
  }

  return definitionLine.substring(startIdx, endIdx);
}

function shouldntBeDecorated(paramList: string[], functionCall: IFunctionCallObject, functionCallLine: string, definitionLine: string): boolean {
  // If the functionName is one of the parameters, don't decorate it
  if (paramList.some((param) => param === functionCall.functionName)) {
    return true;
  }

  // If the line that is extracted is a function definition rather than call, continue on without doing anything
  if (functionCallLine.includes("function ")) {
    return true;
  }

  // Don't decorate if the definition is inside a for loop
  if (definitionLine.includes("for (") || definitionLine.includes("for (")) {
    return true;
  }

  return false;
}
