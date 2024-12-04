import { window } from "vscode";
import { Config } from "../configs/config";
import { runCommand } from "../helper/command.helper";
import { pickItem } from "../helper/dialog.helper";

export class TerminalController {
    constructor(private readonly config: Config) { }

    /**
     * new nodejs project
     * @returns 
     */
    async newNodejsProject(): Promise<void> {
        const manager = await pickItem(
            ['npm', 'yarn'],
            'Which package manager do you want to use?'
        );
        if (!manager) { return; }

        const useTypescript = await pickItem(
            ['true', 'false'],
            'Would you like to use TypeScript?'
        );
        if (!useTypescript) { return; }

        const label = "Create Node.js Project";
        const typescriptPackages = "typescript tsx @types/node";

        const commands = [];
        commands.push(manager === 'npm' ? 'npm init -y' : 'yarn init -y');

        if (useTypescript === 'true') {
            commands.push(
                manager === 'npm'
                    ? `npm install ${typescriptPackages} --save-dev`
                    : `yarn add ${typescriptPackages} --dev`
            );
            commands.push(
                manager === 'npm' ? 'npx tsc --init' : 'yarn tsc --init'
            );
        }

        const fullCommand = commands.join(' && ');
        try {
            await runCommand(label, fullCommand);
            window.showInformationMessage('Node.js project created successfully!');
        } catch (error) {
            window.showErrorMessage(
                `Failed to create Node.js project: ${error}`
            );
        }
    }

    /**
     * new react project
     * @returns 
     */
    async newReactProject(): Promise<void> {
        const type = await window.showQuickPick(
            [
                {
                    label: 'create-remix-app',
                    description: 'Create a new project with Create remix App',
                },
                {
                    label: 'create-next-app',
                    description: 'Create a new project with Create Next App',
                },
                {
                    label: 'create-vite-app',
                    description: 'Create a new project with React and Vite',
                }
            ],
            {
                placeHolder: 'What kind of project do you want to create?',
            },
        );

        if (!type) {
            return;
        }

        const manager = await pickItem(
            ['npm', 'yarn', 'pnpm'],
            'Which package manager do you want to use?',
        );

        if (!manager) {
            return;
        }

        switch (type.label) {
            case 'create-vite-app':
                const viteType = await window.showQuickPick(
                    [
                        {
                            label: 'react',
                            description: 'Create a new project with React and Vite',
                        },
                        {
                            label: 'react-ts',
                            description:
                                'Create a new project with React, TypeScript and Vite',
                        },
                        {
                            label: 'react-swc',
                            description: 'Create a new project with React, SWC and Vite',
                        },
                        {
                            label: 'react-swc-ts',
                            description:
                                'Create a new project with React, TypeScript, SWC and Vite',
                        },
                    ],
                    {
                        placeHolder: 'What kind of project do you want to create?',
                    },
                );

                if (!viteType) {
                    return;
                }

                switch (manager) {
                    case 'npm':
                        runCommand(
                            type.label,
                            `npm create vite@latest . -- --template ${viteType.label}`,
                        );
                        break;

                    case 'yarn':
                        runCommand(
                            type.label,
                            `yarn create vite . --template ${viteType.label}`,
                        );
                        break;

                    case 'pnpm':
                        runCommand(
                            type.label,
                            `pnpm create vite . --template ${viteType.label}`,
                        );
                        break;
                }

                break;

            case 'create-next-app':
                switch (manager) {
                    case 'npm':
                        runCommand(type.label, 'npx create-next-app@latest .');
                        break;

                    case 'yarn':
                        runCommand(type.label, 'yarn create next-app .');
                        break;

                    case 'pnpm':
                        runCommand(type.label, 'pnpm create next-app .');
                        break;
                }

                break;

            case 'create-remix-app':
                switch (manager) {
                    case 'npm':
                        runCommand(type.label, 'npx create-remix@latest .');
                        break;

                    case 'yarn':
                        runCommand(type.label, 'yarn create remix .');
                        break;

                    case 'pnpm':
                        runCommand(type.label, 'pnpm create remix@latest .');
                        break;
                }

                break;
        }
    }
}