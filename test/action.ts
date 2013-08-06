/// <reference path="../definitions/mocha/mocha.d.ts" />
/// <reference path="../definitions/chai/chai.d.ts" />
/// <reference path="../compiled/fivefold.ts" />

module spec {
    chai.should();

    describe('Action', () => {
        describe('ActionError', () => {
            context('when initilize with name and message', () => {
                var actionError: fivefold.ActionError;
                beforeEach(() => {
                    actionError = new fivefold.ActionError('NotFound', 'File not found.');    
                });

                describe('#name', () => {
                    it('returns error name', () => {
                        actionError.name.should.equal('NotFound');
                    });
                });

                describe('#message', () => {
                    it('returns error message', () => {
                        actionError.name.should.equal('File not found.');
                    });
                });
            });
        });
    });
}
