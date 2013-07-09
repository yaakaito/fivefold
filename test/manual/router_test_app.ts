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

    export class SimpleTemplate {
        render(param: Object): string {
            return '<button class="button">' + param['text'] + '</button>';
        }
    }

    export class SimpleView extends fivefold.View {
        template = new SimpleTemplate();
        events = {
            'click .button' : 'showAlert'
        };
        text = '';

        tagName = 'p';

        render() {
            this.$el.html(this.template.render({
                'text': this.text    
            }));
        }

        showAlert() {
            alert(this.text);
        }
    }

    export class SimpleController extends fivefold.Controller {
        layout = SimpleLayout.create();

        index(): fivefold.ActionFuture {
            return fivefold.actionFuture(p => {
                setTimeout(() => {
                    p.success(SimpleView.create());
                }, 1000);
            });
        }

        hoge(): fivefold.ActionFuture {
            return fivefold.actionFuture(p => {
                p.success(SimpleView.create());
            });
        }

        fuga(): fivefold.ActionFuture {
            return fivefold.actionFuture(p => {
                p.success(SimpleView.create());
            });
        }
    }

    class SimpleResolver extends fivefold.RouteResolver {
        parse(relativeURL: string): fivefold.IRouteResolverParseResult {
            return {
                pattern: relativeURL.slice(1),
                options: {}
            }
        }

        match(matchedPattern, routePattern): boolean {
            return matchedPattern === routePattern;
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
            });
        }
    }

    new Application();
}