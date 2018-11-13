import { Control } from './control';
import { Input } from './input';
import { Output } from './output';
import { Throw } from './helpers/throw';

export class Node {

    id: number;
    position: number[] = [0.0, 0.0];
    inputs = new Map<string, Input>();
    outputs = new Map<string, Output>();
    controls = new Map<string, Control>();
    data: any = {};
    meta: any = {};
    static latestId: number;

    constructor(public name: string) {
        this.id = Node.incrementId();
    }

    addControl(control: Control) {
        control.parent = this;

        this.controls.set(control.key, control);
        return this;
    }

    removeControl(control: Control) {
        control.parent = null;

        this.controls.delete(control.key);
    }

    addInput(input: Input) {
        if (input.node !== null) Throw.error`Input has already been added to the node`;

        input.node = this;

        this.inputs.set(input.key, input);
        return this;
    }

    removeInput(input: Input) {
        input.removeConnections();
        input.node = null;

        this.inputs.delete(input.key);
    }

    addOutput(output: Output) {
        if (output.node !== null) Throw.error`Output has already been added to the node`;
        
        output.node = this;
        this.outputs.set(output.key, output);
        return this;
    }

    removeOutput(output: Output | string) {
        if (output instanceof Output) {
            output.removeConnections();
            output.node = null;
            this.outputs.delete(output.key);
        } else if (typeof output === 'string' && this.outputs.has(output)) {
            const auxOutput = this.outputs.get(output);

            auxOutput.removeConnections();
            auxOutput.node = null;
            this.outputs.delete(auxOutput.key);
        } else {
            Throw.error`Output does not exist in this node.`;
        }
    }

    getConnections() {
        const ios = [...this.inputs.values(), ...this.outputs.values()];
        return ios.reduce((arr, io) => [...arr, ...io.connections], []);
    }

    static incrementId() {
        return (this.latestId = !this.latestId ? 1 : this.latestId + 1)
    }

    toJSON() {
        return {
            id: this.id,
            data: this.data,
            inputs: Array.from(this.inputs).reduce((obj: any, [key, input]) => (obj[key] = input.toJSON(), obj), {}),
            outputs: Array.from(this.outputs).reduce((obj: any, [key, output]) => (obj[key] = output.toJSON(), obj), {}),
            position: this.position,
            name: this.name,
            meta: this.meta
        }
    }

    static fromJSON(json: Node) {
        const node = new Node(json.name);

        node.id = json.id;
        node.data = json.data;
        node.position = json.position;
        node.name = json.name;
        Node.latestId = Math.max(node.id, Node.latestId);

        return node;
    }
}
