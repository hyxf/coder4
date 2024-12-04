import { access } from 'fs';
import { join } from 'path';
import { Uri, window, workspace } from 'vscode';
import { Config } from "../configs/config";
import { getName, getPath } from "../helper/dialog.helper";
import { getRelativePath, saveFile, saveFileWithContent } from "../helper/filesystem.helper";
import { dasherize } from '../helper/inflector.helper';

const pipItems = [
    { label: 'click', description: 'Python composable command line interface toolkit' },
    { label: 'requests', description: 'A simple, yet elegant, HTTP library.' },
    { label: 'tqdm', description: 'A Fast, Extensible Progress Bar for Python and CLI' },
    { label: 'pydantic', description: 'Data validation using Python type hints' },
    { label: 'Pillow', description: 'Python Imaging Library' },
    { label: 'fastapi', description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production' },
    { label: 'Flask', description: 'The Python micro framework for building web applications.' },
];

/**
 * file controller
 */
export class FileController {

    constructor(private readonly config: Config) { }

    private async pipDeps(): Promise<string[]> {
        const selectedItems = await window.showQuickPick(pipItems, {
            canPickMany: true,
            placeHolder: 'Select one or more Library',
        });

        let selectedLabels: string[] = [];
        if (selectedItems) {
            selectedLabels = selectedItems.map(item => item.label);
        }

        return selectedLabels;
    }

    async newRequirements(): Promise<void> {
        let folder: string = '';

        if (workspace.workspaceFolders) {
            folder = workspace.workspaceFolders[0].uri.fsPath;
        } else {
            window.showErrorMessage('The file has not been created!');
            return;
        }

        const deps = await this.pipDeps();

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
    async newPyProject(): Promise<void> {
        let folder: string = '';

        if (workspace.workspaceFolders) {
            folder = workspace.workspaceFolders[0].uri.fsPath;
        } else {
            window.showErrorMessage('The file has not been created!');
            return;
        }

        const content = `'use client;'`;

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
    async newPage(path?: Uri): Promise<void> {
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

        const content = `'use client'
    
    interface Props {
    \tparams: {
    \t\tid: string;
    \t};
    }
    
    export default function Page({ params }: Props) {
    \tconst { id } = params;
    
    \treturn (
    \t\t<>
    \t\t\t<h1>Page { id }</h1>
    \t\t\t<p>Page content</p>
    \t\t</>
    \t);
    }
    `;

        const filename = `page.tsx`;

        await saveFile(folder, filename, content);
    }

    /**
     * new loading
     * @param path 
     * @returns 
     */
    async newLoading(path?: Uri): Promise<void> {
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

        const content = `export default function Loading() {
    \treturn <p>Loading...</p>
    }
    `;

        const filename = `loading.tsx`;

        await saveFile(folder, filename, content);
    }

    /**
     * new component
     * @param path path
     * @returns 
     */
    async newComponent(path?: Uri): Promise<void> {
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

        const content = `interface ${functionName}Props {
    \tchildren: React.ReactNode;
    }
    
    export function ${functionName}({ children }: ${functionName}Props) {
    \treturn (
    \t\t<>
    \t\t\t<h1>${functionName}</h1>
    \t\t\t{children}
    \t\t</>
    \t);
    }
    `;

        const filename = `${dasherize(functionName)}.tsx`;

        await saveFile(folder, filename, content);
    }

    /**
     * new layout
     * @param path 
     * @returns 
     */
    async newLayout(path?: Uri): Promise<void> {
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

        const content = `import type { Metadata } from 'next'
    import { Inter } from 'next/font/google'
    import './globals.css'
    
    const inter = Inter({ subsets: ['latin'] })
    
    export const metadata: Metadata = {
    \ttitle: 'Create Next App',
    \tdescription: 'Create Next App with TypeScript, Tailwind CSS, NextAuth, Prisma, tRPC, and more.',
    }
    
    export default function Layout({
    \tchildren,
    }: {
    \tchildren: React.ReactNode
    }) {
    \treturn (
    \t\t<html lang="en">
    \t\t\t<body className={inter.className}>{children}</body>
    \t\t</html>
    \t)
    }
    `;

        const filename = `layout.tsx`;

        await saveFile(folder, filename, content);
    }
}