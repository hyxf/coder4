import { access, existsSync, mkdirSync, open, writeFile } from "fs";
import { dirname, join } from "path";
import { Uri, window, workspace } from "vscode";
import { Config } from "../configs/config";

export class FileController {
    constructor(private readonly config: Config) { }
}

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