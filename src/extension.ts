import * as vscode from 'vscode';
import { Config, EXTENSION_ID } from './configs/config';
import { FileController } from './controllers/file.controller';
import { TerminalController } from './controllers/terminal.controller';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "coder4" is now active!');

	let resource:
		| vscode.Uri
		| vscode.TextDocument
		| vscode.WorkspaceFolder
		| undefined;

	if (vscode.workspace.workspaceFolders) {
		resource = vscode.workspace.workspaceFolders[0];
	}

	const config = new Config(
		vscode.workspace.getConfiguration(EXTENSION_ID, resource),
	);

	const fileController = new FileController(config);
	const terminalController = new TerminalController(config);

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
