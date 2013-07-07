/// <reference path="../definitions/monapt/monapt.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />


module fivefold {

    export class Realizer<T> {
        prefix = '';
        suffix = '';
        static pathSplitter = /\./;
        
        realizeTry(pathOrName: string): monapt.Try<T> {
            return monapt.Try<T>(() => this.realize(pathOrName));
        }

        private realize(pathOrName: string): T {
            var clazz: new() => T = this.getClass(this.parsePathOrName(pathOrName));
            return new clazz();
        }

        parsePathOrName(pathOrName: string): string[] {
            return pathOrName.split(Realizer.pathSplitter);
        }

        getClass(pathComponents: string[]): new() => T {
            var current: any = window;
            for (var i = 0, l = pathComponents.length, component; i < l; i++) {
                component = pathComponents[i];
                // Finally, I want to add prefix and suffix.
                // e.g.
                //   path   = 'service.Feed'
                //   suffix = 'Controller'
                //   
                //   return : window.service.FeedController
                current = current[i == l - 1 ? this.prefix + component + this.suffix : component];
            }
            return <new() => T>current;
        }
    }

    export class ControllerRealizer extends Realizer<Controller> {
        suffix = 'Controller';
    }

    export class Scenario {

        params(view: View): Object {
            return {};
        }

        onBefore(view: View) {
            ;
        }

        execute(view: View, params: Object, success: () => void, failure: () => void) {
            ;
        }

        onAfter(view: View) {
            ;
        }

        executeScenario(view: View) {
            this.onBefore(view);
            this.execute(view, this.params(view), () => {
                this.onAfter(view);    
            }, () => {
                this.onAfter(view);
            });
        }

    }
 
    export class View {

        static eventSplitter = /^(\S+)\s*(.*)$/;
        $el: JQuery = null;
        tagName: string = 'div';
        id: string = '';
        className: string = '';
        attributes: Object = {};
        events: Object;
        scenarios: Object;

        private ensureFuture: monapt.Future<View>;

        constructor() {
            this.ensureFuture = monapt.future<View>(p => {
                setTimeout(() => {
                    try {
                        this.ensureElement();
                        this.delegateEvents();
                        this.created(this.$el);                        
                        p.success(this);
                    }
                    catch (e) {
                        p.failure(e);
                    }
                }, 0);                
            });
        }

        private ensureElement() {
            if (this.$el) {
                return ;
            }

            var attributes = {};
            for (var key in this.attributes) {
                attributes[key] = this.attributes[key];
            }
            attributes['id'] = this.id;
            attributes['class'] = this.className;
            
            this.$el =  $('<' + this.tagName + '>').attr(attributes);
        }

        private delegateEvents() {
            var events = new monapt.Map<string, string>(this.events);
            events.mapValues(fn => this[fn]).filter(fn => $.isFunction(fn)).map((event, fn) => {
                var match = event.match(View.eventSplitter);
                return monapt.Tuple2(match[1], monapt.Tuple2(match[2], fn));    
            }).foreach($.proxy(this.delegate, this));
        }

        private delegateScenarios() {
            var scenarios = new monapt.Map<string, Scenario>(this.scenarios);
            scenarios.mapValues(scenario => () => {
                scenario.executeScenario(this);
            }).map((event, fn) => {
                var match = event.match(View.eventSplitter);
                return monapt.Tuple2(match[1], monapt.Tuple2(match[2], fn));
            }).foreach($.proxy(this.delegate, this));
        }

        private delegate(event: string, selectorAndFn: monapt.Tuple2<string, Function>) {
            var selector = selectorAndFn._1,
                method   = selectorAndFn._2;
            if (selector && selector !== '') {
                this.$el.on(event + '.fivefold', method);
            } else {
                this.$el.on(event + '.fivefold', selector, method);
            }
        }

        renderFuture(): monapt.Future<View> {
            return this.ensureFuture.map<View>((view, p) => {
                setTimeout(() => {
                    try {
                        this.render();
                        p.success(this);
                    } catch (e) {
                        p.failure(e);
                    }
                }, 0);
            });
        }

        render() {
            ;
        }

        // @overridable
        created($el: JQuery) {
            ;
        }
    }

    export class Layout extends View {
        $el = $(document.body);
        $content = $(document.body);

        beforeDisplayContent() {
            ;
        }

        renderFuture(): monapt.Future<Layout> {
            return super.renderFuture();
        }

