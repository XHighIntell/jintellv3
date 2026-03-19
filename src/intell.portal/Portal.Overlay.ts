namespace intell.portal {
    export class Overlay {
        constructor(element?: HTMLElement) {
            //#region 1. Quality of life features
            // --a-- If the element has already been used to create this control, return the previous instance
            if (element != null) { let c = Overlay.getItem(element); if (c != null) return c; }

            if (element == null) element = $$$(`<div class="Overlay"></div>`)[0];
            element.replaceChildren(...$$$(`
<div class="Content">
    <div class="Waiting-Box">
        <div class="Cycle1"></div>
        <div class="Cycle2"></div>
    </div>
    <div class="Application-Details">
        <header>
            <div class="Application-Icon"></div>
            <div class="Application-Name">Loading Forever</div>
        </header>
        <div class="Application-Description">This application takes infinite time to load</div>
    </div>
                            
    <div class="Error">
        <div class="Message">Welcome Error!</div>
        <div class="Stack">TypeError: Welcome Error!
    at Application.init (https://jintellv2.xhighintell.com/demo/portal/apps/error/error.js:17:15)
    at https://jintellv2.xhighintell.com/static/lib/intell/intell.js:1032:84
    at async Portal.portal.open (https://jintellv2.xhighintell.com/static/lib/intell/intell.js:888:25)</div>
    </div>
</div>
`));

            // --b--
            let elementContent = element?.querySelector<HTMLElement>('.Content');
            let elementWaiting = element?.querySelector<HTMLElement>('.Waiting-Box');

            let elementApplicationIcon = element?.querySelector<HTMLElement>('.Application-Icon');
            let elementApplicationName = element?.querySelector<HTMLElement>('.Application-Name');
            let elementApplicationDescription = element?.querySelector<HTMLElement>('.Application-Description');

            let elementError = element?.querySelector<HTMLElement>('.Error');
            let elementErrorMessage = element?.querySelector<HTMLElement>('.Error .Message');
            let elementErrorStack = element?.querySelector<HTMLElement>('.Error .Stack');

            // --c-- predefined
            if (element == null) element = $$$(`<div class="Overlay"></div>`)[0];
            if (elementContent == null) elementContent = $$$(`<div class="Content"></div>`)[0].appendTo(element);
            //#endregion

            Overlay.setItem(element, this);

            const __private = this.getPrivate({});
            __private.element = element;
            __private.elementContent = elementContent;
            __private.elementWaiting = elementWaiting;
            __private.elementApplicationIcon = elementApplicationIcon;
            __private.elementApplicationName = elementApplicationName;
            __private.elementApplicationDescription = elementApplicationDescription;
            __private.elementError = elementError;
            __private.elementErrorMessage = elementErrorMessage;
            __private.elementErrorStack = elementErrorStack;
        }

        //#region properties
        /** Gets the root element of the taskbar. */
        get element() { return this.getPrivate().element }
        get elementContent() { return this.getPrivate().elementContent }


        get icon() { return this.getPrivate().icon }
        set icon(newValue) {
            const __private = this.getPrivate();
            const previous = __private.icon;
            const elementIcon = __private.elementApplicationIcon;

            //#region removes the previous value
            if (previous?.startsWith('class://')) {
                const classname = previous.replace('class://', '');

                if (classname != '' && classname != 'icon') elementIcon.classList.remove(classname);
            }
            else if (previous?.startsWith('http://')) elementIcon.style.backgroundImage = '';
            else if (previous?.startsWith('https://')) elementIcon.style.backgroundImage = '';
            //#endregion

            //#region add the new value
            const icon = __private.icon = newValue;
            elementIcon.setAttribute('data-icon', icon);

            if (icon.startsWith('class://')) {
                const classname = icon.replace('class://', '');

                if (classname != '') elementIcon.classList.add(classname);
            }
            else if (icon.startsWith('http://')) elementIcon.style.backgroundImage = `url(${icon})`;
            else if (icon.startsWith('https://')) elementIcon.style.backgroundImage = `url(${icon})`;
            //#endregion
        }


        get application() { return this.getPrivate().application }
        set application(newValue) {
            const __private = this.getPrivate();
            const application = __private.application = newValue;
            const manifest = application?.manifest;

            ctrl.toggle(__private.elementWaiting, application.status == 'LOADING');

            //#region Sets icon, name, description of the new application
            this.icon = manifest?.icon;
            __private.elementApplicationName.textContent = manifest?.name;
            __private.elementApplicationDescription.innerText = manifest?.description ?? '';
            //#endregion

            const error = application.error;
            ctrl.toggle(__private.elementError, error != null);

            __private.elementErrorMessage.textContent = error?.message;
            __private.elementErrorStack.textContent = error?.stack;
        }
        //#endregion

        //#region methods
        /** Shows the overlay details of the specified application. */
        show(application: Application) {
            const __private = this.getPrivate();
            this.application = application;

            ctrl.show(__private.element);
            
            __private.element.offsetLeft;
            __private.element.classList.add('ACTIVE');
        }

        hide() {
            const __private = this.getPrivate();

            ctrl.hide(__private.element);

            __private.element.classList.remove('ACTIVE');
        }
        //#endregion

        //@ts-ignore
        declare getPrivate(def?: object): OverlayPrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): Overlay; //@ts-ignore
        declare static setItem(element: HTMLElement, ctrl: Overlay): Overlay;
    }

    ctrl.template.inherit(Overlay);
}