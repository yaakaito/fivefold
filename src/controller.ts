export class Controller {

    public layout: Layout = defaultLayout;

    dispatch(method: string, options: Object) {

        this.layout.render();
        var actionFuture = <ActionFuture<View>>this[method](options);
        actionFuture.onSuccess(view => {
            view.render();
            this.layout.beforeDisplayContent();
            this.layout.display(view.$el);
        });
        actionFuture.onFailure(error => console.log(error));

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