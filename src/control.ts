import { Node } from './node';
import { Throw } from './helpers/throw';

export class Control {

    data: any = {};
    parent: Node | any;

    constructor(public key: string) {
        if (this.constructor === Control) Throw.type`Can not construct abstract class`;
        if (!key) Throw.required`The key parameter is missing in super() of Control`;
    }

    getNode(): Node {
        if (this.parent === null) Throw.error`Control isn't added to Node/Input`;

        return this.parent instanceof Node ? this.parent : this.parent.node;
    }

    getData(key: string) {
        return this.getNode().data[key];
    }

    putData(key: string, data: any) {
        this.getNode().data[key] = data;
    }
}