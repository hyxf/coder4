import { env, window } from "vscode";
import { scopeList } from "../helper/config.helper";

/**
 * dev controller
 */
export class DevController {
    constructor() { }

    /**
     * generate snippet
     * @returns 
     */
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
            prompt: 'Please enter name (required)',
            placeHolder: 'name',
            validateInput: input => (input ? '' : 'Name is required'),
        });

        if (!name) {
            return;
        }

        const scopes = await scopeList();

        const scope = await window.showQuickPick(
            scopes,
            { placeHolder: 'Which scope do you want to use?' }
        );

        if (!scope) {
            return;
        }

        const prefix = await window.showInputBox({
            prompt: 'Please enter prefix (required)',
            placeHolder: 'prefix',
            validateInput: input => (input ? '' : 'Prefix is required'),
        });

        if (!prefix) {
            return;
        }

        const description = await window.showInputBox({
            prompt: 'Please enter description (required)',
            placeHolder: 'description',
            validateInput: input => (input ? '' : 'Description is required'),
        });

        if (!description) {
            return;
        }

        const separatedSnippet = selection
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .split("\n");
        const separatedSnippetLength = separatedSnippet.length;

        // add double quotes around each line apart from the last one
        const newSnippet = separatedSnippet.map((line, index) => {
            return index === separatedSnippetLength - 1 ? `"${line}$0"` : `"${line}",`;
        });

        let content = `
"${name}": {
  "prefix": "${prefix}",
  ${scope === 'none' ? '' : `"scope": "${scope}",`}
  "body": [
    ${newSnippet.join('\n')}
  ],
  "description": "${description}"
}
`;

        env.clipboard.writeText(content);

        window.showInformationMessage(
            'Snippet has been copied into the clipboard.',
        );
    }
}