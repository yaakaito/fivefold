module fivefold {
    export class View {

        element: JQuery = null;
        tagName: string = 'div';
        id: string = '';
        className: string = '';
        attributes: Object = {};

        template: ITemplate = null;
        model: M = null;

        events: Object = null;
        scenarios: Object = null;

        sceriveIndetity: number = null;

        constructor() {
            super();
            this.ensureElement();
        }

        private ensureElement() {
            if (this.element) {
                return ;
            }

            var attributes = {};
            for (var key in this.attributes) {
                attributes[key] = this.attributes[key];
            }
            attributes['id'] = this.id;
            attributes['class'] = this.className;
            
            this.element =  $('<' + this.tagName + '>').attr(attributes);
        }

        render() {
            if (this.template) {
                if (this.model) {
                    this.element.html(this.template.render(this.model.attributes()));
                }
                else {
                    this.element.html(this.template.render());
                }
                this.registerEvents();
                this.registerScenarios();
            }
        }

        private registerEvents() {
            if (!this.events) {
                return ;
            }

            for (var key in this.events) {
                var method = this[events[key]];                
                var keys = key.split('\s');
                this.element.on(keys[0], keys[1], $.proxy(method, this));
            }
        }

        private registerScenarios() {
            if (!this.events) {
                return ;
            }

            for (var key in this.scenarios) {
                var scenario = () => {
                    var service = Servies.selectService(this.sceriveIndetity);
                    service.scenarioExecute(this.scenarios[key], this);
                }
                var keys = key.split('\s');
                this.element.on(keys[0], keys[1], scenarios);
            }
        }

           
    }
}