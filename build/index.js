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

    var Scenario = (function () {
        function Scenario() {
        }
        Scenario.prototype.params = function (view) {
            return {};
        };

        Scenario.prototype.onBefore = function (view) {
            ;
        };

        Scenario.prototype.execute = function (view, params, success, failure) {
            ;
        };

        Scenario.prototype.onAfter = function (view) {
            ;
        };

        Scenario.prototype.executeScenario = function (view) {
            var _this = this;
            this.onBefore(view);
            this.execute(view, this.params(view), function () {
                _this.onAfter(view);
            }, function () {
                _this.onAfter(view);
            });
        };
        return Scenario;
    })();
    fivefold.Scenario = Scenario;

    var View = (function () {
        function View() {
            var _this = this;
            this.$el = null;
            this.tagName = 'div';
            this.id = '';
            this.className = '';
            this.attributes = {};
            this.ensureFuture = monapt.future(function (p) {
                setTimeout(function () {
                    try  {
                        _this.ensureElement();
                        _this.delegateEvents();
                        _this.created(_this.$el);
                        p.success(_this);
                    } catch (e) {
                        p.failure(e);
                    }
                }, 0);
            });
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

        View.prototype.delegateEvents = function () {
            var _this = this;
            var events = new monapt.Map(this.events);
            events.mapValues(function (fn) {
                return _this[fn];
            }).filter(function (fn) {
                return $.isFunction(fn);
            }).map(function (event, fn) {
                var match = event.match(View.eventSplitter);
                return monapt.Tuple2(match[1], monapt.Tuple2(match[2], fn));
            }).foreach($.proxy(this.delegate, this));
        };

        View.prototype.delegateScenarios = function () {
            var _this = this;
            var scenarios = new monapt.Map(this.scenarios);
            scenarios.mapValues(function (scenario) {
                return function () {
                    scenario.executeScenario(_this);
                };
            }).map(function (event, fn) {
                var match = event.match(View.eventSplitter);
                return monapt.Tuple2(match[1], monapt.Tuple2(match[2], fn));
            }).foreach($.proxy(this.delegate, this));
        };

        View.prototype.delegate = function (event, selectorAndFn) {
            var selector = selectorAndFn._1, method = selectorAndFn._2;
            if (selector && selector !== '') {
                this.$el.on(event + '.fivefold', method);
            } else {
                this.$el.on(event + '.fivefold', selector, method);
            }
        };

        View.prototype.renderFuture = function () {
            var _this = this;
            return this.ensureFuture.map(function (view, p) {
                setTimeout(function () {
                    try  {
                        _this.render();
                        p.success(_this);
                    } catch (e) {
                        p.failure(e);
                    }
                }, 0);
            });
        };

        View.prototype.render = function () {
            ;
        };

        View.prototype.created = function ($el) {
            ;
        };
        View.eventSplitter = /^(\S+)\s*(.*)$/;
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

        Layout.prototype.renderFuture = function () {
            return _super.prototype.renderFuture.call(this);
        };

        Layout.prototype.display = function (elem) {
            this.$content.html(elem);
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
        Controller.prototype.dispatchFuture = function (method, options) {
            var renderLayoutFuture = this.layout.renderFuture();
            var actionFuture = this[method](options);

            return actionFuture.flatMap(function (view) {
                return renderLayoutFuture.map(function (layout, promise) {
                    setTimeout(function () {
                        var future = view.renderFuture();
                        future.onSuccess(function (view) {
                            layout.beforeDisplayContent();
                            layout.display(view.$el);
                            promise.success(view);
                        });
                        future.onFailure(function (e) {
                            return promise.failure(e);
                        });
                    });
                });
            });
        };
        return Controller;
    })();
    fivefold.Controller = Controller;

    var ControllerRepository = (function () {
        function ControllerRepository() {
        }
        ControllerRepository.prototype.controllerForRoute = function (route) {
            var realizer = new ControllerRealizer();
            return realizer.realizeTry(route.controller).map(function (controller) {
                return new monapt.Some(controller);
            }).getOrElse(function () {
                return new monapt.None();
            });
        };
        return ControllerRepository;
    })();

    var controllerRepository = new ControllerRepository();

    var Route = (function () {
        function Route(pattern, controller, method) {
            this.pattern = pattern;
            this.controller = controller;
            this.method = method;
        }
        return Route;
    })();
    fivefold.Route = Route;

    var RouteResolver = (function () {
        function RouteResolver() {
        }
        RouteResolver.prototype.resolve = function (relativeURL, routes) {
            var _this = this;
            var r = this.parse(relativeURL);
            return routes.find(function (k, v) {
                return _this.match(r.pattern, k);
            }).map(function (t) {
                return monapt.Tuple2(t._2, r.options);
            });
        };

        RouteResolver.prototype.parse = function (relativeURL) {
            return {
                options: {},
                pattern: null
            };
        };

        RouteResolver.prototype.match = function (matched, pattern) {
            return false;
        };
        return RouteResolver;
    })();
    fivefold.RouteResolver = RouteResolver;

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
    fivefold.RouteRepository = RouteRepository;

    var routeRepository = new RouteRepository();

    var routeSplitter = /::/;

    function routeRegisterFn(pattern, controllerOrRedirect) {
        var repository = routeRepository;
        if (typeof controllerOrRedirect == "string") {
            var comp = controllerOrRedirect.split(routeSplitter);
            repository.registerRoute(new Route(pattern, comp[0], comp[1]));
        } else {
        }
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
            this.resolver.resolve(relativeURL, routeRepository.routesMap()).match({
                Some: function (t) {
                    return _this.dispatcher.dispatch(t._1, t._2);
                },
                None: function () {
                    return console.error('No route...');
                }
            });
        };

        Router.prototype.routes = function (routes) {
            routes(routeRegisterFn);
        };
        return Router;
    })();
    fivefold.Router = Router;

    var Dispatcher = (function () {
        function Dispatcher() {
        }
        Dispatcher.prototype.dispatch = function (route, options) {
            controllerRepository.controllerForRoute(route).match({
                Some: function (controller) {
                    return controller.dispatchFuture(route.method, options);
                },
                None: function () {
                    return console.error('Dispatch failure.');
                }
            });
        };
        return Dispatcher;
    })();
    fivefold.Dispatcher = Dispatcher;
})(fivefold || (fivefold = {}));
