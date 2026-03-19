namespace intell.ctrl {
    const localeDecimalSeparator = (0.1).toLocaleString().substring(1, 2);   // "." in en-US
    const localeThousandSeparator = (1000).toLocaleString().substring(1, 2); // "," in en-US

    /**Represents a box that displays TimeSpan value. */
    export class TimeSpan {
        static ERROR_CLASS = 'ERROR';

        /**Initializes a new instance of the Numeric class from element.
        *@param element The element for which to create Numeric.*/
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = TimeSpan.getItem(element); if (c != null) return c; }

            // --b--
            let elementInput = element?.querySelector<HTMLElement>('.Input');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="TimeSpan"></div>`)[0];
            if (elementInput == null) elementInput = $$$(`<div class="Input"></div>`)[0].appendTo(element);

            if (elementInput.tabIndex == -1) elementInput.tabIndex = 0;
            elementInput.spellcheck = false;
            elementInput.contentEditable = 'plaintext-only';
            //#endregion

            TimeSpan.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementInput = elementInput;
            __private.focused = false;
            __private.value = null;
            __private.min = null;
            __private.max = null;
            __private.step = 60000;
            __private.stepViaWheel = false;
            __private.strictness = 0;
            __private.decimalSeparator = localeDecimalSeparator;
            __private.thousandSeparator = localeThousandSeparator;
            __private.nullable = true;
            __private.readonly = false;

            elementInput.addEventListener('focus', () => this.#onUserFocus());           
            elementInput.addEventListener('beforeinput', e => this.#onUserBeforeinput(e));
            elementInput.addEventListener('keydown', e => this.#onUserKeydown(e));
            elementInput.addEventListener('mousewheel', e => this.#onUserMousewheel(e as any));
            elementInput.addEventListener('blur', () => this.#onUserBlur());
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }

        /** Gets the input element of the control. */
        get elementInput() { return this.getPrivate().elementInput }

        /** Gets a value indicating whether the control have input focus. */
        get focused() { return this.getPrivate().focused }

        /** Gets or sets the value in milliseconds. */
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

            // --1--
            if (newValue != null && isNaN(newValue) == true) newValue = undefined;
            if (newValue == oldValue) return;
            if (newValue == null && __private.nullable == false) return;
            if (newValue != null && typeof newValue != 'number') return;

            // --2--
            if (newValue != null && __private.min != null && newValue < __private.min) newValue = __private.min;
            if (newValue != null && __private.max != null && newValue > __private.max) newValue = __private.max;

            __private.value = newValue;
            __private.elementInput.replaceChildren(...TimeSpan.format(newValue, __private));
        }

        /** Gets or sets the minimum allowed value; the default is null. */
        get min() { return this.getPrivate().min }
        set min(newValue) { this.getPrivate().min = newValue }

        /** Gets or sets the maxium allowed value; the default is null. */
        get max() { return this.getPrivate().max }
        set max(newValue) { this.getPrivate().max = newValue }

        /** Gets or sets the amount to increment or decrement when the up or down arrow keys are pressed. The default is 60000. */
        get step() { return this.getPrivate().step }
        set step(newValue) { this.getPrivate().step = newValue }

        /** Gets or sets a value indicating whether the control can accept step changes via the mouse wheel. */
        get stepViaWheel() { return this.getPrivate().stepViaWheel }
        set stepViaWheel(newValue) { this.getPrivate().stepViaWheel = newValue }

        /** Gets or sets the strictness level for parsing the input text value. */
        get strictness() { return this.getPrivate().strictness }
        set strictness(newValue) { this.getPrivate().strictness = newValue }

        /** Gets or sets the decimal separator character; the default value is the locale’s decimal separator. */
        get decimalSeparator() { return this.getPrivate().decimalSeparator }
        set decimalSeparator(newValue) {
            const __private = this.getPrivate();

            __private.decimalSeparator = newValue;
            __private.elementInput.replaceChildren(...TimeSpan.format(__private.value, this));
        }

        /** Gets or sets the thousand separator character; the default value is the locale’s thousand separator. */
        get thousandSeparator() { return this.getPrivate().thousandSeparator }
        set thousandSeparator(newValue) {
            const __private = this.getPrivate();

            __private.thousandSeparator = newValue;
            __private.elementInput.replaceChildren(...TimeSpan.format(__private.value, this));
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
            __private.element.classList.toggle('READONLY', newValue);


            if (newValue == false) {
                __private.elementInput.contentEditable = 'plaintext-only';
            }
            else {
                __private.elementInput.contentEditable = 'false';
            }
        }
        //#endregion

        //#region methods
        #increaseSessionBy(step: number) {
            const __private = this.getPrivate();

            let newValue = TimeSpan.parse(__private.elementInput.textContent, __private);
            if (newValue == null || isNaN(newValue) == true) newValue = 0;

            newValue += step;

            if (__private.min != null && newValue < __private.min) newValue = __private.min;
            if (__private.max != null && newValue > __private.max) newValue = __private.max;

            const savedOffset = intell.highlight.getCaretOffset(__private.elementInput);
            __private.elementInput.replaceChildren(...TimeSpan.format(newValue, __private));

            const range = highlight.createRangeFromCaretOffset(__private.elementInput, Math.min(savedOffset, __private.elementInput.textContent.length));
            const selection = document.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

        }
        #onUserFocus() {
            const __private = this.getPrivate();
            // we are already focused (CSS Debug‑Friendly)
            if (__private.focused == true) return;

            __private.focused = true;
            __private.element.classList.add('FOCUS');
        }
        async #onUserBeforeinput(e: InputEvent) {
            const __private = this.getPrivate();
            if (e.inputType == 'insertLineBreak') { e.preventDefault(); return }
            else if (e.inputType == '') { }

            await intell.wait(1);

            const textContent = __private.elementInput.textContent;
            let hasError = false;

            if (textContent == "") {

            }
            else {
                hasError = TimeSpan.isValid(textContent, this) == false;

                const savedOffset = intell.highlight.getCaretOffset(__private.elementInput);
                __private.elementInput.replaceChildren(...TimeSpan.highlight(textContent));

                const range = highlight.createRangeFromCaretOffset(__private.elementInput, savedOffset);
                const selection = document.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }

            __private.element.classList.toggle(TimeSpan.ERROR_CLASS, hasError);
        }
        #onUserKeydown(e: KeyboardEvent) {
            const __private = this.getPrivate();

            if (e.code == "Escape") {
                __private._revert = true;
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
        #onUserMousewheel(e: WheelEvent) {
            const __private = this.getPrivate();

            if (__private.focused == true && e.ctrlKey == false && __private.stepViaWheel == true) {
                if (e.deltaY > 0) this.#increaseSessionBy(-__private.step)
                else this.#increaseSessionBy(__private.step)

                e.preventDefault();
            }
        }
        #onUserBlur() {
            const __private = this.getPrivate();

            // preserved states when the inspector is open (CSS Debug‑Friendly)
            if (__private.element.contains(document.activeElement) == true) return;

            __private.focused = false;
            __private.element.classList.remove('FOCUS', TimeSpan.ERROR_CLASS);

            // Reverts to the previous value when the user presses the ESC key.
            if (__private._revert == true) {
                // --1--
                __private._revert = false;
                __private.elementInput.replaceChildren(...TimeSpan.format(__private.value, __private));
            }
            else {
                const textContent = __private.elementInput.textContent;
                const oldValue = __private.value;
                let newValue: number;

                // Set value to null only if textContent is an empty string;                 
                if (textContent == "") this.value = newValue = null;
                else {
                    // ignore NaN results from the parse function.
                    let newValue = TimeSpan.parse(textContent, __private);
                    if (isNaN(newValue) != true) {
                        this.value = newValue;
                    }
                }


                // If the value is still equal to the previous value, the change cannot be applied.
                if (this.value == oldValue) {
                    __private.elementInput.replaceChildren(...TimeSpan.format(__private.value, this));
                }
                else {
                    // --2b--
                    const event = new Event('timespanchange', { cancelable: false, bubbles: true });
                    (event as any).timespan = this;
                    __private.element.dispatchEvent(event);
                }
            }
        }
        //#endregion


        static getHHMMSS(value: number) {
            const negative = value < 0;
            let remaining = Math.abs(value);

            let days = Math.floor(remaining / 86_400_000); remaining -= days * 86_400_000;
            let hours = Math.floor(remaining / 3600000); remaining -= hours * 3600000;
            let minutes = Math.floor(remaining / 60000); remaining -= minutes * 60000;
            let seconds = Math.floor(remaining / 1000); remaining -= seconds * 1000;
            let milliseconds = remaining % 1000;

            if (negative == false) return { days, hours, minutes, seconds, milliseconds };
            else return { days: -days, hours: -hours, minutes: -minutes, seconds: -seconds, milliseconds: -milliseconds };
        }

        /** Checks whether the timespan text is valid. */
        static isValid(text: string, option?: TimeSpanFormatOption): boolean {
            if (text == null) return false;

            const strictness = option?.strictness ?? 0;
            if (option?.thousandSeparator != null) text = text.replaceAll(option.thousandSeparator, '');
            if (option?.decimalSeparator != null) text = text.replaceAll(option.decimalSeparator, '.');

            text = text.trim();
            if (text == "") return false;
            if (/^0+$/.test(text) == true) return true;

            if (strictness == 0)
                return /^(-?((\d*\.)?\d+)(d|h|m|s|(ms)) *)*$/.test(text);
            else if (strictness == 1)
                return /^(-?(\d*\.)?\d+d)? *(-?(\d*\.)?\d+h)? *(-?(\d*\.)?\d+m)? *(-?(\d*\.)?\d+s)? *(-?(\d*\.)?\d+ms)?$/.test(text);
            else throw new Error(`The strictness level ${strictness} is not supported.`);
        }

        /** Returns a floating-point number representing milliseconds, parsed from the given string specified language-sensitive representation.
         * The input string supports formats such as '1d 2h 30m 40s 500ms' or '5.5h'. */
        static parse(text: string, option?: TimeSpanFormatOption): number {
            if (this.isValid(text, option) == false) return NaN;

            // convert the input text to US locale culture format
            if (option?.thousandSeparator != null) text = text.replaceAll(option.thousandSeparator, '');
            if (option?.decimalSeparator != null) text = text.replaceAll(option.decimalSeparator, '.');

            const dResult = /(-?(?:\d*\.)?\d+)d(?: |\d|\.|$)/.exec(text);
            const hResult = /(-?(?:\d*\.)?\d+)h(?: |\d|\.|$)/.exec(text);
            const mResult = /(-?(?:\d*\.)?\d+)m(?: |\d|\.|$)/.exec(text);
            const sResult = /(-?(?:\d*\.)?\d+)s(?: |\d|\.|$)/.exec(text);
            const msResult = /(-?(?:\d*\.)?\d+)ms(?: |\d|\.|$)/.exec(text);

            let days = 0;
            let hours = 0;
            let minutes = 0;
            let seconds = 0
            let milliseconds = 0;

            if (dResult != null) days = parseFloat(dResult[1]);
            if (hResult != null) hours = parseFloat(hResult[1]);
            if (mResult != null) minutes = parseFloat(mResult[1]);
            if (sResult != null) seconds = parseFloat(sResult[1]);
            if (msResult != null) milliseconds = parseFloat(msResult[1]);

            return days * 3600000 * 24 + hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
        }

        /** Returns an array of Node representation of this timespan number. If value is null/NaN, return empty array. */
        static format(value: number, option?: TimeSpanFormatOption): Node[] {
            if (value == null) return [];
            if (value == 0) return [document.createTextNode('0')];

            const hhmmss = this.getHHMMSS(value);
            const d = hhmmss.days;
            const h = hhmmss.hours;
            const m = hhmmss.minutes;
            const s = hhmmss.seconds;
            const ms = hhmmss.milliseconds;

            let text: string[] = [];

            if (d != 0) text.push(`${Numeric.formatNumber(d, option)}d`);
            if (h != 0) text.push(`${h}h`);
            if (m != 0) text.push(`${m}m`);
            if (s != 0) text.push(`${s}s`);
            if (ms != 0) text.push(`${Numeric.formatNumber(ms, option)}ms`);

            return this.highlight(text.join(' '));
        }

        static highlight(textContent: string, option?: TimeSpanFormatOption): Node[] {
            const thousandSeparator = option?.thousandSeparator ?? '';
            const decimalSeparator = option?.decimalSeparator ?? localeDecimalSeparator;

            const reg_d =  new RegExp(`(?:\\d*\\${decimalSeparator})?\\d+(d)(?: |\\d|\\${decimalSeparator}|$)`, 'dg');
            const reg_h =  new RegExp(`(?:\\d*\\${decimalSeparator})?\\d+(h)(?: |\\d|\\${decimalSeparator}|$)`, 'dg');
            const reg_m =  new RegExp(`(?:\\d*\\${decimalSeparator})?\\d+(m)(?: |\\d|\\${decimalSeparator}|$)`, 'dg');
            const reg_s =  new RegExp(`(?:\\d*\\${decimalSeparator})?\\d+(s)(?: |\\d|\\${decimalSeparator}|$)`, 'dg');
            const reg_ms = new RegExp(`(?:\\d*\\${decimalSeparator})?\\d+(ms)(?: |\\d|\\${decimalSeparator}|$)`, 'dg');

            return highlight.highlight(textContent, [
                { className: 'Day', regexp: reg_d },
                { className: 'Hour', regexp: reg_h },
                { className: 'Minute', regexp: reg_m },
                { className: 'Second', regexp: reg_s },
                { className: 'MilliSecond', regexp: reg_ms },
            ]);
        }


        //@ts-ignore
        declare getPrivate(def?: object): TimeSpanPrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): TimeSpan; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: TimeSpan): TimeSpan;
    }

    template.inherit(TimeSpan);
}