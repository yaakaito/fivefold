export class ActionFuture<V extends View> extends monapt.Future<V> { }

export var actionFuture = (f: (promise: monapt.IFuturePromiseLike<View>) => void): ActionFuture => {
    return monapt.future<View>(p => f(p));
}

export class ActionError implements Error {

    constructor(public name: string,
                public message: string) {
    
    }
}