namespace docs.ctrl {
    export class Article {
        constructor(data?: Partial<Article>) {
            const element = $(`
<div class="item">
    <div class="label">
        <div class="icon"></div>
        <div class="name"></div>
    </div>
    <div class="children"></div>
</div>`)[0];

            let elementIcon = element?.querySelector<HTMLElement>(':scope>.label>.icon');
            let elementName = element?.querySelector<HTMLElement>(':scope>.label>.name');
            let elementChildren = element?.querySelector<HTMLElement>(':scope>.children');

            Article.setItem(element, this);

            const __private = this.getPrivate({ status: 'NONE' });
            __private.element = element;
            __private.elementName = elementName;
            __private.elementIcon = elementIcon;
            __private.elementChildren = elementChildren;
            __private.hidden = false;
            __private.tags = [];
            __private.children = [];

            if (data != null) {
                Object.assign(__private, data);
                if (data.children != null) __private.children = data.children.map(child => new Article(child));
            }

            if (__private.id) element.setAttribute('data-id', __private.id);
            elementIcon.classList.add(`icon-${__private.icon ?? 'none'}`);
            elementName.textContent = __private.name;
            element.hidden = __private.hidden;
            __private.children.forEach(child => elementChildren.append(child.element));
        }

        //#region properties
        get element() { return this.getPrivate().element }
        get elementIcon() { return this.getPrivate().elementIcon }
        get elementName() { return this.getPrivate().elementName }
        get elementChildren() { return this.getPrivate().elementChildren }
        get elementContent() { return this.getPrivate().elementContent }

        get id() { return this.getPrivate().id }
        set id(newValue) { this.getPrivate().id = newValue }

        get icon() { return this.getPrivate().icon }
        set icon(newValue) { this.getPrivate().icon = newValue }

        get name() { return this.getPrivate().name }
        set name(newValue) { this.getPrivate().name = newValue }

        get url() { return this.getPrivate().url }
        set url(newValue) { this.getPrivate().url = newValue }

        get hidden() { return this.getPrivate().hidden }
        set hidden(newValue) { this.getPrivate().hidden = newValue }

        get children() { return this.getPrivate().children }

        get status() { return this.getPrivate().status }
        set status(newValue) { this.getPrivate().status = newValue }

        error?: Error;
        //#endregion

        //#region methods
        getAbsoluteUrl(): string | undefined {
            // create absolute url from url or id
            // 1. from url
            // 2. from id

            // --1--
            if (this.url != null) return `/article/${this.url}`;

            // --2--
            if (this.id != null) {
                const id = this.id;
                const parts = id.split('.');

                if (parts.length == 1) return `$/article/${id}.json`;
                else {
                    const dir = parts.slice(0, parts.length - 1).join('.');
                    const name = parts[parts.length - 1];
                    return `/article/${dir}/${name}.json`;
                }
            }

        }

        /** Returns the content; if it is not yet loaded, attempts to load it. */
        async load(): Promise<HTMLElement> {
            const __private = this.getPrivate();
            if (__private.elementContent != null) return __private.elementContent;

            if (__private.status == "NONE") {
                try {
                    __private.status = "LOADING";
                    const task = __private.loadingPromise = internalLoad.apply(this);
                    await task;
                    __private.status = "LOADED";
                    return __private.elementContent;
                }
                catch (error) {
                    __private.error = error;
                    __private.status = "FAILED";

                    throw error;
                }
            }
            else if (__private.status == "LOADING") return __private.loadingPromise;
            else if (__private.status == "LOADED") return __private.elementContent;
            else if (__private.status == "FAILED") return __private.loadingPromise;


            /** This method doesn't update status.  */
            async function internalLoad(this: Article): Promise<HTMLElement> {
                const absoluteUrl = this.getAbsoluteUrl();
                if (absoluteUrl == null) throw new Error("This article does not contain any content.");

                const response = await (async () => {
                    try {
                        return await fetch(absoluteUrl);
                    }
                    catch {
                        throw new Error("ERR_INTERNET_DISCONNECTED");
                    }
                })();
                if (response.status != 200) throw new Error(`Server responded with an HTTP error: ${response.status} – ${response.statusText}.`);
                const contentType = response.headers.get('content-type');

                if (contentType?.indexOf('text/html') !== -1) {
                    const html = await response.text();
                    const $root = $(`<div class="article"></div>`).append(html);
                    __private.elementContent = $root[0];
                    __private.elementContent.setAttribute('data-id', this.id);
                }
                else if (contentType?.indexOf('application/json') !== -1) {
                    const text = await response.text();
                    const json = parseJSON(text);

                    __private.elementContent = Article.displayArticle(json);
                }
                else throw new Error("Unknow content type.");

                this.#onLoadCompleted();

                return __private.elementContent;
            }
        }

