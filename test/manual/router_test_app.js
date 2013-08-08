var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TestApp;
(function (TestApp) {
    var SimpleLayout = (function (_super) {
        __extends(SimpleLayout, _super);
        function SimpleLayout() {
            _super.call(this);
            this.$content = $('#contents');
            this.$content.html('');
            this.$content.css({ 'background-color': 'red' });
        }
        SimpleLayout.prototype.beforeDisplayContent = function () {
            this.$content.css({ 'background-color': 'white' });
        };
        return SimpleLayout;
    })(fivefold.Layout);
    TestApp.SimpleLayout = SimpleLayout;

    var SimpleTemplate = (function () {
        function SimpleTemplate() {
        }
        SimpleTemplate.prototype.render = function (param) {
            return '<button class="button">' + param['text'] + '</button>';
        };
        return SimpleTemplate;
    })();
    TestApp.SimpleTemplate = SimpleTemplate;

    var SimpleView = (function (_super) {
        __extends(SimpleView, _super);
        function SimpleView() {
            _super.apply(this, arguments);
            this.template = new SimpleTemplate();
            this.events = {
                'click .button': 'showAlert'
            };
            this.text = '';
            this.tagName = 'p';
        }
        SimpleView.createWithText = function (text) {
            var view = this.create();
            view.text = text;
            return view;
        };

        SimpleView.prototype.render = function () {
            this.$el.html(this.template.render({
                'text': this.text
            }));
            return this;
        };

        SimpleView.prototype.showAlert = function () {
            alert(this.text);
        };
        return SimpleView;
    })(fivefold.View);
    TestApp.SimpleView = SimpleView;

    var SimpleController = (function (_super) {
        __extends(SimpleController, _super);
        function SimpleController() {
            _super.apply(this, arguments);
            this.layout = SimpleLayout.create();
        }
        SimpleController.prototype.index = function () {
            return fivefold.actionFuture(function (p) {
                setTimeout(function () {
                    p.success(SimpleView.createWithText('index'));
                }, 1000);
            });
        };

        SimpleController.prototype.fail = function () {
            return fivefold.actionFuture(function (p) {
                setTimeout(function () {
                    p.failure(new fivefold.ActionError('AError', 'Errorrrrrrr'));
                }, 1000);
            });
        };

        SimpleController.prototype.hoge = function () {
            return fivefold.actionFuture(function (p) {
                p.success(SimpleView.createWithText('hoge'));
            });
        };

        SimpleController.prototype.fuga = function () {
            return fivefold.actionFuture(function (p) {
                p.success(SimpleView.createWithText('fuga'));
            });
        };

        SimpleController.prototype.forError = function () {
            return fivefold.actionFuture(function (p) {
                p.success(SimpleView.createWithText('error in simple controller'));
            });
        };
        return SimpleController;
    })(fivefold.Controller);
    TestApp.SimpleController = SimpleController;

    var ErrorController = (function (_super) {
        __extends(ErrorController, _super);
        function ErrorController() {
            _super.apply(this, arguments);
            this.layout = SimpleLayout.create();
        }
        ErrorController.prototype.for404 = function () {
            return fivefold.actionFuture(function (p) {
                p.success(SimpleView.createWithText('404 page'));
            });
        };

        ErrorController.prototype.for503 = function () {
            return fivefold.actionFuture(function (p) {
                setTimeout(function () {
                    p.failure(new fivefold.ActionError('AError', 'Errorrrrrrr'));
                }, 1000);
            });
        };
        return ErrorController;
    })(fivefold.Controller);
    TestApp.ErrorController = ErrorController;

    var SimpleResolver = (function () {
        function SimpleResolver() {
        }
        SimpleResolver.prototype.resolve = function (relativeURL, routes) {
            var url = relativeURL.slice(1);
            return monapt.future(function (promise) {
                routes.get(url).match({
                    Some: function (route) {
                        return promise.success({ route: route, options: {} });
                    },
                    None: function () {
                        return promise.failure(new Error('Not found'));
                    }
                });
            });
        };
        return SimpleResolver;
    })();

    var Application = (function () {
        function Application() {
            var router = new fivefold.Router(new SimpleResolver());
            router.routes(function (match) {
                match('/', 'TestApp.Simple::index');
                match('/index', 'TestApp.Simple::index');
                match('/hoge', 'TestApp.Simple::hoge');
                match('/fuga', 'TestApp.Simple::fuga');
                match('/fail', 'TestApp.Simple::fail');
            });

            router.errorRoutes(function (match) {
                match(fivefold.RouteError.NotFound, 'TestApp.Error::for404');
                match(fivefold.RouteError.DispatchFailure, 'TestApp.Error::for503');
                match('AError', 'TestApp.Simple::forError');
            });
        }
        return Application;
    })();

    new Application();
})(TestApp || (TestApp = {}));
