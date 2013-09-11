function isJQueryObject(obj: any): boolean {
    if(typeof obj != 'object') return false;
    // JQuery object must have on & off method
    return (typeof obj.on == 'function' && typeof obj.off == 'function');
}
