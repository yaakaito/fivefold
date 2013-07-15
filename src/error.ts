export enum RouteError {
    NotFound = -1,
    DispatchFailure = -2
}

var NotFound = () => new Error('fivefold' + RouteError.NotFound);
var DispatchFailure = () => new Error('fivefold' + RouteError.DispatchFailure);