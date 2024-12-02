import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "coder4" is now active!');

	const disposable = vscode.commands.registerCommand('coder4.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Coder4!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
