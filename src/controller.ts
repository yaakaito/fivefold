// こことDispatcherに闇を押し込んだ

export class Controller {

    public layout: Layout = defaultLayout;

    // mapで合成出来そう
    dispatch(method: string, options: Object): monapt.Future<View> {

        this.layout.render();
        var promise = new monapt.Promise<View>();

        var action = <ActionFuture<View>>this[method](options);
        action.onComplete(r => r.match({
            Success: view => {
                try {
                    view.render();
                    this.layout.beforeDisplayContent();
                    this.layout.display(view.$el);
                    promise.success(view);
                } catch(e) {
                    error(e);
                    promise.failure(e);
                }
            },
            Failure: e => {
                promise.failure(e);
                error(e);
            }
        }));

        return promise.future();
    }
}

class ControllerRepository {

    controllerForRouteTry(route: Route): monapt.Try<Controller> {
        var realizer = new ControllerRealizer();
        return realizer.realizeTry(route.controller).filter(controller => controller instanceof Controller);
    }
}

var controllerRepository = new ControllerRepository();  

export class ControllerRealizer extends Realizer<Controller> {
    suffix = 'Controller';
}