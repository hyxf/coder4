import * as fs from 'fs';
import * as handlebars from "handlebars";
import { join } from 'path';
import { ExtensionContext, QuickPickItem, window } from "vscode";



const pipItems: QuickPickItem[] = [
    { label: 'click', description: 'Python composable command line interface toolkit', picked: true },
    { label: 'requests', description: 'A simple, yet elegant, HTTP library.' },
    { label: 'tqdm', description: 'A Fast, Extensible Progress Bar for Python and CLI' },
    { label: 'pydantic', description: 'Data validation using Python type hints' },
    { label: 'Pillow', description: 'Python Imaging Library' },
    { label: 'fastapi', description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production' },
    { label: 'Flask', description: 'The Python micro framework for building web applications.' },
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
 * pip deps
 * @param deps 
 * @returns 
 */
export async function pipDeps(deps: string[]): Promise<string[]> {
    const additionalDeps: QuickPickItem[] = deps
        .filter(dep => !pipItems.some(item => item.label === dep))
        .map(dep => ({ label: dep, description: 'User-defined dependency', picked: true }));

    const allItems = [...pipItems, ...additionalDeps];

    allItems.forEach(item => {
        if (deps.includes(item.label)) {
            item.picked = true;
        }
    });

    const selectedItems = await window.showQuickPick(allItems, {
        canPickMany: true,
        placeHolder: 'Select one or more libraries',
    });

    let selectedLabels: string[] = [];
    if (selectedItems) {
        selectedLabels = selectedItems.map(item => item.label);
    }

    return selectedLabels;
}
