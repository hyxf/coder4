import { QuickPickItem, window } from "vscode";

const pipItems: QuickPickItem[] = [
    { label: 'click', description: 'Python composable command line interface toolkit' },
    { label: 'requests', description: 'A simple, yet elegant, HTTP library.' },
    { label: 'tqdm', description: 'A Fast, Extensible Progress Bar for Python and CLI' },
    { label: 'pydantic', description: 'Data validation using Python type hints' },
    { label: 'Pillow', description: 'Python Imaging Library' },
    { label: 'fastapi', description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production' },
    { label: 'Flask', description: 'The Python micro framework for building web applications.' },
];

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
