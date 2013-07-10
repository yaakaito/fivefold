export class Scenario {

    params(view: View): Object {
        return {};
    }

    onBefore(view: View) {
        ;
    }

    execute(view: View, params: Object, success: () => void, failure: () => void) {
        ;
    }

    onAfter(view: View) {
        ;
    }

    executeScenario(view: View) {
        this.onBefore(view);
        this.execute(view, this.params(view), () => {
            this.onAfter(view);    
        }, () => {
            this.onAfter(view);
        });
    }
}