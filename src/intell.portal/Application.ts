namespace intell.portal {
    /** Represents the portal application. */
    export class Application {
        /** Represents a portal application instance. */
        constructor(manifest: ApplicationManifest) {
            let shortcut = new TaskbarShortcut();
            shortcut.element.title = manifest.title ?? '';
            shortcut.value = this;
            shortcut.icon = manifest.icon;
            shortcut.text = manifest.name;

            const __private = this.getPrivate({});
            __private.manifest = manifest;
            __private.shortcut = shortcut;
            __private.status = 'NONE';
            __private._inits = [];
        }

        //#region properties
        /** Gets the status of the application. */
        get manifest() { return this.getPrivate().manifest }

        /** Gets the status of the application. "NONE" = 0, "LOADING" = 1, "LOADED" = 2, "FAIL" = 3 */
        get status() { return this.getPrivate().status }

        /** Gets the Taskbar shortcut of the application. */
        get shortcut() { return this.getPrivate().shortcut }

        /** Gets the portal of the application. */
        get portal() { return this.getPrivate().portal }

        /** Gets the the root content element of the application. */
        get elementRoot() { return this.getPrivate().elementRoot }

        /** Gets the error that occurred while loading the application. */
        get error() { return this.getPrivate().error }
        //#endregion

        //#region methods
        /** Loads the application. Subsequent calls return the previous Promise. */
        load(): Promise<void> {
            const __private = this.getPrivate();

            if (__private._loadingTask != null) return __private._loadingTask;

            return __private._loadingTask = this.#internal_load();
        }

        /**Adds a post-initialization task to the application that executes after it loads. */
        addPostInitTask(init: (this: this) => Promise<any> | any) {
            const __private = this.getPrivate();
            const status = __private.status;

            if (status == "LOADED" || status == "FAIL")
                throw new Error("Initialization tasks cannot be added after the application reaches a loaded or failed state.");
            
            __private._inits.push(init);
        }

        async #internal_load(): Promise<void> {
            const __private = this.getPrivate();
            const portal = __private.portal;
            const portalPrivate = portal?.getPrivate();

            if (portal == null) throw new Error("The application cannot be loaded outside the portal.");

            // Application status must be 'NONE'
            if (__private.status != "NONE") throw new Error("The application is already loaded.");
            __private.status = "LOADING";

            const manifest = __private.manifest;

            try {
                // Loads html
                if (manifest.content.html) {
                    let responseText: string;

                    try {
                        const response = await fetch(manifest.content.html)
                        if (response.status != 200) throw new Error("Can't fetch manifest.content.html: " + manifest.content.html);

                        responseText = await response.text();
                    }
                    catch (error) {
                        throw new Error("ERR_INTERNET_DISCONNECTED");
                    }

                    // 1. if have more than 1 element, swap in another div

                    // --1--
                    let elementRoots = $$$(responseText);
                    if (elementRoots.length > 1) {
                        elementRoots = [$$$('<div class="Application-Wrapper"></div>')[0]];
                        elementRoots[0].append(...elementRoots);
                    }
                    __private.elementRoot = elementRoots[0];

                    ctrl.hide(__private.elementRoot);
                    portalPrivate.elementContentApplications.append(__private.elementRoot);
                }

                // Loads scripts
                if (manifest.content.js != null)
                    for (let url of manifest.content.js) await loadScript(url);

                // Loads styles
                if (manifest.content.css != null)
                    for (var url of manifest.content.css) await loadStyle(url);


                for (let i = 0; i < __private._inits.length; i++) {
                    const fn = __private._inits[i];
                    await fn.call(this)
                }

                __private.status = "LOADED";
            }
            catch (error) {
                __private.status = "FAIL";
                __private.error = error;
                throw error;
            }
        }
        //#endregion

        getPrivate(_default?: object): ApplicationPrivate { return this[ctrl.template.privateKey] ??= _default ?? {} }
    }


}