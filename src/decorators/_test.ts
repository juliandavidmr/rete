import { Control, ControlProperties } from "./control";

@Control('ControlTextKey')
class ControlText implements ControlProperties {
    public key: string;
    constructor() {

    }
}

const c = new ControlText()
console.log(c.key);