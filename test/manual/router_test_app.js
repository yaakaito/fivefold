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
        return SimpleController;
    })(fivefold.Controller);
    TestApp.SimpleController = SimpleController;

    var SimpleResolver = (function (_super) {
        __extends(SimpleResolver, _super);
        function SimpleResolver() {
            _super.apply(this, arguments);
        }
        SimpleResolver.prototype.parse = function (relativeURL) {
            return {
                pattern: relativeURL.slice(1),
                options: {}
            };
        };

        SimpleResolver.prototype.match = function (matchedPattern, routePattern) {
            return matchedPattern === routePattern;
        };
        return SimpleResolver;
    })(fivefold.RouteResolver);

    var Application = (function () {
        function Application() {
            var router = new fivefold.Router(new SimpleResolver());
            router.routes(function (match) {
                match('/', 'TestApp.Simple::index');
                match('/index', 'TestApp.Simple::index');
                match('/hoge', 'TestApp.Simple::hoge');
                match('/fuga', 'TestApp.Simple::fuga');
            });
        }
        return Application;
    })();

    new Application();
})(TestApp || (TestApp = {}));
