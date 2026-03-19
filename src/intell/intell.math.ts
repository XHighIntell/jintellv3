namespace intell.math {
    export type PointLike = { x: number, y: number };

    //#region getRectWhenShowAt
    export function getRectWhenShowAt(popup: DOMRect, at: DOMRect, location: number, option?: ShowAtOption): ShowAtResult;
    export function getRectWhenShowAt(popup: DOMRect, at: PointLike, location: number, option?: ShowAtOption): ShowAtResult;
    export function getRectWhenShowAt(popup: DOMRect, at: object, location: number, option?: ShowAtOption): ShowAtResult {
        if (at instanceof DOMRect) return getRectWhenShowAtRect.apply(null, arguments);
        else return getRectWhenShowAtPoint.apply(null, arguments); 
    }

    function getRectWhenShowAtRect(popup: DOMRect, at: DOMRect, location: number, option?: ShowAtOption): ShowAtResult {
        let distance = option?.distance ?? 0;
        let distanceToContainer = option?.distanceToContainer ?? 0;
        let container = option?.container ?? new DOMRect(-Infinity, -Infinity, Infinity, Infinity);
        let rect = new DOMRect(0, 0, popup.width, popup.height);

        let startX = 0;
        let cLeft = 0, cRight = 0;
        let distanceLeft = 0, distanceRight = 0;

        let startY = 0;
        let cTop = 0, cBottom = 0;
        let distanceTop = 0, distanceBottom = 0;

        /*      1   2   3
            12 ┌──────────┐ 4
            11 │targetRect│ 5
            10 └──────────┘ 6
                9   8   7       */

        // x
        switch (location) {
            case 1: case 9:
                startX = at.x; break;
            case 2: case 8:
                startX = at.x + (at.width - rect.width) / 2; break;
            case 3: case 7:
                startX = at.x + at.width - rect.width; break;
            case 4: case 5: case 6:
                startX = at.x + at.width + distance; break;
            case 10: case 11: case 12:
                startX = at.x - rect.width - distance; break;
        }
        switch (location) {
            case 1: case 2: case 3: case 7: case 8: case 9:
                cLeft = container.left; cRight = container.right;
                distanceLeft = distanceRight = distanceToContainer;
                break;
            case 4: case 5: case 6:
                cLeft = at.right; cRight = container.right;
                distanceLeft = distance;
                distanceRight = distanceToContainer;
                break;
            case 10: case 11: case 12:
                cLeft = container.left; cRight = at.left;
                distanceLeft = distanceToContainer;
                distanceRight = distance;
                break;
        }

        // y
        switch (location) {
            case 1: case 2: case 3:
                startY = at.y - rect.height - distance; break;
            case 4: case 12:
                startY = at.y; break;
            case 5: case 11:
                startY = at.y + (at.height - rect.height) / 2; break;
            case 6: case 10:
                startY = at.y + at.height - rect.height; break;
            case 7: case 8: case 9:
                startY = at.y + at.height + distance; break;
        }
        switch (location) {
            case 4: case 5: case 6: case 10: case 11: case 12:
                cTop = container.top; cBottom = container.bottom;
                distanceTop = distanceBottom = distanceToContainer;
                break;
            case 1: case 2: case 3:
                cTop = container.top; cBottom = at.top;
                distanceTop = distanceToContainer;
                distanceBottom = distance;
                break;
            case 7: case 8: case 9:
                cTop = at.bottom; cBottom = container.bottom;
                distanceTop = distance;
                distanceBottom = distanceToContainer;
                break;
        }

        rect.x = aa(startX, rect.width, cLeft, cRight, distanceLeft, distanceRight, container.left);
        rect.y = aa(startY, rect.height, cTop, cBottom, distanceTop, distanceBottom, container.top);
        let overlap = at.intersect(rect);

        return { location: location, rect: rect, overlap: overlap.width * overlap.height };
    }
    function getRectWhenShowAtPoint(popup: DOMRect, at: PointLike, location: number, option?: ShowAtOption): ShowAtResult {
        //@ts-ignore
        return getRectWhenShowAtRect(popup, new DOMRect(at.x ?? at.left, at.y ?? at.top, 0, 0), location, option);
    }
    function aa(x: number, width: number, cLeft: number, cRight: number, paddingLeft: number, paddingRight: number, min: number): number {
        let cWidth = cRight - cLeft;

        if (isNaN(cLeft)) cLeft = -Infinity;
        if (isNaN(cRight)) cRight = Infinity;
        if (isNaN(cWidth)) cWidth = Infinity;
        if (isNaN(min)) min = -Infinity;

        /*             x
                       ↓
            ├──────────┼─────────┼────────┤
            ↑          └────↓────┘        ↑
          cLeft           width         cRight  
       padding-left                  padding-right    */


        if ((x - paddingLeft >= cLeft) && (x + width + paddingRight <= cRight)) return x; // perfect
        else if (cWidth <= width) {
            let result = x;
            if (result + width > cRight) result = cRight - width;

            return Math.max(min, result);
        }
        else if (cWidth <= width + paddingLeft + paddingRight) return cLeft + (cWidth - width) / (paddingLeft + paddingRight) * paddingLeft;
        else {
            // we have enough space for (distance + rect + distance)

            if (x + width + paddingRight > cRight) return cRight - paddingRight - width;
            else if (x - paddingLeft < cLeft) return cLeft + paddingLeft;
            else return x;
        }
    }

    /** The ShowAt option; this is used to calculate the placement position. */
    export interface ShowAtOption {
        /** The rectangle within which the popup must be placed. */
        container?: DOMRect;

        /** The minimum distance between the popup and the target. */
        distance?: number;

        /** The minimum distance between the popup and the container. */
        distanceToContainer?: number;
    }

    /** The result for calculating show at method. */
    export interface ShowAtResult {
        /** The location type, from 1 to 12. */
        location: number;

        /** The rectangle where the popup should be displayed. */
        rect: DOMRect;

        /** The overlap area of the result; lower values indicate better performance.  */
        overlap: number;
    }
    //#endregion


    /** Returns the value of a number rounded to the nearest number that has the same decimal points. */
    export function round(x?: number | string, decimal: number = 0): number | undefined {
        if (x == null) return undefined;
        if (typeof x == 'string') x = parseFloat(x);
        if (decimal == 0) return Math.round(x);

        return Math.round(x * (10 ** decimal)) / (10 ** decimal);
    }

    
}