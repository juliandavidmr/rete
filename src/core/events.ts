export class Events {

    handlers: any;

    constructor(handlers: any) {
        this.handlers = {
            warn: [console.warn],
            error: [console.error],
            ...handlers
        };
    }
}