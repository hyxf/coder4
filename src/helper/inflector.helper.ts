
export const camelize = (str: string): string => {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : word.toUpperCase(),
        )
        .replace(/\s+/g, '');
};


export const pascalize = (str: string): string => {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
        .replace(/\s+/g, '');
};

export const underscore = (str: string): string => {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : `_${word.toLowerCase()}`,
        )
        .replace(/\s+/g, '_');
};


export const decamelize = (str: string): string => {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : `_${word.toLowerCase()}`,
        )
        .replace(/\s+/g, '_');
};


export const humanize = (str: string): string => {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toUpperCase() : ` ${word.toLowerCase()}`,
        )
        .replace(/\s+/g, ' ');
};


export const isPluralizable = (str: string): boolean => {
    return str.endsWith('s');
};


export const dasherize = (str: string): string => {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : `-${word.toLowerCase()}`,
        )
        .replace(/\s+/g, '-');
};

export const ordinal = (num: number): string => {
    const j = num % 10;
    const k = num % 100;

    if (j === 1 && k !== 11) {
        return `${num}st`;
    }
    if (j === 2 && k !== 12) {
        return `${num}nd`;
    }
    if (j === 3 && k !== 13) {
        return `${num}rd`;
    }
    return `${num}th`;
};

export const ordinalize = (num: number): string => {
    return `${num}${ordinal(num)}`;
};

export const pluralize = (str: string): string => {
    if (str.endsWith('y')) {
        return str.slice(0, -1) + 'ies';
    }
    if (str.endsWith('s')) {
        return str;
    }
    return str + 's';
};

export const singularize = (str: string): string => {
    if (str.endsWith('ies')) {
        return str.slice(0, -3) + 'y';
    }
    if (str.endsWith('s')) {
        return str.slice(0, -1);
    }
    return str;
};

export const titleize = (str: string): string => {
    return str
        .split(' ')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ');
};