namespace intell.portal {
    export class TaskbarShortcut {
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = TaskbarShortcut.getItem(element); if (c != null) return c; }

            // --b--
            let elementIcon = element?.querySelector<HTMLElement>(':scope>.Icon');
            let elementText = element?.querySelector<HTMLElement>(':scope>.Text');
            let elementDescription = element?.querySelector<HTMLElement>(':scope>.Description');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="Shortcut"></div>`)[0];
            if (elementIcon == null) elementIcon = $$$(`<div class="Icon"></div>`)[0].appendTo(element);
            if (elementText == null) elementText = $$$(`<div class="Text"></div>`)[0].appendTo(element);
            if (elementDescription == null) elementDescription = $$$(`<div class="Description"></div>`)[0].appendTo(element);
            //#endregion

            TaskbarShortcut.setItem(element, this);

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
        /** Gets the root element of the shortcut. */
        get element() { return this.getPrivate().element }

        /** Gets the Icon element of the shortcut. */
        get elementIcon() { return this.getPrivate().elementIcon }

        /** Gets the Text element of the shortcut. */
        get elementText() { return this.getPrivate().elementText }

        /** Gets the parent Portal of the shortcut. */
        get parent() { return this.getPrivate().parent }

        /** Gets the parent group of the shortcut. */
        get group() { return this.getPrivate().group }

        /** Gets or sets whether the option is selected or not. */
        get selected() { return this.getPrivate().selected }
        set selected(newValue) {
            const __private = this.getPrivate();
            if (__private.selected == newValue) return;
            __private.selected = newValue;
            __private.element.classList.toggle(Taskbar.ITEM_SELECTED_CLASS, newValue);

            if (newValue == true) {
                __private.parent.shortcuts.forEach(shortcut => {
                    if (shortcut != this) shortcut.selected = false;
                });
            }
        }

        get value() { return this.getPrivate().value }
        set value(newValue) { this.getPrivate().value = newValue }

        get icon() { return this.getPrivate().icon }
        set icon(newValue) {
            const __private = this.getPrivate();
            const previous = __private.icon;
            const elementIcon = __private.elementIcon;

            //#region removes the previous value
            if (previous?.startsWith('class://')) {
                const classname = previous.replace('class://', '');

                if (classname != '' && classname != 'icon') elementIcon.classList.remove(classname);
            }
            else if (previous?.startsWith('http://')) elementIcon.style.backgroundImage = '';
            else if (previous?.startsWith('https://')) elementIcon.style.backgroundImage = '';
            //#endregion

            //#region add the new value
            const icon = __private.icon = newValue;
            elementIcon.setAttribute('data-icon', icon);

            if (icon.startsWith('class://')) {
                const classname = icon.replace('class://', '');

                if (classname != '') elementIcon.classList.add(classname);
            }
            else if (icon.startsWith('http://')) elementIcon.style.backgroundImage = `url(${icon})`;
            else if (icon.startsWith('https://')) elementIcon.style.backgroundImage = `url(${icon})`;
            //#endregion
        }

        /** Gets or sets the displaying text of the option. */
        get text() { return this.getPrivate().elementText.textContent }
        set text(newValue) { this.getPrivate().elementText.textContent = newValue }
        //#endregion

        /** Removes the option from its parent. If it has no parent, calling remove() does nothing.*/
        remove() {
            const __private = this.getPrivate();
            const parent = __private.parent;

            // If it has no parent, calling remove() does nothing.
            if (parent == null) return;

            parent.getPrivate().shortcuts.remove(this); // remove this from its parent
            __private.group.getPrivate().shortcuts.remove(this); // remove this from its group

            __private.parent = undefined;
            __private.group = undefined;
            __private.outline = false;
            __private.element.remove();
        }

        //@ts-ignore
        declare getPrivate(def?: object): TaskbarShortcutPrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): TaskbarShortcut; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: TaskbarShortcut): TaskbarShortcut;
    }

    ctrl.template.inherit(TaskbarShortcut);
}

