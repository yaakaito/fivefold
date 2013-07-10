var uniqId = 0;
function viewUniqId(): string {
    return 'view' + uniqId++;
}

function ensureElement(view: View) {
    if (view.$el) {
        return ;
    }
    var attributes = {};
    for (var key in view.attributes) {
        attributes[key] = view.attributes[key];
    }
    attributes['id'] = view.id;
    attributes['class'] = view.className;
        
    view.$el =  $('<' + view.tagName + '>').attr(attributes);
}


var eventSplitter = /^(\S+)\s*(.*)$/;
function delegateEvents(view: View) {
    var events = new monapt.Map<string, string>(view.events);
    events.mapValues(fn => view[fn]).filter((key, fn) => isFunction(fn)).map((event, fn) => {
        var match = event.match(eventSplitter);
        return monapt.Tuple2(match[1], monapt.Tuple2(match[2], proxy(fn, view)));    
    }).foreach((e, t) => view.delegate(e, t._1, t._2));
}

function delegateScenarios(view: View) {
    var scenarios = new monapt.Map<string, Scenario>(view.scenarios);
    scenarios.mapValues(scenario => () => {
        scenario.executeScenario(this);
    }).map((event, fn) => {
        var match = event.match(eventSplitter);
        return monapt.Tuple2(match[1], monapt.Tuple2(match[2], fn));
    }).foreach((e, t) => view.delegate(e, t._1, t._2));
}

export class View {

    private cid = viewUniqId();
    $el: JQuery = null;
    tagName: string = 'div';
    id: string = '';
    className: string = '';
    attributes: Object = {};
    events: Object;
    scenarios: Object;

    static create(): View {
        var view: View = new this();
        ensureElement(view);
        delegateEvents(view);
        delegateScenarios(view);
        return view;
    }

    delegate(event: string, fn: Function);
    delegate(event: string, selector:string, fn: Function);
    delegate(event: string, fnOrSelector: any, fn?: any) {
        var evt = event + '.ff' + this.cid;
        this.$el.on.call(this.$el, evt, fnOrSelector, fn);
    }

    undelegateAll() {
        this.$el.off('.ff' + this.cid);
    }

    render() {
        ;
    }
}