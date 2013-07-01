/// <reference path="../definitions/monapt/monapt.d.ts" />

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

    export class View {
        render() {

        }
    }

    export class Layout extends View {

    }

    export class ActionFuture<V extends View> extends monapt.Future<V> { }

    export class Controller {

        public layout: Layout;

        dispatch(route: Route) {
            var future = <ActionFuture<View>>this[route.method]();
            future.onComplete(view => {
                view.match({
                    Success: view => {

                    },
                    Failure: error => {

                    }    
                });
            });

        }
    }

    export class FinalErrorController extends Controller {

    }

    export class Route {

        constructor(public pattern: string,
                    public controller: string,
                    public method: string) { }
    }

    export class RouteRepository {
        private static sharedInstance = new RouteRepository();
        private routes: Object = {};
        public parser: Function;

        static ofMemory(): RouteRepository {
            return this.sharedInstance;
        }

        routeForRelativeURL(relativeURL: string): monapt.Option<Route> {
            this.validate();
            return null;
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

    }

    export class Dispatcher {
        private realizer = new ControllerRealizer();

        dispatch(action: Route, options: Object) {
            this.realizer.realizeTry(action.controller).orElse(() => this.dispatchErrorTry())
                    .getOrElse(() => new FinalErrorController())//.dispatch(action.method, options);
        }

        private dispatchErrorTry(): monapt.Try<Controller> {
            return monapt.Try(() => {
                return RouteRepository.ofMemory().routeForRelativeURL('dispatchFailure')
                        .map(action => action.controller).get();
            }).flatMap(pathOrName => this.realizer.realizeTry(pathOrName));
        }
    }
}