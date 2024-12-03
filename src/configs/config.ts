import { WorkspaceConfiguration } from "vscode";

export const EXTENSION_ID: string = 'coder4';

export const EXTENSION: string = 'py';
export const TAB_SIZE: number = 4;

export class Config {
    extension: string;
    tabSize: number;
    constructor(readonly config: WorkspaceConfiguration) {
        this.extension = config.get<string>('files.extension') ?? EXTENSION;
        this.tabSize = config.get<number>('tabSize') ?? TAB_SIZE;
    }
}