/// <reference path="../definitions/mocha/mocha.d.ts" />
/// <reference path="../definitions/chai/chai.d.ts" />
/// <reference path="../compiled/fivefold.ts" />

module spec {
    chai.should();

    class SuccessResolver implements fivefold.RouteResolver {
        resolve(relativeURL: string, routes: monapt.Map<string, Route>): monapt.Future<IRouteAndOptions> {

        }
    }


    class FailureResolver implements fivefold.RouteResolver {
        resolve(relativeURL: string, routes: monapt.Map<string, Route>): monapt.Future<IRouteAndOptions> {
            
        }
    }

    describe('Router', () => {
        context('when resolver can resolve route', () => {
            context('when initialized', () => {

            });

            context('when hash change', () => {

            });

        });

        context('when resolver cannt resolve route', () => {
            context('when initialized', () => {

            });

            context('when hash change', () => {

            });

        });
    });

    describe('Dispacher', () => {
        
    });
}
