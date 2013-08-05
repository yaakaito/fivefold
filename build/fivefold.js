/*! fivefold v0.1.1 | MIT Licence | https://github.com/yaakaito/fivefold | (c) 2013 yaakaito.org  */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fivefold;
(function (fivefold) {
    function isFunction(obj) {
        return typeof obj === "function" && !(obj instanceof RegExp);
    }
    function proxy(fn, context) {
        if (!isFunction(fn)) {
            return undefined;
        }

        return function () {
            return fn.apply(context || this, Array.prototype.slice.call(arguments));
        };
    }
    var realizerPathSplitter = /\./;

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
            return pathOrName.split(realizerPathSplitter);
        };

        Realizer.prototype.getClass = function (pathComponents) {
            var current = window;
            for (var i = 0, l = pathComponents.length, component; i < l; i++) {
                component = pathComponents[i];

                current = current[i == l - 1 ? this.prefix + component + this.suffix : component];
            }
            return current;
        };
        return Realizer;
    })();
    fivefold.Realizer = Realizer;
    (function (RouteError) {
        RouteError[RouteError["NotFound"] = -1] = "NotFound";

        RouteError[RouteError["DispatchFailure"] = -2] = "DispatchFailure";
    })(fivefold.RouteError || (fivefold.RouteError = {}));
    var RouteError = fivefold.RouteError;

    var NotFound = function () {
        return new Error('fivefold' + RouteError.NotFound);
    };
    var DispatchFailure = function () {
        return new Error('fivefold' + RouteError.DispatchFailure);
    };
    var uniqId = 0;
    function viewUniqId() {
        return 'view' + uniqId++;
    }

    function ensureElement(view) {
        if (view.$el) {
            return;
        }
        var attributes = {};
        for (var key in view.attributes) {
            attributes[key] = view.attributes[key];
        }

        if (view.id) {
            attributes['id'] = view.id;
        }

        if (view.className) {
            attributes['class'] = view.className;
        }

        view.$el = $('<' + view.tagName + '>').attr(attributes);
    }

    var eventSplitter = /^(\S+)\s*(.*)$/;

    var View = (function () {
        function View() {
            this.cid = viewUniqId();
            this.$el = null;
            this.tagName = 'div';
            this.id = '';
            this.className = '';
            this.attributes = {};
        }
        View.create = function () {
            var view = new this();
            ensureElement(view);
            view.delegateEvents();
            return view;
        };

        View.prototype.delegateEvents = function () {
            var _this = this;
            this.undelegateAll();
            var events = new monapt.Map(this.events);
            events.mapValues(function (fn) {
                if (isFunction(fn)) {
                    return fn;
                } else {
                    return _this[fn];
                }
            }).filter(function (key, fn) {
                return isFunction(fn);
            }).map(function (event, fn) {
                var match = event.match(eventSplitter);
                return monapt.Tuple2(match[1], monapt.Tuple2(match[2], proxy(fn, _this)));
            }).foreach(function (e, t) {
                return _this.delegate(e, t._1, t._2);
            });
            return this;
        };

        View.prototype.delegate = function (event, fnOrSelector, fn) {
            var evt = event + '.ff' + this.cid;
            this.$el.on.call(this.$el, evt, fnOrSelector, fn);
        };

        View.prototype.undelegateAll = function () {
            this.$el.off('.ff' + this.cid);
        };

        View.prototype.render = function () {
            return this;
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
        Layout.create = function () {
            var layout = new this();
            ensureElement(layout);
            layout.delegateEvents();
            return layout;
        };

        Layout.prototype.beforeDisplayContent = function () {
            ;
        };

        Layout.prototype.display = function (elem) {
            this.$content.html(elem);
        };
        return Layout;
    })(View);
    fivefold.Layout = Layout;

    var defaultLayout = new Layout();

    var Controller = (function () {
        function Controller() {
            this.layout = defaultLayout;
        }
        Controller.prototype.dispatch = function (method, options) {
            var _this = this;
            this.layout.render();
            var actionFuture = this[method](options);
            actionFuture.onSuccess(function (view) {
                try  {
                    view.render();
                    _this.layout.beforeDisplayContent();
                    _this.layout.display(view.$el);
                } catch (e) {
                    console.error(e.toLocaleString());
                }
            });
            actionFuture.onFailure(function (error) {
                return console.log(error);
            });
        };
        return Controller;
    })();
    fivefold.Controller = Controller;

    var ControllerRepository = (function () {
        function ControllerRepository() {
        }
        ControllerRepository.prototype.controllerForRouteTry = function (route) {
            var realizer = new ControllerRealizer();
            return realizer.realizeTry(route.controller).filter(function (controller) {
                return controller instanceof Controller;
            });
        };
        return ControllerRepository;
    })();

    var controllerRepository = new ControllerRepository();

    var ControllerRealizer = (function (_super) {
        __extends(ControllerRealizer, _super);
        function ControllerRealizer() {
            _super.apply(this, arguments);
            this.suffix = 'Controller';
        }
        return ControllerRealizer;
    })(Realizer);
    fivefold.ControllerRealizer = ControllerRealizer;
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
        RouteRepository.prototype.routesMap = function () {
            return new monapt.Map(this.routes);
        };

        RouteRepository.prototype.registerRoute = function (route) {
            this.routes[route.pattern] = route;
        };
        return RouteRepository;
    })();

    var routeRepository = new RouteRepository();

    var ErrorRouteRepository = (function (_super) {
        __extends(ErrorRouteRepository, _super);
        function ErrorRouteRepository() {
            _super.apply(this, arguments);
        }
        ErrorRouteRepository.prototype.routeForError = function (error) {
            return _super.prototype.routesMap.call(this).get(error.message);
        };
        return ErrorRouteRepository;
    })(RouteRepository);

    var errorRouteRepository = new ErrorRouteRepository();

    var routeSplitter = /::/;

    function routeRegisterFn(pattern, controllerOrRedirect) {
        var repository = routeRepository;
        if (typeof controllerOrRedirect == "string") {
            var comp = controllerOrRedirect.split(routeSplitter);
            repository.registerRoute(new Route(pattern, comp[0], comp[1]));
        } else {
        }
    }

    function errorRouteRegisterFn(code, controllerAndMethod) {
        var repository = errorRouteRepository;
        var comp = controllerAndMethod.split(routeSplitter);
        var route = null;
        if (typeof code == 'number')
            route = new Route('fivefold' + code, comp[0], comp[1]); else
            route = new Route(code, comp[0], comp[1]);
        repository.registerRoute(route);
    }

    var Router = (function () {
        function Router(resolver) {
            this.resolver = resolver;
            this.dispatcher = new Dispatcher();
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
            var resolve = this.resolver.resolve(relativeURL, routeRepository.routesMap());
            resolve.onComplete(function (r) {
                return r.match({
                    Success: function (routeAndOptions) {
                        return _this.dispatcher.dispatch(routeAndOptions.route, routeAndOptions.options);
                    },
                    Failure: function (error) {
                        return _this.dispatcher.dispatchError(NotFound());
                    }
                });
            });
        };

        Router.prototype.routes = function (routes) {
            routes(routeRegisterFn);
        };

        Router.prototype.errorRoutes = function (routes) {
            routes(errorRouteRegisterFn);
        };
        return Router;
    })();
    fivefold.Router = Router;

    var Dispatcher = (function () {
        function Dispatcher() {
        }
        Dispatcher.prototype.dispatch = function (route, options) {
            var _this = this;
            controllerRepository.controllerForRouteTry(route).match({
                Success: function (controller) {
                    return controller.dispatch(route.method, options);
                },
                Failure: function (e) {
                    return _this.dispatchError(e);
                }
            });
        };

        Dispatcher.prototype.dispatchError = function (error) {
            var _this = this;
            errorRouteRepository.routeForError(error).match({
                Some: function (route) {
                    _this.dispatch(route, {});
                },
                None: function () {
                    throw new Error('Route not found: ' + error.message);
                }
            });
        };
        return Dispatcher;
    })();
    fivefold.Dispatcher = Dispatcher;
})(fivefold || (fivefold = {}));
