import { window } from 'vscode';


export const runCommand = async (
    title: string,
    command: string,
): Promise<void> => {
    const terminal = window.createTerminal(title);
    terminal.show();
    terminal.sendText(command);
};