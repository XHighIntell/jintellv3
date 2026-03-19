namespace intell.ctrl.template {
    export interface Constructor {
        prototype: {
            getPrivate(_default?: object): object;
        }

        getItem(element?: HTMLElement): object | undefined;
        setItem(element: HTMLElement, control: object): object;
    }
    export interface InheritOption {
        ctrlKey: symbol | string;
        mode?: 'all';
    }
    export type defineProperties<T> = {
        [K in keyof T]?: {
            configurable?: boolean;
            enumerable?: boolean;
            value?: any;
            writable?: boolean;
            get: (this: T) => T[K];
            set?: (this: T, newValue: T[K]) => void;
        }
    }

    /** Gets unique key for storing private fields in control. */
    export const privateKey = (Symbol ? Symbol('__private') : '__private');

    //#region methods
    /** Enriches the specified class's constructor with useful methods.
     * - getPrivate(),
     * - static getItem(element?: HTMLElement): object, 
     * - static setItem(element: HTMLElement, ctrl: object): object */
    export function inherit(constructor: Constructor, option?: InheritOption) {
        const ctrlKey = option?.ctrlKey ?? (Symbol ? Symbol() : 'ctrlKey');
        
        constructor.prototype.getPrivate = getPrivate;

        constructor.getItem = function(element) { return element?.[ctrlKey] }
        constructor.setItem = function(element, control) { return element[ctrlKey] = control }
    }

    /** Adds one or more properties to an object, and/or modifies attributes of existing properties. */
    export function defineProperties<T>(o: T, properties: defineProperties<T>): T {
        return Object.defineProperties(o, properties)
    }
    //#endregion

    function getPrivate(o?: object) { return this[privateKey] ??= o ?? {}; }
}