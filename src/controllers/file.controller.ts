import { join } from 'path';
import { ExtensionContext, Uri } from 'vscode';
import { getName, getPath } from "../helper/dialog.helper";
import { getRelativePath, saveFile, saveFileWithContent } from "../helper/filesystem.helper";
import { dasherize } from '../helper/inflector.helper';
import { templateCompile } from '../helper/project.helper';

interface ComponentData {
    functionName: string;
}

/**
 * file controller
 */
export class FileController {

    constructor() { }


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