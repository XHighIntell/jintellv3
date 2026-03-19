namespace intell.ctrl {
    /** Shows the element by modifying its display style.
     * 
     * Remarks: This method uses operations that may force the browser to recalculate the element’s layout. */
    export function show(element?: HTMLElement) {
        if (element == null) return;
        if (element instanceof Element == false) throw new TypeError("Failed to execute 'intell.ctrl.show': 'element' must be a HTMLElement.");

        // 1. Removes the inline style
        // 2. getComputedStyle; if the element display is still none, set inline style

        // --1--
        if (element.style.display == 'none') element.style.display = '';

        // --2--
        const computedStyle = getComputedStyle(element);
        if (computedStyle.display == 'none') element.style.display = 'revert';
    }

    /** Hides the element by modifying its display style. */
    export function hide(element?: HTMLElement) {
        if (element == null) return;
        if (element instanceof Element == false) throw new TypeError("Failed to execute 'intell.ctrl.hide': 'element' must be a HTMLElement.");

        const computedStyle = getComputedStyle(element);
        if (computedStyle.display != 'none') element.style.display = 'none';
    }

    /** Toggles an element’s visibility by modifying its display style. */
    export function toggle(element?: HTMLElement, force?: boolean): boolean {
        if (element == null) return;
        if (element instanceof Element == false) throw new TypeError("Failed to execute 'intell.ctrl.toggle': 'element' must be a HTMLElement.");

        if (force == null) {
            const computedStyle = getComputedStyle(element);

            if (computedStyle.display == 'none') { show(element); return true; }
            else { hide(element); return false; }
        } else {
            if (force == true) { show(element); return true; }
            else { hide(element); return false; }
        }
    }

    /** Finds an element by traversing itself and its parents (heading toward the document root) until it finds an element that matches the specified predicate. */
    export function closest(element: HTMLElement, predicate: (value: HTMLElement) => boolean, stopElement?: HTMLElement): HTMLElement | undefined {
        let target = element;
        
        while (target != null) {
            if (element == stopElement) return
            if (predicate(target) === true) return target;

            target = target.parentElement;
        }
    }

    //#region startHide, stopHide
    const processes: StartHideProcess[] = []; 

    /**Starts the hide animation by adding specified classes, then fully hides the element. Calling `startHide` multiple times returns the Promise from the previous call.
    * 
    * Returns true if the animation completes successfully; otherwise returns false. 
    * This method also returns false if the animation is stopped by calling `stopHide`. */
    export function startHide(element: HTMLElement, timeout: number, delayHideClasses?: string[] | string): Promise<boolean> {
        // 1. if the element is in the hiding process, returns previous promise
        // 2. add class to element
        // 3. add to list
        // 4. stopHide & hide

        let classes: string[] = flatStrings(delayHideClasses);
        // --1--
        let item = processes.find(item => item.element === element);
        if (item != null) return item.promise;

        let promiseResolve: (value: boolean) => void;
        const promise = new Promise<boolean>((resolve, reject) => promiseResolve = resolve);

        // --2--
        element.classList.add(...classes);

        const timer = setTimeout(() => {
            // --4--
            processes.remove(item);
            element.classList.remove(...item.classes);
            ctrl.hide(element);
            promiseResolve(true);
        }, timeout);

        // --3--
        processes.push(item = { element, timer, classes, promise, promiseResolve });

        return promise;
    }


    export function stopHide(element: HTMLElement): number {
        // remove all matching processes
        // 1. remove class
        // 2. clear timer
        // 3. remove from list
        let count = 0;

        for (var i = 0; i < processes.length; i++) {
            const item = processes[i];
            if (item.element != element) continue;

            // --1--
            element.classList.remove(...item.classes);

            // --2--
            clearTimeout(item.timer);

            // --3--
            processes.splice(i, 1); i--;

            item.promiseResolve(false);
            count++;
        }

        return count;
    }

    interface StartHideProcess {
        element: HTMLElement;
        timer: number;
        classes: string[];
        promise: Promise<boolean>;
        promiseResolve: (value: boolean) => void;
    }
    //#endregion

    //#region showAt
    /** Shows the element so that it stays near another DOMRect or element. */
    export function showAt(element: HTMLElement, at: DOMRect, locations: number[], option?: math.ShowAtOption): math.ShowAtResult;
    export function showAt(element: HTMLElement, at: HTMLElement, locations: number[], option?: math.ShowAtOption): math.ShowAtResult;

    /** Shows the element at the coordinates relative to the document. */
    export function showAt(element: HTMLElement, at: math.PointLike, locations: number[], option?: math.ShowAtOption): math.ShowAtResult;
    export function showAt(element: HTMLElement, at: any, locations: number[], option?: math.ShowAtOption): math.ShowAtResult {
        if (at instanceof DOMRect) return showAtRect.apply(null, arguments);
        if (at instanceof HTMLElement) return showAtElement.apply(null, arguments);
        return showAtPoint.apply(null, arguments);
    }

    function showAtRect(element: HTMLElement, at: DOMRect, locations: number[], option?: math.ShowAtOption) {
        if (locations == null) throw new TypeError("locations can't be null");
        option = Object.assign({}, option);

        // 1. calculate the container's DOMRect
        //    a. looking parent element that bounding us
        //    b. calculate DOMRect depend on the parent element that bounding us
        // 2. Shows the element in a location where the user cannot see it, so its getBoundingClientRectOffset() can be measured
        // 3.

        //#region --1--
        // --1a-- 
        let elementOffsetParent = element.parentElement as HTMLElement;
        while (elementOffsetParent) {
            if (elementOffsetParent == document.body) break;

            const computedStyle = getComputedStyle(elementOffsetParent);
            if (computedStyle.overflow != 'visible' && computedStyle.position != 'static') break;

            elementOffsetParent = elementOffsetParent.offsetParent as HTMLElement;
        }

        // --1b--
        let viewRect = new DOMRect(window.scrollX, window.scrollY, document.documentElement.clientWidth, document.documentElement.clientHeight);
        let container: DOMRect;

        if (elementOffsetParent == document.body) container = viewRect;
        else {
            const styles = getComputedStyle(elementOffsetParent);
            const borderLeft = parseFloat(styles.getPropertyValue('border-left-width'));
            const borderTop = parseFloat(styles.getPropertyValue('border-top-width'));
            const borderRight = parseFloat(styles.getPropertyValue('border-right-width'));
            const borderBottom = parseFloat(styles.getPropertyValue('border-bottom-width'));
            const parentRect = elementOffsetParent.getBoundingClientRectOffset();

            container = new DOMRect(parentRect.left + borderLeft, parentRect.top + borderTop, parentRect.width - borderLeft - borderRight, parentRect.height - borderTop - borderBottom);
            container = container.intersect(viewRect);
        }
        //#endregion

        option.container = container;

        // --2--
        element.style.left = '-900px'; element.style.top = '-900px'; element.style.visibility = 'hidden';
        show(element);

        const popup = element.getBoundingClientRectOffset();
        const results = locations.map(location => math.getRectWhenShowAt(popup, at, location, option));
        const result = results.sort((a, b) => a.overlap - b.overlap)[0];

        element.style.visibility = '';
        element.setOffset({ x: result.rect.x, y: result.rect.y });
        
        return result;
    }
    function showAtElement(element: HTMLElement, at: HTMLElement, locations: number[], option?: math.ShowAtOption) {
        return showAtRect(element, at.getBoundingClientRectOffset(), locations, option);
    }
    function showAtPoint(element: HTMLElement, at: math.PointLike, locations: number[], option?: math.ShowAtOption) {
        return showAtRect(element, new DOMRect(at.x, at.y), locations, option);
    }
    //#endregion

    //#region getTextWidth
    let _canvas: HTMLCanvasElement;

    export function getTextMetrics(text: string, font: string): TextMetrics;
    export function getTextMetrics(text: string, element: HTMLElement): TextMetrics;
    export function getTextMetrics(text: string, o: any): TextMetrics {
        if (o instanceof HTMLElement) return getTextWidthElement(text, o);
        else return getTextWidthFont(text, o);
    }
    function getTextWidthFont(text: string, font: string): TextMetrics {
        const canvas = _canvas ?? (_canvas = document.createElement("canvas"));
        const context = canvas.getContext("2d");
        context.font = font;
        const metrics = context.measureText(text);
        return metrics;
    }
    function getTextWidthElement(text: string, element: HTMLElement): TextMetrics {
        const font = getComputedStyle(element).font;

        return getTextWidthFont(text, font);
    }
    //#endregion

    function flatStrings(value?: string | string[]): string[] {
        if (value == null) return [];
        else return Array.isArray(value) ? value : [value];
    }
}