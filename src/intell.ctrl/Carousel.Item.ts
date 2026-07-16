namespace intell.ctrl {
    export class CarouselItem {


        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = CarouselItem.getItem(element); if (c != null) return c; }

            // --b--

            // --c-- predefined
            if (element == null) element = $$$(`<div class="Item"></div>`)[0];
            const elementIndicator = $$$(`<div class="Indicator"></div>`)[0];
            //#endregion

            CarouselItem.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementIndicator = elementIndicator;
            __private.active = false;

            ctrl.toggle(element, __private.active);

            elementIndicator.addEventListener('click', e => this.#onUserClickIndicator(e));
        }

        //#region properties
        /** Gets the root element of the item. */
        get element() { return this.getPrivate().element }

        /** Gets the indicator element of the item. */
        get elementIndicator() { return this.getPrivate().elementIndicator }

        /** Gets the parent Carousel of the item. */
        get parent() { return this.getPrivate().parent }

        /**Gets whether the item is actived or not. */
        get active() { return this.getPrivate().active }
        //#endregion
        
        //#region methods
        /** Removes the item from its parent. If it has no parent, calling remove() does nothing.*/
        remove() {
            const __private = this.getPrivate();
            const parent = __private.parent;

            // If it has no parent, calling remove() does nothing.
            if (parent == null) return;

            parent.getPrivate().items.remove(this); // remove this from its parent

            __private.parent = undefined;
            __private.element.remove();
        }

        /** Views this item. If it has no parent, calling view() does nothing. */
        view(next?: boolean) { this.parent?.view(this, next) }
        //#endregion


        #onUserClickIndicator(e: PointerEvent) {
            const parent = this.parent;
            const index = parent.items.indexOf(this);

            parent.view(index);
        }

        //@ts-ignore
        declare getPrivate(def?: object): CarouselItemPrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): CarouselItem; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: CarouselItem): CarouselItem;
    }

    template.inherit(CarouselItem);
}