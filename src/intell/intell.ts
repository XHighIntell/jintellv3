namespace intell {
    /** Gets the version of the library. */
    export const version = '3.0.0';

    export class EventRegister<T extends (this: any, ...args: any)=>any> {
        constructor(target?: ThisParameterType<T>, option?: EventRegisterOption) {
            this.target = target;
            this.option = { once: option?.once ?? false };
            this.listeners = [];
        }

        protected target?: ThisParameterType<T>;
        protected option: EventRegisterOption;
        protected listeners: T[];

        /** Registers an event‑listener callback for this event. The callback argument set the callback that will be invoked when the event is dispatched.
         *  Listeners can return "stop" to prevent further callbacks from being invoked. */
        addListener(callback: T): void {
            if (typeof (callback) != 'function') throw new Error('The callback must be function.');

            this.listeners.push(callback);
        }

        /** Unregisters an event‑listener callback from this event. */
        removeListener(callback: T): void {
            const index = this.listeners.indexOf(callback);
            if (index == -1) return;

            this.listeners.splice(index, 1);
        }

        /** Dispatches a synthetic event. */
        dispatch(...args: Parameters<T>): void {

            // 1. dispatch event to the listeners
            //      a. if there is any error in a listener, log into the console and continue.
            // 2. if true, the listener would be automatically removed when invoked
            // 3. if any of the listeners return "stopPropagation", stop. This is internally used
            const once = this.option.once;

            for (var i = 0; i < this.listeners.length; i++) {
                const callback = this.listeners[i];

                // --1--
                try {
                    var result = callback.apply(this.target, args);
                } catch (e) {
                    console.error(e);
                }

                // --2--
                if (once === true) { this.listeners.splice(i, 1); i--; }

                // --3--
                if (result == "stop" || result == "stopPropagation") break;
            }
        }

        /** Determines whether this event contains the specified listener.
        * @param callback Listener whose registration status shall be tested */
        hasListener(callback: T) { return this.listeners.indexOf(callback) != -1 }

        /** Determines whether this event has any listeners. */
        hasListeners() { return this.listeners.length > 0 }
    }

    /** Creates elements from the specified HTML string. */
    export function $$$<T = HTMLElement>(html: string, includeTextNode: boolean = false): T[] {
        const template = document.createElement('template');
        template.innerHTML = html;

        if (includeTextNode == false) {
            return [...template.content.children] as T[];
        }
        else {
            return [...template.content.childNodes] as T[];
        }
    }

    /** Creates a query object from a string.
     * @param search The string containing key–value pairs separated by '='. If no search string is provided, `location.search.substring(1)` will be used instead.
     * @returns Returns the key value pair object. */
    export function qs(search?: string): { [T: string]: string } {
        search ??= window.location.search.substring(1);

        const parts = search.split('&'); 
        const r = {};

        for (const part of parts) {
            if (part == "") continue;

            const p = part.split('=');
            const key = decodeURIComponent(p[0]);
            const value = p[1] == undefined ? undefined : decodeURIComponent(p[1]);

            r[key] = value;
        }

        return r;
    };

    /** Creates a promise that will resolve after a time delay. */
    export function wait(timeout: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }

    const loadedScripts: HTMLScriptElement[] = [];
    const loadedStyles: HTMLLinkElement[] = [];

    /** Loads a JavaScript file by creating a script tag and appending it to the DOM.
     * @returns Returns the script element on success. */
    export async function loadScript(url: string) {
        const href = new URL(url, location.href).href;

        // Caching feature: If the script was previously loaded, returns the existing script element.
        const element = loadedScripts.find(element => element.src == href);
        if (element != null) return element;

        return new Promise<HTMLScriptElement>((resolve, reject) => {
            const element = document.createElement('script');
            element.type = 'text/javascript';
            element.src = href;
            element.onload = () => { loadedScripts.push(element); resolve(element); };
            element.onerror = () => {
                element.remove();
                reject(new Error(`Failed to load script from ${url}: ERR_INTERNET_DISCONNECTED.`));
            };

            document.head.appendChild(element);
        });
    }

    /**Loads a Cascading Style Sheets file by creating a link tag and appending it to the DOM.
     * @returns Returns the link element on success. */
    export async function loadStyle(url: string) {
        const href = new URL(url, location.href).href;

        // Caching feature: If the style was previously loaded, returns the link script element.
        const element = loadedStyles.find(element => element.href == href);
        if (element != null) return element;

        return new Promise<HTMLLinkElement>((resolve, reject) => {
            const element = document.createElement('link');
            element.rel = 'stylesheet';
            element.href = href;
            element.onload = () => { loadedStyles.push(element); resolve(element) };
            element.onerror = () => {
                element.remove();
                reject(new Error(`Failed to load style from ${url}: ERR_INTERNET_DISCONNECTED.`));
            };

            document.head.appendChild(element);
        });
    }
}