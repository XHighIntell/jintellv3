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

        _hideChildrenTimer: number;
        _showChildrenTimer: number;
    }

    export interface MenuItemAddModifiers {
        icon?: string;
        iconClass?: string;
        text?: string;
        title?: string;
        //description?: string;
        disabled?: boolean;
        children?: MenuItemAddModifiers[];
    }
    export type MenuChildrenDirection = "row" | "column";
}


interface GlobalEventHandlersEventMap {
    menuclick: Event & { menu: intell.ctrl.Menu, menuitem: intell.ctrl.MenuItem };
}