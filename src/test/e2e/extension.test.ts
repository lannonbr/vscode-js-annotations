import * as assert from "assert";
import * as path from "path";
import * as vscode from "vscode";
import * as Extension from "../../extension";

const testFolderLocation = "/../../../src/test/examples/";

suite("js annotations", () => {
  test("should annotate function with parameters", async () => {
    const uri = vscode.Uri.file(path.join(__dirname + testFolderLocation + "normalParams.js"));
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    await sleep(500);
    const [decArray, errDecArray] = await Extension.createDecorations(editor, editor.document.getText());

    assert.deepEqual(decArray.length, 1);
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("should not annotate function with no parameters", async () => {
    const uri = vscode.Uri.file(path.join(__dirname + testFolderLocation + "noParams.js"));
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    await sleep(500);
    const [decArray, errDecArray] = await Extension.createDecorations(editor, editor.document.getText());

    assert.deepEqual(decArray.length, 0);
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("should decorate with error decoration if more args than params", async () => {
    const uri = vscode.Uri.file(path.join(__dirname + testFolderLocation + "moreArgs.js"));
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    await sleep(500);
    const [decArray, errDecArray] = await Extension.createDecorations(editor, editor.document.getText());

    assert.deepEqual(decArray.length, 1);

    // By Default the error decoration is hidden with the diagnostic in it's place
    // TODO: Check for diagnostic
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("should decorate with rest params", async () => {
    const uri = vscode.Uri.file(path.join(__dirname + testFolderLocation + "rest.js"));
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    await sleep(500);
    const [decArray, errDecArray] = await Extension.createDecorations(editor, editor.document.getText());

    assert.deepEqual(decArray.length, 3);
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("should decorate function call with multiple lines", async () => {
    const uri = vscode.Uri.file(path.join(__dirname + testFolderLocation + "multipleLines.js"));
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    await sleep(500);
    const [decArray, errDecArray] = await Extension.createDecorations(editor, editor.document.getText());

    assert.deepEqual(decArray.length, 2);
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("should decorate with nested function calls", async () => {
    const uri = vscode.Uri.file(path.join(__dirname + testFolderLocation + "nested.ts"));
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    await sleep(500);
    const [decArray, errDecArray] = await Extension.createDecorations(editor, editor.document.getText());

    assert.deepEqual(decArray.length, 6);
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("should not annotate with call that has no definition", async () => {
    const uri = vscode.Uri.file(path.join(__dirname + testFolderLocation + "noDefinition.js"));
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    await sleep(500);
    const [decArray, errDecArray] = await Extension.createDecorations(editor, editor.document.getText());

    assert.deepEqual(decArray.length, 0);
    assert.deepEqual(errDecArray.length, 0);

    vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
