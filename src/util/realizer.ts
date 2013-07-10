var  realizerPathSplitter = /\./;
    
export class Realizer<T> {
    prefix = '';
    suffix = '';
    
    realizeTry(pathOrName: string): monapt.Try<T> {
        return monapt.Try<T>(() => this.realize(pathOrName));
    }

    private realize(pathOrName: string): T {
        var clazz: new() => T = this.getClass(this.parsePathOrName(pathOrName));
        return new clazz();
    }

    parsePathOrName(pathOrName: string): string[] {
        return pathOrName.split(realizerPathSplitter);
    }

    getClass(pathComponents: string[]): new() => T {
        var current: any = window;
        for (var i = 0, l = pathComponents.length, component; i < l; i++) {
            component = pathComponents[i];
            // Finally, I want to add prefix and suffix.
            // e.g.
            //   path   = 'service.Feed'
            //   suffix = 'Controller'
            //   
            //   return : window.service.FeedController
            current = current[i == l - 1 ? this.prefix + component + this.suffix : component];
        }
        return <new() => T>current;
    }
}