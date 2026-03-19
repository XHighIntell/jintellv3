namespace intell.ctrl {
    export interface TimeSpanPrivate {
        element: HTMLElement;
        elementInput: HTMLElement

        focused: boolean;
        value?: number;

        min?: number;
        max?: number;
        step: number; stepViaWheel: boolean;

        strictness: number;
        decimalSeparator: string;
        thousandSeparator: string;

        nullable: boolean;
        readonly: boolean;

        _revert?: boolean;
    }

    export interface TimeSpanFormatOption {
        /** Gets or sets the strictness level; the default value is 0. */
        strictness?: number;

        /** Gets or sets the decimal separator; the default value is locale decimal separator. */
        decimalSeparator?: string;

        /** Gets or sets the thousand separator; the default value is locale thousand separator. */
        thousandSeparator?: string;
    }
}


interface GlobalEventHandlersEventMap {
    timespanchange: Event & { timespan: intell.ctrl.TimeSpan };
}