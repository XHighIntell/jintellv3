namespace docs.ctrl {
    export function startWait(element: HTMLElement) {
        let elementWaiting = element.querySelector(':scope>.waiting-cycle') as HTMLElement;

        if (elementWaiting == null) {
            elementWaiting = $(`<div class="waiting-cycle"></div>`)[0];
            elementWaiting.style.opacity = '0';
            element.append(elementWaiting); elementWaiting.offsetHeight;
            elementWaiting.style.opacity = '1';
        }
        element.classList.add('WAITING');
    }
    export function stopWait(element: HTMLElement) {
        let elementWaiting = element.querySelector(':scope>.waiting-cycle');
        elementWaiting?.remove();
        element.classList.remove('WAITING');
    }
}