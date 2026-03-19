namespace intell.ctrl {
    export interface ComboBoxPrivate<TValue = any> {
        element: HTMLElement;
        elementSelectedContent: HTMLElement;
        elementPicker: HTMLElement; // showPicker
        elementSearch: HTMLElement;
        elementSearchInput: HTMLInputElement;
        elementChildren: HTMLElement;

        focused: boolean;

        /** The following methods and properties will modifiy this value.
         * Combobox: addGroup()
         * Group: remove() */
        groups: ComboBoxGroup[];

        /** The following methods and properties will modifiy this value.
         * Combobox: addGroup()
         * Group: add(), remove()
         * Item: remove() */
        options: ComboBoxOption<TValue>[];

        pickerVisible: boolean;
        pickerLocations: number[];
        pickerOption: intell.math.ShowAtOption;

        multiple: boolean;
        filterEnabled: boolean;

        //filters: boolean;

        /** The most recent mousedown event. */
        _previousMousedownEvent?: MouseEvent;


        /** True if elementDropdown was previously opened via a mousedown event. */
        _isPickerOpenedByMousedown?: boolean;

        /** [Performance] True if the options may need to be resorted. The following methods and properties will set this value to true.
         * Combobox: addGroup()
         * Group: add() 
         * Item: */
        _needsResortOptions?: boolean;

        /** [Performance] The timer that triggers the code only after the user has stopped typing for 350ms. */
        _filterTimer?: number

        /** [Performance] This is used within the internalUpdateSelectedContent() method. */
        _requestAnimationFrameId?: number;

        
    }

    export interface ComboBoxItemPrivate<T = any> {
        element: HTMLElement;
        elementIcon: HTMLElement;
        elementText: HTMLElement;
        elementDescription: HTMLElement;
        parent?: ComboBox;
        group?: ComboBoxGroup;

        //index: number;
        disabled: boolean;
        selected: boolean;
        outline: boolean;
        hidden: boolean;
        value: T;
    }
    export interface ComboBoxGroupPrivate {
        element: HTMLElement;
        elementHeader: HTMLElement;
        elementText: HTMLElement;
        elementChildren: HTMLElement;
        parent?: ComboBox;
        options: ComboBoxOption[];
        id?: string;
        default: boolean;
    }
    export interface ComboBoxAddOption<T = any> {
        icon?: string;
        iconClass?: string;
        text?: string;
        description?: string;
        group?: string;
        disabled?: boolean;

        value: T;
    }
}


interface GlobalEventHandlersEventMap {
    comboboxchange: Event & { combobox: intell.ctrl.ComboBox };
}