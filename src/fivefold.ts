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

    export interface ITemplate {
        render(param: Object): string;
    }
 
    export class View {

        $el: JQuery = null;
        tagName: string = 'div';
        id: string = '';
        className: string = '';
        attributes: Object = {};

        template: ITemplate = null;

        constructor() {
            this.ensureElement();
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

        render() {
            if (this.template) {
                this.$el.html(this.template.render(this.values()));
            }
        }

        values(): Object {
            return {};
        }
    }

    export class Layout extends View {
        $el = $(document.body);
        $content = $(document.body);

        beforeDisplayContent() {
            ;
        }
    }

    var layout = new Layout();

    export class ActionFuture<V extends View> extends monapt.Future<V> { }

    export class Controller {

        public layout: Layout = layout;

        dispatch(method: string, options: Object) {
            var future = <ActionFuture<View>>this[method](options);
            future.onComplete(view => {
                view.match({
                    Success: view => {
                        view.render();
                        this.layout.beforeDisplayContent();
                        this.layout.$content.html(view.$el);
                    },
                    Failure: error => {
                        console.log('error');
                    }    
                });
            });
        }
    }

    export class FinalErrorController extends Controller {

    }

    export interface IRouteParser {
        (relativeURL: string): monapt.Option<monapt.Tuple2<string, Object>>;
    }

    export class Route {

        constructor(public pattern: string,
                    public controller: string,
                    public method: string) { }
    }

    export class RouteRepository {
        private static sharedInstance = new RouteRepository();
        private routes: Object = {};
        public parser: IRouteParser;

        static ofMemory(): RouteRepository {
            return RouteRepository.sharedInstance;
        }

        routeForRelativeURL(relativeURL: string): monapt.Option<Route> {
            this.validate();
            return this.parser(relativeURL).flatMap<Route>(t => new monapt.Map(this.routes).get(t._1));
        }

        routeForKey(key: string): monapt.Option<Route> {
            this.validate();
            return null;
        }

        private validate() {
            if (!this.parser) {
                throw new Error('No such parser');
            }
        }

        registerRoute(route: Route) {
            this.routes[route.pattern] = route;
        }

    }

    export interface IRouteMatcher {
        (pattern :string, controllerAndMethod: string);
        (pattern :string, redirect: { redirectTo: string; });
    }

    var routeSplitter = /::/;

    function routeMatcher(pattern :string, controllerAndMethod: string): void;
    function routeMatcher(pattern :string, redirect: { redirectTo: string; }): void;
    function routeMatcher(pattern :string, controllerOrRedirect: any): void {
        var repository = RouteRepository.ofMemory();
        if (typeof controllerOrRedirect == "string") {
            var comp = controllerOrRedirect.split(routeSplitter);
            repository.registerRoute( new Route(pattern, comp[0], comp[1]) );
        } else {
            // redirect
//            repository.registerRoute( new Route('/index', 'Controller'))
        }
    }

    export class Router {

        private routeRepository = RouteRepository.ofMemory();
        private dispatcher = new Dispatcher();

        constructor(private parser: IRouteParser) {
            this.routeRepository.parser = parser;
            this.start();
        }

        private start() {
            window.onhashchange = (event: Object) => {
                var relativeURL: string = location.hash;
                this.routeRepository.routeForRelativeURL(relativeURL).match({
                    Some: route => {
                        var options = this.parser(relativeURL).getOrElse(() => monapt.Tuple2(null, null))._2;
                        this.dispatcher.dispatch(route, options);
                    },
                    None: () => {
                        // 404;
                    }
                })
            }
        }

        routes(routes: (matcher: IRouteMatcher) => void) { 
            routes(routeMatcher);
        }
    }

    export class Dispatcher {
        private realizer = new ControllerRealizer();

        dispatch(route: Route, options: Object) {
            this.realizer.realizeTry(route.controller).orElse(() => this.dispatchErrorTry())
                    .getOrElse(() => new FinalErrorController()).dispatch(route.method, options);
        }

        private dispatchErrorTry(): monapt.Try<Controller> {
            return monapt.Try(() => {
                return RouteRepository.ofMemory().routeForRelativeURL('dispatchFailure')
                        .map(route => route.controller).get();
            }).flatMap(pathOrName => this.realizer.realizeTry(pathOrName));
        }
    }
}