namespace intell.ctrl {
    export interface TargetPopupPrivate {
        element: HTMLElement;
        elementAttached?: HTMLElement;

        visible: boolean;
        locations: number[];
        option: intell.math.ShowAtOption;

        /** The most recent mousedown event. */
        _previousMousedownEvent?: MouseEvent;
    }
}


interface GlobalEventHandlersEventMap {
    targetpopuphide: Event & { ctrl: intell.ctrl.TargetPopup };
}