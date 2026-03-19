namespace intell.ctrl {
/* ┌┐└┘─│ */
    /**Represents a spin box that displays numeric values. */
    export class ___Template {
        constructor();

        /**Initializes a new instance of the Numeric class from element.
        *@param element The element for which to create Numeric.*/
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = ___Template.getItem(element); if (c != null) return c; }

            // --b--
            let elementModifiers = element?.querySelector<HTMLElement>('.Modifiers');
            let elementPrefix = element?.querySelector<HTMLElement>('.Prefix');
            let elementInput = element?.querySelector<HTMLInputElement>('input');
            let elementSuffix = element?.querySelector<HTMLElement>('.Suffix');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="Overlay-Progress"></div>`)[0];
            if (elementModifiers == null) elementModifiers = $$$(`<div class="Modifiers"></div>`)[0].appendTo(element);
            if (element.tabIndex == -1) element.tabIndex = 0;
            //#endregion

            ___Template.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.focused = false;

            element.addEventListener('focus', () => this.#onUserFocus());
            element.addEventListener('blur', () => this.#onUserBlur());
            element.addEventListener('contextmenu', () => false);
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }

        /** Gets a value indicating whether the control have input focus. */
        get focused() { return this.getPrivate().focused }

        /** Gets or sets value. */
        get value() { return 2 }
        set value(newValue) { }
        //#endregion

        #onUserFocus() { }
        #onUserBlur() { }

        //@ts-ignore
        declare getPrivate(def?: object): ___TemplatePrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): ___Template; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: ___Template): ___Template;
    }

    template.inherit(___Template);
}