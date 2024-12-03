import { env, window } from "vscode";
import { Config } from "../configs/config";

export class DevController {
    constructor(private readonly config: Config) { }

    async generateCodeString(): Promise<void> {
        const editor = window.activeTextEditor;

        if (!editor) {
            window.showErrorMessage('No active text editor');
            return;
        }

        const selection = editor.document.getText(editor.selection);

        if (!selection.length) {
            window.showErrorMessage('No selected text');
            return;
        }

        const tabSize = this.config.tabSize;

        const spaces = new RegExp(` {${tabSize}}`, 'g');

        const snippetString = selection
            .split(/\r?\n/)
            .map(line => line.replace(/\$(?![\d{]|TM_)/g, '\\$').replace(spaces, '\t'))

        env.clipboard.writeText(`${snippetString}`);

        window.showInformationMessage(
            'Code String has been copied into the clipboard',
        );
    }

    async generateSnippet(): Promise<void> {
        const editor = window.activeTextEditor;

        if (!editor) {
            window.showErrorMessage('No active text editor');
            return;
        }

        const selection = editor.document.getText(editor.selection);

        if (!selection.length) {
            window.showErrorMessage('No selected text');
            return;
        }

        const name = await window.showInputBox({
            placeHolder: 'Please enter name (required)',
            validateInput: input => (input ? '' : 'Name is required'),
        });

        if (!name) {
            return;
        }

        const scope = await window.showInputBox({
            placeHolder: 'Please enter scope (optional)',
        });

        if (!scope) {
            return;
        }

        const prefix = await window.showInputBox({
            placeHolder: 'Please enter prefix (required)',
            validateInput: input => (input ? '' : 'Prefix is required'),
        });

        if (!prefix) {
            return;
        }

        const description = await window.showInputBox({
            placeHolder: 'Please enter description (optional)',
        });

        if (!description) {
            return;
        }

        const tabSize = this.config.tabSize;

        const spaces = new RegExp(` {${tabSize}}`, 'g');

        const snippetObj = {
            [name]: {
                ...(scope && { scope }),
                prefix,
                body: selection
                    .split(/\r?\n/)
                    .map(line => line.replace(/\$(?![\d{]|TM_)/g, '\\$').replace(spaces, '\t')),
                ...(description && { description }),
            },
        };

        const snippetJSON = JSON.stringify(snippetObj, null, tabSize)
            .split('\n')
            .slice(1, -1)
            .join('\n');

        env.clipboard.writeText(`${snippetJSON},`);

        window.showInformationMessage(
            'Snippet has been copied into the clipboard, please use the command "Snippets: Configure User Snippets" to paste it.',
        );
    }
}