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
