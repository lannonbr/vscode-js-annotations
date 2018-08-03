import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "vscode-js-named-params-annotations" is now active!'
  );

  let disposable = vscode.commands.registerCommand("extension.sayHello", () => {
    vscode.window.showInformationMessage("Hello World!");
  });

  decorate();

  context.subscriptions.push(disposable);
}

async function decorate(): Promise<void> {
  // const editors = vscode.window.visibleTextEditors.filter(
  //   editor => editor.document.languageId === "javascript"
  // );

  const editors = [vscode.window.activeTextEditor];

  let linesArr: functionCallObject[] = [];

  for (let editor of editors) {
    if (!editor) {
      return;
    }
    let sourceCode = editor.document.getText();

    // let regex = /(?:(\.)|(\w+\.))?(\w+)\((([A-Za-z\]\[\{\}0-9]*,? ?)*)\)/gm;

    let regex = /(\w+)?(\.)?(\w+)\((([\"A-Za-z\]\[\{\}0-9, ]*)*)\)/;

    let sourceCodeArr = sourceCode.split("\n");
    let sourceCodeArrLength = sourceCodeArr.length;

    for (let i = 0; i < sourceCodeArrLength; i++) {
      let arr = sourceCodeArr[i].match(regex);

      if (arr) {
        // console.log(arr.index);
        // console.log(arr);
        // console.log(sourceCodeArr[i]);

        if (arr.index) {
          let range = editor.document.getWordRangeAtPosition(
            new vscode.Position(
              i,
              arr.index +
              (arr[1] ? arr[1].length : 0) +
              (arr[2] ? arr[2].length : 0)
            )
          );
          // console.log(range, arr);

          // console.log(
          //   `Code at L${i}, C${arr.index}: ${editor.document.getText(range)}`
          // );

          let newfuncObj = {
            lineNumber: i,
            fullMatch: arr,
            functionCaller: arr[1] ? arr[1] : undefined,
            functionName: arr[3],
            functionRange: range,
            params: arr[4] ? arr[4].split(",") : undefined
          };

          linesArr.push(newfuncObj);
        }
      }
    }

    for (let line of linesArr) {
      console.log("newFuncObj");
      console.log(line);

      if (line.functionRange) {
        let uri = editor.document.uri;

        await vscode.commands.executeCommand("vscode.executeDefinitionProvider", uri, line.functionRange.start)
          .then(succ => {
            let loc = succ as vscode.Location[];
            if (loc && loc.length > 0) {
              vscode.workspace.openTextDocument(loc[0].uri).then(document => {
                console.log(document.fileName);
                let str = document.getText(new vscode.Range(new vscode.Position(loc[0].range.start.line, 0), new vscode.Position(loc[0].range.start.line, 500)));
                console.log(str);
              })
            }
          },
            err => console.log("ERR", err)
          );
      }
    }
  }
}

interface functionCallObject {
  lineNumber: number;
  fullMatch: RegExpMatchArray;
  functionCaller?: string;
  functionName: string;
  params?: string[];
  functionRange?: vscode.Range;
}

export function deactivate() { }
