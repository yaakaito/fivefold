export var silent = false;

var error = (error: Error) => {
    if (!silent) console.log(error.message);
}