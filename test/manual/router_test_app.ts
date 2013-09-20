/// <reference path="../../definitions/monapt/monapt.d.ts" />
/// <reference path="../../compiled/fivefold.ts" />

module TestApp {

    export class SimpleLayout extends fivefold.Layout {

        $content = $('#contents');

        events(): Object {
            return {
                'click #history-current': () => console.log(fivefold.history.current()),
                'click #history-dump':  () => console.log(fivefold.history.previous(100)), // FIXME
                'click #history-previous':  () => console.log(fivefold.history.previous()[0]),
                'click #history-previous-2':  () => console.log(fivefold.history.previous(2)),
                'click #history-previous-10':  () => console.log(fivefold.history.previous(10)),                
            };
        }

        constructor() {
            super();
            this.$content.html('');
            this.$content.css({ 'background-color': 'red'});
        }

        beforeDisplayContent() {
            this.$content.css({ 'background-color': 'white'});
        }

    }

    export class SimpleTemplate {
        render(param: Object): string {
            return '<button class="button">' + param['text'] + '</button>';
        }
    }

    export class SimpleView extends fivefold.View {
        template = new SimpleTemplate();
        text = '';

        static createWithText(text) {
            var view = new this({
                tagName: 'p'
            });
            view.text = text;
            return view;
        }


        events(): Object {
            return {
                'click .button' : 'showAlert'
            };
        }


        render(): SimpleView {
            this.$el.html(this.template.render({
                'text': this.text    
            }));
            return  this;
        }

        showAlert() {
            alert(this.text);
        }
    }

    var layout = new SimpleLayout();
    export class SimpleController extends fivefold.Controller {
        layout = layout;

        index(): fivefold.ActionFuture {
            return fivefold.actionFuture(p => {
                setTimeout(() => {
                    p.success(SimpleView.createWithText('index'));
                }, 1000);
            });
        }

        fail(): fivefold.ActionFuture {
            return fivefold.actionFuture(p => {
                setTimeout(() => {
                    p.failure(new fivefold.ActionError('AError', 'Errorrrrrrr'));
                }, 1000);
            });
        }

        hoge(): fivefold.ActionFuture {
            return fivefold.actionFuture(p => {
                p.success(SimpleView.createWithText('hoge'));
            });
        }

        fuga(): fivefold.ActionFuture {
            return fivefold.actionFuture(p => {
                p.success(SimpleView.createWithText('fuga'));
            });
        }


        forError(error: Error): fivefold.ActionFuture {
            return fivefold.actionFuture(p => {
                p.success(SimpleView.createWithText(error.message));
            });
        }
    }

    export class ErrorController extends fivefold.Controller {
        layout = layout;

        for404(): fivefold.ActionFuture {
            return fivefold.actionFuture(p => {
                p.success(SimpleView.createWithText('404 page'));
            });
        }

        for503(): fivefold.ActionFuture {
            return fivefold.actionFuture(p => {
                setTimeout(() => {
                    p.failure(new fivefold.ActionError('AError', 'Errorrrrrrr'));
                }, 1000);
            });
        }
    }


    class SimpleResolver implements fivefold.RouteResolver {

        resolve(relativeURL: string, routes: monapt.Map<string, fivefold.Route>): monapt.Future<fivefold.IRouteAndOptions> {
            var url = relativeURL.slice(1);
            return monapt.future(promise => {
                routes.get(url).match({
                    Some: route => promise.success({ route: route, options: {}}),
                    None: () => promise.failure(new Error('Not found')),
                });
            });
        }

    }

    class Application {
        constructor() {
            var router = new fivefold.Router(new SimpleResolver());
            router.routes(match => {
                match('/', 'TestApp.Simple::index');
                match('/index', 'TestApp.Simple::index');
                match('/hoge', 'TestApp.Simple::hoge');
                match('/fuga', 'TestApp.Simple::fuga');
                match('/fail', 'TestApp.Simple::fail');
            });

            router.errorRoutes(match => {
                match(fivefold.RouteError.NotFound, 'TestApp.Error::for404');
                match(fivefold.RouteError.DispatchFailure, 'TestApp.Error::for503');
                match('AError', 'TestApp.Simple::forError');
            });

            router.listen((route?) => {
                console.log(route);
            });
        }
    }

    new Application();
}