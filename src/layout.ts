export class Layout extends View {
    $el = $(document.body);
    $content = $(document.body);

    beforeDisplayContent() {
        ;
    }

    display(elem: JQuery) {
        this.$content.html(elem);
    }
}

var defaultLayout = new Layout();
