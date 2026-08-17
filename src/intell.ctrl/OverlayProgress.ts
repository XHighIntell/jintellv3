namespace intell.ctrl {
    /** Represents an overlay progress box that displays ongoing tasks. */
    export class OverlayProgress {
        static WAITING_CLASS = 'WAITING';
        static COMPLETED_CLASS = 'DONE';
        static FAILED_CLASS = 'FAILED';
        static FADING_CLASS = 'FADING';

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
        }

        //#region properties
        /** Gets the root element of the control. */
        get element() { return this.getPrivate().element }
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
        async displayProgress<T>(name: string, task: (progressItem: OverlayProgressItem) => Promise<T>): Promise<T> {
            const progressItem = this.add(name);

            try {
                const response = await task(progressItem);
                progressItem.complete().remove();
                return response;
            }
            catch (e) {
                progressItem.fault().remove();
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
    
    template.inherit(OverlayProgress);
}