        /** Checks whether the article contains a specified tag. */
        containsTag(tag: string): boolean {
            const __private = this.getPrivate();
            return __private.tags.indexOf(tag) != -1;
        }

        //#endregion

        #onLoadCompleted() {
            const __private = this.getPrivate();
            const elementContent = __private.elementContent;
            const $elementContent = $(__private.elementContent);

            $elementContent.on('click', '.code-block .code-block-header', function(this: HTMLElement) {
                this.closest<HTMLElement>('.code-block').classList.toggle('expanded');
            });
            $elementContent.on('click', '.item-member.item-property>.item-member-header', function(this: HTMLElement) {
                this.closest<HTMLElement>('.item-member').classList.toggle('expanded');
            });
            $elementContent.on('click', '.item-member.item-field>.item-member-header', function(this: HTMLElement) {
                this.closest<HTMLElement>('.item-member').classList.toggle('expanded');
            });
            $elementContent.on('click', '.item-member.item-event>.item-member-header', function(this: HTMLElement) {
                this.closest<HTMLElement>('.item-member').classList.toggle('expanded');
            });
            $elementContent.on('click', '.item-member.item-method>.item-member-header', function(this: HTMLElement) {
                this.closest<HTMLElement>('.item-member').classList.toggle('expanded');
            });
            $elementContent.on('click', '.theme-switch .theme', function(this: HTMLElement) {
                const $themes = $(this.closest('.theme-switch'));
                const target = this.closest('.theme');
                const _theme = target.getAttribute('data-theme');

                $themes.find('.theme').removeClass('selected');
                $themes.find(`.theme[data-theme="${_theme}"]`).addClass('selected');

                const event = new CustomEvent('article-theme-change', { cancelable: false, bubbles: true, detail: { name: _theme } });
                $themes[0].dispatchEvent(event);
            });

            elementContent.querySelectorAll('.code-block').forEach(element => {
                const $element = $(element as HTMLElement);
                let $body = $element.find('.code-block-body'); if ($body.length == 0) $body = $('<div class="code-block-body"></div>').appendTo($element);
                const elementBody = $body[0];

                // 1. looking for data-source-id & update body
                // 2. trim indents and highlight the body

                // --1--
                const sourceId = element.getAttribute('data-source-id');
                if (sourceId != null) {
                    const $source = $elementContent.find(`[data-source="${sourceId}"]`);
                    $body.text($source.html());
                }

                // --2--
                elementBody.innerHTML = docs.trimIndents(elementBody.innerHTML);
                (hljs as any).highlightElement(elementBody);
            });
            elementContent.querySelectorAll('.code-box').forEach(element => {
                element.innerHTML = docs.trimIndents(element.innerHTML);

                //@ts-ignore
                hljs.highlightElement(element);
            });

        }

        //@ts-ignore
        declare getPrivate(def?: Partial<ArticlePrivate>): ArticlePrivate;

        //@ts-ignore
        declare static getItem(element: HTMLElement): Article; //@ts-ignore
        declare static setItem(element: HTMLElement, control: Article): Article;

        static flatArticles(articles: ctrl.Article[]): ctrl.Article[] {
            return articles.flatMap(a => [a, ...Article.flatArticles(a.children)]);
        }

        /** Display text
         * @returns Returns an empty array if the text is null or an empty string. */
        static displayText(text?: Name): (Text | HTMLElement)[] {
            if (text == null) return [];

            //@ts-ignore
            const texts: string[] = Array.isArray(text) ? text.flat(Infinity) : [text];
            const element = document.createElement('div');
            element.innerHTML = texts.join('');

            return [...element.childNodes] as any;
        }
        static displayType(name?: string, node?: Type): HTMLElement | undefined {
            if (name == null && node == null) return;

            let type: string;
            let href: string;

            if (typeof node == "string") type = node;
            else {
                type = node?.name;
                href = node?.href;
            }

            const $element = $(`<div class="item-member-type"></div>`);
            if (name) $(`<div class="name">${name}</div>`).appendTo($element);
            if (type) {
                const $type = $(`<a class="type language-typescript">${type}</a>`).appendTo($element);
                $type.attr('href', href);

                //@ts-ignore
                hljs.highlightElement($type[0]);
            }

            return $element[0];
        }
        static displayDescription(description?: Name): HTMLElement | undefined {
            if (description == null) return;

            return $('<div class="description">').append(this.displayText(description))[0];
        }

