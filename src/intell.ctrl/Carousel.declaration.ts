namespace intell.ctrl {
    export interface CarouselPrivate {
        element: HTMLElement;
        elementChildren: HTMLElement;
        elementPrev: HTMLElement;
        elementNext: HTMLElement;
        elementIndicators: HTMLElement;

        focused: boolean;
        items: CarouselItem[];
        interval: number;

        /** Indicates whether the carousel is automatically cycling. */
        running: boolean;

        /** The current item to which the pending visual effect is attached. */
        runningItem?: CarouselItem;

        /** The timer used to automatically cycle through items. */
        _timer?: number;
    }

    export interface CarouselItemPrivate {
        element: HTMLElement;
        elementIndicator: HTMLElement;

        parent?: Carousel;
        active: boolean;
    }
}


interface GlobalEventHandlersEventMap {
    carouselchange: Event & {
        /** A reference to the control to which the event was originally dispatched. */
        carousel: intell.ctrl.Carousel;

        /** The previous slide before it changes. */
        oldItem: intell.ctrl.CarouselItem;

        /** The current slide. */
        newItem: intell.ctrl.CarouselItem;
    };
}