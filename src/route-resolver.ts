export interface IRouteParser {
    (relativeURL: string): monapt.Option<monapt.Tuple2<string, Object>>;
}

export interface IRouteMatcher {
    (matched: string, pattern: string): boolean; 
}

export interface IRouteAndOptions {
    route: Route;
    options: Object;
}

export interface RouteResolver {

    resolve(relativeURL: string, routes: monapt.Map<string, Route>): monapt.Future<IRouteAndOptions>;
}
