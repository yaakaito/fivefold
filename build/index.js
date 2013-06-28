var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fivehold;
(function (fivehold) {
    var Realizer = (function () {
        function Realizer() {
            this.prefix = '';
            this.suffix = '';
        }
        Realizer.prototype.realizeTry = function (pathOrName) {
            var _this = this;
            return monapt.Try(function () {
                return _this.realize(pathOrName);
            });
        };

        Realizer.prototype.realize = function (pathOrName) {
            var clazz = this.getConstructor(this.parsePathOrName(pathOrName));
            return new clazz();
        };

        Realizer.prototype.parsePathOrName = function (pathOrName) {
            return pathOrName.split(Realizer.pathSplitter);
        };

        Realizer.prototype.getConstructor = function (pathComponents) {
            var current = window;
            for (var i = 0, l = pathComponents.length, component; i < l; i++) {
                component = pathComponents[i];

                current = current[i == l - 1 ? this.prefix + component + this.suffix : component];
            }
            return current;
        };
        Realizer.pathSplitter = /\./;
        return Realizer;
    })();
    fivehold.Realizer = Realizer;

    var ControllerRealizer = (function (_super) {
        __extends(ControllerRealizer, _super);
        function ControllerRealizer() {
            _super.apply(this, arguments);
            this.suffix = 'Controller';
        }
        return ControllerRealizer;
    })(Realizer);
    fivehold.ControllerRealizer = ControllerRealizer;

    var Controller = (function () {
        function Controller() {
        }
        return Controller;
    })();
    fivehold.Controller = Controller;

    var FinalErrorController = (function (_super) {
        __extends(FinalErrorController, _super);
        function FinalErrorController() {
            _super.apply(this, arguments);
        }
        return FinalErrorController;
    })(Controller);
    fivehold.FinalErrorController = FinalErrorController;

    var Action = (function () {
        function Action(route, target) {
            this.route = route;
            var t = target.split(Action.targetSplitter);
            this.pathOrName = t[0];
            this.method = t[1];
        }
        Action.targetSplitter = /::/;
        return Action;
    })();
    fivehold.Action = Action;

    var Memory = 1;
    var ActionRepository = (function () {
        function ActionRepository() {
            this.actions = {};
        }
        ActionRepository.of = function (type) {
            return this.sharedInstance;
        };

        ActionRepository.prototype.actionForRoute = function (route) {
            var action = this.actions[route];
            if (action) {
                return new monapt.Some(action);
            }
            return new monapt.None();
        };

        ActionRepository.prototype.storeAction = function (route, action) {
            this.actions[route] = action;
        };
        ActionRepository.sharedInstance = new ActionRepository();
        return ActionRepository;
    })();

    var Dispatcher = (function () {
        function Dispatcher() {
            this.realizer = new ControllerRealizer();
        }
        Dispatcher.prototype.dispatch = function (action, options) {
            var _this = this;
            this.realizer.realizeTry(action.pathOrName).orElse(function () {
                return _this.dispatchErrorTry();
            }).getOrElse(function () {
                return new FinalErrorController();
            });
        };

        Dispatcher.prototype.dispatchErrorTry = function () {
            var _this = this;
            return monapt.Try(function () {
                return ActionRepository.of(Memory).actionForRoute('dispatchFailure').map(function (action) {
                    return action.pathOrName;
                }).get();
            }).flatMap(function (pathOrName) {
                return _this.realizer.realizeTry(pathOrName);
            });
        };
        return Dispatcher;
    })();
    fivehold.Dispatcher = Dispatcher;
})(fivehold || (fivehold = {}));
