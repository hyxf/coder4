import * as fs from 'fs';
import { access } from 'fs';
import * as os from 'os';
import { join } from 'path';
import { ExtensionContext, Uri, window, workspace } from 'vscode';
import { z } from "zod";
import { Config } from "../configs/config";
import { getName, getPath, showError } from "../helper/dialog.helper";
import { getRelativePath, saveFile, saveFileWithContent } from "../helper/filesystem.helper";
import { dasherize } from '../helper/inflector.helper';
import { pipDeps, templateCompile } from '../helper/project.helper';


interface PyProjectData {
    name: string;
    description: string;
    user: string;
    email: string;
    packageName: string;
    dependencies: string[]
}

interface ComponentData {
    functionName: string;
}

const PyProjectSchema = z.object({
    project: z.object({
        dependencies: z.array(z.string()),
    }),
});

type PyProjectToml = z.infer<typeof PyProjectSchema>;

/**
 * file controller
 */
export class FileController {

    constructor(private readonly config: Config) { }

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
            const modifyDeps = await pipDeps(deps);
            if (modifyDeps && modifyDeps.length > 0) {
                console.log('');
            }
        } catch (error) {
            await showError(`${error instanceof Error ? error.message : error}`);
        }
    }

    async newRequirements(): Promise<void> {
        let folder: string = '';

        if (workspace.workspaceFolders) {
            folder = workspace.workspaceFolders[0].uri.fsPath;
        } else {
            window.showErrorMessage('The file has not been created!');
            return;
        }

        const deps = await pipDeps([]);

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

        const dependencies = await pipDeps([]);

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

    /**
     * new python package
     * @param path path
     * @returns 
     */
    async newPythonPackage(path?: Uri): Promise<void> {
        const folder = await getPath(
            'New Python Package',
            'name',
            "",
            (pkg: string) =>
                !/^(?!\/)[^\sÀ-ÿ]+?$/.test(pkg)
                    ? 'The package name must be a valid name'
                    : undefined
        );

        const rootPath = path?.fsPath || "";
        const packageFolder = folder || "";

        if (!rootPath && !packageFolder) {
            return;
        }

        const packageInitPath = join(rootPath, packageFolder, '__init__.py');

        await saveFileWithContent(packageInitPath, '');
    }

    /**
     * new python file
     * @param path path
     * @returns 
     */
    async newPythonFile(path?: Uri): Promise<void> {
        const pythonName = await getPath(
            'New Python File',
            'name',
            "",
            (name: string) =>
                !/^(?!\/)[^\sÀ-ÿ]+?$/.test(name)
                    ? 'The Python file name must be a valid name'
                    : undefined
        );

        const rootPath = path?.fsPath || "";
        if (!pythonName || !rootPath) {
            return;
        }

        const pythonFile = pythonName.endsWith('.py') ? pythonName : `${pythonName}.py`;

        const pythonPath = join(rootPath, pythonFile);

        await saveFileWithContent(pythonPath, '');
    }

    /**
     * new page
     * @param path 
     * @returns 
     */
    async newPage(context: ExtensionContext, path?: Uri): Promise<void> {
        // Get the relative path
        const folderPath: string = path ? await getRelativePath(path.path) : '';

        // Get the path to the folder
        const folder = await getPath(
            'Folder name',
            'Folder name. E.g. src, app...',
            folderPath,
            (path: string) => {
                if (!/^(?!\/)[^\sÀ-ÿ]+?$/.test(path)) {
                    return 'The folder name must be a valid name';
                }
                return;
            },
        );

        if (!folder) {
            return;
        }

        const content = await templateCompile(context, "page.tsx.hbs", {});

        const filename = `page.tsx`;

        await saveFile(folder, filename, content);
    }

    /**
     * new loading
     * @param path 
     * @returns 
     */
    async newLoading(context: ExtensionContext, path?: Uri): Promise<void> {
        // Get the relative path
        const folderPath: string = path ? await getRelativePath(path.path) : '';

        // Get the path to the folder
        const folder = await getPath(
            'Folder name',
            'Folder name. E.g. src, app...',
            folderPath,
            (path: string) => {
                if (!/^(?!\/)[^\sÀ-ÿ]+?$/.test(path)) {
                    return 'The folder name must be a valid name';
                }
                return;
            },
        );

        if (!folder) {
            return;
        }

        const content = await templateCompile(context, "loading.tsx.hbs", {});

        const filename = `loading.tsx`;

        await saveFile(folder, filename, content);
    }

    /**
     * new component
     * @param path path
     * @returns 
     */
    async newComponent(context: ExtensionContext, path?: Uri): Promise<void> {
        // Get the relative path
        const folderPath: string = path ? await getRelativePath(path.path) : '';

        // Get the path to the folder
        const folder = await getPath(
            'Folder name',
            'Folder name. E.g. src, app...',
            folderPath,
            (path: string) => {
                if (!/^(?!\/)[^\sÀ-ÿ]+?$/.test(path)) {
                    return 'The folder name must be a valid name';
                }
                return;
            },
        );

        if (!folder) {
            return;
        }

        // Get the function name
        const functionName = await getName(
            'Component Name',
            'E.g. Title, Header, Main, Footer...',
            (name: string) => {
                if (!/^[A-Z][A-Za-z]{2,}$/.test(name)) {
                    return 'Invalid format! Entity names MUST be declared in PascalCase.';
                }
                return;
            },
        );

        if (!functionName) {
            return;
        }

        const content = await templateCompile<ComponentData>(context, "component.tsx.hbs", {
            functionName
        });

        const filename = `${dasherize(functionName)}.tsx`;

        await saveFile(folder, filename, content);
    }

    /**
     * new layout
     * @param path 
     * @returns 
     */
    async newLayout(context: ExtensionContext, path?: Uri): Promise<void> {
        // Get the relative path
        const folderPath: string = path ? await getRelativePath(path.path) : '';

        // Get the path to the folder
        const folder = await getPath(
            'Folder name',
            'Folder name. E.g. src, app...',
            folderPath,
            (path: string) => {
                if (!/^(?!\/)[^\sÀ-ÿ]+?$/.test(path)) {
                    return 'The folder name must be a valid name';
                }
                return;
            },
        );

        if (!folder) {
            return;
        }

        const content = await templateCompile(context, "layout.tsx.hbs", {});

        const filename = `layout.tsx`;

        await saveFile(folder, filename, content);
    }
}