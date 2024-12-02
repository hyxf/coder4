import { access, existsSync, mkdirSync, open, writeFile } from "fs";
import { dirname, join } from "path";
import { Uri, window, workspace } from "vscode";

export class FileController {

}

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

export const getRelativePath = async (path: string): Promise<string> => {
    return workspace.asRelativePath(path);
};

export const saveFile = async (
    path: string,
    filename: string,
    data: string,
): Promise<void> => {
    let folder: string = '';

    if (workspace.workspaceFolders) {
        folder = workspace.workspaceFolders[0].uri.fsPath;
    } else {
        window.showErrorMessage('The file has not been created!');
        return;
    }

    const file = join(folder, path, filename);

    if (!existsSync(dirname(file))) {
        mkdirSync(dirname(file), { recursive: true });
    }

    access(file, (err: any) => {
        if (err) {
            open(file, 'w+', (err: any, fd: any) => {
                if (err) {
                    throw err;
                }

                writeFile(fd, data, 'utf8', (err: any) => {
                    if (err) {
                        throw err;
                    }

                    const openPath = Uri.file(file);

                    workspace.openTextDocument(openPath).then((filename) => {
                        window.showTextDocument(filename);
                    });
                });
            });

            window.showInformationMessage('Successfully created the file!');
        } else {
            window.showWarningMessage('Name already exist!');
        }
    });
};