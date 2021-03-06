import { Handlers } from "../helpers/handlers";

export class Zoom {

    distance: number;
    enabled: boolean = true;

    constructor(public container: HTMLElement, public el: HTMLElement, public intensity: number, public onzoom: Function) {
        Handlers.on(container, 'DOMMouseScroll mousewheel', this.wheel.bind(this));
        Handlers.on(container, 'touchmove', this.move.bind(this));
        Handlers.on(container, 'touchend', this.end.bind(this));
        Handlers.on(container, 'touchcancel', this.end.bind(this));
        Handlers.on(container, 'dblclick', this.dblclick.bind(this));
    }

    wheel(e: MouseWheelEvent) {
        if (this.enabled) {
            e.preventDefault();

            const rect = this.el.getBoundingClientRect();
            const wheelDelta = Handlers.extractDelta(e);
            const delta = (wheelDelta ? wheelDelta / 120 : - e.deltaY / 3) * this.intensity;

            var ox = (rect.left - e.clientX) * delta;
            var oy = (rect.top - e.clientY) * delta;

            this.onzoom(delta, ox, oy, 'wheel');
        }
    }

    touches(e: TouchEvent) {
        if (this.enabled) {
            let [x1, y1] = [e.touches[0].clientX, e.touches[0].clientY];
            let [x2, y2] = [e.touches[1].clientX, e.touches[1].clientY];
            let distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

            return {
                cx: (x1 + x2) / 2,
                cy: (y1 + y2) / 2,
                distance
            };
        }
    }

    move(e: TouchEvent) {
        if (this.enabled) {
            if (e.touches.length < 2) return;

            let rect = this.el.getBoundingClientRect();
            let { cx, cy, distance } = this.touches(e);

            if (this.distance !== null) {
                let delta = distance / this.distance - 1;

                var ox = (rect.left - cx) * delta;
                var oy = (rect.top - cy) * delta;

                this.onzoom(delta, ox, oy, 'touch');
            }
            this.distance = distance;
        }
    }

    end() {
        this.distance = null;
    }

    dblclick(e: MouseEvent) {
        if (this.enabled) {
            e.preventDefault();

            var rect = this.el.getBoundingClientRect();
            var delta = 4 * this.intensity;

            var ox = (rect.left - e.clientX) * delta;
            var oy = (rect.top - e.clientY) * delta;

            this.onzoom(delta, ox, oy, 'dblclick');
        }
    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }
}