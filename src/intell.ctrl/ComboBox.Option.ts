namespace intell.ctrl {
    export class ComboBoxOption<T = any> {
        static readonly SELECTED_CLASS = 'SELECTED';
        static readonly OUTLINE_CLASS = 'OUTLINE';

        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = ComboBoxOption.getItem(element); if (c != null) return c; }

            // --b--
            let elementIcon = element?.querySelector<HTMLElement>(':scope>.Icon');
            let elementText = element?.querySelector<HTMLElement>(':scope>.Text');
            let elementDescription = element?.querySelector<HTMLElement>(':scope>.Description');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="Item"></div>`)[0];
            if (elementIcon == null) elementIcon = $$$(`<div class="Icon"></div>`)[0].appendTo(element);
            if (elementText == null) elementText = $$$(`<div class="Text"></div>`)[0].appendTo(element);
            if (elementDescription == null) elementDescription = $$$(`<div class="Description"></div>`)[0].appendTo(element);
            //#endregion

            ComboBoxOption.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementIcon = elementIcon;
            __private.elementText = elementText;
            __private.elementDescription = elementDescription;
            __private.disabled = false;
            __private.selected = false;
            __private.outline = false;
            __private.hidden = false;
        }

        //#region properties
        /** Gets the root element of the option. */
        get element() { return this.getPrivate().element }

        /** Gets the Icon element of the option. */
        get elementIcon() { return this.getPrivate().elementIcon }

        /** Gets the Text element of the option. */
        get elementText() { return this.getPrivate().elementText }

        /** Gets the parent ComboBox of the option. */
        get parent() { return this.getPrivate().parent }

        /** Gets the parent group of the option. */
        get group() { return this.getPrivate().group }

        /** Gets or sets a value indicating whether interaction with the option is disabled. If disabled, the option will not respond to mouse clicks or keyboard selection. */
        get disabled() { return this.getPrivate().disabled }
        set disabled(newValue) {
            const __private = this.getPrivate();

            __private.disabled = newValue;
            __private.element.classList.toggle('DISABLED', newValue)
        }

        /** Gets or sets whether the option is selected or not. */
        get selected() { return this.getPrivate().selected }
        set selected(newValue) {
            const __private = this.getPrivate();
            if (__private.selected == newValue) return;
            __private.selected = newValue;
            __private.element.classList.toggle(ComboBoxOption.SELECTED_CLASS, newValue);

            if (newValue == true && __private.parent?.multiple === false) {
                const selectedOptions = __private.parent.selectedOptions;

                if (selectedOptions.length > 1) {
                    selectedOptions.forEach(option => {
                        if (option != this) option.selected = false;
                    });
                }
            }

            __private.parent?.internalUpdateSelectedContent();
        }

        /** Gets or sets the outline visibility of the option. This value has no effect if the option does not have a parent.
         * Only one option may be outlined at any given time. */
        get outline() { return this.getPrivate().outline }
        set outline(newValue) {
            const __private = this.getPrivate();

            if (newValue == true) {
                if (__private.parent != null) {
                    __private.parent.options.forEach(option => option.outline = false);
                    __private.outline = true;
                }
            }
            else {
                __private.outline = newValue;
            }

            __private.element.classList.toggle(ComboBoxOption.OUTLINE_CLASS, newValue);
        }

        /** Gets or sets whether the option is hidden. If all options within a group are hidden, the group's visibility will be toggled to hidden as well.*/
        get hidden() { return this.getPrivate().hidden }
        set hidden(newValue) {
            const __private = this.getPrivate();

            if (__private.hidden === newValue) return;
            __private.hidden = newValue;

            toggle(__private.element, !newValue);

            if (__private.group != null) {
                const groupPrivate = __private.group.getPrivate();
                const allHidden = groupPrivate.options.every(option => option.hidden == true);

                toggle(groupPrivate.element, !allHidden);
            }
        }

        get value() { return this.getPrivate().value }
        set value(newValue) { this.getPrivate().value = newValue }

        /** Gets or sets the displaying text of the option. */
        get text() { return this.getPrivate().elementText.textContent }
        set text(newValue) { this.getPrivate().elementText.textContent = newValue }

        /** Gets or sets the displaying description of the option. */
        get description() { return this.getPrivate().elementDescription.textContent }
        set description(newValue) { this.getPrivate().elementDescription.textContent = newValue }
        //#endregion

        //#region methods
        /** Removes the option from its parent. If it has no parent, calling remove() does nothing.*/
        remove() {
            const __private = this.getPrivate();
            const parent = __private.parent;

            // If it has no parent, calling remove() does nothing.
            if (parent == null) return;

            parent.getPrivate().options.remove(this); // remove this from its parent
            __private.group.getPrivate().options.remove(this); // remove this from its group

            __private.parent = undefined;
            __private.group = undefined;
            __private.outline = false;
            __private.element.remove();
        }

        /** Checks whether the option matches all specified keywords. */
        matchKeywords(keywords: string[]) {

            const groupText = this.group?.text.toLowerCase();
            const text = this.text.toLowerCase();
            const description = this.description.toLowerCase();

            return keywords.every(keyword => {
                keyword = keyword.toLowerCase();

                if (groupText != null && groupText.indexOf(keyword) != -1) return true;
                if (text != null && text.indexOf(keyword) != -1) return true;
                if (description != null && description.indexOf(keyword) != -1) return true;

                return false;
            });
        }
        //#endregion

        //@ts-ignore
        declare getPrivate(def?: object): ComboBoxItemPrivate<T>;

        //@ts-ignore
        declare static getItem(element: HTMLElement): ComboBoxOption; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: ComboBoxOption): ComboBoxOption;
    }

    template.inherit(ComboBoxOption);
}