        static displayArticle(article: ArticleData): HTMLElement {
            const $article = $(`
<div class="article">
    <div class="title">${article.title ?? ''}</div>
</div>`);
            $article.attr('data-kind', article.kind);
            $article.append(this.displayDescription(article.description));
            $article.append(this.displayConstructors(article.constructors));
            $article.append(this.displayProperties(article.properties));
            $article.append(this.displayFields(article.fields));
            $article.append(this.displayEvents(article.events));
            $article.append(this.displayMethods(article.methods));
            $article.append(this.displayStaticFields(article.static_fields));
            $article.append(this.displayStaticMethods(article.static_methods));
            $article.append(this.displayExamples(article.examples));
            $article.append(this.displayText(article.after));

            return $article[0];
        }

        static displayConstructors(methods?: Method[]): HTMLElement | undefined {
            if (methods == null || methods.length == 0) return;

            const $element = $(`<div class="group-members group-constructors"><div class="title">Constructors</div></div>`);
            const $members = $('<div class="members"></div>').appendTo($element);

            $members.append(methods.map(method => this.displayMethod(method)));

            return $element[0];
        }
        
        static displayProperties(properties?: Property[]): HTMLElement | undefined {
            if (properties == null || properties.length == 0) return;

            const $element = $(`<div class="group-members group-properties"><div class="title">Properties</div></div>`);
            const $members = $('<div class="members"></div>').appendTo($element);

            $members.append(properties.map(property => this.displayProperty(property)));

            return $element[0];
        }
        static displayProperty(property: Property, icon: string = 'property'): HTMLElement {
            const $element = $(`<div class="item-member item-${icon}"></div>`);
            const $header = $(`<div class="item-member-header">
    <div class="label">
        <i class="icon icon-${icon}"></i>
        <div class="name language-typescript"></div>
    </div>
</div>`).appendTo($element);
            const $headerName = $header.find('.name').append(this.displayText(property.name));
            const $body = $('<div class="item-member-body"></div>').appendTo($element);

            $body.append(this.displayType(null, property.type));
            $body.append(this.displayDescription(property.description));
            $body.append(this.displayRemarks(property.remarks));

            (hljs as any).highlightElement($headerName[0]);

            return $element[0];
        }

        static displayFields(properties?: Property[]): HTMLElement | undefined {
            if (properties == null || properties.length == 0) return;

            const $element = $(`<div class="group-members group-fields"><div class="title">Fields</div></div>`);
            const $members = $('<div class="members"></div>').appendTo($element);

            $members.append(properties.map(property => this.displayProperty(property, 'field')));

            return $element[0];
        }

        static displayEvents(events?: Event[]): HTMLElement | undefined {
            if (events == null || events.length == 0) return;

            const $element = $(`<div class="group-members group-events"><div class="title">Events</div></div>`);
            const $members = $('<div class="members"></div>').appendTo($element);

            $members.append(events.map(event => this.displayEvent(event)));

            return $element[0];
        }
        static displayEvent(event?: Event): HTMLElement | undefined {
            if (event == null) return;

            const $element = $(`<div class="item-member item-event"></div>`);
            const $header = $(`<div class="item-member-header"><div class="label"><i class="icon icon-event"></i><div class="name"></div></div></div>`).appendTo($element);
            const $body = $('<div class="item-member-body"></div>').appendTo($element);

            $header.find('.name').append(this.displayText(event.name));

            $body.append(this.displayEventTags(event.bubbles, event.cancelable));
            $body.append(this.displayDescription(event.description));

            return $element[0];
        }
        static displayEventTags(bubbles?: boolean, cancelable?: boolean): HTMLElement | undefined {
            if (bubbles == null && cancelable == null) return;

            const $element = $(`<div class="event-tags"></div>`);
            if (bubbles != null) $(`<div class="tag"><span class="name">bubbles</span>: <span class="value">${bubbles}</span></div>`).appendTo($element);
            if (cancelable != null) $(`<div class="tag"><span class="name">cancelable</span>: <span class="value">${cancelable}</span></div>`).appendTo($element);

            return $element[0];
        }

