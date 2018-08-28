import { Range, Location } from 'vscode';

export default interface functionCallObject {
    functionName: string;
    lineNumber: number;
    functionRange?: Range;
    paramNames?: string[];
    paramLocations?: Range[];
    definitionLocation?: Location
}