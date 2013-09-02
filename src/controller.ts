// こことDispatcherに闇を押し込んだ

export class Controller {

    public layout: Layout = defaultLayout;

    // mapで合成出来そう
    dispatch(method: string, optionsOrError: any): monapt.Future<View> {

        this.layout.render();
        var promise = new monapt.Promise<View>();

        // これ例外拾わないと駄目そう
        var action = <ActionFuture<View>>this[method](optionsOrError);
        action.onComplete(r => r.match({
            Success: view => {
                try {
                    if (view.autoRender) view.render();
                    this.layout.beforeDisplayContent();
                    this.layout.display(view.$el);
                    promise.success(view);
                } catch(e) {
                    errorLog(e);
                    promise.failure(e);
                }
            },
            Failure: e => {
                promise.failure(e);
                errorLog(e);
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