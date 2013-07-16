

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
        this.resolver.resolve(relativeURL, routeRepository.routesMap()).match({
            Some: t => this.dispatcher.dispatch(t._1, t._2),
            None: () => this.dispatcher.dispatchError(NotFound())
        });
    }

    routes(routes: (match: IRouteRegister) => void) { 
        routes(routeRegisterFn);
    }

    errorRoutes(routes: (match: IErrorRouteRegister) => void) {
        routes(errorRouteRegisterFn);
    }
}

export class Dispatcher {

    dispatch(route: Route, options: Object) {
        controllerRepository.controllerForRouteTry(route).match({
            Success: controller => controller.dispatch(route.method, options),
            Failure: e => this.dispatchError(e)
        });
    }

    dispatchError(error: Error) {
        errorRouteRepository.routeForError(error).match({
            Some: route => { this.dispatch(route, {}) },
            None: () => { throw new Error('Route not found: ' + error.message) }
        });
    }
}