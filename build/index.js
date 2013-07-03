var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fivefold;
(function (fivefold) {
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
            var clazz = this.getClass(this.parsePathOrName(pathOrName));
            return new clazz();
        };

        Realizer.prototype.parsePathOrName = function (pathOrName) {
            return pathOrName.split(Realizer.pathSplitter);
        };

        Realizer.prototype.getClass = function (pathComponents) {
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
    fivefold.Realizer = Realizer;

    var ControllerRealizer = (function (_super) {
        __extends(ControllerRealizer, _super);
        function ControllerRealizer() {
            _super.apply(this, arguments);
            this.suffix = 'Controller';
        }
        return ControllerRealizer;
    })(Realizer);
    fivefold.ControllerRealizer = ControllerRealizer;

    var View = (function () {
        function View() {
            this.$el = null;
            this.tagName = 'div';
            this.id = '';
            this.className = '';
            this.attributes = {};
            this.template = null;
            this.ensureElement();
        }
        View.prototype.ensureElement = function () {
            if (this.$el) {
                return;
            }

            var attributes = {};
            for (var key in this.attributes) {
                attributes[key] = this.attributes[key];
            }
            attributes['id'] = this.id;
            attributes['class'] = this.className;

            this.$el = $('<' + this.tagName + '>').attr(attributes);
        };

        View.prototype.render = function () {
            if (this.template) {
                this.$el.html(this.template.render(this.values()));
            }
        };

        View.prototype.values = function () {
            return {};
        };
        return View;
    })();
    fivefold.View = View;

    var Layout = (function (_super) {
        __extends(Layout, _super);
        function Layout() {
            _super.apply(this, arguments);
            this.$el = $(document.body);
            this.$content = $(document.body);
        }
        Layout.prototype.beforeDisplayContent = function () {
            ;
        };
        return Layout;
    })(View);
    fivefold.Layout = Layout;

    var layout = new Layout();

    var ActionFuture = (function (_super) {
        __extends(ActionFuture, _super);
        function ActionFuture() {
            _super.apply(this, arguments);
        }
        return ActionFuture;
    })(monapt.Future);
    fivefold.ActionFuture = ActionFuture;

    fivefold.actionFuture = function (f) {
        return monapt.future(function (p) {
            return f(p);
        });
    };

    var Controller = (function () {
        function Controller() {
            this.layout = layout;
        }
        Controller.prototype.dispatch = function (method, options) {
            var _this = this;
            this.layout.render();
            var future = this[method](options);
            future.onComplete(function (view) {
                view.match({
                    Success: function (view) {
                        view.render();
                        _this.layout.beforeDisplayContent();
                        _this.layout.$content.html(view.$el);
                    },
                    Failure: function (error) {
                        console.log('error');
                    }
                });
            });
        };
        return Controller;
    })();
    fivefold.Controller = Controller;

    var FinalErrorController = (function (_super) {
        __extends(FinalErrorController, _super);
        function FinalErrorController() {
            _super.apply(this, arguments);
        }
        return FinalErrorController;
    })(Controller);
    fivefold.FinalErrorController = FinalErrorController;

    var Route = (function () {
        function Route(pattern, controller, method) {
            this.pattern = pattern;
            this.controller = controller;
            this.method = method;
        }
        return Route;
    })();
    fivefold.Route = Route;

    var RouteRepository = (function () {
        function RouteRepository() {
            this.routes = {};
        }
        RouteRepository.ofMemory = function () {
            return RouteRepository.sharedInstance;
        };

        RouteRepository.prototype.routeForRelativeURL = function (relativeURL) {
            var _this = this;
            this.validate();
            return this.parser(relativeURL).flatMap(function (t) {
                return new monapt.Map(_this.routes).get(t._1);
            });
        };

        RouteRepository.prototype.routeForKey = function (key) {
            this.validate();
            return null;
        };

        RouteRepository.prototype.validate = function () {
            if (!this.parser) {
                throw new Error('No such parser');
            }
        };

        RouteRepository.prototype.registerRoute = function (route) {
            this.routes[route.pattern] = route;
        };
        RouteRepository.sharedInstance = new RouteRepository();
        return RouteRepository;
    })();
    fivefold.RouteRepository = RouteRepository;

    var routeSplitter = /::/;

    function routeMatcher(pattern, controllerOrRedirect) {
        var repository = RouteRepository.ofMemory();
        if (typeof controllerOrRedirect == "string") {
            var comp = controllerOrRedirect.split(routeSplitter);
            repository.registerRoute(new Route(pattern, comp[0], comp[1]));
        } else {
        }
    }

    var Router = (function () {
        function Router(parser) {
            this.parser = parser;
            this.routeRepository = RouteRepository.ofMemory();
            this.dispatcher = new Dispatcher();
            this.routeRepository.parser = parser;
            this.start();
        }
        Router.prototype.start = function () {
            var _this = this;
            window.onhashchange = function (event) {
                _this.onHashChange();
            };

            setTimeout(function () {
                return _this.onHashChange();
            }, 0);
        };

        Router.prototype.onHashChange = function () {
            var _this = this;
            var relativeURL = location.hash;
            this.routeRepository.routeForRelativeURL(relativeURL).match({
                Some: function (route) {
                    var options = _this.parser(relativeURL).getOrElse(function () {
                        return monapt.Tuple2(null, null);
                    })._2;
                    _this.dispatcher.dispatch(route, options);
                },
                None: function () {
                }
            });
        };

        Router.prototype.routes = function (routes) {
            routes(routeMatcher);
        };
        return Router;
    })();
    fivefold.Router = Router;

    var Dispatcher = (function () {
        function Dispatcher() {
            this.realizer = new ControllerRealizer();
        }
        Dispatcher.prototype.dispatch = function (route, options) {
            var _this = this;
            this.realizer.realizeTry(route.controller).orElse(function () {
                return _this.dispatchErrorTry();
            }).getOrElse(function () {
                return new FinalErrorController();
            }).dispatch(route.method, options);
        };

        Dispatcher.prototype.dispatchErrorTry = function () {
            var _this = this;
            return monapt.Try(function () {
                return RouteRepository.ofMemory().routeForRelativeURL('dispatchFailure').map(function (route) {
                    return route.controller;
                }).get();
            }).flatMap(function (pathOrName) {
                return _this.realizer.realizeTry(pathOrName);
            });
        };
        return Dispatcher;
    })();
    fivefold.Dispatcher = Dispatcher;
})(fivefold || (fivefold = {}));
