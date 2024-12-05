import { window } from 'vscode';

/**
 * run command
 * @param title 
 * @param command 
 */
export const runCommand = async (
    title: string,
    command: string,
): Promise<void> => {
    const terminal = window.createTerminal(title);
    terminal.show();
    terminal.sendText(command);
};