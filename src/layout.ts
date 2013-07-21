export class Layout extends View {
    $el = $(document.body);
    $content = $(document.body);

    static create(): Layout {
        var layout: Layout = new this();
        ensureElement(layout);
        layout.delegateEvents();
        return layout;
    }

    beforeDisplayContent() {
        ;
    }

    display(elem: JQuery) {
        this.$content.html(elem);
    }
}

var defaultLayout = new Layout();
