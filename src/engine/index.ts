import { ComponentEngine } from './component_engine';
import { Context } from '../core/context';
import { EngineEvents } from './events';
import { Validator } from '../core/validator';
import { Node } from '../node';
import { KeyValue } from '../interfaces/generic';

const enum State {
    AVALIABLE = 0,
    PROCESSED = 1,
    ABORT = 2
};

export { ComponentEngine };

export class Engine extends Context {

    components: ComponentEngine[] = [];
    args: any[] = [];
    data: any;
    private state = State.AVALIABLE;

    constructor(id: string) {
        super(id, new EngineEvents());
    }

    onAbort() { }

    clone() {
        const engine = new Engine(this.id);
        this.components.map(c => engine.register(c));
        return engine;
    }

    register(component: ComponentEngine) {
        this.components.push(component);
        this.trigger('componentregister', component);
    }

    async throwError(message: string, data: any = null) {
        await this.abort();
        this.trigger('error', { message, data });
        this.processDone();
        return 'error';
    }

    extractInputNodes(node: any, nodes: Node[]) {
        return Object.keys(node.inputs).reduce((a, key) => {
            return [...a, ...(node.inputs[key].connections || []).reduce((b: any, c: any) => [...b, nodes[c.node]], [])]
        }, []);
    }

    detectRecursions(nodes: any[]) {
        const nodesArr = Object.keys(nodes).map((id: any) => nodes[id]);
        const findSelf = (node: Node, inputNodes: any[]) => {
            if (inputNodes.some(n => n === node))
                return node;

            for (var i = 0; i < inputNodes.length; i++) {
                if (findSelf(node, this.extractInputNodes(inputNodes[i], nodes)))
                    return node;
            }

            return null;
        }

        return nodesArr.map(node => {
            return findSelf(node, this.extractInputNodes(node, nodes))
        }).filter(r => r !== null);
    }

    processStart() {
        if (this.state === State.AVALIABLE) {
            this.state = State.PROCESSED;
            return true;
        }

        if (this.state === State.ABORT) {
            return false;
        }

        console.warn(`The process is busy and has not been restarted.
                Use abort() to force it to complete`);
        return false;
    }

    processDone() {
        var success = this.state !== State.ABORT;

        this.state = State.AVALIABLE;

        if (!success) {
            this.onAbort();
            this.onAbort = () => { }
        }

        return success;
    }

    async abort() {
        return new Promise(ret => {
            if (this.state === State.PROCESSED) {
                this.state = State.ABORT;
                this.onAbort = ret;
            }
            else if (this.state === State.ABORT) {
                this.onAbort();
                this.onAbort = ret;
            }
            else
                ret();
        });
    }

    async lock(node: any) {
        return new Promise(res => {
            node.unlockPool = node.unlockPool || [];
            if (node.busy && !node.outputData)
                node.unlockPool.push(res);
            else
                res();

            node.busy = true;
        });
    }

    unlock(node: any) {
        node.unlockPool.forEach((a: Function) => a());
        node.unlockPool = [];
        node.busy = false;
    }

    async extractInputData(node: any) {
        const obj: KeyValue<any> = {};

        for (let key of Object.keys(node.inputs)) {
            let input = node.inputs[key];
            var conns = input.connections;
            let connData = await Promise.all(conns.map(async (c: any) => {
                const prevNode = this.data.nodes[c.node];

                let outputs = await this.processNode(prevNode);

                if (!outputs)
                    this.abort();
                else
                    return outputs[c.output];
            }));

            obj[key] = connData;
        }

        return obj;
    }

    async processWorker(node: Node) {
        var inputData = await this.extractInputData(node);
        var component = this.components.find(c => c.name === node.name);
        var outputData = {};

        try {
            await component.worker(node, inputData, outputData, ...this.args);
        } catch (e) {
            this.abort();
            this.trigger('warn', e);
        }

        return outputData;
    }

    async processNode(node: any) {
        if (this.state === State.ABORT || !node)
            return null;

        await this.lock(node);

        if (!node.outputData) {
            node.outputData = this.processWorker(node)
        }

        this.unlock(node);
        return node.outputData;
    }

    async forwardProcess(node: any) {
        if (this.state === State.ABORT)
            return null;

        return await Promise.all(Object.keys(node.outputs).map(async (key) => {
            const output = node.outputs[key];

            return await Promise.all(output.connections.map(async (c: any) => {
                const nextNode = this.data.nodes[c.node];

                await this.processNode(nextNode);
                await this.forwardProcess(nextNode);
            }));
        }));
    }

    copy(data: any) {
        data = Object.assign({}, data);
        data.nodes = Object.assign({}, data.nodes);

        Object.keys(data.nodes).forEach(key => {
            data.nodes[key] = Object.assign({}, data.nodes[key])
        });
        return data;
    }

    async validate(data: any) {
        var checking = Validator.validate(this.id, data);

        if (!checking.success)
            return await this.throwError(checking.msg);

        var recurentNodes = this.detectRecursions(data.nodes);

        if (recurentNodes.length > 0)
            return await this.throwError('Recursion detected', recurentNodes);

        return true;
    }

    async processStartNode(id: string) {
        if (id) {
            let startNode = this.data.nodes[id];

            if (!startNode)
                return await this.throwError('Node with such id not found');

            await this.processNode(startNode);
            await this.forwardProcess(startNode);
        }
    }

    async processUnreachable() {
        for (var i in this.data.nodes) // process nodes that have not been reached
            if (typeof this.data.nodes[i].outputData === 'undefined') {
                var node = this.data.nodes[i];

                await this.processNode(node);
                await this.forwardProcess(node);
            }
    }

    async process(data: Object, startId?: string, ...args: any[]) {
        if (!this.processStart()) return;
        if (!this.validate(data)) return;

        this.data = this.copy(data);
        this.args = args;

        await this.processStartNode(startId);
        await this.processUnreachable();

        return this.processDone() ? 'success' : 'aborted';
    }
}