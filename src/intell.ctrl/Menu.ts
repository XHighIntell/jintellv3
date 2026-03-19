namespace intell.ctrl {
    /**Represents a menu that displays sub-menu and options. */
    export class Menu {
        static ACTIVE_CLASS = "ACTIVE";
        static HAS_CHILDREN_CLASS = "HAS-CHILDREN";
        static ROOT_CLASS = "ROOT";
        static CHILDREN_VISIBLE_DELAY = 250;
        
        /** Initializes a new instance of the Menu class from element.
        *@param element The element for which to create Menu control.*/
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = Menu.getItem(element); if (c != null) return c; }

            // --b--
            let elementChildren = element?.querySelector<HTMLElement>('.Children');  

            // --c-- predefined
            if (element == null) element = $$$(`<div class=Menu"></div>`)[0];
            if (elementChildren == null) elementChildren = $$$(`<div class="Children"></div>`)[0].appendTo(element);

            if (element.tabIndex == -1) element.tabIndex = 0;
            //#endregion

            Menu.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementChildren = elementChildren;
            __private.focused = false;
            __private.children = [];
            __private.childrenLocations = [4, 12];
            __private.childrenOption = { distance: -1, distanceToContainer: 1 };
            __private.childrenDirection = 'column';
            __private.childrenIntersectEnabled = false;
            __private.rootChildrenLocations = [9, 1];
            __private.rootChildrenOption = { distance: -1, distanceToContainer: 1 };
            __private.rootChildrenDirection = 'row';
            __private.rootChildrenIntersectEnabled = true;
            this.contextMenu = false;

            element.addEventListener('focus', () => this.#onUserFocus());
            element.addEventListener('blur', () => this.#onUserBlur());
            element.addEventListener('keydown', e => this.#onUserKeydown(e));
            element.addEventListener('contextmenu', e => e.preventDefault());

            //#region Predefined feature
            [...__private.elementChildren.querySelectorAll(':scope>.Item')]
                .map((element: HTMLElement) => new MenuItem(element))
                .forEach(item => this.#addItem(item, true));
            //#endregion
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }

        /** Gets the root elementChildren of the control. */
        get elementChildren() { return this.getPrivate().elementChildren }

        /** Gets a value indicating whether the control have input focus. */
        get focused() { return this.getPrivate().focused }

        /** Gets the child menu items. */
        get children() { return this.getPrivate().children.slice() }

        /** Gets or sets the placement locations for all sub-item dropdowns. */
        get childrenLocations() { return this.getPrivate().childrenLocations }
        set childrenLocations(newValue) { this.getPrivate().childrenLocations = newValue }

        /** Gets or sets the placement option for all sub-item dropdowns. */
        get childrenOption() { return this.getPrivate().childrenOption }
        set childrenOption(newValue) { this.getPrivate().childrenOption = newValue }

        /** Gets or sets the input direction of children for all sub-item. This value does not determine the children layout; rather, it dictates how user input is handled. */
        get childrenDirection() { return this.getPrivate().childrenDirection }
        set childrenDirection(newValue) { this.getPrivate().childrenDirection = newValue }

        /** Gets or sets a value indicating whether the intersection overlay is enabled for all sub-item dropdowns. */
        get childrenIntersectEnabled() { return this.getPrivate().childrenIntersectEnabled }
        set childrenIntersectEnabled(newValue) { this.getPrivate().childrenIntersectEnabled = newValue }

        /** Gets or sets the placement locations for all root-item dropdowns. */
        get rootChildrenLocations() { return this.getPrivate().rootChildrenLocations }
        set rootChildrenLocations(newValue) { this.getPrivate().rootChildrenLocations = newValue }

        /** Gets or sets the placement option for all root-item dropdowns. */
        get rootChildrenOption() { return this.getPrivate().rootChildrenOption }
        set rootChildrenOption(newValue) { this.getPrivate().rootChildrenOption = newValue }

        /** Gets or sets the input direction of children for all root-item dropdown. This value does not determine the children layout; rather, it dictates how user input is handled. */
        get rootChildrenDirection() { return this.getPrivate().rootChildrenDirection }
        set rootChildrenDirection(newValue) { this.getPrivate().rootChildrenDirection = newValue }

        /** Gets or sets a value indicating whether the intersection overlay is enabled for all root-item dropdowns. */
        get rootChildrenIntersectEnabled() { return this.getPrivate().rootChildrenIntersectEnabled }
        set rootChildrenIntersectEnabled(newValue) { this.getPrivate().rootChildrenIntersectEnabled = newValue }

        /** Gets or sets a value indicating whether the menu is a context menu. */
        get contextMenu() { return this.getPrivate().contextMenu }
        set contextMenu(newValue) {
            const __private = this.getPrivate();

            __private.contextMenu = newValue;
            __private.element.classList.toggle('CONTEXTMENU', newValue);
        }
        //#endregion

        //#region methods
        /** Adds a new menu to the end of the list for this menu. This method removes the menu from its current parent, if one exists, before adding it to the new parent. */
        add(modifiers: MenuItemAddModifiers | string): MenuItem;
        add(item: MenuItem) : void;
        add(item: any) {
            if (item instanceof MenuItem) this.#addItem(item);
            else return this.#addModifiers(item);
        }

        #addModifiers(modifiers: MenuItemAddModifiers | string): MenuItem {
            if (typeof modifiers == 'object') {
                const item = new MenuItem();

                if (modifiers.icon != null) item.elementIcon.textContent = modifiers.icon;
                if (modifiers.iconClass != null) item.elementIcon.classList.add(modifiers.iconClass);
                if (modifiers.text != null) item.text = modifiers.text;
                if (modifiers.title != null) item.title = modifiers.title;
                if (modifiers.disabled != null) item.disabled = modifiers.disabled;
                if (modifiers.children != null) modifiers.children.forEach(child => item.add(child));

                this.#addItem(item);
                return item;
            }
            else {
                if (modifiers == '--') this.#addSeparator();
            }
        }
        #addItem(item: MenuItem, predefine: boolean = false) {
            if (item.parent != null) item.remove();

            // adds the new item into list
            const __private = this.getPrivate();
            __private.children.push(item);
            if (predefine == false) __private.elementChildren.append(item.element);
            else if (__private.elementChildren.contains(item.element) == false) __private.elementChildren.append(item.element)
            __private.element.classList.toggle(Menu.HAS_CHILDREN_CLASS, true);

            // sets the new parent to the item
            const itemPrivate = item.getPrivate();
            itemPrivate.parent = this;
            itemPrivate.element.classList.toggle(Menu.ROOT_CLASS, true);
        }
        #addSeparator() {
            const __private = this.getPrivate();
            __private.elementChildren.appendChild($$$('<div class="Separator"></div>')[0]);
        }

        /** Shows the menu as a context menu. The menu receives focus immediately after being shown. */
        showAsContextMenuAt(at: HTMLElement, locations: number[], option?: math.ShowAtOption): math.ShowAtResult;
        showAsContextMenuAt(at: math.PointLike, locations: number[], option?: math.ShowAtOption): math.ShowAtResult;
        showAsContextMenuAt(at: any, locations: number[], option?: math.ShowAtOption): math.ShowAtResult {
            const __private = this.getPrivate();
            if (__private.contextMenu == false) throw new Error("This menu cannot be displayed as a context menu. Set 'contextMenu' property to true to enable this feature.");

            const result = intell.ctrl.showAt(__private.element, at, locations, option);
            __private.element.focus();
            const activeItem = this.getActiveItem();
            if (activeItem != null) activeItem.active = false;

            return result;
        }

        /** Gets the active child item in the menu. */
        getActiveItem(): MenuItem | undefined { return this.getPrivate().children.find(menu => menu.active) }

        /** Gets the most deeply nested active menu in the menu tree. */
        getDeepestActive(): MenuItem | undefined { return this.getActiveItem()?.getDeepestActive() }

        isMenu(): this is Menu { return true; }
        isMenuItem(): this is MenuItem { return false; }

        /** Gets the task for the specified user input. */
        internalGetWork(e: KeyboardEvent): MenuItemKeyboardWork | undefined {
            const __private = this.getPrivate();
            const code = e.code;
            const direction = __private.rootChildrenDirection;

            let ArrowLeft: string;
            let ArrowUp: string;
            let ArrowRight: string;
            let ArrowDown: string;


            if (direction == 'row') {
                ArrowLeft = 'ArrowLeft';
                ArrowUp = 'ArrowUp';
                ArrowRight = 'ArrowRight';
                ArrowDown = 'ArrowDown';
            }
            else {
                ArrowLeft = 'ArrowUp';
                ArrowUp = 'ArrowLeft';
                ArrowRight = 'ArrowDown';
                ArrowDown = 'ArrowRight';
            }

            if (code == 'Tab') return { type: 'MOVE', step: 1 }
            else if (code == ArrowRight) return { type: 'MOVE', step: 1 }
            else if (code == ArrowLeft) return { type: 'MOVE', step: -1 }
        }

        #onUserFocus() {
            const __private = this.getPrivate();
            // we are already focused (CSS Debug‑Friendly)
            if (__private.focused == true) return;

            __private.focused = true;
            __private.element.classList.add('FOCUS');

            // Upon receiving focus, active the first item if no item is currently active.
            if (__private.children.length > 0) {
                const current = this.getActiveItem();

                if (current == null) __private.children[0].active = true;
            }
        }
        #onUserBlur() {
            const __private = this.getPrivate();

            // preserved states when the inspector is open (CSS Debug‑Friendly)
            if (__private.element.contains(document.activeElement) == true) return;

            __private.focused = false;
            __private.element.classList.remove('FOCUS');

            const activedMenu = this.getActiveItem();
            if (activedMenu != null) {
                activedMenu.active = false;
                activedMenu.hideChildren(0);
            }

            if (__private.contextMenu == true) {
                hide(__private.element);
            }
        }
        #onUserKeydown(e: KeyboardEvent) {
            // Tab, ArrowLeft, ArrowRight, ArrowLeft, ArrowUp, ArrowDown

            if (e.code == 'Tab' || e.code == 'ArrowLeft' || e.code == 'ArrowRight' || e.code == 'ArrowUp' || e.code == 'ArrowDown' || e.code == 'Escape' || e.code == 'Enter') {
                let activeItem = this.getDeepestActive();

                if (activeItem != null) {
                    const work = activeItem.internalGetWork(e);
                    if (work == null) return;

                    if (work.type == 'ROOTMOVE') {
                        // When the user presses the 'Open' key on an item that has no children:
                        // Move focus to the next item in the root collection
                        let activeItem = this.getActiveItem();
                        let items = this.children.filter(item => item.disabled == false);
                        let index = items.indexOf(activeItem);

                        index += work.step;
                        if (work.repeat == true && index < 0) index = items.length - 1;
                        if (work.repeat == true && index >= items.length) index = 0;

                        // indicating whether the current top-level menu has visible children
                        const pickerVisible = activeItem.childrenVisible;

                        if (0 <= index && index < items.length) {
                            const item = items[index];
                            item.active = true;

                            if (pickerVisible == true) {
                                let child_children = item.children.filter(item => item.disabled == false);
                                if (child_children.length > 0) child_children[0].active = true;
                            }
                        } else return;
                    }
                    else if (work.type == 'MOVE') {
                        let items = activeItem.parent.children.filter(item => item.disabled == false);
                        let index = items.indexOf(activeItem);
                        index += work.step;

                        if (index < 0) index = items.length - 1;
                        if (index >= items.length) index = 0;

                        if (0 <= index && index < items.length) items[index].active = true;
                    }
                    else if (work.type == 'OPEN') {
                        if (activeItem.children.length > 0) activeItem.children[0].active = true;

                    }
                    else if (work.type == 'CLOSE') {
                        if (activeItem.parent.isMenuItem()) activeItem.parent.hideChildren(0);
                    }
                    else if (work.type == 'ENTER') {
                        if (activeItem.children.length > 0) activeItem.children[0].active = true;
                        else {
                            activeItem.internalDispatchMenuClickEvent();
                            activeItem.getMenu()?.element.blur();
                        }
                    }
                }
                else {
                    const work = this.internalGetWork(e);
                    if (work == null) return;

                    if (work.type == 'MOVE') {
                        let items = this.children.filter(item => item.disabled == false);
                        let index = items.indexOf(activeItem);
                        index += work.step;

                        if (index < 0) index = items.length - 1;
                        if (index >= items.length) index = 0;

                        if (0 <= index && index < items.length) items[index].active = true;
                    }
                    
                }

                e.preventDefault();
            }
        }
        //#endregion

        //@ts-ignore
        declare getPrivate(def?: object): MenuPrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): Menu; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: Menu): Menu;
    }

    template.inherit(Menu);
}
