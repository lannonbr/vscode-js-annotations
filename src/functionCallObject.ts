import { Range, Location } from 'vscode';

export default interface functionCallObject {
    lineNumber: number;
    functionRange?: Range;
    paramLocations?: Range[];
    definitionLocation?: Location
}