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

export async function buildPyProject(): Promise<string> {
    const { stringify } = await import("smol-toml");
    const data = {
        project: {
            name: "sbook",
            description: "sbook",
            readme: "README.md",
            "requires-python": ">=3.11",
            license: { text: "MIT License" },
            authors: [{ name: "Seven", email: "1162584980@qq.com" }],
            maintainers: [{ name: "Seven", email: "1162584980@qq.com" }],
            dynamic: ["version"],
            classifiers: [
                "License :: OSI Approved :: MIT License",
                "Environment :: Console :: Curses",
                "Operating System :: OS Independent",
                "Programming Language :: Python :: 3",
                "Topic :: Utilities",
            ],
            dependencies: [
                "click",
                "ebooklib",
                "Pillow",
                "pydantic",
                "types-click",
                "questionary",
                "rich",
                "beautifulsoup4",
            ],
            "optional-dependencies": {
                dev: ["build", "twine"],
            },
            scripts: {
                sbook: "book.cmdline:create_epub",
                xbook: "book.cmdline:create_prompt",
                scover: "book.cover:extract_cover",
                sepub: "book.epub:modify_epub_content",
            },
        },
        "build-system": {
            requires: ["setuptools"],
            "build-backend": "setuptools.build_meta",
        },
        "tool.setuptools.dynamic": {
            version: { attr: "book.__VERSION__" },
        },
        "tool.setuptools.packages.find": {
            include: ["book*"],
        },
        "tool.setuptools": {
            "include-package-data": true,
        },
        "tool.setuptools.package-data": {
            book: ["templates/*", "static/**/*"],
        },
        "tool.black": {
            "line-length": 120,
        },
    };

    const tomlContent = stringify(data);
    return tomlContent;
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
