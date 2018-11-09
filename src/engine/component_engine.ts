import { KeyValue } from "../interfaces/generic";
import { Engine } from "./index";
import { Throw } from "../helpers/throw";

export class ComponentEngine {

    data: any = {};
    engine: Engine;

    constructor(public name: string) {
        if (this.constructor === ComponentEngine) Throw.type`Can not construct abstract class.`;
    }

    worker(node: any, inputData: KeyValue<any>, outputData: {}, args?: any[]) { }
}