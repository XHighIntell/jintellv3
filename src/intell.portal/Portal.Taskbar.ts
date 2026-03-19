namespace intell.portal {
    export class Taskbar {
        static ITEM_SELECTED_CLASS = "SELECTED";

        constructor(portal: Portal, element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = Taskbar.getItem(element); if (c != null) return c; }

            // --b--
            let elementTaskbarTop = element?.querySelector<HTMLElement>('.Taskbar-Top');
            let elementActionCollapse = element?.querySelector<HTMLElement>('.Action-Collapse');
            let elementTaskbarMiddle = element?.querySelector<HTMLElement>('.Taskbar-Middle');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="Taskbar"></div>`)[0];
            if (elementTaskbarTop == null) elementTaskbarTop = $$$(`<div class="Taskbar-Top"></div>`)[0].appendTo(element);
            if (elementActionCollapse == null) elementActionCollapse = $$$(`<div class="Action-Collapse" tabindex="0" data-action-role="taskbar-collapse"></div>`)[0].appendTo(elementTaskbarTop);
            if (elementTaskbarMiddle == null) elementTaskbarMiddle = $$$(`<div class="Taskbar-Middle"></div>`)[0].appendTo(element);
            //#endregion

            Taskbar.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementTaskbarTop = elementTaskbarTop;
            __private.elementActionCollapse = elementActionCollapse;
            __private.elementTaskbarMiddle = elementTaskbarMiddle;
            __private.portal = portal;
            __private.groups = [];
            __private.shortcuts = [];


            element.addEventListener('click', e => this.#onUserClick(e));
            //element.addEventListener('mouseup', e => this.#onUserMouseup(e));
            //element.addEventListener('keydown', e => this.#onUserKeydown(e));
            //element.addEventListener('input', e => this.#onUserInput(e));
        }

        //#region properties
        /** Gets the root element of the taskbar. */
        get element() { return this.getPrivate().element }
        get elementTaskbarTop() { return this.getPrivate().elementTaskbarTop }
        get elementTaskbarMiddle() { return this.getPrivate().elementTaskbarMiddle }

        /** Gets an array containing all groups. */
        get groups() { return this.getPrivate().groups.slice() }

        /** Gets an array containing all items. */
        get shortcuts() {
            const __private = this.getPrivate();

            if (__private._needsResortOptions === true) {
                __private._needsResortOptions = false;
                __private.shortcuts.sort((a, b) => {
                    if (a.element.compareDocumentPosition(b.element) & 2) return 1;
                    return -1;
                });
            }

            return __private.shortcuts.slice();
        }

        /** Gets the selected option. */
        get selectedItem() { return this.shortcuts.find(item => item.selected) }
        //#endregion

        //#region methods
        toggle(force?: boolean) {
            const __private = this.getPrivate();
            const state = __private.element.classList.toggle('COLLAPSED', force);

            if (__private.collapseStorageKey) 
                localStorage.setItem(__private.collapseStorageKey, state.toString());
        }

        /** Adds a new TaskbarShortcut into the taskbar. */
        add(shortcut: TaskbarShortcut, groupId?: string) {
            let group = this.findGroupById(groupId);
            if (group == null) {
                group = new TaskbarGroup();
                group.id = groupId;
                group.text = groupId ?? '';
                if (groupId == null) group.default = true;

                this.addGroup(group);
            }

            group.add(shortcut);
        }

        /** Adds a new TaskbarGroup into the taskbar. */
        addGroup(group: TaskbarGroup) {
            // removes the group from its current portal if one exists
            if (group.parent != null) group.remove();

            const __private = this.getPrivate();

            // adds the items into parent
            if (group.shortcuts.length > 0) {
                __private.shortcuts.push(...group.shortcuts);
                __private._needsResortOptions = true;
            }
            __private.groups.push(group);
            __private.elementTaskbarMiddle.append(group.element);

            // sets parent of group
            const groupPrivate = group.getPrivate();
            groupPrivate.parent = this;
        }

        /**   */
        enableCollapseStorage(key: string) {
            const __private = this.getPrivate();
            __private.collapseStorageKey = key;

            if (key) this.toggle(localStorage.getItem(key) == "true");
        }


        findGroupById(id?: string) { return this.getPrivate().groups.find(g => g.id == id); }
        //#endregion


        #onUserClick(e: MouseEvent) {
            const __private = this.getPrivate();
            const target = e.target as HTMLElement;
            let shortcut: TaskbarShortcut;

            const elementItem = ctrl.closest(target, value => (shortcut = TaskbarShortcut.getItem(value)) != null, __private.element);
            if (elementItem == null) return;

            const portal = __private.portal;
            const application = shortcut.value;

            shortcut.selected = true;
            portal.open(application);
            console.log('application', application);
        }

        //@ts-ignore
        declare getPrivate(def?: object): TaskbarPrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): Taskbar; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: Taskbar): Taskbar;
    }

    ctrl.template.inherit(Taskbar);
}