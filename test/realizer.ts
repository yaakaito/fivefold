/// <reference path="../definitions/mocha/mocha.d.ts" />
/// <reference path="../definitions/chai/chai.d.ts" />
/// <reference path="../src/fivefold.ts" />
/// <reference path="./fakes.ts" />

module spec {
    chai.should();

    describe('Realizer', () => {
        var realizer = new fivefold.Realizer<Fake.FakeController>();
        describe('when exist target class', () => {
            it('can realize class', () => {
                var realize = realizer.realizeTry('Fake.FakeController');
                realize.isSuccess.should.be.true;
                realize.get().should.instanceof(Fake.FakeController);
                realize.get().fakeMethod().should.equal('Fake');
            });
        });

        describe('when not exist target', () => {
            it('cant realize class', () => {
                var realize = realizer.realizeTry('fake.Unknown');
                realize.isSuccess.should.be.false;    
            })
        });


    });
}