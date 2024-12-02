import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "coder4" is now active!');

	const disposableFileLayout = vscode.commands.registerCommand('coder4.file.layout', () => {
		vscode.window.showInformationMessage('Hello World from Coder4!');
	});

	const disposableFileComponent = vscode.commands.registerCommand('coder4.file.component', () => {
		vscode.window.showInformationMessage('Hello World from Coder4!');
	});

	const disposableFileLoading = vscode.commands.registerCommand('coder4.file.loading', () => {
		vscode.window.showInformationMessage('Hello World from Coder4!');
	});

	const disposableFilePage = vscode.commands.registerCommand('coder4.file.page', () => {
		vscode.window.showInformationMessage('Hello World from Coder4!');
	});

	const disposableTerminalProject = vscode.commands.registerCommand('coder4.terminal.project', () => {
		vscode.window.showInformationMessage('Hello World from Coder4!');
	});

	context.subscriptions.push(
		disposableFileLayout,
		disposableFileComponent,
		disposableFileLoading,
		disposableFilePage,
		disposableTerminalProject);
}

export function deactivate() { }
