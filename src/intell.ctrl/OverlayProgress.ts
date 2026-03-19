namespace intell.ctrl {
    /** Represents an overlay progress box that displays ongoing tasks. */
    export class OverlayProgress {
        static WAITING_CLASS = 'WAITING';
        static COMPLETED_CLASS = 'DONE';
        static FAILED_CLASS = 'FAILED';

        /** Initializes a new overlay progress box.*/
        constructor(element?: HTMLElement) {
            if (element != null) { let c = OverlayProgress.getItem(element); if (c != null) return c; }

            //#region quality of life
            let elementItemAbstract = element?.querySelector<HTMLElement>('.Item.abstract');
            elementItemAbstract?.remove(); elementItemAbstract?.classList.remove('abstract');

            if (element == null) element = $$$(`<div class="Overlay-Progress"></div>`)[0];
            //#endregion

            OverlayProgress.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementItemAbstract = elementItemAbstract;
            __private.items = [];
            __private.fadeOutTime = 1500;
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }

        /** Gets or sets the fade‑out duration of the animation. */
        get fadeOutTime() { return this.getPrivate().fadeOutTime }
        set fadeOutTime(newValue) { this.getPrivate().fadeOutTime = newValue }
        //#endregion

        //#region methods
        /** Creates and adds a newly created overlay progress UI to the list. */
        add(name: string): OverlayProgressItem {
            const __private = this.getPrivate();
            const item = new OverlayProgressItem(__private.elementItemAbstract?.cloneNode(true) as HTMLElement, this);
            __private.items.push(item);
            __private.element.appendChild(item.element);

            item.elementName.innerHTML = name;

            return item;
        }

        /** Displays an overlay progress UI for long‑running tasks. */
        async displayProgress<T>(name: string, task: () => Promise<T>): Promise<T> {
            const progressItem = this.add(name);

            try {
                const response = await task();
                progressItem.complete();
                return response;
            }
            catch (e) {
                progressItem.fault();
                throw e;
            }
        }
        //#endregion

        //@ts-ignore
        declare getPrivate(def?: object): OverlayProgressPrivate;

        //@ts-ignore
        declare static getItem(element?: HTMLElement): OverlayProgress | undefined; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: OverlayProgress): OverlayProgress;
    }
    
    export class OverlayProgressItem {
        constructor(element: HTMLElement | undefined, parent: OverlayProgress) {
            if (element != null) { let c = OverlayProgressItem.getItem(element); if (c != null) return c; }

            let elementName = element?.querySelector<HTMLElement>(':scope>.Name');
            let elementState = element?.querySelector<HTMLElement>(':scope>.State');

            if (element == null) element = $$$('<div class="Item"></div>')[0];
            if (elementName == null) elementName = $$$('<div class="Name"></div>')[0].appendTo(element);
            if (elementState == null) elementState = $$$('<div class="State"></div>')[0].appendTo(element);

            OverlayProgressItem.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementName = elementName;
            __private.elementState = elementState;
            __private.parent = parent;

            element.classList.add(OverlayProgress.WAITING_CLASS);
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }

        /** Gets the name element. */
        get elementName() { return this.getPrivate().elementName }

        /** Gets the state element. */
        get elementState() { return this.getPrivate().elementState }

        /** Gets the parent overlay progress control. */
        get parent() { return this.getPrivate().parent }
        //#endregion

        //#region methods
        /** Removes this ongoing progress item and also removes it from its parent. */
        remove() {
            const parent__private = this.parent.getPrivate();
            parent__private.items.remove(this);

            intell.ctrl.startHide(this.element, parent__private.fadeOutTime, 'FADING').then(() => this.element.remove());
        }

        /** Sets state to COMPLETED and also removes it from its parent.  */
        complete() {
            this.element.classList.remove(OverlayProgress.WAITING_CLASS);
            this.element.classList.add(OverlayProgress.COMPLETED_CLASS);

            this.remove();
        }

        /** Sets state to FAILED and also removes it from its parent.  */
        fault() {
            this.element.classList.remove(OverlayProgress.WAITING_CLASS);
            this.element.classList.add(OverlayProgress.FAILED_CLASS);

            this.remove();
        }
        //#endregion

        //@ts-ignore
        declare getPrivate(def?: object): OverlayProgressItemPrivate;

        //@ts-ignore
        declare static getItem(element?: HTMLElement): OverlayProgressItem | undefined; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: OverlayProgressItem): OverlayProgressItem;
    }

    template.inherit(OverlayProgress);
    template.inherit(OverlayProgressItem);
}