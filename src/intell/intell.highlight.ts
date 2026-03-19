namespace intell.highlight {

    export interface HighlightRule {
        className: string;
        regexp: RegExp;
    }
    export interface MatchResult {
        start: number;
        end: number;
        rule: HighlightRule;
    }

    /** Gets the highlight details for the specified text and rules. */
    export function getDetails(text: string, rules: HighlightRule[]) {
        const matchResults: MatchResult[] = [];

        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i]
            let regexp = rule.regexp;

            if (regexp.hasIndices == false) {
                regexp = new RegExp(regexp.source, regexp.flags + 'd');
            }

            const matches = [...text.matchAll(regexp)];

            matches.forEach(match => {
                if (match.indices.length == 1) {
                    matchResults.push({
                        start: match.indices[0][0],
                        end: match.indices[0][1],
                        rule: rule,
                    });
                }
                else {
                    matchResults.push({
                        start: match.indices[1][0],
                        end: match.indices[1][1],
                        rule: rule,
                    });
                }
                
            });

        }

        return removeOverlap(matchResults).sort((a, b) => a.start - b.start);
    }

    export function highlight(text: string, rules: HighlightRule[]): Node[] {
        const details = getDetails(text, rules);
        const output = text.split('');

        for (let i = details.length - 1; i >= 0; i--) {
            const detail = details[i];            
            const searchValue = output.slice(detail.start, detail.end);

            output.splice(detail.start, detail.end - detail.start, `<span class="${detail.rule.className}">${searchValue.join('')}</span>`);
        }

        return $$$(output.join(''), true);
    }

    export function createRangeFromCaretOffset(element: HTMLElement, offset: number): Range {

        if (offset == 0) {
            const range = document.createRange();
            range.setStart(element, 0);
            return range;
        }

        let current = 0;
        const textNodes = flatTextNode(element);

        for (let i = 0; i < textNodes.length; i++) {
            const node = textNodes[i]
            const data = node.data;
            
            if (current + data.length >= offset) {
                const range = document.createRange();
                range.setStart(node, offset - current);
                return range;
            }
            else {
                current += data.length;
            }
        }

        throw new RangeError(`The offset ${offset} is greater than the total character length of all child nodes.`);
        //range.set
    }

    export function getCaretOffset(element: HTMLElement) {
        const selection = getSelection();
        const range = selection.getRangeAt(0);
        const bits = element.compareDocumentPosition(range.startContainer);

        if ((bits & 2) == 2) {
            // The current caret position is located before the element
            const clone = range.cloneRange();
            clone.setStart(range.startContainer, range.startOffset);
            clone.setEnd(element, 0);
            //selection.removeAllRanges(); selection.addRange(clone);

            return -clone.toString().length;
        }
        else if ((bits & 4) == 4) {
            // The current caret position is located after the element
            const clone = range.cloneRange();
            clone.setStart(element, 0);
            clone.setEnd(range.startContainer, range.startOffset);
            //selection.removeAllRanges(); selection.addRange(clone);

            return clone.toString().length;
        }
        else if (bits == 0) return 0;
    }

    function flatTextNode(element: HTMLElement): Text[] {
        return flatNodes([element]).filter(node => node instanceof Text == true) as Text[];
    }
    function flatNodes(nodes: Node[]): Node[] {
        return nodes.flatMap(a => [a, ...flatNodes([...a.childNodes])]);
    }

    /** Checks whether two results overlap. */
    function isMatchOverlap(a: MatchResult, b: MatchResult) {
        let start = Math.max(a.start, b.start);
        let end = Math.min(a.end, b.end);

        return end - start >= 1;
    }

    /** This method mutates the array and returns a reference to the same array. */
    function removeOverlap(results: MatchResult[]) {
        for (let i = results.length - 1; i >= 0; i--) {

            for (let j = 0; j < i; j++) {
                let before = results[j];
                let after = results[i];

                if (isMatchOverlap(before, after) == true) {
                    results.splice(i, 1); i--;
                    break;
                }
            }
        }

        return results;
    }

    function aa() {
        getDetails('5h 30m', [
            { className: 'H', regexp: /\d*\.?\d*(h)/gd },
            { className: 'M', regexp: /\d*\.?\d*(m)/gd },
            { className: 'M', regexp: /\d*m/gd },
        ]);
        highlight('5h 30m', [
            { className: 'H', regexp: /\d*\.?\d*(h)/gd },
            { className: 'M', regexp: /\d*\.?\d*(m)/gd },
            { className: 'M', regexp: /\d*m/gd },
        ]);
    }
}