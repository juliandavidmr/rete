import { Control } from './control';
import { Input } from './input';
import { Output } from './output';

export class Node {

    id: string;
    position: number[];
    inputs: Map<string, Input>;
    outputs: Map<string, Output>;
    controls: Map<string, Control>;
    data: any;
    meta: any;
    static latestId: any;

    constructor(public name: string) {
        // this.name = name;
        this.id = Node.incrementId();
        this.position = [0.0, 0.0];

        this.inputs = new Map();
        this.outputs = new Map();
        this.controls = new Map();
        this.data = {};
        this.meta = {};
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
        if (input.node !== null)
            throw new Error('Input has already been added to the node');

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
        if (output.node !== null)
            throw new Error('Output has already been added to the node');

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
            throw new Error('Output does not exist in this node.');
        }
    }

    getConnections() {
        const ios = [...this.inputs.values(), ...this.outputs.values()];
        const connections = ios.reduce((arr, io) => {
            return [...arr, ...io.connections];
        }, []);

        return connections;
    }

    static incrementId() {
        if (!this.latestId)
            this.latestId = 1
        else
            this.latestId++
        return this.latestId
    }

    toJSON() {
        return {
            'id': this.id,
            'data': this.data,
            'inputs': Array.from(this.inputs).reduce((obj: any, [key, input]) => (obj[key] = input.toJSON(), obj), {}),
            'outputs': Array.from(this.outputs).reduce((obj: any, [key, output]) => (obj[key] = output.toJSON(), obj), {}),
            'position': this.position,
            'name': this.name
        }
    }

    static fromJSON(json: any) {
        const node: any = new Node(json.name);

        node.id = json.id;
        node.data = json.data;
        node.position = json.position;
        node.name = json.name;
        Node.latestId = Math.max(node.id, Node.latestId);

        return node;
    }
}