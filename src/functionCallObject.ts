import { Range, Location } from 'vscode';

export default interface functionCallObject {
    functionName: string;
    lineNumber: number;
    functionRange?: Range;
    paramLocations?: Range[];
    definitionLocation?: Location
}