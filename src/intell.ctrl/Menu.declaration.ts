namespace intell.ctrl {
    export interface MenuPrivate {
        element: HTMLElement;
        elementChildren: HTMLElement;
        focused: boolean;
        children: MenuItem[];

        childrenLocations: number[];
        childrenOption: intell.math.ShowAtOption;
        childrenDirection: MenuChildrenDirection;
        childrenIntersectEnabled: boolean;

        rootChildrenLocations: number[];
        rootChildrenOption: intell.math.ShowAtOption;
        rootChildrenDirection: MenuChildrenDirection;
        rootChildrenIntersectEnabled: boolean;

        contextMenu: boolean;
    }

    export interface MenuItemPrivate {
        element: HTMLElement;
        elementLabel: HTMLElement;
        elementIcon: HTMLElement;
        elementText: HTMLElement;
        elementChildren: HTMLElement;
        elementIntersect: HTMLElement;

        /** The Menu control to which the MenuItem belongs. */
        //root?: Menu;

        parent?: MenuItem | Menu;
        children: MenuItem[];

        active: boolean;
        disabled: boolean;

        childrenVisible: boolean;
        childrenLocations?: number[];
        childrenOption?: intell.math.ShowAtOption;
        childrenDirection?: MenuChildrenDirection;
        childrenIntersectEnabled?: boolean;

        icon?: string;

        _hideChildrenTimer: number;
        _showChildrenTimer: number;
    }

    export interface MenuItemAddModifiers {
        /** Initializes the specified value for the menu icon. The icon can be an image URL (http://) or a CSS class (class://). */
        icon?: string;

        /** Initializes the specified value for the menu class. */
        class?: string;

        /** Initializes the specified value for the menu text. */
        text?: string;

        /** Initializes the specified value for the menu title. */
        title?: string;

        disabled?: boolean;
        children?: MenuItemAddModifiers[];
    }
    export type MenuChildrenDirection = "row" | "column";
}


interface GlobalEventHandlersEventMap {
    menuclick: Event & {
        /** A reference to the Menu to which the event was originally dispatched. */
        menu: intell.ctrl.Menu,

        /** A reference to the MenuItem to which the event was originally dispatched. */
        menuitem: intell.ctrl.MenuItem
    };

    menublur: Event & {
        /** A reference to the Menu to which the event was originally dispatched. */
        menu: intell.ctrl.Menu,
    };
}