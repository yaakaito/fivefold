export interface IRouteParser {
    (relativeURL: string): monapt.Option<monapt.Tuple2<string, Object>>;
}

export interface IRouteMatcher {
    (matched: string, pattern: string): boolean; 
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
