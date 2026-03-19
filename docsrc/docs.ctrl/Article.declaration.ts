namespace docs.ctrl {
    export interface ArticlePrivate {
        element: HTMLElement;
        elementIcon: HTMLElement;
        elementName: HTMLElement;
        elementChildren: HTMLElement;
        elementContent?: HTMLElement;

        id?: string;
        icon?: string;
        name: string;
        url?: string;
        hidden: boolean;
        tags: string[];

        children: Article[];
        status: 'NONE' | 'LOADING' | 'FAILED' | 'LOADED';
        error?: Error;

        loadingPromise?: Promise<HTMLElement>;

    }
}