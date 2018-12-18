import { Area } from './area';
import { Connection } from '../connection';
import { Emitter } from '../core/emitter';
import { Connection as ViewConnection } from './connection';
import { Node as NodeView } from './node';
import { Node } from '../node';
import { Component } from '../component';

export class EditorView extends Emitter {

    nodes = new Map<Node, NodeView>();
    connections = new Map<Connection, ViewConnection>();
    area: Area;

    constructor(public container: HTMLElement, public components: Map<string, Component>, emitter: Emitter) {
        super(emitter);

        container.style.overflow = 'hidden';
        container.addEventListener('click', this.click.bind(this));
        container.addEventListener('contextmenu', e => this.trigger('contextmenu', { e, view: this }));
        window.addEventListener('resize', this.resize.bind(this));

        this.on('nodetranslated', this.updateConnections.bind(this));

        this.area = new Area(container, this);
        container.appendChild(this.area.el);
    }

    addNode(node: Node) {
        const nodeView = new NodeView(node, this.components.get(node.name), this);

        this.nodes.set(node, nodeView);
        this.area.appendChild(nodeView.el);
    }

    removeNode(node: Node) {
        let nodeView = this.nodes.get(node);
        if (!nodeView) {
            const nd = Array.from(this.nodes.values()).find(n => n.node.id === node.id);
            nodeView = this.nodes.get(nd.node);
        }

        if (nodeView) {
            this.nodes.delete(node);
            this.area.removeChild(nodeView.el);
        } else {
            this.trigger('error', [`The node ${node.name} can not remove.`, nodeView, node]);
        }
    }

    addConnection(connection: Connection) {
        const viewInput = this.nodes.get(connection.input.node);
        const viewOutput = this.nodes.get(connection.output.node);
        const connView = new ViewConnection(connection, viewInput, viewOutput, this);

        this.connections.set(connection, connView);
        this.area.appendChild(connView.el);
    }

    removeConnection(connection: Connection) {
        const connView = this.connections.get(connection);
        const response = this.connections.delete(connection);
        if (response) {
            this.area.removeChild(connView.el);
        } else {
            this.trigger('warn', [`Can't remove connection`, connection])
        }
        return response;
    }

    updateConnections(param: any) {
        param.node.getConnections().map((conn: Connection) => {
            this.connections.get(conn).update();
        });
    }

    resize() {
        const { container } = this;
        const width = container.parentElement.clientWidth;
        const height = container.parentElement.clientHeight;

        container.style.width = width + 'px';
        container.style.height = height + 'px';
    }

    click(e: any) {
        const container = this.container;

        if (container !== e.target) return;
        if (!this.trigger('click', { e, container })) return;
    }
}
