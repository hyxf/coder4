import * as fs from 'fs';
import { access } from 'fs';
import * as os from 'os';
import { join } from 'path';
import { ExtensionContext, Uri, window, workspace } from 'vscode';
import { z } from "zod";
import { runCommand } from '../helper/command.helper';
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

    async editPackageJson(path?: Uri): Promise<void> {
        const rootPath = path?.fsPath || "";

        if (!rootPath) {
            await showError('Invalid path: Please provide a valid path to the package.json file.');
            return;
        }

        try {
            const fileContent = await fs.promises.readFile(rootPath, 'utf-8');
            const packageJson = PackageJsonSchema.parse(JSON.parse(fileContent));

            const deps = Object.keys(packageJson.dependencies ?? {});
            const devDeps = Object.keys(packageJson.devDependencies ?? {});

            const modifyDeps = await depsPick(deps, npmItems, 'Dependencies pick');
            const modifyDevDeps = await depsPick(devDeps, npmDevItems, 'DevDependencies pick');

            const packageManager = await window.showQuickPick(
                ['yarn', 'npm', 'pnpm'],
                { placeHolder: 'Which package manager do you want to use?' }
            );

            if (!packageManager) {
                await showError('No package manager selected. Operation canceled.');
                return;
            }

            const command = this.buildInstallCommand(packageManager, modifyDeps, modifyDevDeps);

            if (!command) {
                await showError('No dependencies selected for installation. Nothing to execute.');
                return;
            }

            const label = 'Add library';
            await runCommand(label, command);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            await showError(`Error editing package.json: ${message}`);
        }
    }

    buildInstallCommand(packageManager: string, deps: string[], devDeps: string[]): string {
        const commands: string[] = [];

        if (deps.length > 0) {
            const depsCommand = this.buildSingleCommand(packageManager, deps, false);
            commands.push(depsCommand);
        }

        if (devDeps.length > 0) {
            const devDepsCommand = this.buildSingleCommand(packageManager, devDeps, true);
            commands.push(devDepsCommand);
        }

        return commands.join(' && ');
    }

    buildSingleCommand(packageManager: string, dependencies: string[], isDev: boolean): string {
        const devFlag = isDev ? (packageManager === 'npm' ? '--save-dev' : '-D') : '';
        const depsList = dependencies.join(' ');

        switch (packageManager) {
            case 'yarn':
                return `yarn add ${devFlag} ${depsList}`;
            case 'pnpm':
                return `pnpm add ${devFlag} ${depsList}`;
            case 'npm':
            default:
                return `npm install ${devFlag} ${depsList}`;
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