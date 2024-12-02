import { access, existsSync, mkdirSync, open, writeFile } from "fs";
import { dirname, join } from "path";
import { Uri, window, workspace } from "vscode";
import { Config } from "../configs/config";

export class FileController {
    constructor(private readonly config: Config) { }
}