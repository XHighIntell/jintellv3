namespace intell.ctrl {
/* ┌┐└┘─│ */
    /**Represents a spin box that displays numeric values. */
    export class MenuItem {
        

        /**Initializes a new instance of the Numeric class from element.
        *@param element The element for which to create Numeric.*/
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = MenuItem.getItem(element); if (c != null) return c; }

            // --b--
            let elementLabel = element?.querySelector<HTMLElement>(':scope>.Label');
            let elementIcon = element?.querySelector<HTMLElement>(':scope>.Label>.Icon');
            let elementText = element?.querySelector<HTMLElement>(':scope>.Label>.Text');
            let elementChildren = element?.querySelector<HTMLElement>(':scope>.Children');
            let elementIntersect = element?.querySelector<HTMLElement>(':scope>.Children>.Intersect');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="Item"></div>`)[0];
            if (elementLabel == null) elementLabel = $$$(`<div class="Label"></div>`)[0].appendTo(element);
            if (elementIcon == null) elementIcon = $$$(`<div class="Icon"></div>`)[0].appendTo(elementLabel);
            if (elementText == null) elementText = $$$(`<div class="Text"></div>`)[0].appendTo(elementLabel);
            if (elementChildren == null) elementChildren = $$$(`<div class="Children"></div>`)[0].appendTo(element);
            if (elementIntersect == null) elementIntersect = $$$(`<div class="Intersect"></div>`)[0].appendTo(elementChildren);
            //#endregion

            MenuItem.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementLabel = elementLabel;
            __private.elementIcon = elementIcon;
            __private.elementText = elementText;
            __private.elementChildren = elementChildren;
            __private.elementIntersect = elementIntersect;
            __private.children = [];
            __private.active = false;
            __private.disabled = false;
            __private.childrenVisible = false;

            element.addEventListener('focus', () => this.#onUserFocus());
            element.addEventListener('blur', () => this.#onUserBlur());
            element.addEventListener('mouseenter', e => this.#onUserMouseenter(e));
            element.addEventListener('mouseout', e => this.#onUserMouseout(e));

            element.addEventListener('mousedown', e => this.#onUserMousedown(e));
            element.addEventListener('mouseup', e => this.#onUserMouseup(e));
            element.addEventListener('contextmenu', () => false);

            //#region Predefined feature
            [...__private.elementChildren.querySelectorAll(':scope>.Item')]
                .map((element: HTMLElement) => new MenuItem(element))
                .forEach(item => this.#addItem(item, true));
            //#endregion
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }
        get elementLabel() { return this.getPrivate().elementLabel }
        get elementIcon() { return this.getPrivate().elementIcon }
        get elementText() { return this.getPrivate().elementText }
        get elementChildren() { return this.getPrivate().elementChildren }

        /** Gets the parent Menu or MenuItem that the item belongs to. */
        get parent() { return this.getPrivate().parent }

        /** Gets the child menu items. */
        get children() { return this.getPrivate().children.slice() }

        /** Gets or sets whether the menu is actived or not. 
         * When the MenuItem is deactivated, its children are automatically hidden.
         * When the MenuItem is activated, the visibility of its children remains unchanged. */
        get active() { return this.getPrivate().active }
        set active(newValue) {
            const __private = this.getPrivate();
            if (__private.active == newValue) return;
            __private.active = newValue;
            __private.element.classList.toggle(Menu.ACTIVE_CLASS, newValue);

            if (newValue == false) {
                // When the MenuItem is deactivated, its children will be hidden.
                this.hideChildren();

                // When the MenuItem is deactivated, all children will be deactivated as well.
                __private.children.forEach(item => item.active = false);
            }
            else if (newValue == true) {
                const parent = this.parent;
                if (parent.isMenuItem()) {
                    // Ensures the active item is visible.
                    parent.showChildren(0);
                }

                __private.parent?.children.forEach(item => {
                    if (item != this) item.active = false;
                });
            }
        }

        /** Gets or sets a value indicating whether interaction with the option is disabled. If disabled, the option will not respond to mouse clicks or keyboard selection. */
        get disabled() { return this.getPrivate().disabled }
        set disabled(newValue) {
            const __private = this.getPrivate();

            __private.disabled = newValue;
            __private.element.classList.toggle('DISABLED', newValue)
        }

        /** Gets a value indicating whether the dropdown children are displayed. */
        get childrenVisible() { return this.getPrivate().childrenVisible }

        /** Gets or sets the placement locations of the dropdowns. */
        get childrenLocations() { return this.getPrivate().childrenLocations }
        set childrenLocations(newValue) { this.getPrivate().childrenLocations = newValue }

        /** Gets or sets the placement option of the dropdowns. */
        get childrenOption() { return this.getPrivate().childrenOption }
        set childrenOption(newValue) { this.getPrivate().childrenOption = newValue }

        /** Gets or sets the input direction of children. This value does not determine the children layout; rather, it dictates how user input is handled. */
        get childrenDirection() { return this.getPrivate().childrenDirection }
        set childrenDirection(newValue) { this.getPrivate().childrenDirection = newValue }

        /** Gets or sets a value indicating whether the intersection overlay is enabled. */
        get childrenIntersectEnabled() { return this.getPrivate().childrenIntersectEnabled }
        set childrenIntersectEnabled(newValue) { this.getPrivate().childrenIntersectEnabled = newValue }

        /** Gets or sets the displaying text of the Text element. */
        get text() { return this.getPrivate().elementText.textContent }
        set text(newValue) { this.getPrivate().elementText.textContent = newValue }

        /** Gets or sets the title of the element label. */
        get title() { return this.getPrivate().elementLabel.title }
        set title(newValue) { this.getPrivate().elementLabel.title = newValue }
        //#endregion

        //#region methods
        /** Shows the dropdown picker.  */
        showChildren(delay: number = Menu.CHILDREN_VISIBLE_DELAY, force: boolean = false) {
            const __private = this.getPrivate();

            // Cancels the pending hide or show operation currently in progress.
            if (__private._hideChildrenTimer != null) { clearTimeout(__private._hideChildrenTimer); __private._hideChildrenTimer = null }
            if (__private._showChildrenTimer != null) { clearTimeout(__private._showChildrenTimer); __private._showChildrenTimer = null }

            if (__private.children.length == 0) return;
            if (__private.childrenVisible == true && force === false) return;

            // In Force mode, children positions are recalculated even if they are currently displayed
            if (__private.childrenVisible == true && force === true) force = true;
            else force = false;


            if (delay == 0 || force == true) {
                __private.childrenVisible = true;

                // Hides the children of all other items before showing this item's children
                __private.parent.children.forEach(item => {
                    if (item != this) item.hideChildren(delay);
                });

                const menu = this.getMenu();
                const isRoot = this.isMenuItemRoot();
                const locations = __private.childrenLocations ?? (isRoot ? menu.rootChildrenLocations : menu.childrenLocations);
                const option = __private.childrenOption ?? (isRoot ? menu.rootChildrenOption : menu.childrenOption);

                ctrl.showAt(__private.elementChildren, __private.element, locations, option);

                //#region Intersect features
                const intersectEnabled = __private.childrenIntersectEnabled ?? (isRoot ? menu.rootChildrenIntersectEnabled : menu.childrenIntersectEnabled);
                if (intersectEnabled == true) {
                    let intersect = MenuItem.#getIntersectRect(__private.elementLabel, __private.elementChildren);

                    if (intersect.isEmpty == true) hide(__private.elementIntersect);
                    else {
                        show(__private.elementIntersect);
                        __private.elementIntersect.setOffset({ x: intersect.left, y: intersect.top });
                        __private.elementIntersect.style.width = intersect.width + 'px';
                        __private.elementIntersect.style.height = intersect.height + 'px';
                    }
                }
                else hide(__private.elementIntersect);
                //#endregion
            }
            else {
                __private._showChildrenTimer = setTimeout(() => {
                    __private._showChildrenTimer = null;
                    this.showChildren(0);
                }, delay);
            }  
        }

        /** Hides the children, resets filters and the outlined option. */
        hideChildren(delay: number = Menu.CHILDREN_VISIBLE_DELAY) {
            const __private = this.getPrivate();

            // Cancels the pending hide or show operation currently in progress.
            if (__private._hideChildrenTimer != null) { clearTimeout(__private._hideChildrenTimer); __private._hideChildrenTimer = null }
            if (__private._showChildrenTimer != null) { clearTimeout(__private._showChildrenTimer); __private._showChildrenTimer = null }

            if (__private.childrenVisible == false) return;

            if (delay == 0) {    
                __private.childrenVisible = false;

                __private.children.forEach(item => {
                    item.active = false;
                    item.hideChildren(0);
                });

                ctrl.hide(__private.elementChildren);
            }
            else {
                __private._hideChildrenTimer = setTimeout(() => {
                    __private._hideChildrenTimer = null;
                    this.hideChildren(0);
                }, delay);
            }
        }

        /** Toggle shows/hides dropdown picker. */
        toggleChildren(delay: number = Menu.CHILDREN_VISIBLE_DELAY, force: boolean = false) {
            const __private = this.getPrivate();

            if (__private.childrenVisible == false) this.showChildren(delay, force);
            else this.hideChildren(delay);
        }

        /** Adds a new menu to the end of the list for this menu. This method removes the menu from its current parent, if one exists, before adding it to the new parent. */
        add(modifiers: MenuItemAddModifiers): MenuItem;
        add(item: MenuItem): void;
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
            item.getPrivate().parent = this;
        }
        #addSeparator() {
            const __private = this.getPrivate();
            __private.elementChildren.appendChild($$$('<div class="Separator"></div>')[0]);
        }

        /** Removes the menu from its parent. If it has no parent, calling remove() does nothing. */
        remove() {
            const __private = this.getPrivate();
            const parent = __private.parent;

            // If it has no parent, calling remove() does nothing.
            if (parent == null) return;

            parent.getPrivate().children.remove(this); // remove this from its parent
            __private.parent = undefined;
            __private.active = false;
            __private.element.remove();
            __private.element.classList.toggle(Menu.ROOT_CLASS, false);
             
            // If the parent has no children, the 'HAS-CHILDREN' class is removed
            if (parent.children.length == 0) parent.element.classList.toggle(Menu.HAS_CHILDREN_CLASS, false);
        }

        /** Returns the topmost parent Menu. */
        getMenu(): Menu | undefined {
            let item: MenuItem = this;

            while (true) {
                let parent = item.parent;
                if (parent == null) return;

                if (parent.isMenu()) return parent;
                else item = parent;
            }
        }

        /** Gets the active child item in the menu. */
        getActiveItem(): MenuItem | undefined { return this.getPrivate().children.find(menu => menu.active) }

        /** Gets the most deeply nested active menu in the menu tree. */
        getDeepestActive(): MenuItem | undefined {
            const __private = this.getPrivate();

            //  this is not active
            if (__private.active == false) return null;

            // looks for active item in children
            const child = __private.children.find(child => child.active == true);

            if (child == null) return this;
            else return child.getDeepestActive();
        }

        isMenu(): this is Menu { return false }
        isMenuItem(): this is MenuItem { return true }
        isMenuItemRoot(): this is MenuItem { return this.parent?.isMenu() == true }

        #onUserFocus() { }
        #onUserBlur() { }
        #onUserMouseenter(e: MouseEvent) {
            const menu = this.getMenu();
            if (menu.focused == true) {
                this.active = true;

                // If the menu is a context menu, treat root menus and submenus identically
                if (menu.contextMenu == true) this.showChildren();                
                else {
                    // If the menu is not a context menu, root menu children will be shown immediately
                    if (this.parent == menu) this.showChildren(0);
                    else this.showChildren();
                }                
            }
        }
        #onUserMouseout(e: MouseEvent) {
            const menu = this.getMenu();

            if (menu.focused == true) {
                const target = e.target as HTMLElement;

                // 1. Ensures the mouse has completely exited the MenuItem's boundaries
                if (this.element.contains(e.relatedTarget as HTMLElement) == true) return;

                // 2. Ensures the mouse is not exited from elementChildren
                if (this.elementChildren.contains(target) == true) return;

                // If the menu is a context menu, treat root menus and submenus identically
                if (this.isMenuItemRoot() == true && menu.contextMenu == false) { }
                else this.active = false;
            }
        }
        #onUserMousedown(e: MouseEvent) {
            const __private = this.getPrivate();

            if (e.button == 0 && __private.elementLabel.contains(e.target as any) == true) {
                this.active = true;
                this.showChildren(0);
            }
        }
        #onUserMouseup(e: MouseEvent) {
            const __private = this.getPrivate();
            const target = e.target as HTMLElement;

   
            if (e.button == 0 && __private.children.length == 0 && __private.elementLabel.contains(target) == true) {
                const menu = this.getMenu();
                this.internalDispatchMenuClickEvent();
                menu.element.blur();
            }
        }
        //#endregion

        internalDispatchMenuClickEvent() {
            const __private = this.getPrivate();
            const event = new Event('menuclick', { bubbles: true, cancelable: false });
            (event as any).menu = this.getMenu();
            (event as any).menuitem = this;
            __private.element.dispatchEvent(event);
        }

        /** Gets the task for the specified user input. */
        internalGetWork(e: KeyboardEvent): MenuItemKeyboardWork | undefined {
            const __private = this.getPrivate();
            
            const code = e.code;
            const menu = this.getMenu();
            const isRoot = this.isMenuItemRoot();
            const direction = __private.childrenDirection ?? (isRoot ? menu.rootChildrenDirection : menu.childrenDirection);

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

            // 

            if (code == 'Tab') {
                if (this.parent.isMenu()) {
                    if (e.shiftKey == false) return { type: 'ROOTMOVE', step: 1, repeat: false };
                    else return { type: 'ROOTMOVE', step: -1, repeat: false };
                }
                else {
                    if (e.shiftKey == false) return { type: 'MOVE', step: 1 };
                    else return { type: 'MOVE', step: -1 };
                }
            }
            else if (code == ArrowRight) return { type: 'MOVE', step: 1 }
            else if (code == ArrowLeft) {
                return { type: 'MOVE', step: -1 }
            }
            else if (code == ArrowUp) {
                if (this.parent.isMenu()) return { type: 'OPEN' }
                else return { type: 'CLOSE' }
            }
            else if (code == ArrowDown) {
                if (this.parent.isMenu()) return { type: 'OPEN' }
                else return { type: 'OPEN' }
            }
            else if (code == 'Escape') {
                if (this.parent.isMenu()) { }
                else return { type: 'CLOSE' }
            }
            else if (code == 'Enter') return { type: 'ENTER' }
        }

        /** The most confusing method. */
        static #getOddRect(intersect: DOMRect, a: DOMRect,  borderLeft: number, borderTop: number, borderRight: number, borderBottom: number) {
            const result = new DOMRect(intersect.x, intersect.y, intersect.width, intersect.height);

            if (a.x <= result.x && result.x <= a.x + borderLeft) {
                const additionX = a.x + borderLeft - result.x;
                result.x += additionX;
                result.width -= additionX;
            }
            if (a.y <= result.y && result.y <= a.y + borderTop) {
                const additionY = a.y + borderTop - result.y;
                result.y += additionY;
                result.height -= additionY;
            }
            if (a.right - borderRight <= result.right && result.right <= a.right) {
                const subtractionWidth = result.right - (a.right - borderRight);
                result.width -= subtractionWidth;
            }
            if (a.bottom - borderBottom <= result.bottom && result.bottom <= a.bottom) {
                const subtractionHeight = result.bottom - (a.bottom - borderBottom);
                result.height -= subtractionHeight;
            }

            if (result.width < 0) { result.x = result.left; result.width = -result.width }
            if (result.height < 0) { result.y = result.top; result.height = -result.height }

            return result;
        }
        static #getIntersectRect(element: HTMLElement, elementChildren: HTMLElement) {
            const a = element.getBoundingClientRectOffset();
            const aStyles = getComputedStyle(element);
            const aBorderLeft = parseFloat(aStyles.borderLeftWidth);
            const aBorderTop = parseFloat(aStyles.borderTopWidth);
            const aBorderRight = parseFloat(aStyles.borderRightWidth);
            const aBorderBottom = parseFloat(aStyles.borderBottomWidth);

            const b = elementChildren.getBoundingClientRectOffset();
            const bStype = getComputedStyle(elementChildren);
            const bBorderLeft = parseFloat(bStype.borderLeftWidth);
            const bBorderTop = parseFloat(bStype.borderTopWidth);
            const bBorderRight = parseFloat(bStype.borderRightWidth);
            const bBorderBottom = parseFloat(bStype.borderBottomWidth);

            const intersect = a.intersect(b);
            if (intersect.isEmpty == true) return intersect;

            const oddA = this.#getOddRect(intersect, a, aBorderLeft, aBorderTop, aBorderRight, aBorderBottom);
            const oddB = this.#getOddRect(intersect, b, bBorderLeft, bBorderTop, bBorderRight, bBorderBottom);

            if (oddA.intersect(oddB).isEmpty == false) return oddA;
            else {
                // 1 is oddA
                // 2 is intersect
                // 3 is oddB
                if (
                    // 1-2-3
                    ((oddA.left == intersect.x || oddA.right == intersect.x) && (intersect.right == oddB.x || intersect.right == oddB.right)) ||

                    // 3-2-1
                    ((oddB.left == intersect.x || oddB.right == intersect.x) && (intersect.right == oddA.x || intersect.right == oddA.right))
                ) {
                    let x = Math.min(oddA.x, intersect.x, oddB.x);
                    let right = Math.max(oddA.right, intersect.right, oddB.right);

                    let y = Math.max(oddA.y, intersect.y, oddB.y);
                    let bottom = Math.min(oddA.bottom, intersect.bottom, oddB.bottom);

                    return new DOMRect(x, y, right - x, bottom - y);
                }
                else {
                    // oddA
                    // intersect
                    // oddB

                    let x = Math.max(oddA.x, intersect.x, oddB.x);
                    let right = Math.min(oddA.right, intersect.right, oddB.right);

                    let y = Math.min(oddA.y, intersect.y, oddB.y);
                    let bottom = Math.max(oddA.bottom, intersect.bottom, oddB.bottom);

                    return new DOMRect(x, y, right - x, bottom - y);
                }
            }
        }

        //@ts-ignore
        declare getPrivate(def?: object): MenuItemPrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): MenuItem; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: MenuItem): MenuItem;
    }

    // 'ROOTMOVE' | 'MOVE' | 'OPEN' | 'CLOSE'
    export type MenuItemKeyboardWork = { type: 'OPEN' } | { type: 'ENTER' } | { type: 'CLOSE' } | { type: 'MOVE', step: number } | { type: 'ROOTMOVE', step: number, repeat: boolean };

    template.inherit(MenuItem);
}