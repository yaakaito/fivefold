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
        var resolve = this.resolver.resolve(relativeURL, routeRepository.routesMap());
        resolve.onComplete(r => r.match({
            Success: routeAndOptions => this.dispatcher.dispatch(routeAndOptions.route, routeAndOptions.options),
            Failure: error => this.dispatcher.dispatchError(NotFound())
        }));
    }

    routes(routes: (match: IRouteRegister) => void) { 
        routes(routeRegisterFn);
    }

    errorRoutes(routes: (match: IErrorRouteRegister) => void) {
        routes(errorRouteRegisterFn);
    }
}

// こことControllerに闇を押し込んだ

class Dispatcher {

    dispatch(route: Route, options: Object) {
        controllerRepository.controllerForRouteTry(route).match({
            Success: controller => {
                controller.dispatch(route.method, options).onFailure(error => {
                    this.dispatchError(error);    
                });
            },
            Failure: e => this.dispatchError(e)
        });
    }

    dispatchError(error: ActionError) {
        errorRouteRepository.routeForError(error).match({
            Some: route => { this.dispatch(route, {}) },
            None: () => { throw new Error('Route not found: ' + error.message) }
        });
    }
}