import { WorkspaceConfiguration } from "vscode";
import { EXTENSION } from "./constants";

export class Config {
    extension: string;
    constructor(readonly config: WorkspaceConfiguration) {
        this.extension = config.get<string>('coder4.files.extension') ?? EXTENSION;
    }
}