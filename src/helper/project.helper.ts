import * as fs from 'fs';
import * as handlebars from "handlebars";
import { join } from 'path';
import { ExtensionContext, QuickPickItem, window } from "vscode";



const pipItems: QuickPickItem[] = [
    { label: 'click', description: 'Python composable command line interface toolkit' },
    { label: 'requests', description: 'A simple, yet elegant, HTTP library.' },
    { label: 'tqdm', description: 'A Fast, Extensible Progress Bar for Python and CLI' },
    { label: 'pydantic', description: 'Data validation using Python type hints' },
    { label: 'Pillow', description: 'Python Imaging Library' },
    { label: 'fastapi', description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production' },
    { label: 'Flask', description: 'The Python micro framework for building web applications.' },
];


interface PyProjectData {
    name: string;
    description: string;
    user: string;
    email: string;
    packageName: string;
    dependencies: string[]
}

export async function buildPyProject(context: ExtensionContext, data: PyProjectData): Promise<string> {
    const resourcePath = join(context.extensionPath, 'template', 'pyproject.hbs');
    let result = "";
    try {
        if (!fs.existsSync(resourcePath)) {
            throw new Error(`Template file not found: ${resourcePath}`);
        }

        const fileContent = await fs.promises.readFile(resourcePath, 'utf-8');

        const template = handlebars.compile(fileContent);

        result = template(data);
    } catch (error) {
        console.error('Error generating pyproject:', error);
    }

    return result || '';
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
