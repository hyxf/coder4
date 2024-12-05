import { access, existsSync, mkdirSync, open, writeFile } from 'fs';
import { dirname, join } from 'path';
import { FilePermission, FileStat, Uri, window, workspace } from 'vscode';


export const directoryMap = async (
    path: string,
    options?: { extensions?: string[]; ignore?: string[]; maxResults?: number },
): Promise<Uri[]> => {
    let includes = path === '/' ? '**/*' : `${path}/**/*`;
    let exclude = '';

    if (options && options.extensions && options.extensions.length) {
        includes += `.{${options.extensions.join(',')}}`;
    }

    if (options && options.ignore && options.ignore.length) {
        exclude = `{${options.ignore.join(',')}}`;
    }

    return workspace.findFiles(includes, exclude, options?.maxResults);
};

/**
 * create dir
 * @param folder 
 * @param path 
 */
export const createDir = async (folder: string, path: string): Promise<void> => {
    const file = join(folder, path);
    const newDirectoryUri = Uri.file(file);
    await workspace.fs.createDirectory(newDirectoryUri);
};

/**
 * save file with content
 * @param file 
 * @param data 
 */
export const saveFileWithContent = async (file: string, data: string): Promise<void> => {
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

/**
 * save file
 * @param path 
 * @param filename 
 * @param data 
 * @returns 
 */
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
    await saveFileWithContent(file, data);
};

/**
 * delete files
 * @param path 
 * @param options 
 */
export const deleteFiles = async (
    path: string,
    options?: { recursive?: boolean; useTrash?: boolean },
): Promise<void> => {
    const files = await workspace.findFiles(`${path}/**/*`);

    files.forEach((file) => {
        access(file.path, (err: any) => {
            if (err) {
                throw err;
            }

            workspace.fs.delete(file, options);
        });
    });
};

/**
 * TODO: unuse
 * @param path 
 * @param options 
 * @returns 
 */
export const getFilenames = async (
    path: string,
    options?: { extensions?: string[]; ignore?: string[]; maxResults?: number },
): Promise<string[]> => {
    const files = await directoryMap(path, options);

    return files.map((file) => file.path);
};


export const getFileInfo = async (path: string): Promise<object> => {
    return await workspace.fs.stat(Uri.file(path));
};


export const getDirFileInfo = async (path: string): Promise<object> => {
    return await workspace.fs.stat(Uri.file(path));
};


export const symbolicPermissions = async (
    path: string,
): Promise<FilePermission | undefined> => {
    return await workspace.fs
        .stat(Uri.file(path))
        .then((file) => file.permissions);
};


export const octalPermissions = async (
    path: string,
): Promise<string | undefined> => {
    const file = await workspace.fs
        .stat(Uri.file(path))
        .then((file) => file.permissions);

    return file?.toString(8);
};

/**
 * TODO: unuse
 * @param file1 
 * @param file2 
 * @returns 
 */
export const sameFile = async (
    file1: string,
    file2: string,
): Promise<boolean> => {
    const file1Info = await getFileInfo(file1);
    const file2Info = await getFileInfo(file2);

    return file1Info === file2Info;
};


export const setRealpath = async (path: string): Promise<Uri | FileStat> => {
    return (await workspace.fs.stat)
        ? await workspace.fs.stat(Uri.file(path))
        : await workspace
            .openTextDocument(Uri.file(path))
            .then((filename) => filename.uri);
};

/**
 * Relative Path
 * @param path 
 * @returns 
 */
export const getRelativePath = async (path: string): Promise<string> => {
    return workspace.asRelativePath(path);
};

/**
 * real path
 * @param path 
 * @returns 
 */
export const getRealpath = async (path: string): Promise<string> => {
    return Uri.file(path).fsPath;
};

/**
 * TODO: unuse
 * @param path 
 * @returns 
 */
export const exists = async (path: string): Promise<boolean> => {
    return existsSync(path);
};

/**
 * is dir
 * @param path 
 * @returns 
 */
export const isDirectory = async (path: string): Promise<boolean> => {
    return (await workspace.fs.stat(Uri.file(path))).type === 2;
};