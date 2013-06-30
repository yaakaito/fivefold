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

    export class Controller {

    }

    export class FinalErrorController extends Controller {

    }

    export class Action {
        pathOrName: string;
        method: string;
        static targetSplitter = /::/;

        constructor(public route: string, target: string) {
            var t = target.split(Action.targetSplitter);
            this.pathOrName = t[0];
            this.method = t[1];
        }
    }

    class ActionRepository {
        private static sharedInstance = new ActionRepository();
        private actions: Object = {};

        static ofMemory(): ActionRepository {
            return this.sharedInstance;
        }

        actionForRoute(route: string): monapt.Option<Action> {
            var action: Action = this.actions[route];
            if (action) {
                return new monapt.Some(action);
            }
            return new monapt.None<Action>();
        }

        storeAction(route: string, action: Action) {
            this.actions[route] = action;
        }
    }

    export class Dispatcher {
        private realizer = new ControllerRealizer();

        dispatch(action: Action, options: Object) {
            this.realizer.realizeTry(action.pathOrName).orElse(() => this.dispatchErrorTry())
                    .getOrElse(() => new FinalErrorController())//.dispatch(action.method, options);
        }

        private dispatchErrorTry(): monapt.Try<Controller> {
            return monapt.Try(() => {
                return ActionRepository.ofMemory().actionForRoute('dispatchFailure')
                        .map(action => action.pathOrName).get();
            }).flatMap(pathOrName => this.realizer.realizeTry(pathOrName));
        }
    }
}