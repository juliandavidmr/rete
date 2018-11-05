// Decorador para funciones
export function Event(eventName: string) {
    return function (target: any, key: any, descriptor: any) {
        const originalMethod = descriptor.value;
        descriptor.value = function () {
            console.log(`${key} was called with:`, arguments);
            var result = originalMethod.apply(this, arguments);
            return result;
        };
        return descriptor;
    }
}


/**
@Event('nodecreated')
function OnCreateNode(node: Node) {
    console.log('Node created:', node)
}
 */