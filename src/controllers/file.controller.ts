import { Uri, window } from 'vscode';
import { Config } from "../configs/config";
import { getName, getPath } from "../helper/dialog.helper";
import { createDir, getRelativePath, saveFile } from "../helper/filesystem.helper";
import { dasherize } from '../helper/inflector.helper';


export class FileController {
    constructor(private readonly config: Config) { }

    async newPythonPackage(path?: Uri): Promise<void> {

        const folder = await getPath(
            'New Python Package',
            'name',
            "",
            (pkg: string) => {
                if (!/^(?!\/)[^\sÀ-ÿ]+?$/.test(pkg)) {
                    return 'The package name must be a valid name';
                }
                return;
            },
        );

        if (!path && !folder) {
            return;
        }

        createDir(path, folder);
        window.showInformationMessage('Successfully created the file!');
    }

    async newPythonFile(path?: Uri): Promise<void> {

    }

    async newPyProject(path?: Uri): Promise<void> {

    }

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

        saveFile(folder, filename, content);
    }

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

        saveFile(folder, filename, content);
    }


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

        saveFile(folder, filename, content);
    }


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

        saveFile(folder, filename, content);
    }
}