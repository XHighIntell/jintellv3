namespace docs.page.docu {
    const currentPage = globalThis.currentPage as string; //@ts-ignore 
    if (currentPage != 'intell.ctrl.getBoundingClientRectOffset') return;

    const box = $('.box')[0];

    let dragging = false;
    let draggingPoint = { x: 0, y: 0 };

    box.addEventListener('mousedown', function(e) {
        draggingPoint.x = e.offsetX;
        draggingPoint.y = e.offsetY;
        dragging = true;

        console.log(draggingPoint);
    });
    document.addEventListener('mouseup', function() { dragging = false });
    document.addEventListener('mousemove', function(e) {
        if (dragging == false) return;
        $(box).offset({ left: e.pageX -draggingPoint.x, top: e.pageY - draggingPoint.y });
    });


    $('#buttonTest').on('click', function() {
        $('.box-overlay').remove();

        const rect = intell.ctrl.getBoundingClientRectOffset(box);
        const element = $('<div class="box-overlay"></div>')[0];

        element.style.left = rect.left + 'px';
        element.style.top = rect.top + 'px';
        element.style.width = rect.width + 'px';
        element.style.height = rect.height + 'px';

        element.addEventListener('dblclick', function() {
            element.remove();
        });

        document.body.append(element);
    });

}