        display(elem: JQuery) {
            this.$content.html(elem);
        }
    }

    var layout = new Layout();

    export class ActionFuture<V extends View> extends monapt.Future<V> { }

    export var actionFuture = (f: (promise: monapt.IFuturePromiseLike<View>) => void): ActionFuture => {
        return monapt.future<View>(p => f(p));
    }

    export class Controller {

        public layout: Layout = layout;

        dispatchFuture(method: string, options: Object): monapt.Future<View> {

            var renderLayoutFuture = this.layout.renderFuture();
            var actionFuture = <ActionFuture<View>>this[method](options);

            return actionFuture.flatMap<View>(view => {
                return renderLayoutFuture.map<View>((layout, promise) => {
                    setTimeout(() => {
                        var future = view.renderFuture();    
                        future.onSuccess(view => {
                            layout.beforeDisplayContent(); 
                            layout.display(view.$el);   
                            promise.success(view);
                        });
                        future.onFailure(e => promise.failure(e));
                    });
                });
            });

        }
    }

    class ControllerRepository {

        controllerForRoute(route: Route): monapt.Option<Controller> {
            var realizer = new ControllerRealizer();
            return realizer.realizeTry(route.controller)
                    .map<monapt.Option<Controller>>(controller => new monapt.Some(controller))
                    .getOrElse(() => new monapt.None<Controller>());
        }
    }

    var controllerRepository = new ControllerRepository();


    export interface IRouteParser {
        (relativeURL: string): monapt.Option<monapt.Tuple2<string, Object>>;
    }

    export interface IRouteMatcher {
        (matched: string, pattern: string): boolean; 
    }

    export class Route {

        constructor(public pattern: string,
                    public controller: string,
                    public method: string) { }
    }

    export interface IRouteResolverParseResult {
        pattern: string;
        options: Object;
    }

    export class RouteResolver {

        resolve(relativeURL: string, routes: monapt.Map<string, Route>): monapt.Option<monapt.Tuple2<Route, Object>> {
            var r = this.parse(relativeURL);
            return routes.find((k, v) => this.match(r.pattern, k))
                    .map<monapt.Tuple2<Route, Object>>(t => monapt.Tuple2(t._2, r.options));
        }

        parse(relativeURL: string): IRouteResolverParseResult {
            return {
                options: {},
                pattern: null
            }
        }

        match(matched: string, pattern: string): boolean {
            return false;
        }
    }

    export class RouteRepository {
        private routes: Object = {};

        routesMap(): monapt.Map<string, Route> {
            return new monapt.Map<string, Route>(this.routes);
        }

        registerRoute(route: Route) {
            this.routes[route.pattern] = route;
        }
    }

    var routeRepository = new RouteRepository();

    export interface IRouteRegister {
        (pattern :string, controllerAndMethod: string);
        (pattern :string, redirect: { redirectTo: string; });
    }

    var routeSplitter = /::/;

    function routeRegisterFn(pattern :string, controllerAndMethod: string): void;
    function routeRegisterFn(pattern :string, redirect: { redirectTo: string; }): void;
    function routeRegisterFn(pattern :string, controllerOrRedirect: any): void {
        var repository = routeRepository;
        if (typeof controllerOrRedirect == "string") {
            var comp = controllerOrRedirect.split(routeSplitter);
            repository.registerRoute( new Route(pattern, comp[0], comp[1]));
        } else {
            // redirect
            // repository.registerRoute( new Route('/index', 'Controller'))
        }
    }

    export class Router {

        private dispatcher = new Dispatcher();

        constructor(private resolver: RouteResolver) {
            this.start();
        }

        private start() {
            window.onhashchange = (event: Object) => {
                this.onHashChange();
            }
            setTimeout(() => this.onHashChange(), 0);
        }

        private onHashChange() {
            var relativeURL: string = location.hash;
            this.resolver.resolve(relativeURL, routeRepository.routesMap())
                    .match({
                        Some: t => this.dispatcher.dispatch(t._1, t._2),
                        None: () => console.error('No route...')
                    });
        }

        routes(routes: (match: IRouteRegister) => void) { 
            routes(routeRegisterFn);
        }
    }

    export class Dispatcher {

        dispatch(route: Route, options: Object) {
            controllerRepository.controllerForRoute(route).match({
                Some: controller => controller.dispatchFuture(route.method, options),
                None: () => console.error('Dispatch failure.')
            });
        }

    }
}