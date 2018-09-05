import * as testRunner from "vscode/lib/testrunner";

testRunner.configure({
    timeout: 10000,
    ui: "tdd",
    useColors: true
});

module.exports = testRunner;
