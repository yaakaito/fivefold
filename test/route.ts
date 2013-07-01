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
        it('has shared on memory repository', () => {
            var repo = fivefold.RouteRepository.ofMemory();
            repo.should.be.instanceof(fivefold.RouteRepository);
            repo.should.eql(fivefold.RouteRepository.ofMemory());
        });

        describe('When after initialized', () => {
            var repo = new fivefold.RouteRepository();

            describe('#routeForRelativeURL', () => {
                it('should throws `No such parser` Error', () => {
                    (() => {
                        repo.routeForRelativeURL('/');
                    }).should.throw('No such parser');
                });
            });

            describe('#routeForKey', () => {
                it('should throws `No such parser` Error', () => {
                    (() => {
                        repo.routeForKey('key');
                    }).should.throw('No such parser');
                });
            });
        });

        describe('When setted parerFunction', () => {

        });

    });
}