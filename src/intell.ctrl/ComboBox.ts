namespace intell.ctrl {
    /**Represents a spin box that displays numeric values. */
    export class ComboBox<T = any> {
        /**Initializes a new instance of the Numeric class from element.
        *@param element The element for which to create Numeric.*/
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = ComboBox.getItem(element); if (c != null) return c; }

            // --b--
            let elementSelectedContent = element?.querySelector<HTMLElement>('.Selected-Content');
            let elementPicker = element?.querySelector<HTMLElement>('.Picker');
            let elementSearch = element?.querySelector<HTMLElement>('.Picker>.Search');
            let elementSearchInput = element?.querySelector<HTMLInputElement>('.Picker>.Search>input');
            let elementChildren = element?.querySelector<HTMLElement>('.Picker>.Children');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="ComboBox"></div>`)[0];
            if (elementSelectedContent == null) elementSelectedContent = $$$(`<div class="Selected-Content"></div>`)[0].appendTo(element);
            if (elementPicker == null) elementPicker = $$$(`<div class="Picker"></div>`)[0].appendTo(element);
            if (elementSearch == null) elementSearch = $$$(`<div class="Search"></div>`)[0].prependTo(elementPicker);
            if (elementSearchInput == null) elementSearchInput = $$$(`<input type="text" placeholder="Search">`)[0].appendTo(elementSearch) as any;
            if (elementChildren == null) elementChildren = $$$(`<div class="Children"></div>`)[0].appendTo(elementPicker) as any;

            if (element.tabIndex == -1) element.tabIndex = 0;
            //#endregion

            ComboBox.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementSelectedContent = elementSelectedContent;
            __private.elementPicker = elementPicker;
            __private.elementSearch = elementSearch;
            __private.elementSearchInput = elementSearchInput;
            __private.elementChildren = elementChildren;
            __private.focused = false;
            __private.pickerVisible = false;
            __private.pickerLocations = [9, 1];
            __private.pickerOption = { distance: -1, distanceToContainer: 1 };
            __private.groups = [];
            __private.options = [];
            __private.multiple = false;
            this.filterEnabled = false;

            element.addEventListener('focus', () => this.#onUserFocus());
            element.addEventListener('blur', () => this.#onUserBlur());
            elementSearchInput.addEventListener('blur', () => this.#onUserBlur());
            elementSearchInput.addEventListener('focus', () => this.#onUserFocus());

            element.addEventListener('mousedown', e => this.#onUserMousedown(e));
            element.addEventListener('mouseup', e => this.#onUserMouseup(e));
            element.addEventListener('keydown', e => this.#onUserKeydown(e));
            element.addEventListener('input', e => this.#onUserInput(e));
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }

        /** Gets the container element that contains the selected option. */
        get elementSelectedContent() { return this.getPrivate().elementSelectedContent }

        /** Gets the picker element. */
        get elementPicker() { return this.getPrivate().elementPicker }

        /** Gets the container element for search input. */
        get elementSearch() { return this.getPrivate().elementSearch }

        /** Gets the search input element. */
        get elementSearchInput() { return this.getPrivate().elementSearchInput }

        /** Gets a value indicating whether the control have input focus. */
        get focused() { return this.getPrivate().focused }

        /** Gets an array containing all groups. */
        get groups() { return this.getPrivate().groups.slice() }

        /** Gets an array containing all option items. */
        get options() {
            const __private = this.getPrivate();

            if (__private._needsResortOptions === true) {
                __private._needsResortOptions = false;
                __private.options.sort((a, b) => {
                    if (a.element.compareDocumentPosition(b.element) & 2) return 1;
                    return -1;
                });
            }

            return __private.options.slice();
        }

        /** Gets the selected option. */
        get selectedOption() { return this.options.find(item => item.selected) }

        /** Gets an array of all currently selected options. */
        get selectedOptions() { return this.options.filter(item => item.selected) }

        /** Gets the active outlined option. */
        get outlinedOption() { return this.options.find(item => item.outline) }

        /** Gets a value indicating whether the dropdown picker is displayed. */
        get pickerVisible() { return this.getPrivate().pickerVisible }

        /** Gets or sets the preferred placement locations of the dropdown picker. The default value is [9, 1]. */
        get pickerLocations() { return this.getPrivate().pickerLocations }
        set pickerLocations(newValue) { this.getPrivate().pickerLocations = newValue }

        /** Gets or sets the placement option of the dropdown picker. */
        get pickerOption() { return this.getPrivate().pickerOption }
        set pickerOption(newValue) { this.getPrivate().pickerOption = newValue }

        /** Gets or sets a value indicating whether multiple items can be selected. */
        get multiple() { return this.getPrivate().multiple }
        set multiple(newValue) {
            const __private = this.getPrivate();
            if (__private.multiple == newValue) return;

            __private.multiple = newValue;
            __private.element.classList.toggle('MUTIPLE', newValue);

            if (newValue == false) {
                const selectedOptions = this.selectedOptions;
                if (selectedOptions.length > 0) selectedOptions.slice(1).forEach(option => option.selected = false)
            }

            this.internalUpdateSelectedContent();
        }

        /** Gets or sets a value indicating whether the filtering features are visible. The default is false. */
        get filterEnabled() { return this.getPrivate().filterEnabled }
        set filterEnabled(newValue) {
            const __private = this.getPrivate();
            __private.filterEnabled = newValue;

            toggle(__private.elementSearch, newValue);
        }
        //#endregion

        //#region methods
        /** Shows the dropdown picker.  */
        showPicker(force: boolean = false) {
            const __private = this.getPrivate();

            if (__private.pickerVisible == true && force === false) return;
            __private.pickerVisible = true;

            ctrl.showAt(__private.elementPicker, __private.element, __private.pickerLocations, __private.pickerOption);
        }

        /** Hides the dropdown picker, resets filters and the outlined option. */
        hidePicker() {
            const __private = this.getPrivate();
            __private.pickerVisible = false;

            // Resets the outlined option when hidePicker
            const outlinedOption = this.outlinedOption;
            if (outlinedOption != null) outlinedOption.outline = false;

            this.clearFilters();

            ctrl.hide(__private.elementPicker);
        }

        /** Toggle shows/hides dropdown picker. */
        togglePicker(force: boolean = false) {
            const __private = this.getPrivate();

            if (__private.pickerVisible == false) this.showPicker(force);
            else this.hidePicker();
        }

        /** Adds a new ComboBoxOption, specified by modifiers, to the end of the list.*/
        add(modifiers: ComboBoxAddOption<T>) {
            const item = new ComboBoxOption<T>();

            if (modifiers.icon != null) item.elementIcon.textContent = modifiers.icon;
            if (modifiers.iconClass != null) item.elementIcon.classList.add(modifiers.iconClass);
            if (modifiers.text != null) item.text = modifiers.text;
            if (modifiers.description != null) item.description = modifiers.description;
            if (modifiers.disabled != null) item.disabled = modifiers.disabled;
            if (modifiers.value != null) item.value = modifiers.value;

            let group = this.#findGroupById(modifiers.group);
            if (group == null) {
                group = new ComboBoxGroup();
                group.id = modifiers.group;
                group.text = modifiers.group ?? '';
                if (group.id == null) group.default = true;

                this.addGroup(group);
            }

            group.add(item);

            return item;
        }

        /** Adds a new ComboBoxGroup into the control.*/
        addGroup(group: ComboBoxGroup) {
            // removes the group from its current parent if one exists
            if (group.parent != null) group.remove();

            const __private = this.getPrivate();

            // adds the items into parent
            if (group.options.length > 0) {
                __private.options.push(...group.options);
                __private._needsResortOptions = true;
            }
            __private.groups.push(group);
            __private.elementChildren.append(group.element);

            // sets parent of group
            const groupPrivate = group.getPrivate();
            groupPrivate.parent = this;

            this.internalUpdateSelectedContent();
        }
        
        /** Sets the filter keyword for the list. The filter text is automatically reset when the picker is hidden. */
        setFilters(text: string) {
            const __private = this.getPrivate();
            const keywords = text.split(' ').filter(a => a != '');

            __private.elementSearchInput.value = text;

            for (let i = 0; i < __private.options.length; i++) {
                const option = __private.options[i];
                const matchedKeyword = option.matchKeywords(keywords);

                option.hidden = !matchedKeyword;
            }
        }

        /** Resets filters to default and display all options. The method is automatically invoked when the picker is hidden. */
        clearFilters() {
            const __private = this.getPrivate();
            
            for (let i = 0; i < __private.options.length; i++)
                __private.options[i].hidden = false;

            __private.elementSearchInput.value = '';
        }

        /** Renders the selected options within the elementSelectedContent container. The following methods and properties should invoke this method:
         *     - Combobox: addGroup(), multiple
         *     - Group: add() 
         *     - Item: selected */
        internalUpdateSelectedContent() {
            const __private = this.getPrivate();

            cancelAnimationFrame(__private._requestAnimationFrameId);
            __private._requestAnimationFrameId = requestAnimationFrame(() => {
                if (__private.multiple == false) {
                    const selectedOption = this.selectedOption;

                    if (selectedOption == null) __private.elementSelectedContent.replaceChildren();
                    else __private.elementSelectedContent.replaceChildren(selectedOption.element.cloneNode(true));
                }
                else {
                    const selectedOptions = this.selectedOptions;

                    if (selectedOptions.length == 1) __private.elementSelectedContent.replaceChildren(selectedOptions[0]?.element.cloneNode(true));
                    else __private.elementSelectedContent.innerHTML = `${selectedOptions.length} selected`;
                }
                console.log('internalUpdateSelectedContent()');
            });
        }

        #findGroupById(id?: string) { return this.getPrivate().groups.find(g => g.id == id); }
        #onUserFocus() {
            const __private = this.getPrivate();
            // we are already focused (CSS Debug‑Friendly)
            if (__private.focused == true) return;
            
            __private.focused = true;
            __private.element.classList.add('FOCUS');
        }
        async #onUserBlur() {
            const __private = this.getPrivate();

            // Prevent 'lost focus' events when moving focus to a child element.
            // We must wait one tick for document.activeElement to update before verifying the new focus.
            await intell.wait(1);

            // preserved states when the inspector is open (CSS Debug‑Friendly)
            if (__private.element.contains(document.activeElement) == true) return;

            __private.focused = false;
            __private.element.classList.remove('FOCUS');
            this.hidePicker();
        }
        #onUserMousedown(e: MouseEvent) {
            const __private = this.getPrivate();

            __private._previousMousedownEvent = e;

            if (e.button == 0 && (e.target == __private.element || __private.elementSelectedContent.contains(e.target as any) == true)) {
                //if (__private.focused == false) __private.element.focus();
                //__private.element.focus();
                //e.preventDefault(); // prevents default text selection

                if (__private.pickerVisible == false) {
                    this.showPicker();
                    __private._isPickerOpenedByMousedown = true;
                } else
                    __private._isPickerOpenedByMousedown = false;
            }
            
        }
        #onUserMouseup(e: MouseEvent) {
            const __private = this.getPrivate();
            if (__private.focused == false) return;

            const target = e.target as HTMLElement;
            const previousMousedownEvent = __private._previousMousedownEvent;

            if (e.button == 0) {
                if (__private.elementPicker.contains(target) == true) {

                    //#region Prevents accidental selection if the picker spawns directly under the cursor
                    if (__private.elementPicker.contains(previousMousedownEvent.target as any) == false) {
                        // the previous mousedown target was within the selection content (element or elementSelectedContent)
                        const pageX = previousMousedownEvent.pageX;
                        const pageY = previousMousedownEvent.pageY;

                        // Ignore if cursor moved less than 2px
                        if (Math.abs(pageX - e.pageX) <= 2 && Math.abs(pageY - e.pageY) <= 2) return;
                    }
                    //#endregion

                    // Avoid using target.closest('.Item') to retrieve the element associated with the option
                    let option: ComboBoxOption;

                    const elementItem = ComboBox.#findClosest(target, value =>
                        (option = ComboBoxOption.getItem(value)) != null,
                        __private.elementPicker
                    );
                    
                    if (elementItem == null) return;

                    //while (elementItem != null) {
                    //    if (elementItem == __private.elementPicker) return;
                    //
                    //    option = ComboBoxOption.getItem(elementItem);
                    //    if (option != null) break;
                    //
                    //    // to the next ancestor element
                    //    elementItem = elementItem.parentElement;
                    //}

                    this.#onUserSelectOption(option, e);
                }
                else {
                    // Indicates whether the user performed both a mousedown and a mouseup within the selection content (element or elementSelectedContent)
                    const isMousedownValid = previousMousedownEvent.target == __private.element || __private.elementSelectedContent.contains(previousMousedownEvent.target as any);
                    const isMouseupValid = target == __private.element || __private.elementSelectedContent.contains(target);

                    if (isMousedownValid == true && isMouseupValid == true) {
                        if (__private._isPickerOpenedByMousedown == false) this.hidePicker();
                    }
                }
            }
        }
        #onUserKeydown(e: KeyboardEvent) {
            const __private = this.getPrivate();

            if (e.key === 'Enter' || e.key === ' ') {
                if (e.target == __private.elementSearchInput && e.key == ' ') return;
                
                // Suppress default Space key behavior to prevent scrolling
                if (e.key == ' ') e.preventDefault();

                const outlinedOption = this.outlinedOption;
                if (outlinedOption == null && document.activeElement === __private.element) this.togglePicker();
                if (outlinedOption != null) {

                    if (__private.multiple === false) {
                        if (e.key === 'Enter') this.#onUserSelectOption(outlinedOption, e);
                    }
                    else this.#onUserSelectOption(outlinedOption, e);
                }
            }
            else if (e.key === 'Escape') {
                if (__private.pickerVisible == true) {
                    this.element.focus();
                    this.hidePicker();
                }
            }
            else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                // Show the picker and return if ArrowDown or ArrowUp is pressed while hidden.
                if (__private.pickerVisible == false) { this.showPicker(); e.preventDefault(); return; }

                let options = this.options.filter(option => option.hidden == false && option.disabled == false);
                let outlinedOption = this.outlinedOption ?? this.selectedOption;
                let index = options.indexOf(outlinedOption);

                if (e.key === 'ArrowDown') index++;
                else if (e.key === 'ArrowUp') index--;
                if (index == -2) index = options.length - 1;

                if (0 <= index && index < options.length) options[index].outline = true;
                
                e.preventDefault();
            }
        }
        #onUserInput(e: Event) {
            // handles the filtering logic
            const __private = this.getPrivate();

            clearTimeout(__private._filterTimer);
            __private._filterTimer = setTimeout(() => {
                this.setFilters(__private.elementSearchInput.value);
            }, 350);
        }

        /** When user selects an option via mouseup or keyboard keydown. Triggers comboboxchange event if necessary. */
        #onUserSelectOption(option: ComboBoxOption, e: Event) {
            if (option.disabled == true) return;

            const __private = this.getPrivate();
            let triggerEvent = true;

            if (__private.multiple == false) {

                if (option.selected == true)
                    triggerEvent = false;
                else option.selected = true;

                this.hidePicker();
            }
            else {
                option.selected = !option.selected;

                // Hide keyboard focus outline if the option was selected via mouse.
                if (e instanceof MouseEvent) {
                    const outlinedOption = this.outlinedOption;
                    if (outlinedOption != null) outlinedOption.outline = false;
                }
            }

            if (triggerEvent == true) {
                const event = new Event('comboboxchange', { bubbles: true, cancelable: false });
                (event as any).combobox = this;
                __private.element.dispatchEvent(event);
            }
        }
        //#endregion

        static #findClosest(element: HTMLElement, predicate: (value: HTMLElement) => boolean, stopElement?: HTMLElement): HTMLElement | undefined {
            let target = element;
            
            while (target != null) {
                if (element == stopElement) return

                if (predicate(target) === true) return target;

                target = target.parentElement;
            }
        }

        //@ts-ignore
        declare getPrivate(def?: object): ComboBoxPrivate<T>;

        //@ts-ignore
        declare static getItem(element: HTMLElement): ComboBox; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: ComboBox): ComboBox;
    }

    template.inherit(ComboBox);
}