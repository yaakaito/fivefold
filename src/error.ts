export enum RouteError {
    NotFound = -1,
    DispatchFailure = -2
}

var NotFound = () => new ActionError('-1', '');
var DispatchFailure = () => new ActionError('-2', '');