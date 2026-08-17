namespace intell.ctrl {
    export class OverlayProgressItem {
        constructor(element: HTMLElement | undefined, parent: OverlayProgress) {
            if (element != null) { let c = OverlayProgressItem.getItem(element); if (c != null) return c; }

            let elementName = element?.querySelector<HTMLElement>(':scope>.Name');
            let elementState = element?.querySelector<HTMLElement>(':scope>.State');

            if (element == null) element = $$$('<div class="Item"></div>')[0];
            if (elementName == null) elementName = $$$('<div class="Name"></div>')[0].appendTo(element);
            if (elementState == null) elementState = $$$('<div class="State"></div>')[0].appendTo(element);

            OverlayProgressItem.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementName = elementName;
            __private.elementState = elementState;
            __private.parent = parent;

            element.classList.add(OverlayProgress.WAITING_CLASS);
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }

        /** Gets the name element. */
        get elementName() { return this.getPrivate().elementName }

        /** Gets the state element. */
        get elementState() { return this.getPrivate().elementState }

        /** Gets the parent overlay progress control. */
        get parent() { return this.getPrivate().parent }
        //#endregion

        //#region methods
        /** Removes this ongoing progress item and also removes it from its parent. */
        remove() {
            const __private = this.getPrivate();
            const parent__private = this.parent.getPrivate();
            parent__private.items.remove(this);

            __private.element.classList.add(OverlayProgress.FADING_CLASS);

            // Gets the opacity transition animation.
            const transition = __private.element.getAnimations().find(animation => {
                if (animation instanceof CSSTransition && animation.transitionProperty == "opacity") return true;
                return false;
            });

            if (transition != null) {
                // Waits for the transition to complete, then removes the item.                
                transition.finished.then(() => { }).catch(e => { }).finally(() => __private.element.remove());
            }
            else __private.element.remove()
        }

        /** Sets state to COMPLETED. */
        complete() {
            this.element.classList.remove(OverlayProgress.WAITING_CLASS);
            this.element.classList.add(OverlayProgress.COMPLETED_CLASS);

            return this;
        }

        /** Sets state to FAILED. */
        fault() {
            this.element.classList.remove(OverlayProgress.WAITING_CLASS);
            this.element.classList.add(OverlayProgress.FAILED_CLASS);

            return this;
        }
        //#endregion

        //@ts-ignore
        declare getPrivate(def?: object): OverlayProgressItemPrivate;

        //@ts-ignore
        declare static getItem(element?: HTMLElement): OverlayProgressItem | undefined; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: OverlayProgressItem): OverlayProgressItem;
    }

    template.inherit(OverlayProgressItem);
}