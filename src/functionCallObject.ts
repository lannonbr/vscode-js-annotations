import { Location, Range } from "vscode";

export interface IFunctionCallObject {
    functionName: string;
    lineNumber: number;
    functionRange?: Range;
    paramNames?: string[];
    paramLocations?: Range[];
    definitionLocation?: Location;
}
