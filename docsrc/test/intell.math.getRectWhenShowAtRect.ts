namespace docs.page.docu {
    const currentPage = globalThis.currentPage as string; //@ts-ignore 
    if (currentPage != 'intell.math.getRectWhenShowAtRect') return;


    const $testcase = $('.testcase');
    const $body = $testcase.find('>.body');
    const elementTarget = $('.box')[0];

    const elementCheckboxIsInContainer = document.getElementById('checkboxIsInContainer') as HTMLInputElement;
    const elementMargin = document.getElementById('margin') as HTMLInputElement;
    const elementSpace = document.getElementById('space') as HTMLInputElement;

    let dragging = false;
    let draggingPoint = { x: 0, y: 0 };

    elementTarget.addEventListener('mousedown', function(e) {
        draggingPoint.x = e.offsetX;
        draggingPoint.y = e.offsetY;
        dragging = true;
        document.getSelection().removeAllRanges();
    });
    document.addEventListener('mouseup', () => dragging = false);
    document.addEventListener('mousemove', function(e) {
        if (dragging == false) return;
        $(elementTarget).offset({ left: e.pageX -draggingPoint.x, top: e.pageY - draggingPoint.y });
    });

    $testcase.on('click', '.actions>button', function(this: HTMLElement) {
        const location = parseInt(this.getAttribute('data-location'));
        test(location);
    });
    document.addEventListener('keydown', function(e) {
        let location = parseInt(e.key);

        if (e.key == '0') location = 10;
        else if (e.key == '-') location = 11;
        else if (e.key == '=') location = 12;

        if (isNaN(location) == true) return;
        test(location);
    });


    function test(location: number) {
        $('.box-overlay').remove();

        const element = $('<div class="box-overlay" style="left:-999px;top:-999px;width:150px;height:50px"></div>')[0];
        document.body.append(element);

        let container: DOMRect;

        if (elementCheckboxIsInContainer.checked == true) container = $body[0].getBoundingClientRectOffset();
        

        const result = intell.math.getRectWhenShowAt(
            element.getBoundingClientRectOffset(),
            elementTarget.getBoundingClientRectOffset(), location,
            {
                distanceToContainer: elementMargin.valueAsNumber,
                distance: elementSpace.valueAsNumber,
                container: container
            }
        );

        element.style.left = result.rect.left + 'px';
        element.style.top = result.rect.top + 'px';
        element.style.width = result.rect.width + 'px';
        element.style.height = result.rect.height + 'px';

        $('.overlap').text(result.overlap);

        element.addEventListener('dblclick', () => element.remove());
    }

}

