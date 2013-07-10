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
            Some: controller => controller.dispatch(route.method, options),
            None: () => console.error('Dispatch failure.')
        });
    }

}