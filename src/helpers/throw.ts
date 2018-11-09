export class Throw {
    public static required(name?: TemplateStringsArray) {
        throw new Error(`${name ? name.join('') : 'Field'} required`);
    }

    public static requireInstance<T extends { new(...args: any[]): {} }>(instance: T) {
        throw new Error(`${name ? name : 'Field'} required`);
    }

    public static error(message: TemplateStringsArray, ...placeholders: string[]) {
        throw new Error(this.getString(message, ...placeholders));
    }

    public static type(message: TemplateStringsArray) {
        throw new TypeError(message.join(' '));
    }

    private static getString(literals: TemplateStringsArray, ...placeholders: string[]) {
        let result = "";

        // interleave the literals with the placeholders
        for (let i = 0; i < placeholders.length; i++) {
            result += literals[i];
            // result += placeholders[i]
            //     .replace(/&/g, '&amp;')
            //     .replace(/"/g, '&quot;')
            //     .replace(/'/g, '&#39;')
            //     .replace(/</g, '&lt;')
            //     .replace(/>/g, '&gt;');
        }

        // add the last literal
        result += literals[literals.length - 1];
        return result;
    }
}