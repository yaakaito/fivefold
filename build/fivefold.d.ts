declare module fivefold {
    class Realizer<T> {
        public prefix: string;
        public suffix: string;
        static pathSplitter: RegExp;
        public realizeTry(pathOrName: string): monapt.Try<T>;
        private realize(pathOrName);
        public parsePathOrName(pathOrName: string): string[];
        public getClass(pathComponents: string[]): new() => Controller;
    }
    class Scenario {
        public params(view: View): Object;
        public onBefore(view: View): void;
        public execute(view: View, params: Object, success: () => void, failure: () => void): void;
        public onAfter(view: View): void;
        public executeScenario(view: View): void;
    }
    class View {
        private cid;
        public $el: JQuery;
        public tagName: string;
        public id: string;
        public className: string;
        public attributes: Object;
        public events: Object;
        public scenarios: Object;
        static create(): View;
        public delegate(event: string, fn: Function);
        public delegate(event: string, selector: string, fn: Function);
        public undelegateAll(): void;
        public render(): void;
    }
    class Layout extends View {
        public $el: JQuery;
        public $content: JQuery;
        static create(): Layout;
        public beforeDisplayContent(): void;
        public display(elem: JQuery): void;
    }
    class Controller {
        public layout: Layout;
        public dispatch(method: string, options: Object): void;
    }
    class ControllerRealizer extends Realizer<Controller> {
        public suffix: string;
    }
    class ActionFuture<V extends fivefold.View> extends monapt.Future<V> {
    }
    var actionFuture: (f: (promise: monapt.IFuturePromiseLike<fivefold.View>) => void) => ActionFuture<V>;
    class Route {
        public pattern: string;
        public controller: string;
        public method: string;
        constructor(pattern: string, controller: string, method: string);
    }
    class RouteRepository {
        private routes;
        public routesMap(): monapt.Map<string, fivefold.Route>;
        public registerRoute(route: Route): void;
    }
    interface IRouteParser {
        (relativeURL: string): monapt.Option<monapt.Tuple2<string, Object>>;
    }
    interface IRouteMatcher {
        (matched: string, pattern: string): boolean;
    }
    interface IRouteResolverParseResult {
        pattern: string;
        options: Object;
    }
    class RouteResolver {
        public resolve(relativeURL: string, routes: monapt.Map<string, fivefold.Route>): monapt.Option<monapt.Tuple2<fivefold.Route, Object>>;
        public parse(relativeURL: string): IRouteResolverParseResult;
        public match(matched: string, pattern: string): boolean;
    }
    interface IRouteRegister {
        (pattern: string, controllerAndMethod: string);
        (pattern: string, redirect: {
            redirectTo: string;
        });
    }
    class Router {
        private resolver;
        private dispatcher;
        constructor(resolver: RouteResolver);
        private start();
        private onHashChange();
        public routes(routes: (match: IRouteRegister) => void): void;
    }
    class Dispatcher {
        public dispatch(route: Route, options: Object): void;
    }
}
