/// <reference path="../definitions/mocha/mocha.d.ts" />
/// <reference path="../definitions/chai/chai.d.ts" />
/// <reference path="../compiled/fivefold.ts" />

module spec {
    chai.should();

    describe('View', () => {
        describe('on create default', () => {
            var view: fivefold.View;
            beforeEach(() => {
                view = fivefold.View.create();
            });

            describe('#el', () => {
                it('should created', () => {
                    view.$el.should.not.be.null;
                });

                it('is jQuery object', () => {
                    view.$el.should.instanceof(jQuery);
                });

                it('tagName is `div` on deault', () => {
                    view.$el[0].tagName.should.equal('DIV');
                });

                it('not has any classes', () => {
                    view.$el[0].classList.should.have.length(0);
                });

                it('not has a id', () => {
                    view.$el[0].id.should.be.equal(''); 
                })

                it('not has any attributes', () => {
                    view.$el[0].attributes.length.should.be.empty;
                });
            });
        });
    });
}
