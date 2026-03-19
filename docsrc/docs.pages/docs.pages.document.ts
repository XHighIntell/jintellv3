namespace docs.page.docu {
    const currentPage = globalThis.currentPage as string; //@ts-ignore 
    if (currentPage != 'document') return;
    const $docs_tree = $('.docs-tree');

    export namespace titlebar {
        const $themes = $('.app-title-bar .themes');
        export declare let theme: string; let _theme: string;

        const LOCALSTORAGE_THEME_KEY = 'theme';

        intell.ctrl.template.defineProperties(titlebar, {
            theme: {
                get() { return _theme },
                set(newValue) {
                    // remove previous theme
                    if (_theme != null) document.body.classList.remove(_theme);

                    _theme = newValue;
                    document.body.classList.add(_theme);
                    localStorage.setItem(LOCALSTORAGE_THEME_KEY, _theme);

                    $themes.find('.theme').removeClass('selected');
                    $themes.find(`.theme[data-theme=${_theme}]`).addClass('selected');
                }
            }
        });

        function loadFromLocalStorage(): boolean {
            const value = localStorage.getItem(LOCALSTORAGE_THEME_KEY);

            if (value != null) theme = value;
            return value != null;
        }

        $themes.on('click', '.theme', (e) => {
            const element = (e.originalEvent.target as HTMLElement).closest('.theme');

            titlebar.theme = element.getAttribute('data-theme');
        });

        if (loadFromLocalStorage() == false)
            titlebar.theme = $themes.find('.theme.selected')[0]?.getAttribute('data-theme');
    }
    export namespace filters {
        const $filters = $docs_tree.find('.filters');

        $filters.on('click', '.filter', function(e) {
            const target = e.originalEvent.target as HTMLElement;
            const element = target.closest('.filter') as HTMLElement;
            const name = element.getAttribute('data-filter');
            const checked = element.classList.toggle('checked');
            
            toggle(name, checked);
        });

        export function toggle(name: string, force: boolean) {
            const flats = ctrl.Article.flatArticles(articles);
            const matched_articles = flats.filter(a => a.containsTag(name));

            matched_articles.forEach(a => a.element.hidden = !force);
        }
        export function init() {
            $filters.find('>.filter').toArray().forEach(function(element) {
                const name = element.getAttribute('data-filter');
                const checked = element.classList.contains('checked');

                toggle(name, checked);
            });
        }
    }
    export namespace treeview {
        /** Gets or sets selected article. */
        export declare let value: ctrl.Article; let _value: ctrl.Article;

        

        intell.ctrl.template.defineProperties(treeview, {
            value: {
                get: function() { return _value },
                set: function(newValue) {
                    // 1. do nothing
                    // 2. Removes the selected class from the previously selected article
                    // 3.

                    // --1--
                    if (newValue == _value) return;

                    // --2--
                    _value?.element.classList.remove('selected');

                    _value = newValue;
                    _value?.element.classList.add('selected');
                    //if (_value != null) _value.element.hidden = false;
                },
            }
        });

        export async function add(articles: ctrl.Article[]) {
            const elements = articles.map(article => article.element);

            $docs_tree.append(elements);
        }

        $docs_tree.on('click', '.item>.label', async function(ev) {
            const e = ev.originalEvent;
            const element = (e.target as HTMLElement).closest<HTMLElement>('.item');
            const article = docs.ctrl.Article.getItem(element);

            if (article.id == null) return;

            openByArticle(article, true);
        });
    }
    export namespace details {
        /** Gets or sets selected article. */
        export declare let value: ctrl.Article; let _value: ctrl.Article;

        const $docs_content = $('.docs-content');
        const $error_overlay = $docs_content.find('.error-overlay').remove().show();
        const $error_overlay_message = $error_overlay.find('.message');

        intell.ctrl.template.defineProperties(details, {
            value: {
                get: function() { return _value },
                set: function(newValue) {
                    _value = newValue;

                    if (treeview.value == _value) {
                        $docs_content.append(_value.elementContent);
                        $(_value.elementContent).find('script').remove();
                    }
                },
            }
        });

        export function startWait() { $docs_content[0].replaceChildren(); ctrl.startWait($docs_content[0]); }
        export function stopWait() { ctrl.stopWait($docs_content[0]); }
        export function showError(error: Error) {
            $error_overlay_message.text(error.message);
            $docs_content.append($error_overlay);
        }
    }

    async function openById(id: string, pushState: boolean) {
        const flats = ctrl.Article.flatArticles(articles);
        const article = flats.find(a => a.id == id);

        await openByArticle(article, pushState);
    }
    async function openByArticle(article: ctrl.Article, pushState: boolean) {
        if (article == null) return;
        if (treeview.value == article) return;
        if (pushState == true) history.pushState(article.id, article.name, '?q=' + article.id);
        
        treeview.value = article;
        details.value = null;

        try {            
            details.startWait();
            await article.load();
            details.value = article;
        }
        catch (e) {
            const error = e as Error;
            if (treeview.value == article) {
                details.showError(error);
                console.error(error);
            }
        }
        finally {
            details.stopWait();
        }
    }

    $(document).on('click', 'a[href]', function(e) {
        const element = (e.originalEvent.target as HTMLElement).closest('a') as HTMLAnchorElement;
        const href = new URL(element.href, location as any);

        if (href.search.startsWith('?q=') == true) {
            const id = intell.qs(href.search.substring(1)).q as string;
            if (id == null) return;

            openById(id, true);
            e.originalEvent.preventDefault();
        }
    });

    window.addEventListener('popstate', function(event) {
        const qs = intell.qs();
        openById(qs.q, false);
    });

    (async () => {
        treeview.add(await getArticles());
        filters.init();

        const qs = intell.qs();
        openById(qs.q ?? 'getting-started', false);
    })();
}

