namespace intell.ctrl {
    export class ComboBoxGroup {
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = ComboBoxGroup.getItem(element); if (c != null) return c; }

            // --b--
            let elementHeader = element?.querySelector<HTMLElement>(':scope>header');
            let elementText = element?.querySelector<HTMLElement>(':scope>header .Text');
            let elementChildren = element?.querySelector<HTMLElement>(':scope>.Children');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="Group"></div>`)[0];
            if (elementHeader == null) elementHeader = $$$(`<header></header>`)[0].appendTo(element);
            if (elementText == null) elementText = $$$(`<div class="Text"></div>`)[0].appendTo(elementHeader);
            if (elementChildren == null) elementChildren = $$$(`<div class="Children"></div>`)[0].appendTo(element);
            //#endregion

            ComboBoxGroup.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementHeader = elementHeader;
            __private.elementText = elementText;
            __private.elementChildren = elementChildren;
            __private.options = [];
            __private.default = false;
        }

        //#region properties
        /** Gets the root element of this group. */
        get element() { return this.getPrivate().element }

        /** Gets the element Header of this group. */
        get elementHeader() { return this.getPrivate().elementHeader }

        /** Gets the element Text of this group. */
        get elementText() { return this.getPrivate().elementText }

        /** Gets the element Children of this group. */
        get elementChildren() { return this.getPrivate().elementChildren }

        /** Gets the parent ComboBox of the group. */
        get parent() { return this.getPrivate().parent }

        /** Gets an array containing all option items. */
        get options() { return this.getPrivate().options.slice() }

        /** Gets or sets the id of the group. */
        get id() { return this.getPrivate().id }
        set id(newValue) { this.getPrivate().id = newValue }

        /** Gets or sets the displaying text of this group. */
        get text() { return this.getPrivate().elementText.textContent }
        set text(newValue) { this.getPrivate().elementText.textContent = newValue }

        /** Gets or sets whether this is the default group. Default groups do not display a header. */
        get default() { return this.getPrivate().default }
        set default(newValue) {
            const __private = this.getPrivate();
            __private.default = newValue;

            __private.element.classList.toggle('DEFAULT', newValue);
            __private.elementHeader.hidden = newValue;
        }
        //#endregion

        //#region methods
        /** Adds a new option to the end of the list for this group. */
        add(item: ComboBoxOption) {
            // removes the item from its current parent if one exists
            if (item.parent != null) item.remove();

            const __private = this.getPrivate();
            const parent = __private.parent;

            // adds the new item into list - parent + group
            if (parent != null) {
                const parentPrivate = parent.getPrivate();
                parentPrivate.options.push(item);
                parentPrivate._needsResortOptions = true;
            }
            __private.options.push(item);
            __private.elementChildren.append(item.element);

            const itemPrivate = item.getPrivate();
            itemPrivate.parent = parent;
            itemPrivate.group = this;

            parent?.internalUpdateSelectedContent();
        }

        /** Removes the group from its parent. If it has no parent, calling remove() does nothing.*/
        remove() {
            const __private = this.getPrivate();
            const parent = __private.parent;
            const parentPrivate = parent.getPrivate();

            if (parent == null) return;

            // 1. Removes children from parent.items (combobox)
            // 2. Removes group from parent.group (remove this group from its parent)
            // 3. clears group.parent

            // --1--
            const options = parentPrivate.options;
            for (let i = 0; i < __private.options.length; i++) options.remove(__private.options[i]);            
            
            parentPrivate.groups.remove(this); // --2--
            __private.parent = undefined; // --3--

            __private.element.remove();
        }
        //#endregion

        //@ts-ignore
        declare getPrivate(def?: object): ComboBoxGroupPrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): ComboBoxGroup; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: ComboBoxGroup): ComboBoxGroup;
    }
    template.inherit(ComboBoxGroup);
}
