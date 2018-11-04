import { Control as ControlClass } from "../control";
import { applyMixins } from "../helpers/mixin";
export function Control(params: DecoratorControlParams | string) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        class Base extends constructor {
            public key: string = typeof params === 'string' ? params : params.key
            public newProperty = "new property";
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

export declare class ControlProperties {
    public key: string
}