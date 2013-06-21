/// <refrence path="./scenario.ts" />

module fivefold {

    var idenity = 0;

    export class Service{

        scenarios: katana.Map<string, Scenario> = new katana.Map<string, Scenario>();
        identity: number = identity++;

        registerScenario(key: string, scenario: Scenario) {
            this.scenarios.add(key, scenario);
        }


    }

    static var Services = {
        instances: [],
        add: (service: Service) => {
            this.instances.push(service);
        },
        find: (identity: number) => {
            for (var i = 0, l = this.instances.length; i < l; i++) {
                if (this.instances[i].identity == identity) {
                    return this.instances[i];
                }
            }
            return null;
        }
    }

    export module Service {
        export var selectService = (identity: number) => {
            return Services.find(identify);
        }
    }
}

class TimelineService extends Service {
    senarios = {
        'postTweet': new PostTweetScenario()
    }
}

class TimelineController extends Controller {

    index(): katana.Future<TimelineService> {
        return katana.future<TimelineService>(promise => {
            
            var permission = future {
                TimelineViewRequest request;
                request.execute();
            }

            permission.map(() => {

                TweetsRepository.shared().forPage(0).onComplete(
                    Success: tweets => {
                        var service = new TimelineService(new TimelineView(tweets));
                        promise.success(service);
                    },
                    Failure: error => {
                        promise.failure(error);
                    }
                );
            })

            permission.onFailure((error) => promise.failure(error));

            gluon.execute();
        });
    }
}
