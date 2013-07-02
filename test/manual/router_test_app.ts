/// <reference path="../../src/fivefold.ts" />

module TestApp {

    export class SimpleController extends fivefold.Controller {
        pageName = document.getElementById('pageName');

        index() {
            this.pageName.innerHTML = 'index';            
        }

        hoge() {
            this.pageName.innerHTML = 'hoge';            
        }

        fuga() {
            this.pageName.innerHTML = 'fuga';
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