namespace docs {
    export let articles: ctrl.Article[];

    /** Fetchs all articles; if it is not yet loaded, attempts to load it. */
    export async function getArticles(): Promise<ctrl.Article[]> {
        if (articles != null) return articles;

        const text = await (await fetch('/article/all.json')).text();
        const raws = parseJSON(text) as ctrl.Article[];

        return articles = raws.map(raw => new ctrl.Article(raw));
    }

    /** Parses a JSON string into an object, with support for comments and trailing commas. */
    export function parseJSON(text: string) {
        const cleaned = text
            .replace(/\/\/.*/g, '') // Remove comments
            .replace(/,\s*([}\]])/g, '$1') // Remove commas before closing braces/brackets
            .trim();

        return JSON.parse(cleaned);
    }

    /** Removes all unnecessary whitespace from code text. */
    export function trimIndents(code: string) {
        let lines = code.split(/(?:\n)|(?:\r\n)/);
        let spaces = lines.map(value => {
            if (value.trim() == "") return 999;
            return countSpaceStartWith(value);
        });

        const min = Math.min.apply(Math, spaces)

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let numberOfSpace = spaces[i];

            if (numberOfSpace >= min) lines[i] = line.slice(min);
        }

        return lines.join('\n').trim();
    }

    function countSpaceStartWith(line: string) {
        var count = 0;
        for (var i = 0; i < line.length; i++) {
            if (line[i] == ' ') count++;
            else return count;
        }
        return count;
    }


    const originalTs = window.hljs?.getLanguage('TypeScript');

    window.hljs?.registerLanguage('TypeScript', function(hljsInstance) {
        const ts = { ...originalTs };

        ts.contains.push(
            { className: 'title.class', begin: /(?<=< *)\w+(?= *>)/ }, // class<T>
            { className: 'title.function', begin: /^\w+(?=\()/, },           
        );

        return ts;
    });
}