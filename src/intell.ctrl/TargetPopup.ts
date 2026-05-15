namespace intell.ctrl {
    /** Represents a container that can be displayed anywhere or attached to another element. */
    export class TargetPopup {
        /**Initializes a new instance of the TargetPopup class from element.
        *@param element The element for which to create TargetPopup.*/
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = TargetPopup.getItem(element); if (c != null) return c; }

            // --b--
            // let elementModifiers = element?.querySelector<HTMLElement>('.Modifiers');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="TargetPopup"></div>`)[0];
            //#endregion

            TargetPopup.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.visible = false;
            __private.locations = [9, 1];
            __private.option = { distance: 0 };

            hide(element);

            document.addEventListener('mousedown', e => this.#onUserMousedown(e));
            document.addEventListener('mouseup', e => this.#onUserMouseup(e));
            //element.addEventListener('focus', () => this.#onUserFocus());
            //element.addEventListener('blur', () => this.#onUserBlur());
            //element.addEventListener('contextmenu', () => false);
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }

        /** Gets the element attached to the TargetPopup. */
        get elementAttached() { return this.getPrivate().elementAttached }

        /** Gets a value indicating whether the popup is displayed. */
        get visible() { return this.getPrivate().visible }

        /** Gets or sets the placement locations for the popup. The default value is [9, 1]. */
        get locations() { return this.getPrivate().locations }
        set locations(newValue) { this.getPrivate().locations = newValue }

        /** Gets or sets the placement option for the popup. The default value is { distance: 0 }. */
        get option() { return this.getPrivate().option }
        set option(newValue) { this.getPrivate().option = newValue }
        //#endregion

        //#region methods
        /** Shows the popup so that it stays near another element. */
        showAt(target: HTMLElement): void;

        /** Shows the popup at the coordinates relative to the document. */
        showAt(coordinates: math.PointLike): void;
        showAt() {
            const __private = this.getPrivate();
            __private.visible = true;

            // Removes 'POPUP-ATTACHED' from previous elementAttached
            __private.elementAttached?.classList.remove('POPUP-ATTACHED');
            __private.elementAttached = null;

            if (arguments[0] instanceof HTMLElement) {
                __private.elementAttached = arguments[0];
                __private.elementAttached.classList.add('POPUP-ATTACHED');
            }

            ctrl.showAt(__private.element, arguments[0], __private.locations, __private.option);
            __private.element.classList.add('ACTIVE');
        }

        /** Hides the popup. */
        hide() {
            const __private = this.getPrivate();
            if (__private.visible == false) return;

            __private.visible = false;
            __private.element.classList.remove('ACTIVE');

            // Removes 'POPUP-ATTACHED' from previous elementAttached
            __private.elementAttached?.classList.remove('POPUP-ATTACHED');
            __private.elementAttached = null;

            // Gets the opacity transition animation.
            const transition = __private.element.getAnimations().find(animation => {
                if (animation instanceof CSSTransition) {
                    if (animation.transitionProperty == "opacity") return true;
                }
                return false;
            });
            
            // Hide the popup
            if (transition != null) {
                // Waits for the transition animation to finish before hiding the popup.
                transition.finished.then(() => {
                    hide(__private.element);
                }).catch(e => {
                    
                });
            }
            else hide(__private.element);

            const event = new Event("targetpopuphide", { cancelable: false, bubbles: true });
            (event as GlobalEventHandlersEventMap["targetpopuphide"]).ctrl = this;
            __private.element.dispatchEvent(event);

            __private._previousMousedownEvent = null;
        }
        //#endregion

        #onUserMousedown(e: MouseEvent) {
            const __private = this.getPrivate();
            if (__private.visible == false) return; // already hidden

            __private._previousMousedownEvent = e;
        }
        #onUserMouseup(e: MouseEvent) {
            const __private = this.getPrivate();
            const taget = e.target as HTMLElement;

            if (__private.visible == false) return; // already hidden
            if (__private._previousMousedownEvent == null) return;

            // mousedown from inside
            if (__private.element.contains(__private._previousMousedownEvent.target as HTMLElement) == true) return; 

            // mouseup on our target
            if (__private.elementAttached != null && __private.elementAttached.contains(taget) == true) return; 

            this.hide();
        }

        /** The static showAt() function is a shortcut to create or reuse an existing instance, then display it at the specified elements or coordinates. */
        static showAt(element: HTMLElement, target: HTMLElement, locations?: number[], option?: math.ShowAtOption): TargetPopup;
        /** The static showAt() function is a shortcut to create or reuse an existing instance, then display it at the specified elements or coordinates. */
        static showAt(element: HTMLElement, coordinates: math.PointLike, locations?: number[], option?: math.ShowAtOption): TargetPopup;
        static showAt(element: HTMLElement, target: any, locations?: number[], option?: math.ShowAtOption) {
            const targetpopup = new TargetPopup(element);
            if (locations) targetpopup.locations = locations;
            if (option) targetpopup.option = option;

            targetpopup.showAt(target);

            return targetpopup;
        }


        //@ts-ignore
        declare getPrivate(def?: object): TargetPopupPrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): TargetPopup; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: TargetPopup): TargetPopup;
    }

    template.inherit(TargetPopup);
}