import { window } from 'vscode';


export const getPath = async (
    prompt: string,
    placeHolder: string,
    currentPath: string,
    validate: (path: string) => string | undefined,
): Promise<string | undefined> => {
    return await window.showInputBox({
        prompt,
        placeHolder,
        value: currentPath,
        validateInput: validate,
    });
};

export const getName = async (
    prompt: string,
    placeHolder: string,
    validate: (name: string) => string | undefined,
): Promise<string | undefined> => {
    return await window.showInputBox({
        prompt,
        placeHolder,
        validateInput: validate,
    });
};

export const pickItem = async (
    items: string[],
    placeHolder: string,
): Promise<string | undefined> => {
    return await window.showQuickPick(items, {
        placeHolder,
    });
};

export const showMessage = async (message: string): Promise<void> => {
    window.showInformationMessage(message);
};

export const showError = async (message: string): Promise<void> => {
    window.showErrorMessage(message);
};

export const showWarning = async (message: string): Promise<void> => {
    window.showWarningMessage(message);
};