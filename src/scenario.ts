module fivefold {
    
    interface IScenarioSuccess {
        (value?: any);
    }

    interface IScenarioFailure {
        (error?: Error);
    }

    export class Scenario {
        view: View;

        userInputs(): Object {
            return {}
        }

        onBefore() {
            ;
        }

        script(success: IScenarioSuccess, error: IScenarioFailure, userInputs: Object) {
            throw new Error('Script are empty');
        }

        onAfter() {
            ;
        }

        onSuccess(value: any) {
            ;
        }

        onFailure(error: Error) {
            ;
        }

        execute() {
            this.onBefore();
            this.script(
                (value?: any) => {
                    this.onSuccess(value);
                    this.onAfter();
                },
                (error?: Error) => {
                    this.onFailure(error);
                    this.onAfter;

                }
                this.userInputs());
        }
    }

    export class PostTweetScenario extends Scenario {
        view: TweetPostView;

        userInputs(): Object {
            return {
                'text': view.textField.val()
            }
        }

        onBefore() {
            view.lockInputs();
        }

        script(success: IScenarioSuccess, error: IScenarioFailure, userInputs: Object) {
            var tweet = new Tweet(userInputs['text']);
            var repository = TweetRepository.shared();
            repository.postTweet(tweet);
            success();
        }

        onSuccess() {
            alert('やったね');
        }

        onFailure() {
            alert('送信に失敗しました。');
        }

        onAfter() {
            view.unlockInputs();
        }
    }

}

var postTweet = new PostTweetScenario();
postTweet.execute();



class PostTweetView extends View {
    scenarios = {
        'click .tweet': 'postTweet'        
    };
    events = {
        'click .hoge' : 'display'
    };
}
