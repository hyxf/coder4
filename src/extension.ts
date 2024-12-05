import * as path from 'path';
import * as vscode from 'vscode';
import { DevController } from './controllers/dev.controller';
import { FileController } from './controllers/file.controller';
import { TerminalController } from './controllers/terminal.controller';
import { EXTENSION_ID } from './helper/config.helper';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "coder4" is now active!');

	const fileController = new FileController();

	const disposableFileLayout = vscode.commands.registerCommand(`${EXTENSION_ID}.file.layout`, (args) => fileController.newLayout(context, args));
	const disposableFileComponent = vscode.commands.registerCommand(`${EXTENSION_ID}.file.component`, (args) => fileController.newComponent(context, args));
	const disposableFileLoading = vscode.commands.registerCommand(`${EXTENSION_ID}.file.loading`, (args) => fileController.newLoading(context, args));
	const disposableFilePage = vscode.commands.registerCommand(`${EXTENSION_ID}.file.page`, (args) => fileController.newPage(context, args));

	const terminalController = new TerminalController();
	const disposableTerminalProject = vscode.commands.registerCommand(`${EXTENSION_ID}.terminal.project`, () => terminalController.newReactProject());
	const disposableTerminalNodejs = vscode.commands.registerCommand(`${EXTENSION_ID}.terminal.nodejs`, () => terminalController.newNodejsProject());

	//---

	const disposablePythonPackage = vscode.commands.registerCommand(`${EXTENSION_ID}.python.package`, (args) => fileController.newPythonPackage(args));
	const disposablePythonFile = vscode.commands.registerCommand(`${EXTENSION_ID}.python.file`, (args) => fileController.newPythonFile(args));
	const disposablePyProject = vscode.commands.registerCommand(`${EXTENSION_ID}.python.pyproject.toml`, () => fileController.newPyProject(context));
	const disposableRequirements = vscode.commands.registerCommand(`${EXTENSION_ID}.python.requirements.txt`, () => fileController.newRequirements());
	const disposableContextPyProject = vscode.commands.registerCommand(`${EXTENSION_ID}.python.context.pyproject.toml`, (args) => fileController.editPyProject(args));
	const disposableContextRequirements = vscode.commands.registerCommand(`${EXTENSION_ID}.python.context.requirements.txt`, (args) => fileController.editRequirements(args));

	//---
	const devController = new DevController();
	const disposableGenerateSnippet = vscode.commands.registerCommand(`${EXTENSION_ID}.generate.snippet`, () => devController.generateSnippet());
	//---

	context.subscriptions.push(
		disposableFileLayout,
		disposableFileComponent,
		disposableFileLoading,
		disposableFilePage,
		disposableTerminalProject,
		disposableTerminalNodejs,
		disposablePythonPackage,
		disposablePythonFile,
		disposablePyProject,
		disposableContextPyProject,
		disposableContextRequirements,
		disposableRequirements,
		disposableGenerateSnippet);

	//---
	const cmdCheckNextJs = `${EXTENSION_ID}.ext.checkNextJs`;
	vscode.commands.registerCommand(cmdCheckNextJs, async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;

		if (workspaceFolders) {
			const rootFolder = workspaceFolders[0].uri.fsPath;
			const nextConfig = path.join(rootFolder, 'next.config.ts');

			const fileExists = await vscode.workspace.fs.stat(vscode.Uri.file(nextConfig)).then(
				() => true,
				() => false
			);

			vscode.commands.executeCommand('setContext', 'isNextJsProject', fileExists);
		}
	});
	vscode.commands.executeCommand(cmdCheckNextJs);
	//---
	const cmdCheckPython = `${EXTENSION_ID}.ext.checkPython`;
	vscode.commands.registerCommand(cmdCheckPython, async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;

		if (workspaceFolders) {
			const rootFolder = workspaceFolders[0].uri.fsPath;

			const targetPyProject = path.join(rootFolder, 'pyproject.toml');
			const filePyProjectExists = await vscode.workspace.fs.stat(vscode.Uri.file(targetPyProject)).then(
				() => true,
				() => false
			);

			const targetRequirement = path.join(rootFolder, 'requirements.txt');
			const fileRequirementExists = await vscode.workspace.fs.stat(vscode.Uri.file(targetRequirement)).then(
				() => true,
				() => false
			);
			vscode.commands.executeCommand('setContext', 'isPythonProject', filePyProjectExists || fileRequirementExists);
		}
	});
	vscode.commands.executeCommand(cmdCheckPython);
}

export function deactivate() { }
