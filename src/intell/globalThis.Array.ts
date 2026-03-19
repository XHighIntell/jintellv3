interface Array<T> {
    /** [Extension] Removes the first occurrence of a specific object from the array. 
    * Returns true if item is successfully removed; otherwise, false. This method also returns false if item was not found in the array.*/
    remove(this: Array<T>, item: T): boolean;
}

(function() {
    const prototype = Array.prototype;

    if (prototype.remove != null) console.warn("Added 'remove' extension to 'Array.prototype': overriding the native funtion.");

    prototype.remove = function(item) {
        const index = this.indexOf(item);
        if (index != -1) this.splice(index, 1);

        return index != -1;
    };
})
