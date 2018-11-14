import { Component } from './component';
import { Connection } from './connection';
import { Context } from './core/context';
import { EditorEvents } from './events';
import { EditorView } from './view/index';
import { Input } from './input';
import { Node } from './node';
import { Output } from './output';
import { Selected } from './selected';
import { Validator } from './core/validator';
import { Throw } from './helpers/throw';

type KeyValue = { [key: string]: any };

export class NodeEditor extends Context {

    public nodes: Node[] = [];
    components = new Map<string, Component>();
    selected: Selected;
    view: EditorView;

    constructor(id: string, public container: HTMLElement) {
        super(id, new EditorEvents());

        if (!container && !(container instanceof HTMLElement)) {
            throw new Error(`Invalid container element.`);
        }

        this.selected = new Selected();
        this.view = new EditorView(container, this.components, this);

        window.addEventListener('keydown', e => this.trigger('keydown', e));
        window.addEventListener('keyup', e => this.trigger('keyup', e));
        this.on('nodecreated', (node: Node) => this.getComponent(node.name).created(node));
        this.on('noderemoved', (node: Node) => this.getComponent(node.name).destroyed(node));
        this.on('selectnode', ({ node, accumulate }: { node: Node, accumulate: any }) => this.selectNode(node, accumulate));
        this.on('nodeselected', () => this.selected.each((n: Node) => this.view.nodes.get(n).onStart()));
        this.on('translatenode', ({ dx, dy }: { dx: number, dy: number }) => this.selected.each((n: Node) => this.view.nodes.get(n).onDrag(dx, dy)));
    }

    addNode(node: Node) {
        if (!this.trigger('nodecreate', node)) return;

        this.nodes.push(node);
        this.view.addNode(node);

        this.trigger('nodecreated', node);
    }

    removeNode(node: Node = Throw.requireInstance(Node) as any) {
        if (!this.trigger('noderemove', node)) return;

        node.getConnections().forEach((c: Connection) => this.removeConnection(c));

        this.nodes.splice(this.nodes.indexOf(node), 1);
        this.view.removeNode(node);

        this.trigger('noderemoved', node);
    }

    connect(output: Output, input: Input, data = {}): boolean {
        if (!this.trigger('connectioncreate', { output, input })) return;

        try {
            const connection = output.connectTo(input);

            connection.data = data;
            this.view.addConnection(connection);

            this.trigger('connectioncreated', connection);
            return true;
        } catch (e) {
            this.trigger('warn', e)
            return false;
        }
    }

    removeConnection(connection: Connection) {
        if (!this.trigger('connectionremove', connection)) return;

        this.view.removeConnection(connection);
        connection.remove();

        this.trigger('connectionremoved', connection);
    }

    selectNode(node: Node, accumulate: boolean = false) {
        if (this.nodes.indexOf(node) === -1)
            throw new Error('Node not exist in list');

        if (!this.trigger('nodeselect', node)) return;

        this.selected.add(node, accumulate);

        this.trigger('nodeselected', node);
    }

    getComponent(name: string) {
        const component = this.components.get(name);

        if (!component) Throw.error`Component ${name} not found`;

        return component;
    }

    register(component: Component) {
        component.editor = this;
        this.components.set(component.name, component);
        this.trigger('componentregister', component)
    }

    clear() {
        [...this.nodes].map(node => this.removeNode(node));
    }

    toJSON() {
        const data: KeyValue = { id: this.id, nodes: {} };

        this.nodes.forEach(node => data.nodes[node.id] = node.toJSON());
        this.trigger('export', data);
        return data;
    }

    beforeImport(json: Object) {
        var checking = Validator.validate(this.id, json);

        if (!checking.success) {
            this.trigger('warn', checking.msg);
            return false;
        }

        this.silent = true;
        this.clear();
        this.trigger('import', json);
        return true;
    }

    afterImport() {
        this.silent = false;
        return true;
    }

    async fromJSON(json: any) {
        if (!this.beforeImport(json)) return false;
        const nodes: KeyValue = {};

        try {
            await Promise.all(Object.keys(json.nodes).map(async id => {
                var node = json.nodes[id];
                var component = this.getComponent(node.name);

                nodes[id] = await component.build(Node.fromJSON(node));
                this.addNode(nodes[id]);
            }));

            Object.keys(json.nodes).forEach(id => {
                const jsonNode = json.nodes[id];
                const node = nodes[id];

                Object.keys(jsonNode.outputs).forEach(key => {
                    const outputJson = jsonNode.outputs[key];

                    outputJson.connections.forEach((jsonConnection: any) => {
                        const nodeId = jsonConnection.node;
                        const data = jsonConnection.data;
                        const targetOutput = node.outputs.get(key);
                        const targetInput = nodes[nodeId].inputs.get(jsonConnection.input);

                        this.connect(targetOutput, targetInput, data);
                    });
                });
            });
        } catch (e) {
            this.trigger('warn', e);
            return !this.afterImport();
        } finally {
            return this.afterImport();
        }
    }
}
