/// <reference path="../../src/fivefold.ts" />

module TestApp {

    export class SimpleLayout extends fivefold.Layout {
        $content = $('#contents');

        constructor() {
            super();
            this.$content.html('');
            this.$content.css({ 'background-color': 'red'});
        }

        beforeDisplayContent() {
            this.$content.css({ 'background-color': 'white'});
        }

    }

    export class SimpleTemplate implements fivefold.ITemplate {
        render(param: Object): string {
            return param['text'];
        }
    }

    export class SimpleView extends fivefold.View {
        tagName = 'p';
        template = new SimpleTemplate();

        constructor(private text: string) {
            super();
        }

        values(): Object {
            return {
                'text': this.text,
            }
        }
    }

    export class SimpleController extends fivefold.Controller {
        layout = new SimpleLayout();

        index(): fivefold.ActionFuture {
            return monapt.future<SimpleView>(p => {
                setTimeout(() => {
                    p.success(new SimpleView('index'));
                }, 1000);
            });
        }

        hoge(): fivefold.ActionFuture {
            return monapt.future<SimpleView>(p => {
                p.success(new SimpleView('hoge'));
            });
        }

        fuga(): fivefold.ActionFuture {
            return monapt.future<SimpleView>(p => {
                p.success(new SimpleView('fuga'));
            });
        }
    }

    class Application {
        constructor() {
            var router = new fivefold.Router(relativeURL => {
                var pattern = relativeURL.slice(1);
                return new monapt.Some(monapt.Tuple2(pattern, {}));
            });

            router.routes(match => {
                match('/', 'TestApp.Simple::index');
                match('/index', 'TestApp.Simple::index');
                match('/hoge', 'TestApp.Simple::hoge');
                match('/fuga', 'TestApp.Simple::fuga');
            });
        }
    }

    new Application();
}