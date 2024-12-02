import { WorkspaceConfiguration } from "vscode";

export const EXTENSION: string = 'py';

export class Config {
    extension: string;
    constructor(readonly config: WorkspaceConfiguration) {
        this.extension = config.get<string>('coder4.files.extension') ?? EXTENSION;
    }
}