export module Handlers {

    export function on(element: HTMLElement, events: string, handler: (...args: any[]) => void, options?: boolean | AddEventListenerOptions) {
        str2arr(events).map(eventName => {
            element.addEventListener(eventName, handler, options)
        })
    }

    export function str2arr(s: string, d?: string) { return s.split(d || ' ') }

    export function extractDelta(e: any) {
        if (typeof e === 'object') {
            if (e.wheelDelta) {
                return e.wheelDelta;
            }
    
            if (e.originalEvent) {
                if (e.originalEvent.detail) {
                    return e.originalEvent.detail * -40;
                }
        
                if (e.originalEvent.wheelDelta) {
                    return e.originalEvent.wheelDelta;
                }
            }
        }
    }
}