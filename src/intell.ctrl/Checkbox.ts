namespace intell.ctrl {

    /**Represents a spin box that displays numeric values. */
    export class Checkbox {
        constructor();

        /**Initializes a new instance of the Checkbox class from element.
        *@param element The element for which to create Numeric.*/
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = Checkbox.getItem(element); if (c != null) return c; }


            // --b--
            let elementLabel = element?.querySelector<HTMLElement>('.Label');
            let elementIcon = element?.querySelector<HTMLElement>('.Label>.Icon');
            let elementName = element?.querySelector<HTMLElement>('.Label>.Name');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="Checkbox"></div>`)[0];
            if (elementLabel == null) elementLabel = $$$(`<div class="Label"></div>`)[0].appendTo(element);
            if (elementIcon == null) elementIcon = $$$(`<span class="Icon"></span>`)[0].appendTo(elementLabel);
            if (elementName == null) elementName = $$$(`<span class="Name"></span>`)[0].appendTo(elementLabel);
            if (elementLabel.tabIndex == -1) elementLabel.tabIndex = 0;

            // brings all TextNode from the root element to elementName
            [...element.childNodes].forEach(node => {
                if (node instanceof Text) elementName.append(node);
            });
            //#endregion

            Checkbox.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementLabel = elementLabel;
            __private.elementIcon = elementIcon;
            __private.elementName = elementName;
            __private.focused = false;
            __private.nullable = true;
            __private.readonly = false;

            this.checked = null;

            elementLabel.addEventListener('focus', () => this.#onUserFocus());
            elementLabel.addEventListener('keydown', e => this.#onUserKeydown(e));
            elementLabel.addEventListener('keyup', e => this.#onUserKeyup(e));
            elementLabel.addEventListener('click', e => this.#onUserClick(e));
            elementLabel.addEventListener('blur', () => this.#onUserBlur());
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }
        get elementLabel() { return this.getPrivate().elementLabel }
        get elementIcon() { return this.getPrivate().elementIcon }
        get elementName() { return this.getPrivate().elementName }

        /** Gets a value indicating whether the control have input focus. */
        get focused() { return this.getPrivate().focused }

        /** Gets or sets value indicating whether this checkbox is checked. */
        get checked() { return this.getPrivate().checked }
        set checked(newValue) {
            const __private = this.getPrivate();
            let oldValue = __private.checked;

            // 1. check
            //   a. treat NaN as null
            //   b. exit because nothing was changed
            //   c. exit because we are not allow null
            //   d. newValue is not boolean


            // --1--
            if (newValue === oldValue) return;
            if (newValue == null && __private.nullable == false) return;
            if (newValue != null && typeof newValue != 'boolean') return;
            

            __private.checked = newValue;
            __private.element.setAttribute('data-checked', newValue == null ? 'null' : newValue.toString());
            __private.element.classList.remove('CHECKED', 'UNCHECKED', 'NULL');
            __private.element.classList.add(Checkbox.getClassName(newValue));
        }

        /** Gets the text element of the control. */
        get text() { return this.getPrivate().elementName.innerHTML }
        set text(newValue) { this.getPrivate().elementName.innerHTML = newValue }

        /** Gets or sets whether the value can be null; the default is true. */
        get nullable() { return this.getPrivate().nullable }
        set nullable(newValue) {
            const __private = this.getPrivate();

            __private.nullable = newValue;
            if (__private.nullable == false && __private.checked == null) this.checked = false;
        }

        get readonly() { return this.getPrivate().readonly }
        set readonly(newValue) {
            const __private = this.getPrivate();

            __private.readonly = newValue;
            __private.element.classList.toggle('READONLY', newValue === true);
        }
        //#endregion

        //#region methods
        #onUserNextValue() { 
            const __private = this.getPrivate();
            if (__private.readonly == true) return;
            const nextValue = Checkbox.#nextValue(__private.checked);

            this.checked = nextValue;
            const event = new Event('checkboxchange', { bubbles: true, cancelable: false });
            (event as any).checkbox = this;
            __private.element.dispatchEvent(event);
        }

        #onUserFocus() {
            const __private = this.getPrivate();
            // we are already focused (CSS Debug‑Friendly)
            if (__private.focused == true) return;

            __private.focused = true;
            __private.element.classList.add('FOCUS');
        }
        #onUserClick(e: MouseEvent) { this.#onUserNextValue() }
        #onUserKeydown(e: KeyboardEvent) {
            if (e.code == 'Space') e.preventDefault();
        }
        #onUserKeyup(e: KeyboardEvent) {
            const __private = this.getPrivate();

            if (__private.focused == true && e.code == 'Space') {
                this.#onUserNextValue();
                e.preventDefault();
            }
        }
        #onUserBlur() {
            const __private = this.getPrivate();

            // preserved states when the inspector is open (CSS Debug‑Friendly)
            if (document.activeElement == __private.element) return;

            __private.focused = false;
            __private.element.classList.remove('FOCUS');
        }
        //#endregion

        static #nextValue(checked: boolean) {
            if (checked === true) return false
            else if (checked === false) return true;

            return true;
        }
        static getClassName(checked: boolean): string {
            if (checked === true) return 'CHECKED';
            else if (checked === false) return 'UNCHECKED';
            else return 'NULL';
        }

        //@ts-ignore
        declare getPrivate(def?: object): CheckboxPrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): Checkbox; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: Checkbox): Checkbox;
    }

    template.inherit(Checkbox);
}