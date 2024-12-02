import { window } from "vscode";
import { Config } from "../configs/config";

export class TerminalController {
    constructor(private readonly config: Config) { }
}

export const runCommand = async (
    title: string,
    command: string,
): Promise<void> => {
    const terminal = window.createTerminal(title);
    terminal.show();
    terminal.sendText(command);
};