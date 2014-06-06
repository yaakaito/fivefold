var uniqId = 0;
function viewUniqId(): string {
    return 'view' + uniqId++;
}

function ensureElement(view: View, selector: string, context: JQuery) {
    if (view.$el) {
        return ;
    }

    var $el: JQuery = null;
    if (selector) {
        $el = $(selector, context);
    }
    else {
        $el = $('<' + view.tagName + '>');
    }

    var attributes = {};
    for (var key in view.attributes) {
        attributes[key] = view.attributes[key];
    }

    if (view.id) {
        attributes['id'] = view.id;
    }

    if (view.className) {
        attributes['class'] = view.className;
    }

    view.$el = $el.attr(attributes);
}

var eventSplitter = /^(\S+)\s*(.*)$/;

export interface IViewCreateOptions {
    $el?: JQuery;
    tagName?: string;
    selector?: string;
    context?: JQuery;
    id?: string;
    className?: string;
    attributes?: Object;
    delegate?: boolean;
}

export class View {

    private cid = viewUniqId();
    private _selectors = []; // for Zepto
    $el: JQuery = null;
    tagName: string = 'div';
    id: string = '';
    className: string = '';
    attributes: Object = {};
    autoRender = true;

    events(): Object {
        return null;
    }

    constructor(options: IViewCreateOptions = {}) {
        var delegate = options.delegate == null ? true : options.delegate;
        var selector = options.selector;
        var context  = options.context;

        this.$el = isJQueryObject(options.$el) ? options.$el : null;
        this.tagName = options.tagName || 'div';
        this.id = options.id || '';
        this.className = options.className || '';
        this.attributes = (typeof options.attributes == 'object') ? options.attributes : {};
        ensureElement(this, selector, context);

        if (delegate) {
            this.delegateEvents();
        }
    }

    delegateEvents(events?: Object): View {
        if (!(events || (events = this.events()))) {
            return this;
        }
        this.undelegateAll();
        var evmap = new monapt.Map<string, any>(events);
        evmap.mapValues(fn => {
            if (isFunction(fn)) {
                return fn;
            }
            else {
                return this[fn];
            }
        }).filter((key, fn) => isFunction(fn)).map((event, fn) => {
            var match = event.match(eventSplitter);
            return monapt.Tuple2(match[1], monapt.Tuple2(match[2], proxy(fn, this)));    
        }).foreach((e, t) => this.delegate(e, t._1, t._2));
        return this;
    }

    delegate(event: string, fn: Function);
    delegate(event: string, selector:string, fn: Function);
    delegate(event: string, fnOrSelector: any, fn?: any) {
        var evt = event + '.ff' + this.cid;
        if (window['Zepto'] && $.isFunction(fn)) {
            this._selectors.push(fnOrSelector);
            this.$el.find.call(this.$el, fnOrSelector).on(evt, fn);
        }
        else {
            this.$el.on.call(this.$el, evt, fnOrSelector, fn);
        }
    }

    undelegateAll() {
        this.$el.off('.ff' + this.cid);
        $.each(this._selectors, (i, selector) => this.$el.find(selector).off('.ff' + this.cid));
        this._selectors = [];
    }

    render(): View {
        return this;
    }
}
