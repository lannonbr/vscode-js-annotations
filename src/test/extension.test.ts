import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import * as Extension from "../extension";

suite("js annotations", () => {
  test("should annotate", async () => {
    const decArrayMock: vscode.DecorationOptions[] = [{
      range: new vscode.Range(
        new vscode.Position(0, 36),
        new vscode.Position(0, 41)
      ),
      renderOptions: {
        before: {
          color: {
            id: "jsannotations.annotationForeground"
          },
          contentText: "elementId: ",
          fontStyle: "italic",
          fontWeight: "400"
        }
      }
    }];
    const errDecArrayMock: vscode.DecorationOptions[] = [];

    const uri = vscode.Uri.file(path.join(__dirname + "/../../src/test/test.js"));
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    await sleep(500);
    const [decArray, errDecArray] = await Extension.createDecorations(editor, editor.document.getText());

    assert.deepEqual(decArray, decArrayMock);
    assert.deepEqual(errDecArray, errDecArrayMock);
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
