import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import * as Extension from "../../extension";

const testFolderLocation = "/../../../src/test/examples/";

suite("js annotations", () => {
  test("should annotate function with parameters", async () => {
    const [decArray, errDecArray] = await getDecorationsFromExample("normalParams.js");

    assert.deepEqual(decArray.length, 1);
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("should not annotate function with no parameters", async () => {
    const [decArray, errDecArray] = await getDecorationsFromExample("noParams.js");

    assert.deepEqual(decArray.length, 0);
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("should decorate with error decoration if more args than params", async () => {
    const [decArray, errDecArray] = await getDecorationsFromExample("moreArgs.js");

    assert.deepEqual(decArray.length, 1);
    assert.deepEqual(errDecArray.length, 0);
    assert.deepEqual(Extension.getDiagnostics().length, 1);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("should decorate with rest params", async () => {
    const [decArray, errDecArray] = await getDecorationsFromExample("rest.js");

    assert.deepEqual(decArray.length, 3);
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("should decorate function call with multiple lines", async () => {
    const [decArray, errDecArray] = await getDecorationsFromExample("multipleLines.js");

    assert.deepEqual(decArray.length, 2);
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("should decorate with nested function calls", async () => {
    const [decArray, errDecArray] = await getDecorationsFromExample("nested.ts");

    assert.deepEqual(decArray.length, 6);
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("should not annotate with call that has no definition", async () => {
    const [decArray, errDecArray] = await getDecorationsFromExample("noDefinition.js");

    assert.deepEqual(decArray.length, 0);
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("Should remove `this` from typescript files", async () => {
    const [decArray, errDecArray] = await getDecorationsFromExample("this.ts");

    assert.deepEqual(decArray.length, 1);
    assert.strictEqual(decArray[0].renderOptions.before.contentText, " str: ");
    assert.deepEqual(errDecArray.length, 0);
  });

  test("Should work for JSX files", async () => {
    const [decArray, errDecArray] = await getDecorationsFromExample("react.jsx");
    assert.deepEqual(decArray.length, 1);
    assert.deepEqual(errDecArray.length, 0);
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getDecorationsFromExample(exampleName: string): Promise<vscode.DecorationOptions[][]> {
  const uri = vscode.Uri.file(path.join(__dirname + testFolderLocation + exampleName));
  const document = await vscode.workspace.openTextDocument(uri);
  const editor = await vscode.window.showTextDocument(document);
  await sleep(500);
  const decorations = await Extension.createDecorations(editor, editor.document.getText());

  return decorations;
}
