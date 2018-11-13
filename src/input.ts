import { Connection } from './connection';
import { Control } from './control';
import { IO } from './io';
import { Socket } from './socket';
import { Throw } from './helpers/throw';

export class Input extends IO {

    control: Control = null;
    meta: any = {};

    constructor(key: string, title: string, socket: Socket, multiConns: boolean = false) {
        super(key, title, socket, multiConns);
    }

    hasConnection() {
        return this.connections.length > 0;
    }

    addConnection(connection: Connection) {
        if (!this.multipleConnections && this.hasConnection()) Throw.error`Multiple connections not allowed`
        this.connections.push(connection);
    }

    addControl(control: Control) {
        this.control = control;
        control.parent = this;
    }

    showControl() {
        return !this.hasConnection && this.control !== null;
    }

    toJSON() {
        return {
            connections: this.connections.map(c => {
                return {
                    node: c.output.node.id,
                    output: c.output.key,
                    data: c.data
                };
            }),
            meta: this.meta
        };
    }
}