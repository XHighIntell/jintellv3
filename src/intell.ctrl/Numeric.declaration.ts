namespace intell.ctrl {
    export interface NumericPrivate {
        element: HTMLElement;
        elementInput: HTMLInputElement;
        elementPrefix: HTMLElement;
        elementSuffix: HTMLElement;
        elementActions: HTMLElement;
        elementUp: HTMLElement;
        elementDown: HTMLElement;
        focused: boolean;

        value?: number;
        min?: number;
        max?: number;
        prefix: string;
        suffix: string;
        step: number; stepViaWheel: boolean;

        minimumFractionDigits: number;
        maximumFractionDigits: number;
        decimalSeparator: string;
        thousandSeparator: string;
        
        nullable: boolean;
        readonly: boolean;


        /** If true, the numeric control displays buttons that allow the user to increase or decrease the value. */
        controls: boolean;

        /** Reverts to previous value. */
        revert?: boolean;

        /** Indicates whether the user is holding the mouse down. */
        holdingMousedown?: boolean;
        holdingMousedownTimer?: number;
    }

    export interface NumericFormatOption {
        /** Gets or sets the minimum number of digits to appear after the decimal point; the default is 0. */
        minimumFractionDigits?: number;

        /** Gets or sets the maximum number of digits to appear after the decimal point; the default is 2. */
        maximumFractionDigits?: number;

        /** Gets or sets the decimal separator; the default is locale decimal separator. */
        decimalSeparator?: string;

        /** Gets or sets the thousand separator; the default is locale thousand separator. */
        thousandSeparator?: string;
    }
}


interface GlobalEventHandlersEventMap {
    numericchange: Event & { numeric: intell.ctrl.Numeric };
}