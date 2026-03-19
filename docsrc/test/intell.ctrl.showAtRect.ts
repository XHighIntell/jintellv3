namespace docs.page.docu {
    const currentPage = globalThis.currentPage as string; //@ts-ignore 
    if (currentPage != 'intell.ctrl.showAtRect') return;

    const $testcase = $('.testcase');
    const $body = $testcase.find('>.body');

    const elementDistance = document.getElementById('distance') as HTMLInputElement;
    const elementDistanceToContainer = document.getElementById('margin') as HTMLInputElement;
    const elementLocations = document.getElementById('locations') as HTMLInputElement;
    const elementTarget = $('.target')[0];

    //#region drag and drop
    let dragging = false;
    let draggingPoint = { x: 0, y: 0 };

    elementTarget.addEventListener('mousedown', function(e) {
        draggingPoint.x = e.offsetX;
        draggingPoint.y = e.offsetY;
        dragging = true;
        document.getSelection().removeAllRanges();
        e.preventDefault();
    });
    document.addEventListener('mouseup', () => dragging = false);
    document.addEventListener('mousemove', function(e) {
        if (dragging == false) return;
        $(elementTarget).offset({ left: e.pageX -draggingPoint.x, top: e.pageY - draggingPoint.y });
    });
    //#endregion

    $testcase.on('contextmenu', e => { e.preventDefault() });
    $testcase.on('click', '.actions>button', function(this: HTMLElement) { test([parseInt(this.getAttribute('data-location'))]) });
    $testcase.on('mousedown', '.actions>button', e => (e.originalEvent.target as HTMLElement).closest('button').classList.toggle('selected'));
    document.addEventListener('keydown', function(e) {
        let locations = [parseInt(e.key)];

        if (e.key == '0') locations = [10];
        else if (e.key == '-') locations = [11];
        else if (e.key == '=') locations = [12];
        else if (e.key == ' ') {
            locations = eval(elementLocations.value);
            e.preventDefault();
        }

        if (isNaN(locations[0]) == true) return;

        test(locations);
    });

    const $popup = $('.box-overlay');

    $popup.on('dblclick', function() { $popup.hide() });

    function test(locations: number[]) {
        const result = intell.ctrl.showAt($popup[0], elementTarget.getBoundingClientRectOffset(), locations, {
            distanceToContainer: elementDistanceToContainer.valueAsNumber,
            distance: elementDistance.valueAsNumber,
        });
        console.log(result);
    }

}

