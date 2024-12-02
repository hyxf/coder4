import { WorkspaceConfiguration } from "vscode";

export const EXTENSION_ID: string = 'coder4';

export const EXTENSION: string = 'py';

export class Config {
    extension: string;
    constructor(readonly config: WorkspaceConfiguration) {
        this.extension = config.get<string>('files.extension') ?? EXTENSION;
    }
}