export class Route {

    constructor(public pattern: string,
                public controller: string,
                public method: string) { }
}

class RouteRepository {
    private routes: Object = {};

    routesMap(): monapt.Map<string, Route> {
        return new monapt.Map<string, Route>(this.routes);
    }

    registerRoute(route: Route) {
        this.routes[route.pattern] = route;
    }
}

var routeRepository = new RouteRepository();


class ErrorRouteRepository extends RouteRepository {

    routeForError(error: ActionError): monapt.Option<Route> {
        return super.routesMap().get(error.name);
    }

}

var errorRouteRepository = new ErrorRouteRepository();

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

export interface IErrorRouteRegister {
    (code: RouteError, controllerAndMethod: string);
    (errorMessage: string, controllerAndMethod: string);
}

function errorRouteRegisterFn(code: RouteError, controllerAndMethod: string);
function errorRouteRegisterFn(errorMessage: string, controllerAndMethod: string);
function errorRouteRegisterFn(code: any, controllerAndMethod: string) {
    var repository = errorRouteRepository;
    var comp = controllerAndMethod.split(routeSplitter);
    var route: Route = null;
    if (typeof code == 'number')
        route = new Route('' + code, comp[0], comp[1]);
    else 
        route = new Route(code, comp[0], comp[1]);
    repository.registerRoute(route);
}