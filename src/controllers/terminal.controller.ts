import { Uri, commands, window } from "vscode";
import { runCommand } from "../helper/command.helper";
import { getName, pickItem, showError, showWarning } from "../helper/dialog.helper";

/**
 * Terminal Controller
 */
export class TerminalController {
    constructor() { }

    /**
     * new nodejs project
     * @returns 
     */
    async newNodejsProject(): Promise<void> {
        const manager = await pickItem(
            ['npm', 'yarn'],
            'Which package manager do you want to use?'
        );
        if (!manager) { return; }

        const useTypescript = await pickItem(
            ['true', 'false'],
            'Would you like to use TypeScript?'
        );
        if (!useTypescript) { return; }

        const label = "Create Node.js Project";
        const typescriptPackages = "typescript tsx @types/node";

        const commands = [];
        commands.push(manager === 'npm' ? 'npm init -y' : 'yarn init -y');

        if (useTypescript === 'true') {
            commands.push(
                manager === 'npm'
                    ? `npm install ${typescriptPackages} --save-dev`
                    : `yarn add ${typescriptPackages} --dev`
            );
            commands.push(
                manager === 'npm' ? 'npx tsc --init' : 'yarn tsc --init'
            );
        }

        const fullCommand = commands.join(' && ');
        try {
            await runCommand(label, fullCommand);
            window.showInformationMessage('Node.js project created successfully!');
        } catch (error) {
            window.showErrorMessage(
                `Failed to create Node.js project: ${error instanceof Error ? error.message : error}`
            );
        }
    }

    /**
     * new react project
     * @returns 
     */
    async newReactProject(): Promise<void> {
        const projectType = await window.showQuickPick(
            [
                { label: 'create-next-app', description: 'Create Next App' },
                { label: 'create-remix-app', description: 'Create Remix App' },
                { label: 'create-vite-app', description: 'Create vite App' },
                { label: 'create-docusaurus', description: 'Create docusaurus' },
            ],
            { placeHolder: 'What kind of project do you want to create?' }
        );

        if (!projectType) {
            return;
        }

        const packageManager = await window.showQuickPick(
            ['yarn', 'npm', 'pnpm'],
            { placeHolder: 'Which package manager do you want to use?' }
        );

        if (!packageManager) {
            return;
        }

        let viteTemplate: string | undefined;
        if (projectType.label === 'create-vite-app') {
            const viteChoice = await window.showQuickPick(
                [
                    { label: 'react-ts', description: 'React, TypeScript and Vite' },
                    { label: 'react', description: 'React and Vite' },
                    { label: 'react-swc-ts', description: 'React, TypeScript, SWC and Vite' },
                    { label: 'react-swc', description: 'React, SWC and Vite' },
                ],
                { placeHolder: 'What kind of Vite template do you want to use?' }
            );

            if (!viteChoice) {
                return;
            }

            viteTemplate = viteChoice.label;
        }

        let command = '';
        switch (projectType.label) {
            case 'create-vite-app':
                if (viteTemplate) {
                    switch (packageManager) {
                        case 'npm':
                            command = `npm create vite@latest . -- --template ${viteTemplate}`;
                            break;
                        case 'yarn':
                            command = `yarn create vite . --template ${viteTemplate}`;
                            break;
                        case 'pnpm':
                            command = `pnpm create vite . --template ${viteTemplate}`;
                            break;
                    }
                }
                break;

            case 'create-next-app':
                const options = '--yes';
                switch (packageManager) {
                    case 'npm':
                        command = `npx create-next-app@latest . ${options}`;
                        break;
                    case 'yarn':
                        command = `yarn create next-app . ${options}`;
                        break;
                    case 'pnpm':
                        command = `pnpm create next-app . ${options}`;
                        break;
                }
                break;

            case 'create-remix-app':
                const optionsRemix = '--yes';
                switch (packageManager) {
                    case 'npm':
                        command = `npx create-remix@latest . ${optionsRemix}`;
                        break;
                    case 'yarn':
                        command = `yarn create remix . ${optionsRemix}`;
                        break;
                    case 'pnpm':
                        command = `pnpm create remix@latest . ${optionsRemix}`;
                        break;
                }
                break;

            case 'create-docusaurus':
                let folder: string = '';

                const rootDir = await window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: 'Select Root Dir'
                });

                if (rootDir && rootDir.length > 0) {
                    folder = rootDir[0].fsPath;
                } else {
                    await showWarning('No folder selected');
                    return;
                }

                const docusaurusName = await getName('Docusaurus Name', 'name', (name: string) => {
                    if (!/^[A-Za-z]{2,}$/.test(name)) {
                        return 'Invalid format! Entity names MUST be declared in PascalCase.';
                    }
                    return;
                });

                if (!docusaurusName) {
                    return;
                }

                command = `yarn create docusaurus --typescript --skip-install --package-manager=${packageManager} ${docusaurusName} classic ${folder}`;
                break;
        }

        if (!command) {
            await showError('Failed to construct the command.');
            return;
        }

        try {
            await runCommand(projectType.label, command);
            // await showMessage(`${projectType.label} successfully!`);
        } catch (error) {
            await showError(`Failed to ${projectType.label} project: ${error instanceof Error ? error.message : error}`);
        }
    }

    /**
     * open folder
     * @param folderToOpen 
     */
    async openFolder(folderToOpen: string): Promise<void> {
        try {
            setTimeout(() => {
                const folderUri = Uri.file(folderToOpen);
                commands.executeCommand('revealFileInOS', folderUri);
            }, 200);
        } catch (err) {
            await showError(`Failed to open folder: ${folderToOpen}`);
        }
    }

}