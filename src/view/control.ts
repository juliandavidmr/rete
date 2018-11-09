import { Emitter } from '../core/emitter';
import { Throw } from '../helpers/throw';

export class ControlView extends Emitter {

    constructor(el: HTMLElement, control = Throw.required`Control` as any, emitter: Emitter) {
        super(emitter);
        this.trigger('rendercontrol', { el, control });
    }
}