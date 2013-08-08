export var silent = false;

var errorLog = (error: Error) => {
    if (!silent) console.log(error.message);
}