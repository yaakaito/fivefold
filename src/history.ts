export interface FivefoldHistoryStatic {
    previous: (n?: number) => Route[];
    current: () => Route;

    // TODO:
    // next: (n: number = 1) => Route;
}

var histories: Route[] = [];

export var history: FivefoldHistoryStatic = {
    previous: (n: number = 1): Route[] => {
        if (histories.length <= 1) return []
        else return histories.slice(0, histories.length - 2).slice(-n).reverse()
    },

    current: (): Route => {
        return histories[histories.length - 1];
    }
}

