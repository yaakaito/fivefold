function proxy(fn : (...args: any[]) => any, context: any, ...args: any[]): any {
    if (!isFunction(fn)) {
        return undefined;
    }

    return function(){
        return fn.apply( context || this, args);
    }
}