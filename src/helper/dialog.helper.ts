import { window } from 'vscode';


/**
 * get path
 * @param prompt 
 * @param placeHolder 
 * @param currentPath 
 * @param validate 
 * @returns 
 */
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

/**
 * get name
 * @param prompt 
 * @param placeHolder 
 * @param validate 
 * @returns 
 */
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

/**
 * pick item
 * @param items 
 * @param placeHolder 
 * @returns 
 */
export const pickItem = async (
    items: string[],
    placeHolder: string,
): Promise<string | undefined> => {
    return await window.showQuickPick(items, {
        placeHolder,
    });
};

/**
 * show error
 * @param message 
 */
export const showError = async (message: string): Promise<void> => {
    window.showErrorMessage(message);
};

/**
 * TODO: unuse
 * @param message 
 */
export const showMessage = async (message: string): Promise<void> => {
    window.showInformationMessage(message);
};

/**
 * TODO: unuse
 * @param message 
 */
export const showWarning = async (message: string): Promise<void> => {
    window.showWarningMessage(message);
};