namespace intell.portal {
    export interface PortalPrivate {
        element: HTMLElement;
        elementHeader: HTMLElement;
        elementMain: HTMLElement;
        elementContent: HTMLElement;
        elementContentApplications: HTMLElement;

        applications: Application[];
        selectedApplication?: Application;
        
        taskbar: Taskbar;
        overlay: Overlay;
    }

    export interface TaskbarPrivate {
        element: HTMLElement;
        elementTaskbarTop: HTMLElement;
        elementActionCollapse: HTMLElement;
        elementTaskbarMiddle: HTMLElement;


        portal: Portal;
        groups: TaskbarGroup[];
        shortcuts: TaskbarShortcut[];
        collapseStorageKey?: string;

        _needsResortOptions: boolean;
    }
    export interface TaskbarGroupPrivate {
        element: HTMLElement;
        elementHeader: HTMLElement;
        elementText: HTMLElement;
        elementChildren: HTMLElement;
       
        parent?: Taskbar;
        shortcuts: TaskbarShortcut[];
        id?: string;
        default: boolean;
    }
    export interface TaskbarShortcutPrivate {
        element: HTMLElement;
        elementIcon: HTMLElement;
        elementText: HTMLElement;
        elementDescription: HTMLElement;
        parent?: Taskbar;
        group?: TaskbarGroup;

        //index: number;
        disabled: boolean;
        selected: boolean;
        outline: boolean;
        hidden: boolean;

        icon?: string;
        value?: Application;
    }

    export interface OverlayPrivate {
        element: HTMLElement;
        elementContent: HTMLElement;
        elementWaiting: HTMLElement;

        elementApplicationIcon: HTMLElement;
        elementApplicationName: HTMLElement;
        elementApplicationDescription: HTMLElement;

        elementError: HTMLElement;
        elementErrorMessage: HTMLElement;
        elementErrorStack: HTMLElement;

        icon?: string;
        application?: Application;
    }
}
