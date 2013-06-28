/// <reference path="../definitions/mocha/mocha.d.ts" />
/// <reference path="../definitions/chai/chai.d.ts" />
/// <reference path="../src/fivefold.ts" />

module spec {
    chai.should();

    export class Target {
        hoge(): string {
            return 'hoge'
        }
    }

    describe('Realizer', () => {
        var realizer = new fivefold.Realizer<Target>();
        describe('when exist target class', () => {
            it('can realize class', () => {
                var realize = realizer.realizeTry('spec.Target');
                realize.isSuccess.should.be.true;
                realize.get().should.instanceof(Target);
                realize.get().hoge().should.equal('hoge');
            });
        });

        describe('when not exist target', () => {
            it('cant realize class', () => {
                var realize = realizer.realizeTry('spec.Unknown');
                realize.isSuccess.should.be.false;    
            })
        });
    });
}