import * as path from 'path';
import * as vscode from 'vscode';
import { Config, EXTENSION_ID } from './configs/config';
import { DevController } from './controllers/dev.controller';
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

	const disposableFileLayout = vscode.commands.registerCommand(`${EXTENSION_ID}.file.layout`, (args) => fileController.newLayout(context, args));
	const disposableFileComponent = vscode.commands.registerCommand(`${EXTENSION_ID}.file.component`, (args) => fileController.newComponent(context, args));
	const disposableFileLoading = vscode.commands.registerCommand(`${EXTENSION_ID}.file.loading`, (args) => fileController.newLoading(context, args));
	const disposableFilePage = vscode.commands.registerCommand(`${EXTENSION_ID}.file.page`, (args) => fileController.newPage(context, args));

	const terminalController = new TerminalController(config);
	const disposableTerminalProject = vscode.commands.registerCommand(`${EXTENSION_ID}.terminal.project`, () => terminalController.newReactProject());
	const disposableTerminalNodejs = vscode.commands.registerCommand(`${EXTENSION_ID}.terminal.nodejs`, () => terminalController.newNodejsProject());

	//---

	const disposablePythonPackage = vscode.commands.registerCommand(`${EXTENSION_ID}.python.package`, (args) => fileController.newPythonPackage(args));
	const disposablePythonFile = vscode.commands.registerCommand(`${EXTENSION_ID}.python.file`, (args) => fileController.newPythonFile(args));
	const disposablePyProject = vscode.commands.registerCommand(`${EXTENSION_ID}.python.pyproject.toml`, () => fileController.newPyProject(context));
	const disposableRequirements = vscode.commands.registerCommand(`${EXTENSION_ID}.python.requirements.txt`, () => fileController.newRequirements());

	//---
	const devController = new DevController(config);
	const disposableGenerateSnippet = vscode.commands.registerCommand(`${EXTENSION_ID}.generate.snippet`, () => devController.generateSnippet());
	const disposableGenerateCodestring = vscode.commands.registerCommand(`${EXTENSION_ID}.generate.codestring`, () => devController.generateCodeString());
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
		disposableRequirements,
		disposableGenerateSnippet,
		disposableGenerateCodestring);

	//---
	const cmdCheckNodeJs = `${EXTENSION_ID}.ext.checkNodeJs`;
	vscode.commands.registerCommand(cmdCheckNodeJs, async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;

		if (workspaceFolders) {
			const rootFolder = workspaceFolders[0].uri.fsPath;
			const targetPackageJson = path.join(rootFolder, 'package.json');

			const fileExists = await vscode.workspace.fs.stat(vscode.Uri.file(targetPackageJson)).then(
				() => true,
				() => false
			);

			vscode.commands.executeCommand('setContext', 'isNodeJsProject', fileExists);
		}
	});
	vscode.commands.executeCommand(cmdCheckNodeJs);
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
