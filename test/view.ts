/// <reference path="../definitions/mocha/mocha.d.ts" />
/// <reference path="../definitions/chai/chai.d.ts" />
/// <reference path="../compiled/fivefold.ts" />


interface EventTarget {
    id: string;
}

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


    var receivedContext: any;
    var receivedEvent: Event;

    class MockView extends fivefold.View {
        events = {
            'click #function': function(e) {
                receivedEvent = e;
                receivedContext = this;
            },
            'click #methodName': 'callbackMethod'
        }

        callbackMethod(e: Event) {
            receivedEvent = e;
            receivedContext = this;
        }

        render(): MockView {
            this.$el.append(
                $('<button id="function"></button>'),
                $('<button id="methodName"></button>')
            )
            return this;
        }
    }

    describe('#delegateEvents', () => {

        var view: MockView;

        beforeEach(() => {
            view = MockView.create().render().delegateEvents();
            $(document.body).append(view.$el);
        });


        it('delegate allow methodName for callback', () => {
            $('#methodName').trigger('click');
            receivedEvent.target.id.should.equal('methodName');
            receivedContext.should.eql(view);
        });


        it('delegate allow function for callback', () => {
            $('#function').trigger('click');
            receivedEvent.target.id.should.equal('function');
            receivedContext.should.eql(view);
        });

        afterEach(() => {
            view.$el.remove();
        });

    });
}
