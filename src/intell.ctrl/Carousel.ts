namespace intell.ctrl {
    /** Represents a slideshow box that cycling through elements. */
    export class Carousel {
        static readonly ACTIVE_CLASS = 'ACTIVE';
        static readonly IN_CLASS = 'IN';
        static readonly IN_LEFT_CLASS = 'IN-LEFT';
        static readonly IN_RIGHT_CLASS = 'IN-RIGHT';
        static readonly OUT_CLASS = 'OUT';
        static readonly OUT_LEFT_CLASS = 'OUT-LEFT';
        static readonly OUT_RIGHT_CLASS = 'OUT-RIGHT';
        static readonly INDICATOR_RUNNING_CLASS = 'RUNNING'; 

        constructor();

        /**Initializes a new instance of the Carousel class from element.
        *@param element The element for which to create Carousel.*/
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = Carousel.getItem(element); if (c != null) return c; }

            // --b--
            let elementChildren = element?.querySelector<HTMLElement>(':scope>.Children');
            let elementPrev = element?.querySelector<HTMLElement>(':scope>.Prev');
            let elementNext = element?.querySelector<HTMLElement>(':scope>.Next');
            let elementIndicators = element?.querySelector<HTMLElement>(':scope>.Indicators');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="Carousel"></div>`)[0];
            if (elementChildren == null) elementChildren = $$$(`<div class="Children"></div>`)[0].appendTo(element);
            if (elementPrev == null) elementPrev = $$$(`<div class="Prev"></div>`)[0].appendTo(element);
            if (elementNext == null) elementNext = $$$(`<div class="Next"></div>`)[0].appendTo(element);
            if (elementIndicators == null) elementIndicators = $$$(`<div class="Indicators"></div>`)[0].appendTo(element);

            if (element.tabIndex == -1) element.tabIndex = 0;
            //#endregion

            Carousel.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementChildren = elementChildren;
            __private.elementPrev = elementPrev;
            __private.elementNext = elementNext;
            __private.elementIndicators = elementIndicators;
            __private.focused = false;
            __private.items = [];
            __private.interval = 5000;
            __private.running = false;

            //#region Predefine
            elementChildren.querySelectorAll(':scope>.Item').forEach(element => {
                this.add(new CarouselItem(element as HTMLElement));
            });
            //#endregion

            element.addEventListener('focus', () => this.#onUserFocus());
            element.addEventListener('blur', () => this.#onUserBlur());
            element.addEventListener('keydown', e => this.#onUserKeydown(e));
            elementPrev.addEventListener('click', () => this.prev());
            elementNext.addEventListener('click', () => this.next());
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }

        /** Gets the element that contains the slide elements. */
        get elementChildren() { return this.getPrivate().elementChildren }

        /** Gets the navigation button element used to move backward. */
        get elementPrev() { return this.getPrivate().elementPrev }

        /** Gets the navigation button element used to move forward. */
        get elementNext() { return this.getPrivate().elementNext }

        /** Gets the element that contains indicator elements. */
        get elementIndicators() { return this.getPrivate().elementIndicators }

        /** Gets a value indicating whether the control have input focus. */
        get focused() { return this.getPrivate().focused }

        /** Gets an array containing all items. */
        get items() { return this.getPrivate().items.slice() }

        /** Gets the currently active item. */
        get activeItem() { return this.items.find(item => item.active) }

        /** Gets the index of the currently active item. */
        get activeIndex() { return this.items.findIndex(item => item.active) }

        /** Gets a value indicating whether the carousel is automatically cycling. */
        get running() { return this.getPrivate().running }

        /** Gets or sets the time interval between automatic item cycles. */
        get interval() { return this.getPrivate().interval }
        set interval(newValue) { this.getPrivate().interval = newValue }
        //#endregion

        //#region methods - foundational
        /** Gets the previous item relative to the currently active item. */
        getPrevItem(): CarouselItem {
            let nextIndex = this.activeIndex - 1;
            if (nextIndex < 0) nextIndex = this.items.length - 1;
            return this.items[nextIndex];
        }

        /** Gets the next item relative to the currently active item. */
        getNextItem(): CarouselItem {
            let nextIndex = this.activeIndex + 1;
            if (nextIndex >= this.items.length) nextIndex = 0;
            return this.items[nextIndex];
        }
        //#endregion

        //#region methods
        /** Adds a new CarouselItem to the end of the list.*/
        add(item: CarouselItem) {
            // removes the item from its current parent if one exists
            if (item.parent != null) item.remove();

            const __private = this.getPrivate();
            __private.items.push(item);

            const itemPrivate = item.getPrivate();
            itemPrivate.parent = this;

            __private.elementIndicators.append(item.elementIndicator);

            if (__private.items.length == 1) this.view(__private.items[0], true);
        }

        /** Views the specified slide by its index. */
        view(index: number, next?: boolean): void;
        /** Views the specified slide. */
        view(item: CarouselItem, next?: boolean): void;
        view(arg1: number | CarouselItem, next: boolean = true) {
            const __private = this.getPrivate();
            const item = typeof arg1 == 'number' ? __private.items[arg1] : arg1;

            if (item == null) throw new Error("The item cannot be null.");
            if (__private.items.indexOf(item) == -1) throw new Error('The item does not belong to this carousel.');
 
            const itemPrivate = item.getPrivate();

            // If it has no parent, calling remove() does nothing.
            if (itemPrivate.parent == null) return;
            if (itemPrivate.active == true) return;

            const inClasses = [Carousel.IN_CLASS, next == true ? Carousel.IN_RIGHT_CLASS : Carousel.IN_LEFT_CLASS];
            const outClasses = [Carousel.OUT_CLASS, next == true ? Carousel.OUT_LEFT_CLASS : Carousel.OUT_RIGHT_CLASS];

            //#region hides previous item if exists
            const previousItem = this.activeItem;
            if (previousItem != null) {
                const previous__ = previousItem.getPrivate();

                previous__.element.classList.remove(Carousel.ACTIVE_CLASS);
                previous__.element.classList.add(...outClasses);

                const promises = previous__.element.getAnimations().map(animation => animation.finished);

                Promise.all(promises).then(r => {
                    hide(previous__.element);
                    previous__.element.classList.remove(Carousel.IN_CLASS, Carousel.IN_LEFT_CLASS, Carousel.IN_RIGHT_CLASS, Carousel.OUT_CLASS, Carousel.OUT_LEFT_CLASS, Carousel.OUT_RIGHT_CLASS);
                }).catch(() => { });

                previous__.elementIndicator.classList.toggle('ACTIVE', false);
                previous__.active = false;
            }
            //#endregion

            //#region shows the item
            itemPrivate.element.classList.remove(Carousel.IN_CLASS, Carousel.IN_LEFT_CLASS, Carousel.IN_RIGHT_CLASS, Carousel.OUT_CLASS, Carousel.OUT_LEFT_CLASS, Carousel.OUT_RIGHT_CLASS);
            hide(itemPrivate.element); itemPrivate.element.classList.add(...inClasses); itemPrivate.element.offsetHeight;
            show(itemPrivate.element); itemPrivate.element.classList.add(Carousel.ACTIVE_CLASS);

            itemPrivate.elementIndicator.classList.toggle('ACTIVE', true);
            itemPrivate.active = true;
            //#endregion

            if (__private.running == true) this.#reattachRunningEffect();

            const event = new Event('carouselchange', { bubbles: true, cancelable: false }) as GlobalEventHandlersEventMap["carouselchange"];
            event.carousel = this;
            event.oldItem = previousItem;
            event.newItem = item;

            __private.element.dispatchEvent(event);
        }
        
        prev() { this.view(this.getPrevItem(), false) }
        next() { this.view(this.getNextItem(), true) }

        /** Starts automatically cycling through items. If it is already started, calling start() does nothing. */
        start() {
            const __private = this.getPrivate();
            if (__private.running == true) return;
            __private.running = true;

            this.#waitAndNext();
        }

        /** Stops automatically cycling through items */
        stop() {
            const __private = this.getPrivate();
            if (__private.running == false) return; __private.running = false;

            clearTimeout(__private._timer);

            const activeIndex = this.activeIndex;
            const activeItem = __private.items[activeIndex];

            activeItem.elementIndicator.style.removeProperty('--interval');
            activeItem.elementIndicator.classList.remove(Carousel.INDICATOR_RUNNING_CLASS);
        }

        #waitAndNext() {
            const __private = this.getPrivate();

            let activeItem = this.activeItem;
            if (activeItem == null) { this.next(); activeItem = this.activeItem }

            this.#startRunningAffect(activeItem);

            __private._timer = setTimeout(() => {
                this.#stopRunningAffect(); this.next(); this.#waitAndNext();
            }, __private.interval);
        }
        /** Starts the running effect on a specified item.  */
        #startRunningAffect(item: CarouselItem) {
            const __private = this.getPrivate();

            item.elementIndicator.style.setProperty('--interval', `${__private.interval}ms`);
            item.elementIndicator.classList.add(Carousel.INDICATOR_RUNNING_CLASS);
            __private.runningItem = item;
        }
        /** Stops the running effect by removing the 'RUNNING' class. */
        #stopRunningAffect() {
            const __private = this.getPrivate();
            const runningItem = __private.runningItem;

            runningItem?.elementIndicator.style.removeProperty('--interval');
            runningItem?.elementIndicator.classList.remove(Carousel.INDICATOR_RUNNING_CLASS);

            delete __private.runningItem;
        }

        #reattachRunningEffect() {
            const __private = this.getPrivate();
            const activeItem = this.activeItem;
            const runningItem = __private.runningItem;

            // If the item with the visual effect is different from the active item, reattach it.
            if (runningItem != null && runningItem != activeItem) {
                clearTimeout(__private._timer);

                this.#stopRunningAffect();
                this.#waitAndNext();
            }
        }
        //#endregion
        

        #onUserFocus() {
            const __private = this.getPrivate();
            // we are already focused (CSS Debug‑Friendly)
            if (__private.focused == true) return;

            __private.focused = true;
            __private.element.classList.add('FOCUS');
        }
        #onUserBlur() {
            const __private = this.getPrivate();

            // preserved states when the inspector is open (CSS Debug‑Friendly)
            if (document.activeElement == __private.element) return;

            __private.focused = false;
            __private.element.classList.remove('FOCUS');
        }
        #onUserKeydown(e: KeyboardEvent) {
            if (e.key === "ArrowLeft") this.prev();
            else if (e.key === "ArrowRight") this.next();
            else if (e.key === " ") this.next();
            else return;

            e.preventDefault();
        }

        //@ts-ignore
        declare getPrivate(def?: object): CarouselPrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): Carousel; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: Carousel): Carousel;
    }

    template.inherit(Carousel);
}