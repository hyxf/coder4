import * as fs from 'fs';
import { access } from 'fs';
import * as os from 'os';
import { join } from 'path';
import { ExtensionContext, Uri, window, workspace } from 'vscode';
import { z } from "zod";
import { showError } from "../helper/dialog.helper";
import { saveFileWithContent } from "../helper/filesystem.helper";
import { depsPick, npmDevItems, npmItems, pipItems, templateCompile } from '../helper/project.helper';

interface PyProjectData {
    name: string;
    description: string;
    user: string;
    email: string;
    packageName: string;
    dependencies: string[]
}

const PackageJsonSchema = z.object({
    name: z.string(),
    devDependencies: z.record(z.string()).optional(),
    dependencies: z.record(z.string()).optional()
});

const PyProjectSchema = z.object({
    project: z.object({
        dependencies: z.array(z.string()),
    }),
});

type PyProjectToml = z.infer<typeof PyProjectSchema>;

export class LibController {

    constructor() { }

    /**
     * edit package.json
     * @param path 
     * @returns 
     */
    async editPackageJson(path?: Uri): Promise<void> {
        const rootPath = path?.fsPath || "";

        // If the path is invalid, notify the user and exit
        if (!rootPath) {
            await showError('Invalid path: Please provide a valid path to the package.json file.');
            return;
        }

        try {
            // Read and parse the content of the package.json file
            const fileContent = await fs.promises.readFile(rootPath, 'utf-8');
            const packageJson = PackageJsonSchema.parse(JSON.parse(fileContent));

            // Get the list of current dependencies and devDependencies
            const deps = Object.keys(packageJson.dependencies ?? {});
            const devDeps = Object.keys(packageJson.devDependencies ?? {});

            // Allow the user to pick dependencies to modify
            const modifyDeps = await depsPick(deps, npmItems, 'Dependencies pick');
            if (!modifyDeps) {
                return;
            }

            const modifyDevDeps = await depsPick(devDeps, npmDevItems, 'DevDependencies pick');
            if (!modifyDevDeps) {
                return;
            }

            // Prompt the user to select a package manager
            const packageManager = await window.showQuickPick(
                ['yarn', 'npm', 'pnpm'],
                { placeHolder: 'Which package manager do you want to use?' }
            );

            // If no package manager is selected, notify the user and exit
            if (!packageManager) {
                await showError('No package manager selected. Operation canceled.');
                return;
            }

            // Calculate the added and removed dependencies
            const { added: addedDeps, removed: removedDeps } = this.diffDependencies(deps, modifyDeps);
            const { added: addedDevDeps, removed: removedDevDeps } = this.diffDependencies(devDeps, modifyDevDeps);

            // Build the install and uninstall command based on changes
            const command = this.buildInstallAndUninstallCommand(packageManager, {
                addedDeps,
                removedDeps,
                addedDevDeps,
                removedDevDeps,
            });

            // If no changes are detected, notify the user and exit
            if (!command) {
                await showError('No changes detected. Nothing to execute.');
                return;
            }

            // Execute the constructed command
            const label = 'Update dependencies';
            // await runCommand(label, command);
        } catch (error) {
            // Catch and display any error that occurs during the process
            const message = error instanceof Error ? error.message : String(error);
            await showError(`Error editing package.json: ${message}`);
        }
    }

    /**
     * Compare original and modified dependency lists to identify added and removed items
     * @param original Original list of dependencies
     * @param modified Modified list of dependencies
     * @returns An object containing added and removed dependencies
     */
    private diffDependencies(original: string[], modified: string[]): { added: string[]; removed: string[] } {
        const added = modified.filter(dep => !original.includes(dep));
        const removed = original.filter(dep => !modified.includes(dep));
        return { added, removed };
    }

    /**
     * Build a command to install and uninstall dependencies based on changes
     * @param packageManager Selected package manager (e.g., npm, yarn, pnpm)
     * @param changes Dependency changes (added/removed dependencies and devDependencies)
     * @returns A combined command string for installation and uninstallation
     */
    private buildInstallAndUninstallCommand(
        packageManager: string,
        changes: { addedDeps: string[]; removedDeps: string[]; addedDevDeps: string[]; removedDevDeps: string[] }
    ): string {
        const commands: string[] = [];

        // Build commands for removed dependencies
        if (changes.removedDeps.length > 0) {
            commands.push(this.buildSingleCommand(packageManager, changes.removedDeps, false, 'uninstall'));
        }
        if (changes.removedDevDeps.length > 0) {
            commands.push(this.buildSingleCommand(packageManager, changes.removedDevDeps, true, 'uninstall'));
        }

        // Build commands for added dependencies
        if (changes.addedDeps.length > 0) {
            commands.push(this.buildSingleCommand(packageManager, changes.addedDeps, false, 'install'));
        }
        if (changes.addedDevDeps.length > 0) {
            commands.push(this.buildSingleCommand(packageManager, changes.addedDevDeps, true, 'install'));
        }

        // Combine all commands into a single string with '&&'
        return commands.join(' && ');
    }

