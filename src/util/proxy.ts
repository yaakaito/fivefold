function proxy(fn : (...args: any[]) => any, context: any): any {
    if (!isFunction(fn)) {
        return undefined;
    }

    return function (){
        return fn.apply(context || this, Array.prototype.slice.call(arguments));
    }
}