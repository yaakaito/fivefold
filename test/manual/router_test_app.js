var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TestApp;
(function (TestApp) {
    var SimpleController = (function (_super) {
        __extends(SimpleController, _super);
        function SimpleController() {
            _super.apply(this, arguments);
            this.pageName = document.getElementById('pageName');
        }
        SimpleController.prototype.index = function () {
            this.pageName.innerHTML = 'index';
        };

        SimpleController.prototype.hoge = function () {
            this.pageName.innerHTML = 'hoge';
        };

        SimpleController.prototype.fuga = function () {
            this.pageName.innerHTML = 'fuga';
        };
        return SimpleController;
    })(fivefold.Controller);
    TestApp.SimpleController = SimpleController;

    var Application = (function () {
        function Application() {
            var router = new fivefold.Router(function (relativeURL) {
                var pattern = relativeURL.slice(1);
                return new monapt.Some(monapt.Tuple2(pattern, {}));
            });

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
