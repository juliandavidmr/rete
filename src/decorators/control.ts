import { Control as ControlClass } from "../control";
import { applyMixins } from "../helpers/mixin";

export function Control(params: DecoratorControlParams | string) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        // TODO: Set key by class name
        class Base extends constructor {
            public key: string = typeof params === 'string' ? params : params.key
            public data: any;
            public parent: any;
            public hello = "override";
        }
        applyMixins(Base, [ControlClass]);
        return Base;
    }
}

export interface DecoratorControlParams {
    key: string
    data?: any
}