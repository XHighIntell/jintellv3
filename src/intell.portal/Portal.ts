namespace intell.portal {
    /** Creates a portal for managing applications. */
    export class Portal {
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = Portal.getItem(element); if (c != null) return c; }

            // --b--
            let elementHeader = element?.querySelector<HTMLElement>('header');

            let elementMain = element?.querySelector<HTMLElement>('main');
            let elementTaskbar = element?.querySelector<HTMLElement>('.Taskbar');
            let elementContent = element?.querySelector<HTMLElement>('main>.Content');
            let elementContentOverlay = element?.querySelector<HTMLElement>('main>.Content>.Overlay');
            let elementContentApplications = element?.querySelector<HTMLElement>('main>.Content>.Applications');


            // --c-- predefined
            if (element == null) element = $$$(`<div class="Portal"></div>`)[0];
            if (elementHeader == null) elementHeader = $$$(`<header></header>`)[0].appendTo(element);
            if (elementMain == null) elementMain = $$$(`<main></main>`)[0].appendTo(element);

            if (elementContent == null) elementContent = $$$(`<div class="Content"></div>`)[0].appendTo(elementMain);
            if (elementContentApplications == null) elementContentApplications = $$$(`<div class="Applications"></div>`)[0].appendTo(elementContent);

            if (element.tabIndex == -1) element.tabIndex = 0;
            //#endregion

            Portal.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementHeader = elementHeader;
            __private.elementMain = elementMain;
            __private.elementContent = elementContent;
            __private.elementContentApplications = elementContentApplications;
            __private.applications = [];
            __private.taskbar = new Taskbar(this, elementTaskbar); __private.taskbar.element.prependTo(elementMain);
            __private.overlay = new Overlay(elementContentOverlay); __private.overlay.element.prependTo(elementContent);


            element.addEventListener('click', e => this.#onUserClick(e));
            //element.addEventListener('focus', () => this.#onUserFocus());
            //element.addEventListener('blur', () => this.#onUserBlur());
            //element.addEventListener('contextmenu', () => false);
        }

        //#region properties
        /** Gets the root element of the portal. */
        get element() { return this.getPrivate().element }
        get elementHeader() { return this.getPrivate().elementHeader }
        get elementMain() { return this.getPrivate().elementMain }
        get elementContent() { return this.getPrivate().elementContent }
        get elementContentApplications() { return this.getPrivate().elementContentApplications }
        

        /** Gets all applications available in the portal. */
        get applications() { return this.getPrivate().applications.slice() }

        /** Gets the current active application. */
        get selectedApplication() { return this.getPrivate().selectedApplication }

        /** Gets the taskbar of the portal. */
        get taskbar() { return this.getPrivate().taskbar }

        /** Gets the overlay of the portal. */
        get overlay() { return this.getPrivate().overlay }
        //#endregion

        //#region methods
        /** Adds an application to the portal. */
        add(application: Application) {
            const __private = this.getPrivate();
            const appPrivate = application.getPrivate();

            appPrivate.portal = this;
            __private.applications.push(application);
            __private.taskbar.add(application.shortcut, appPrivate.manifest.group);

            return application;
        }

        /** Adds an application manifest to the portal and returns the newly created application. */
        addManifest(manifest: ApplicationManifest) { return this.add(new Application(manifest)) }
        
        /** Gets application by its id. */
        get(id: string) { return this.getPrivate().applications.find(app => app.manifest.id == id) }

        /** Opens the first application that has manifest.startup set to true. */
        open(): Promise<void>;
        /** Opens the application with the specified id. */
        open(id: string): Promise<void>;
        /** Opens the application that was added to the portal. */
        open(application: Application): Promise<void>;
        async open(arg1?: any): Promise<void> {
            const __private = this.getPrivate();
            const applications = __private.applications;

            if (arg1 == null) {
                const application = applications.find(value => value.manifest.startup === true);
                if (application == null) throw new Error(`No application with startup set to true was found.`);

                return this.open(application);
            }
            else if (typeof arg1 == "string") {
                const application = applications.find(value => value.manifest.id === arg1);
                if (application == null) throw new Error(`No application with id '${arg1}' was found.`);

                return this.open(application);
            }
            else if (arg1 instanceof Application) {
                const application = arg1;

                // 1. if open an application already opened, exit this block
                // 2. set active class, hide all other applications
                //      a. hide the container of application
                //      b. hide all applications
                // 3. 

                // --1--
                if (__private.selectedApplication == application) return;

                const oldApplication = __private.selectedApplication;
                const newApplication = application;
                const manifest = application.manifest;

                // --2--
                __private.selectedApplication = application;
                application.shortcut.selected = true;

                // --2a--
                ctrl.hide(__private.elementContentApplications);
                applications.forEach(value => ctrl.hide(value.elementRoot));

                if (application.status == "NONE") {
                    const loadTask = application.load();
                    __private.overlay.show(application);

                    try {
                        await loadTask;

                        if (__private.selectedApplication == application) {
                            __private.overlay.hide();
                            ctrl.show(__private.elementContentApplications);
                            ctrl.show(application.elementRoot);
                        }
                        else {
                            ctrl.hide(application.elementRoot);
                        } 

                        //application.onOpen.dispatch();
                    }
                    catch (e) {
                        if (__private.selectedApplication == application) __private.overlay.show(application);
                        throw e;
                    }
                }
                else if (application.status == "LOADING") __private.overlay.show(application);
                else if (application.status == "LOADED") {
                    __private.overlay.hide();
                    ctrl.show(__private.elementContentApplications);
                    ctrl.show(application.elementRoot);
                }
                else if (application.status == "FAIL") {
                    __private.overlay.show(application);
                }

                __private.elementContentApplications.setAttribute('data-active-application', manifest.id);
            }
        }

        //#endregion

        #onUserClick(e: MouseEvent) {
            const __private = this.getPrivate();
            const target = e.target as HTMLElement;

            if (target.matches('[data-action-role="taskbar-collapse"],[data-action-role="taskbar-collapse"] *') == true) {
                this.taskbar.toggle();
            }
        }

        //@ts-ignore
        declare getPrivate(def?: object): PortalPrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): Portal; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: Portal): Portal;
    }


    

    ctrl.template.inherit(Portal);
}