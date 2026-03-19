interface DOMRect {
    /** Tests whether all numeric properties of this Rectangle have values of zero. */
    isEmpty: boolean;

    /**Returns a third Rectangle structure that represents the intersection of two other Rectangle structures. 
     * If there is no intersection, an empty Rectangle is returned.*/
    intersect(this: DOMRect, a: DOMRect): DOMRect;
}

(function() {
    const prototype = DOMRect.prototype;

    const ownPropertyNames = Object.getOwnPropertyNames(prototype);

    if (ownPropertyNames.indexOf('isEmpty') != -1) console.warn("Added 'isEmpty' extension to 'DOMRect.prototype': overriding the native funtion.");
    if (ownPropertyNames.indexOf('intersect') != -1) console.warn("Added 'intersect' extension to 'DOMRect.prototype': overriding the native funtion.");
    
    intell.ctrl.template.defineProperties(prototype, {
        isEmpty: {
            enumerable: true,
            get() {
                if (this.x == 0 && this.y == 0 && this.width == 0 && this.height == 0) return true;
                return false;
            },
        }
    });
    prototype.intersect = function(a) {
        const x1 = Math.max(a.x, this.x);
        const x2 = Math.min(a.x + a.width, this.x + this.width);
        const y1 = Math.max(a.y, this.y);
        const y2 = Math.min(a.y + a.height, this.y + this.height);

        if (x2 >= x1 && y2 >= y1) {
            return new DOMRect(x1, y1, x2 - x1, y2 - y1);
        }

        return new DOMRect(0, 0, 0, 0)
    };
})();

