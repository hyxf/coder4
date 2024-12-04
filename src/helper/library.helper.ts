import { window } from "vscode";

const pipItems = [
    { label: 'click', description: 'Python composable command line interface toolkit' },
    { label: 'requests', description: 'A simple, yet elegant, HTTP library.' },
    { label: 'tqdm', description: 'A Fast, Extensible Progress Bar for Python and CLI' },
    { label: 'pydantic', description: 'Data validation using Python type hints' },
    { label: 'Pillow', description: 'Python Imaging Library' },
    { label: 'fastapi', description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production' },
    { label: 'Flask', description: 'The Python micro framework for building web applications.' },
];

export async function pipDeps(): Promise<string[]> {
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