    /**
     * Build a single command for installing or uninstalling dependencies
     * @param packageManager Selected package manager (e.g., npm, yarn, pnpm)
     * @param dependencies List of dependencies to install or uninstall
     * @param isDev Whether the dependencies are devDependencies
     * @param action The action to perform ('install' or 'uninstall')
     * @returns A single command string
     */
    private buildSingleCommand(
        packageManager: string,
        dependencies: string[],
        isDev: boolean,
        action: 'install' | 'uninstall'
    ): string {
        // Determine the dev flag based on the action and package manager
        const devFlag = isDev && action === 'install' ? (packageManager === 'npm' ? '--save-dev' : '-D') : '';
        const depsList = dependencies.join(' ');

        // Construct the command based on the package manager
        switch (packageManager) {
            case 'yarn':
                return `yarn ${action} ${devFlag} ${depsList}`;
            case 'pnpm':
                return `pnpm ${action} ${devFlag} ${depsList}`;
            case 'npm':
            default:
                return `npm ${action} ${devFlag} ${depsList}`;
        }
    }

    /**
     * edit requirements
     * @param path 
     * @returns 
     */
    async editRequirements(path?: Uri): Promise<void> {
        const rootPath = path?.fsPath || "";

        if (!rootPath) {
            return;
        }
        try {
            const fileContent = await fs.promises.readFile(rootPath, 'utf-8');

            const deps = fileContent
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            const modifyDeps = await depsPick(deps, pipItems);

            if (modifyDeps && modifyDeps.length > 0) {
                await fs.promises.writeFile(rootPath, modifyDeps.join('\n'));
            }
        } catch (error) {
            await showError(`${error instanceof Error ? error.message : error}`);
        }
    }

    /**
     * update dependencies
     * @param configContent 
     * @param newDependencies 
     * @returns 
     */
    private updateDependencies(configContent: string, newDependencies: string[]): string {
        const dependenciesRegex = /dependencies\s*=\s*\[\s*(?:".*?",?\s*)*\]/;
        const newDependenciesContent = `dependencies = [\n    ${newDependencies.map(dep => `"${dep}"`).join(",\n    ")}\n]`;
        return configContent.replace(dependenciesRegex, newDependenciesContent);
    }

    /**
     * edit pyproject.toml
     * @param path 
     * @returns 
     */
    async editPyProject(path?: Uri): Promise<void> {
        const rootPath = path?.fsPath || "";

        if (!rootPath) {
            return;
        }
        try {
            const { parse } = await import("smol-toml");

            const fileContent = await fs.promises.readFile(rootPath, 'utf-8');

            const parsedData = parse(fileContent);
            const pyProject: PyProjectToml = PyProjectSchema.parse(parsedData);
            const deps = pyProject.project.dependencies;

            const modifyDeps = await depsPick(deps, pipItems);

            if (modifyDeps && modifyDeps.length > 0) {
                const modifyContent = this.updateDependencies(fileContent, modifyDeps);
                await fs.promises.writeFile(rootPath, modifyContent);
            }
        } catch (error) {
            await showError(`${error instanceof Error ? error.message : error}`);
        }
    }


    /**
     * new requirements
     * @returns 
     */
    async newRequirements(): Promise<void> {
        let folder: string = '';

        if (workspace.workspaceFolders) {
            folder = workspace.workspaceFolders[0].uri.fsPath;
        } else {
            window.showErrorMessage('The file has not been created!');
            return;
        }

        const deps = await depsPick([], pipItems);
        if (!deps) {
            return;
        }

        const content = deps.join("\n");

        const requirements = join(folder, `requirements.txt`);

        access(requirements, (err: any) => {
            if (err) {
                saveFileWithContent(requirements, content);
            } else {
                window.showWarningMessage('File "requirements.txt" already exists.');
            }
        });
    }

    /**
     * new pyproject
     * @returns 
     */
    async newPyProject(context: ExtensionContext): Promise<void> {
        let folder: string = '';
        let workspaceName: string = '';

        if (workspace.workspaceFolders) {
            folder = workspace.workspaceFolders[0].uri.fsPath;
            workspaceName = workspace.workspaceFolders[0].name;
        } else {
            window.showErrorMessage('The file has not been created!');
            return;
        }

        const name = await window.showInputBox({
            prompt: "Project Name",
            placeHolder: "name",
            value: workspaceName,
            validateInput: (pkg: string) =>
                !/^(?!\/)[^\sÀ-ÿ]+?$/.test(pkg)
                    ? 'The project name must be a valid name'
                    : undefined,
        });

        if (!name) {
            return;
        }

        const packageName = await window.showInputBox({
            prompt: "Package Name",
            placeHolder: "name",
            value: name.toLowerCase(),
            validateInput: (pkg: string) =>
                !/^(?!\/)[^\sÀ-ÿ]+?$/.test(pkg)
                    ? 'The package name must be a valid name'
                    : undefined,
        });

        if (!packageName) {
            return;
        }

        const description = await window.showInputBox({
            prompt: "Description",
            placeHolder: "description",
            value: `${name} description`,
            validateInput: (pkg: string) => {
                if (!pkg) {
                    return 'The description cannot be empty';
                }
                return undefined;
            },
        });

        if (!description) {
            return;
        }

        const dependencies = await depsPick([], pipItems);
        if (!dependencies) {
            return;
        }

        const user = os.userInfo().username;

        const content = await templateCompile<PyProjectData>(context, "pyproject.hbs", {
            name: name || "demo",
            user,
            email: `${user}@gmail.com`,
            dependencies,
            description,
            packageName
        });

        const pyproject = join(folder, `pyproject.toml`);

        access(pyproject, (err: any) => {
            if (err) {
                saveFileWithContent(pyproject, content);
            } else {
                window.showWarningMessage('File "pyproject.toml" already exists.');
            }
        });
    }
}