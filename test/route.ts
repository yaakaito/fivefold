/// <reference path="../definitions/mocha/mocha.d.ts" />
/// <reference path="../definitions/chai/chai.d.ts" />
/// <reference path="../src/fivefold.ts" />
/// <reference path="./fakes.ts" />

module spec {
    chai.should();

    describe('Route', () => {
        it('can initialize with pattern, controller and method', () => {
            var route = new fivefold.Route('/',
                                           'spec.Target',
                                           'hoge');
            route.pattern.should.equal('/');
            route.controller.should.equal('spec.Target');
            route.method.should.equal('hoge');
        });
    });

    describe('RouteRepository', () => {

        var repo: fivefold.RouteRepository;
        beforeEach(() => {
            repo = new fivefold.RouteRepository();
        });

        describe('#registerRoute', () => {
            it('can register new route', () => {
                var route = new fivefold.Route('/', 'spec.Target', 'hoge');
                repo.registerRoute(route);
                var tuple = repo.routesMap().head().get();
                tuple._1.should.equal('/');
                tuple._2.should.eql(route);
            });
        });



    });
}
