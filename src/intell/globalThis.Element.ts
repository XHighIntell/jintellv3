interface Element {
    /** [Extension] Appends the element to the end of the target element. */
    appendTo(this: Element, target: Element): this;

    /** [Extension] Appends the element to the beginning of the target element. */
    prependTo(this: Element, target: Element): this;
}

interface HTMLElement {
    /** [Extension] Returns a DOMRect object that describes the element’s size and its position relative (including borders) to the document rather than the viewport. */
    getBoundingClientRectOffset(this: HTMLElement): DOMRect;

    /** [Extension] Returns a DOMRect object that describes the element’s size and its content position (excluding borders) relative to the document rather than the viewport. */
    getBoundingClientContentRectOffset(this: HTMLElement): DOMRect;

    /** [Extension] Set the current coordinates of the element relative to the document. */
    setOffset(this: HTMLElement, offset: intell.math.PointLike): void;
}

(function() {
    const prototype = Element.prototype;

    if (prototype.appendTo != null) console.warn("Added 'appendTo' extension to 'Element.prototype': overriding the native funtion.");
    if (prototype.prependTo != null) console.warn("Added 'prependTo' extension to 'Element.prototype': overriding the native funtion.");

    prototype.appendTo = function(target) { target.append(this); return this }
    prototype.prependTo = function(target) { target.prepend(this); return this }
})();



(function() {
    const prototype = HTMLElement.prototype;

    if (prototype.getBoundingClientRectOffset != null) console.warn("Added 'getBoundingClientRectOffset' extension to 'HTMLElement.prototype': overriding the native funtion.");
    if (prototype.setOffset != null) console.warn("Added 'setOffset' extension to 'HTMLElement.prototype': overriding the native funtion.");


    prototype.getBoundingClientRectOffset = function() {
        const rect = this.getBoundingClientRect();

        rect.x += window.scrollX;
        rect.y += window.scrollY;

        return rect;
    }
    prototype.getBoundingClientContentRectOffset = function() {
        const rect = this.getBoundingClientRect();

        rect.x += window.scrollX;
        rect.y += window.scrollY;

        if (rect.width * rect.height != 0) {
            const style = getComputedStyle(this);
            const borderLeftWidth = parseFloat(style.borderLeftWidth);
            const borderRightWidth = parseFloat(style.borderRightWidth);
            const borderTopWidth = parseFloat(style.borderTopWidth);
            const borderBottomWidth = parseFloat(style.borderBottomWidth);

            rect.x += borderLeftWidth;
            rect.y += borderTopWidth;
            rect.width -= borderLeftWidth + borderRightWidth;
            rect.height -= borderTopWidth + borderBottomWidth;
        }

        return rect;
    }


    prototype.setOffset = function(offset) {
        const parent = this.offsetParent as HTMLElement;
        if (parent == null) return;

        const parentOffset = parent.getBoundingClientRectOffset();
        const styles = getComputedStyle(parent);
        const borderLeft = parseFloat(styles.getPropertyValue('border-left'));
        const borderTop = parseFloat(styles.getPropertyValue('border-top'));

        // parentOffset.x + parent.borderLeft + position.x = offset.x
        // parentOffset.y + parent.borderTop + position.y = offset.y

        let posX = offset.x - parentOffset.x - borderLeft;
        let posY = offset.y - parentOffset.y - borderTop;

        this.style.left = `${posX}px`;
        this.style.top = `${posY}px`;
    }

})();