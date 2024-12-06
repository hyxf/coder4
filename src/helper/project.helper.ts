import * as fs from 'fs';
import * as handlebars from "handlebars";
import { join } from 'path';
import { ExtensionContext, QuickPickItem, window } from "vscode";

/**
 * pip items
 */
export const pipItems: QuickPickItem[] = [
    { label: 'click', description: 'Python composable command line interface toolkit', picked: true },
    { label: 'requests', description: 'A simple, yet elegant, HTTP library.' },
    { label: 'tqdm', description: 'A Fast, Extensible Progress Bar for Python and CLI' },
    { label: 'pydantic', description: 'Data validation using Python type hints' },
    { label: 'Pillow', description: 'Python Imaging Library' },
    { label: 'fastapi', description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production' },
    { label: 'Flask', description: 'The Python micro framework for building web applications.' },
];

export const npmItems: QuickPickItem[] = [
    { label: 'axios', description: 'Promise based HTTP client for the browser and node.js', picked: false },
    { label: 'zod', description: 'TypeScript-first schema validation with static type inference', picked: false },
    { label: 'commander', description: 'node.js command-line interfaces made easy', picked: false },
    { label: 'chalk', description: 'Terminal string styling done right', picked: false },
    { label: 'fs-extra', description: 'Node.js: extra methods for the fs object like copy(), remove(), mkdirs()', picked: false },
    { label: 'p-map', description: 'Map over promises concurrently', picked: false },
    { label: 'react-hook-form', description: 'React Hooks for form state management and validation', picked: false },
    { label: 'react-query', description: 'Powerful asynchronous state management', picked: false },
    { label: 'swr', description: 'React Hooks for Data Fetching', picked: false },
    { label: '@inquirer/prompts', description: 'A collection of common interactive command line user interfaces.', picked: false },
    { label: '@tanstack/react-table', description: 'Headless UI for building powerful tables & datagrids for TS/JS', picked: false },
];

export const npmDevItems: QuickPickItem[] = [
    { label: 'typescript', description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.', picked: false },
    { label: 'tsx', description: 'TypeScript Execute | The easiest way to run TypeScript in Node.js', picked: false },
    { label: '@types/node', description: 'The repository for high quality TypeScript type definitions.', picked: false },
    { label: 'eslint', description: 'Find and fix problems in your JavaScript code.', picked: false },
    { label: 'vsce', description: 'VS Code Extension Manager', picked: false }
];

/**
 * template compile
 * @param context 
 * @param name 
 * @param data 
 * @returns 
 */
export async function templateCompile<T = any>(context: ExtensionContext, name: string, data: T): Promise<string> {
    const resourcePath = join(context.extensionPath, 'template', name);
    try {
        const fileContent = await fs.promises.readFile(resourcePath, 'utf-8');
        const template = handlebars.compile(fileContent);
        return template(data);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.error(`Template file not found: ${resourcePath}`);
        } else if ((error as NodeJS.ErrnoException).code === 'EACCES') {
            console.error(`Permission denied for file: ${resourcePath}`);
        } else {
            console.error('Error during template compilation:', error);
        }
        return '';
    }
}


/**
 * deps Pick
 * @param deps 
 * @returns 
 */
export async function depsPick(deps: string[], defaultItems: QuickPickItem[], title: string = 'Library Pick', placeHolder: string = 'Select one or more libraries'): Promise<string[] | undefined> {
    const additionalDeps: QuickPickItem[] = deps
        .filter(dep => !defaultItems.some(item => item.label === dep))
        .map(dep => ({ label: dep, description: 'User-defined dependency', picked: true }));

    const allItems = [...defaultItems, ...additionalDeps];

    allItems.forEach(item => {
        if (deps.includes(item.label)) {
            item.picked = true;
        }
    });

    const selectedItems = await window.showQuickPick(allItems, {
        canPickMany: true,
        placeHolder,
        title
    });

    if (!selectedItems) {
        return undefined;
    }

    let selectedLabels: string[] = [];
    if (selectedItems) {
        selectedLabels = selectedItems.map(item => item.label);
    }

    return selectedLabels;
}
