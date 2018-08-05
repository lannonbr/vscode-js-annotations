import { Range, Location } from 'vscode';

export default interface functionCallObject {
    lineNumber: number;
    fullMatch: RegExpMatchArray;
    functionCaller?: string;
    functionName: string;
    params?: string[];
    functionRange?: Range;
    definitionLocation?: Location
}