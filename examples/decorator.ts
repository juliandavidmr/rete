import { ReteControl, Node, Control } from "../";
import { ControlProperties } from "../build/src/decorators/component";

@ReteControl('Control')
class ControlText implements ControlProperties {
    key: string;
    data: any;
    parent: any;

    getNode(): Node {
        throw new Error("Method not implemented.");
    }
    getData(key: string) {
        throw new Error("Method not implemented.");
    }
    putData(key: string, data: any): void {
        throw new Error("Method not implemented.");
    }
}

const instance = new ControlText();
console.log('Key:', Object.keys(instance), instance.key)