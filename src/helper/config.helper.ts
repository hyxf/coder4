import * as vscode from 'vscode';

export const EXTENSION_ID = "coder4";

export async function scopeList(key: string, defaultValue: string): Promise<string> {
    let scopeList: string[] = [];

    let resource:
        | vscode.Uri
        | vscode.TextDocument
        | vscode.WorkspaceFolder
        | undefined;

    if (vscode.workspace.workspaceFolders) {
        resource = vscode.workspace.workspaceFolders[0];
    }

    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(EXTENSION_ID, resource);

    return config.get<string>('files.extension') ?? defaultValue;
}