namespace intell.ctrl {
    const localeDecimalSeparator = (0.1).toLocaleString().substring(1, 2);   // "." in en-US
    const localeThousandSeparator = (1000).toLocaleString().substring(1, 2); // "," in en-US

    /** Represents an overlay progress box that displays ongoing tasks. */
    export class Numeric {

        /** Initializes a new numeric box.*/
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = Numeric.getItem(element); if (c != null) return c; }

            // --b--
            let elementModifiers = element?.querySelector<HTMLElement>('.Modifiers');
            let elementPrefix = element?.querySelector<HTMLElement>('.Prefix');
            let elementInput = element?.querySelector<HTMLInputElement>('input');
            let elementSuffix = element?.querySelector<HTMLElement>('.Suffix');
            let elementActions = element?.querySelector<HTMLElement>('.Actions');
            let elementUp = element?.querySelector<HTMLElement>('.Actions>.Action-Up');
            let elementDown = element?.querySelector<HTMLElement>('.Actions>.Action-Down');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="Numeric"></div>`)[0];
            if (elementModifiers == null) elementModifiers = $$$(`<div class="Modifiers"></div>`)[0].appendTo(element);
            if (elementPrefix == null) elementPrefix = $$$(`<div class="Prefix"></div>`)[0].appendTo(elementModifiers);
            if (elementInput == null) elementInput = $$$(`<input type="text">`)[0].appendTo(elementModifiers) as HTMLInputElement;
            if (elementSuffix == null) elementSuffix = $$$(`<div class="Suffix"></div>`)[0].appendTo(elementModifiers);
            if (elementActions == null) elementActions = $$$(`<div class="Actions"></div>`)[0].appendTo(element);
            if (elementUp == null) elementUp = $$$(`<div class="Action Action-Up icon-up-open-mini"></div>`)[0].appendTo(elementActions);
            if (elementDown == null) elementDown = $$$(`<div class="Action Action-Down icon-down-open-mini"></div>`)[0].appendTo(elementActions);
            //#endregion

            Numeric.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementInput = elementInput;
            __private.elementSuffix = elementSuffix;
            __private.elementPrefix = elementPrefix;
            __private.elementActions = elementActions;
            __private.elementUp = elementUp;
            __private.elementDown = elementDown;
            __private.value = null;
            __private.min = null;
            __private.max = null;
            __private.prefix = '';
            __private.suffix = '';
            __private.step = 1;
            __private.stepViaWheel = false;
            __private.minimumFractionDigits = 0;
            __private.maximumFractionDigits = 2;
            __private.decimalSeparator = localeDecimalSeparator;
            __private.thousandSeparator = localeThousandSeparator;
            __private.nullable = true;
            __private.readonly = false;
            __private.focused = false;
            this.controls = false;
            this.value = Numeric.parseFloat(element.getAttribute('value') ?? '', __private);

            element.style.setProperty('--prefix-width', '0px');
            element.style.setProperty('--suffix-width', '0px');

            elementInput.addEventListener('focus', () => this.#onUserFocus());
            elementInput.addEventListener('beforeinput', e => this.#onUserBeforeinput(e));
            elementInput.addEventListener('keydown', e => this.#onUserKeydown(e));
            elementInput.addEventListener('blur', () => this.#onUserBlur());
            elementUp?.addEventListener('mousedown', e => this.#onUserActionMousedown(e));
            elementDown?.addEventListener('mousedown', e => this.#onUserActionMousedown(e));
            document.addEventListener('mouseup', e => this.#onUserMouseup());
            element.addEventListener('mousewheel', e => this.#onUserMousewheel(e as any));
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }

        /** Gets the input element. */
        get elementInput() { return this.getPrivate().elementInput }

        /** Gets the prefix element. */
        get elementPrefix() { return this.getPrivate().elementPrefix }

        /** Gets the suffix element. */
        get elementSuffix() { return this.getPrivate().elementSuffix }

        /** Gets the button‑up element. */
        get elementUp() { return this.getPrivate().elementUp }

        /** Gets the button‑down element. */
        get elementDown() { return this.getPrivate().elementDown }

        /** Gets a value indicating whether the control have input focus. */
        get focused() { return this.getPrivate().focused }

        /** Gets or sets the value of Numeric. */
        get value() { return this.getPrivate().value }
        set value(newValue) {
            const __private = this.getPrivate();
            let oldValue = __private.value;

            // 1. check
            //   a. treat NaN as null
            //   b. exit because nothing was changed
            //   c. exit because we are not allow null
            //   d. newValue is not number
            // 2. cap [min;max]
            // 3. round to x fraction digits

            // --1--
            if (newValue != null && isNaN(newValue) == true) newValue = undefined;
            if (newValue == oldValue) return;
            if (newValue == null && __private.nullable == false) return;
            if (newValue != null && typeof newValue != 'number') return;

            // --2--
            if (newValue != null && __private.min != null && newValue < __private.min) newValue = __private.min;
            if (newValue != null && __private.max != null && newValue > __private.max) newValue = __private.max;

            // --3--
            if (newValue != null) newValue = math.round(newValue, __private.maximumFractionDigits);
            

            __private.value = newValue;
            __private.elementInput.value = Numeric.formatNumber(newValue, __private);

        }

        /** Gets or sets the minimum allowed value; the default is null. */
        get min() { return this.getPrivate().min }
        set min(newValue) { this.getPrivate().min = newValue }

        /** Gets or sets the maxium allowed value; the default is null. */
        get max() { return this.getPrivate().max }
        set max(newValue) { this.getPrivate().max = newValue }

        get prefix() { return this.getPrivate().prefix }
        set prefix(newValue) {
            const __private = this.getPrivate();
            __private.elementPrefix.textContent = __private.prefix = newValue;

            const prefixTextWidth = getTextMetrics(newValue, __private.elementPrefix).width;
            const inputComputedStyle = getComputedStyle(__private.elementInput);
            const fontSize = parseFloat(inputComputedStyle.fontSize);

            __private.element.style.setProperty('--prefix-width', `${prefixTextWidth / fontSize}em`);
            //this.renderPrefix();
        }
        /** unused */
        renderPrefix() {
            const __private = this.getPrivate();
            const inputComputedStyle = getComputedStyle(__private.elementInput);
            const textAlign = inputComputedStyle.textAlign;
            

            if (textAlign == 'start' || textAlign == 'left' || textAlign == 'justify') {
                __private.elementPrefix.style.right = '';
            }
            else if (textAlign == 'end' || textAlign == 'right' || textAlign == '-webkit-right') {
                const inputPaddingRight = parseFloat(inputComputedStyle.paddingRight);
                const inputTextWidth = getTextMetrics(__private.elementInput.value, __private.elementInput).width;
                const right = inputPaddingRight + inputTextWidth;

                __private.elementPrefix.style.right = `${right}px`;
            }
        }

        get suffix() { return this.getPrivate().suffix }
        set suffix(newValue) {
            const __private = this.getPrivate();
            __private.elementSuffix.textContent = __private.suffix = newValue;

            const textWidth = getTextMetrics(newValue, __private.elementSuffix).width;
            const computedStyle = getComputedStyle(__private.elementInput);
            const fontSize = parseFloat(computedStyle.fontSize);
            const em = textWidth / fontSize;

            __private.element.style.setProperty('--suffix-width', `${em}em`);
        }

        /** Gets or sets the value to increment or decrement the spin box (also known as an up-down control) when the up or down buttons are clicked; the default is 1. */
        get step() { return this.getPrivate().step }
        set step(newValue) { this.getPrivate().step = newValue }

        /** Gets or sets a value indicating whether the control can accept step changes via the mouse wheel. */
        get stepViaWheel() { return this.getPrivate().stepViaWheel }
        set stepViaWheel(newValue) { this.getPrivate().stepViaWheel = newValue }

        /** Gets or sets the minimum number of digits to appear after the decimal point; the default is 0. */
        get minimumFractionDigits() { return this.getPrivate().minimumFractionDigits }
        set minimumFractionDigits(newValue) { this.getPrivate().minimumFractionDigits = newValue }

        /** Gets or sets the maximum number of digits to appear after the decimal point; the default is 2. */
        get maximumFractionDigits() { return this.getPrivate().maximumFractionDigits }
        set maximumFractionDigits(newValue) { this.getPrivate().maximumFractionDigits = newValue }

        /** Gets or sets the decimal separator character; the default value is the locale’s decimal separator. */
        get decimalSeparator() { return this.getPrivate().decimalSeparator }
        set decimalSeparator(newValue) {
            const __private = this.getPrivate();

            __private.decimalSeparator = newValue
            __private.elementInput.value = Numeric.formatNumber(__private.value, __private);
        }

        /** Gets or sets the thousand separator character; the default value is the locale’s thousand separator. */
        get thousandSeparator() { return this.getPrivate().thousandSeparator }
        set thousandSeparator(newValue) {
            const __private = this.getPrivate();

            __private.thousandSeparator = newValue;
            __private.elementInput.value = Numeric.formatNumber(__private.value, __private);
        }

        /** Gets or sets whether the value can be null; the default is true. */
        get nullable() { return this.getPrivate().nullable }
        set nullable(newValue) {
            const __private = this.getPrivate();

            __private.nullable = newValue;
            if (__private.nullable == false && __private.value == null) this.value = 0;
        }

        /** Gets or sets whether the control is not mutable, meaning the user can not edit the control. */
        get readonly() { return this.getPrivate().readonly }
        set readonly(newValue) {
            const __private = this.getPrivate();

            __private.readonly = newValue;
            __private.elementInput.readOnly = newValue;

            ctrl.toggle(__private.elementActions, !newValue);
        }


        /** Gets or sets whether to display controls—such as increment and decrement buttons. */
        get controls() { return this.getPrivate().controls }
        set controls(newValue) {
            const __private = this.getPrivate();
            ctrl.toggle(__private.elementActions, !__private.readonly && (__private.controls = newValue));
        }
        //#endregion

        //#region methods
        #increaseSessionBy(step: number) {
            const __private = this.getPrivate();

            let newValue = Numeric.parseFloat(__private.elementInput.value, __private);
            if (newValue == null || isNaN(newValue) == true) newValue = 0;

            newValue += step;

            if (__private.min != null && newValue < __private.min) newValue = __private.min;
            if (__private.max != null && newValue > __private.max) newValue = __private.max;

            __private.elementInput.value = Numeric.formatNumber(newValue, __private);
        }
        #onUserFocus() {
            const __private = this.getPrivate();
            // we are already focused (CSS Debug‑Friendly)
            if (__private.focused == true) return;

            __private.focused = true;
            __private.element.classList.add('FOCUS');
        }
        #onUserBeforeinput(e: InputEvent) {
            const __private = this.getPrivate();
            
            if (__private.readonly == true) { e.preventDefault(); return; } 
            if (e.inputType == "insertText") {
                if ('1234567890.,-'.indexOf(e.data) == -1) { e.preventDefault(); return; }
            }
        }
        #onUserKeydown(e: KeyboardEvent) {
            const __private = this.getPrivate();

            if (e.code == "Escape") {
                __private.revert = true;
                __private.elementInput.blur();
            }
            else if (e.key == "ArrowUp" && __private.readonly == false) {
                this.#increaseSessionBy(__private.step);
                e.preventDefault();
            }
            else if (e.key == "ArrowDown" && __private.readonly == false) {
                this.#increaseSessionBy(-__private.step);
                e.preventDefault();
            }
        }
        #onUserBlur() {
            const __private = this.getPrivate();

            // preserved states when the inspector is open (CSS Debug‑Friendly)
            if (document.activeElement == __private.elementInput) return;

            // 1. reverts: indicates whether the user press escape
            // 2. parse newValue
            // 3. if can't change value or new value equal old value
            //    a. can't set
            //    b. can set

            __private.focused = false;
            __private.element.classList.remove('FOCUS');

            if (__private.revert == true) {
                // --1--
                __private.revert = false;
                __private.elementInput.value = Numeric.formatNumber(__private.value, __private);
            }
            else {
                // --2--
                let oldValue = __private.value;
                let newValue = this.value = Numeric.parseFloat(__private.elementInput.value, __private);

                // --2a--
                if (this.value == oldValue) {
                    __private.elementInput.value = Numeric.formatNumber(__private.value, __private);
                }
                else {
                    // --2b--
                    const event = new Event('numericchange', { cancelable: false, bubbles: true });
                    (event as any).numeric = this;
                    __private.elementInput.dispatchEvent(event);
                }
            }
        }
        async #onUserActionMousedown(e: MouseEvent) {
            const __private = this.getPrivate();

            __private.elementInput.focus(); e.preventDefault();


            if (__private.readonly == false) {
                __private.holdingMousedown = true;

                let step = 0;

                if (__private.elementUp?.contains(e.target as any)) step = __private.step;
                if (__private.elementDown?.contains(e.target as any)) step = -__private.step;

                this.#increaseSessionBy(step);

                await intell.wait(400);
                if (__private.holdingMousedown === true) {
                    if (__private.holdingMousedownTimer) clearTimeout(__private.holdingMousedownTimer);
                    __private.holdingMousedownTimer = setInterval(() => this.#increaseSessionBy(step), 50);
                }
            } 
        }
        #onUserMouseup() {
            const __private = this.getPrivate();

            // If the user releases the hold, stop the increment timer
            if (__private.holdingMousedown === true) {
                clearInterval(__private.holdingMousedownTimer);
                delete __private.holdingMousedown;
                delete __private.holdingMousedownTimer;
            }
        }
        #onUserMousewheel(e: WheelEvent) {
            const __private = this.getPrivate();
            
            if (__private.focused == true && e.ctrlKey == false && __private.stepViaWheel == true) {
                if (e.deltaY > 0) this.#increaseSessionBy(-__private.step)
                else this.#increaseSessionBy(__private.step)
                
                e.preventDefault();
            }
        }
        //#endregion

        /** Returns a floating point number parsed from the given string specified language-sensitive representation. */
        static parseFloat(text: string, option: NumericFormatOption): number {
            // Assuming we have:
            // thousandSeparator = "| ";
            // decimalSeparator  = "_";

            // 1. "1| 000| 000| 000_88" => "1000000000_88"
            //      thousandSeparator => ""
            //      https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_the_replacement
            // 2. "1000000000_88" => "."
            
            if (typeof text == "object") text = (text as object).toString();

            // --1--
            if (option.thousandSeparator != null) {
                text = text.replaceAll(option.thousandSeparator, '');
            }

            // --2--
            if (option.decimalSeparator != null) {
                text = text.replace(option.decimalSeparator, '.');
            }

            return parseFloat(text);
        } 

        /** Returns a string with a language-sensitive representation of this number. If number is null/NaN, return empty string.
         * @param number The value to parse. If this argument is not a string, then it is converted to one using the ToString abstract operation.
         * @param option An object that supplies culture-specific formatting information. */
        static formatNumber(number: number | undefined, option?: NumericFormatOption): string {

            // 1. if the number is null or NaN, returns empty string
            // 2. minimumFractionDigits - maximumFractionDigits
            // 3. 
            //   3a. "1,222,333.20" => "1a222a333b20"
            //   3b. "1a222a333b20" => "1|222|333_20"

            // --1--
            if (number == null || isNaN(number)) return '';
            if (typeof number != 'number') throw new TypeError('value is not number.');

            // --2--
            let text = Intl.NumberFormat('en-US', { minimumFractionDigits: option?.minimumFractionDigits, maximumFractionDigits: option?.maximumFractionDigits }).format(number);

            // --3a--
            // This replacement step is necessary in case the user wants to swap '.' with ','
            text = text.replace(/,/g, 'a').replace('.', 'b'); // => 1a000a000b14

            // --3b--
            text = text.replace(/a/g, option?.thousandSeparator ?? '').replace('b', option?.decimalSeparator ?? '.');

            return text;
        }


        //@ts-ignore
        declare getPrivate(def?: object): NumericPrivate;

        //@ts-ignore
        declare static getItem(element?: HTMLElement): Numeric | undefined; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: Numeric): Numeric;
    }
    

    template.inherit(Numeric);
}