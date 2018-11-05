import { Control as ControlClass } from "../control";
import { applyMixins } from "../helpers/mixin";
export function Component(params: DecoratorControlParams | string) {
    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        class Base extends constructor {
            public key: string = typeof params === 'string' ? params : params.key
        }
        applyMixins(Base, [ControlClass]);
        return Base;
    }
}

export interface DecoratorControlParams {
    key: string
    data?: any
}

export declare class ControlProperties extends ControlClass {
    public key: string
    public data: any
}