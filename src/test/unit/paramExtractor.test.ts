import * as assert from "assert";
import { splitToParamList } from "../../paramExtractor";

suite("splitToParamList tests", () => {
  test("should properly split simple parameter def with generic type", () => {
    const paramDef = "op1: Opt<T, A>";
    const expectedList = ["op1: Opt<T, A>"];
    const paramList = splitToParamList(paramDef);

    assert.deepEqual(paramList, expectedList);
  });

  test("should properly split parameter def with nested generic type", () => {
    const paramDef = "op1: Opt<T, Test<A, B, C>, D>";
    const expectedList = ["op1: Opt<T, Test<A, B, C>, D>"];
    const paramList = splitToParamList(paramDef);

    assert.deepEqual(paramList, expectedList);
  });

  test("should work with parameter def with arrow functions", () => {
    const paramDef = "fn: (num: number, str: string) => string, opts: any";
    const expectedList = ["fn: (num: number, str: string) => string", "opts: any"];
    const paramList = splitToParamList(paramDef);

    assert.deepEqual(paramList, expectedList);
  });

  test("should work with parameter def with arrow functions and generic return type", () => {
    const paramDef = "fn: (num: number, str: string) => Opt<A, B>, opts: any";
    const expectedList = ["fn: (num: number, str: string) => Opt<A, B>", "opts: any"];
    const paramList = splitToParamList(paramDef);

    assert.deepEqual(paramList, expectedList);
  });

  test("should work with complex parameter def with arrow functions and generic return type", () => {
    const paramDef = "fn: (num: number, strOpt: Opt<A, B, C>) => Opt<A, B>, opts: any";
    const expectedList = ["fn: (num: number, strOpt: Opt<A, B, C>) => Opt<A, B>", "opts: any"];
    const paramList = splitToParamList(paramDef);

    assert.deepEqual(paramList, expectedList);
  });

  test("should be fine with primitive types", () => {
    const paramDef = "str: string, opts: any";
    const expectedList = ["str: string", "opts: any"];
    const paramList = splitToParamList(paramDef);

    assert.deepEqual(paramList, expectedList);
  });

  test("should be fine with rest params", () => {
    const paramDef = "cats: number, ...rest: string[]";
    const expectedList = ["cats: number", "...rest: string[]"];
    const paramList = splitToParamList(paramDef);

    assert.deepEqual(paramList, expectedList);
  });
});
