namespace intell.portal {
    export interface ApplicationManifest {
        /** A unique identifier for the application. */
        id: string;

        /** The application's name. */
        name: string;

        /** A plain text string (no HTML or other formatting) that describes the application while loading. */
        description?: string;

        /** A short tooltip title of the application. */
        title?: string;

        /** The application icon. This can be a URL or an icon class (using the class:// prefix). */
        icon?: string;

        /** Pin this application to menu. The default is true. */
        shortcut?: boolean;

        /** The shortcut group name. */
        group?: string;

        /** Sets whether the application should run on startup. The default is false. */
        startup?: boolean;

        content: ApplicationManifestContent;
    }
    export interface ApplicationManifestContent {
        /** The HTML file to be injected into the page. */
        html: string;

        /** The list of JavaScript files to be injected into the portal. */
        js?: string[];

        /** The list of CSS files to be injected into the portal. */
        css?: string[];
    }

    export interface ApplicationPrivate {
        manifest: ApplicationManifest;
        status: "NONE" | "LOADING" | "LOADED" | "FAIL";

        shortcut: TaskbarShortcut;
        portal?: Portal;
        elementRoot?: HTMLElement;
        error?: Error;

        _loadingTask?: Promise<void>;
        /** The extra init tasks. */
        _inits: (() => Promise<any> | any)[];
    }
}