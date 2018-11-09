import { Events } from './events';
import { Throw } from '../helpers/throw';
import { EventNames } from '../interfaces/event-names';

export class Emitter {

    private events: Emitter | Events | any = {};
    public silent = false;

    constructor(events: Events | Emitter) {
        this.events = events instanceof Emitter ? events.events : events.handlers;
    }

    on(names: string, handler: Function) {
        if (typeof handler !== 'function') Throw.error`Handler is not a function.`

        names.split(' ').forEach(name => {
            if (!this.events[name]) Throw.error`The event ${name} does not exist`

            this.events[name].push(handler);
        });

        return this;
    }

    trigger(name: EventNames, params?: any) {
        if (!(name in this.events))
            throw new Error(`The event ${name} cannot be triggered`);

        return this.events[name].reduce((r: any, e: any) => {
            return (e(params) !== false) && r
        }, true); // return false if at least one event is false        
    }

    bind(name: string) {
        this.events[name] = [];
    }
}