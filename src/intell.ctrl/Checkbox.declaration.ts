namespace intell.ctrl {
    export interface CheckboxPrivate {
        element: HTMLElement;
        elementLabel: HTMLElement;
        elementIcon: HTMLElement;
        elementName: HTMLElement;
        focused: boolean;

        checked?: boolean | undefined;
        text: string;

        nullable: boolean;
        readonly: boolean;
    }
}


interface GlobalEventHandlersEventMap {
    checkboxchange: Event & { checkbox: intell.ctrl.Checkbox };
}