        static displayMethods(methods?: Method[]): HTMLElement | undefined {
            if (methods == null || methods.length == 0) return;

            const $element = $(`<div class="group-members group-methods"><div class="title">Methods</div></div>`);
            const $members = $('<div class="members"></div>').appendTo($element);

            $members.append(methods.map(method => this.displayMethod(method)));

            return $element[0];
        }
        static displayOverloads(overloads?: Method[]): HTMLElement | undefined {
            if (overloads == null || overloads.length == 0) return;

            const $element = $(`<div class="group-members group-overloads"><div class="title">Overloads</div></div>`);
            const $members = $('<div class="members"></div>').appendTo($element);

            $members.append(overloads.map(method => this.displayMethod(method)));

            return $element[0];
        }
        static displayMethod(method?: Method): HTMLElement | undefined {
            if (method == null) return;

            const $element = $(`<div class="item-member item-method"></div>`);
            const $header = $(`<div class="item-member-header">
    <div class="label">
        <i class="icon icon-method"></i>
        <div class="name language-typescript"></div>
    </div>
</div>`).appendTo($element);
            const $headerName = $header.find('.name').append(this.displayText(method.name));
            const $body = $('<div class="item-member-body"></div>').appendTo($element);

            $body.append(this.displayDescription(method.description));
            $body.append(this.displayOverloads(method.overloads));
            $body.append(this.displayMethodParameters(method.parameters));
            $body.append(this.displayReturns(method.returns));
            $body.append(this.displayRemarks(method.remarks));

            (hljs as any).highlightElement($headerName[0]);

            return $element[0];
        }
        static displayMethodParameters(parameters?: Property[]): HTMLElement | undefined {
            if (parameters == null) return;
            if (parameters.length == 0) return;

            const $element = $(`<div class="group-members group-parameters"><div class="title">Parameters</div></div>`);
            const $members = $('<div class="members"></div>').appendTo($element);
            $members.append(parameters.map(item => this.displayMethodParameter(item)));

            return $element[0];
        }
        static displayMethodParameter(parameter: Property): HTMLElement {
            const $element = $(`<div class="item-member item-parameter"></div>`);

            $element.append(this.displayType(parameter.name, parameter.type));
            $element.append(this.displayDescription(parameter.description));

            // method.parameter should not have remarks

            return $element[0];
        }
        static displayReturns(returns?: Method["returns"]): HTMLElement | undefined {
            if (returns == null) return;

            const $element = $(`<div class="group-members returns"><div class="title">Returns</div></div>`);

            if (typeof returns == 'object') {
                const o = returns as { type: Type, description: Name };
                
                $element.append(this.displayType(null, o.type));
                $element.append(this.displayDescription(o.description));
            }
            else {
                $element.append(this.displayDescription(returns));
            }

            return $element[0];
        }
        static displayRemarks(remarks?: Name): HTMLElement | undefined {
            if (remarks == null) return;

            const $element = $(`<div class="group-members remarks"><div class="title">Remarks</div></div>`);
            $element.append(this.displayText(remarks));

            return $element[0];
        }
        static displayExamples(examples: Name): HTMLElement | undefined {
            if (examples == null) return;

            const $element = $(`<div class="group-members examples"><div class="title">Examples</div></div>`);
            $element.append(this.displayText(examples));

            return $element[0];
        }

        static displayStaticFields(properties?: Property[]): HTMLElement | undefined {
            if (properties == null || properties.length == 0) return;

            const $element = $(`<div class="group-members group-static-fields"><div class="title">Static Fields</div></div>`);
            const $members = $('<div class="members"></div>').appendTo($element);

            $members.append(properties.map(property => this.displayProperty(property, 'field')));

            return $element[0];
        }
        static displayStaticMethods(methods?: Method[]): HTMLElement | undefined {
            if (methods == null || methods.length == 0) return;

            const $element = $(`<div class="group-members group-static-method"><div class="title">Static Methods</div></div>`);
            const $members = $('<div class="members"></div>').appendTo($element);

            $members.append(methods.map(method => this.displayMethod(method)));

            return $element[0];
        }

    }

    intell.ctrl.template.inherit(Article);

    type NameNode = (Text | HTMLElement) | NameNode[];
    type Name = string | Name[];
    type Type = string | { name?: string, href?: string };

    export interface Property {
        name: string;
        type: Type;
        description: Name;
        remarks: Name;
    }
    export interface Event {
        name: Name;
        bubbles?: boolean,
        cancelable?: boolean
        description: Name;
    }
    export interface Method {
        name: Name;
        description?: Name;

        overloads?: Method[];
        parameters?: Property[];
        returns?: Name | { type: Type, description: Name };
        remarks?: Name;
    }
    export interface ArticleData {
        kind: string;
        title: string;
        description: string;

        constructors?: Method[];
        properties?: Property[];
        fields?: Property[];
        events?: Event[];
        methods?: Method[];
        static_fields?: Property[];
        static_methods?: Method[];
        examples?: string;
        after: Name;
    }
}