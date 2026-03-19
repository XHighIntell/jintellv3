namespace intell.ctrl {
    export interface OverlayProgressPrivate {
        element: HTMLElement;
        elementItemAbstract?: HTMLElement;

        items: OverlayProgressItem[];
        fadeOutTime: number;
    }
    export interface OverlayProgressItemPrivate {
        element: HTMLElement;
        elementName: HTMLElement;
        elementState: HTMLElement;
        parent: OverlayProgress;
    }
}