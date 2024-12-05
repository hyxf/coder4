import * as vscode from 'vscode';

export const EXTENSION_ID = "coder4";

/**
 * scope list
 * @returns 
 */
export async function scopeList(): Promise<string[]> {

    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(EXTENSION_ID);
    
    return config.get<string[]>('snippet.scope') ?? ["none"];
}