namespace apps.dashboard {
    const application = portal.get('dashboard');
    const root = application.elementRoot;

    export namespace files {
        const elementSection = root.querySelector('.sourcecode');

        export function getOrCreateGroup(group?: string) {
            group ??= '';

            let element = elementSection.querySelector(`[data-group="${group}"]`)
            if (element != null) return element;

            return intell.$$$(`<div class="group-members group-files" data-group="${group}">
    <div class="title">${group}</div>
    <div class="members"></div>
</div>`)[0].appendTo(elementSection);
        }

        export async function add(icon: string, name: string, url: string, group?: string) {
            const response = await fetch(url);
            const text = await response.text();

            const elementGroup = getOrCreateGroup(group);
            const elementGroupMembers = elementGroup.querySelector('.members');

            const element = intell.$$$(`<div class="item-member item-file">
            <div class="item-member-header">
                <div class="label">
                    <i class="icon ${icon}"></i>
                    <div class="name">${name}</div>
                </div>
            </div>
            <div class="item-member-body"></div>`)[0];
            const elementBody = element.querySelector('.item-member-body');
            elementBody.append(document.createTextNode(text));


            if (name.endsWith('.ts') == true) elementBody.classList.add('language-typescript');

            //@ts-ignore
            hljs.highlightElement(elementBody);

            elementGroupMembers.append(element);
        }

        elementSection.addEventListener('click', e => {
            const target = e.target as HTMLElement;
            const element = target.closest('.label')?.closest('.item-member');

            if (element != null) {
                element.classList.toggle('expanded');
            }
        });
    }

    
    application.addPostInitTask(async function () {
        await files.add('icon-html-file', 'index.html', 'index.html');
        await files.add('icon-ts-file', 'entry.ts', 'entry.ts');
        await files.add('icon-stylesheet', 'portal.css', 'portal.css');

        await files.add('icon-html-file', 'apps/dashboard/dashboard.html', 'apps/dashboard/dashboard.html', 'Dashboard Application');
        await files.add('icon-stylesheet', 'apps/dashboard/dashboard.css', 'apps/dashboard/dashboard.css', 'Dashboard Application');
        await files.add('icon-ts-file', 'apps/dashboard/dashboard.ts', 'apps/dashboard/dashboard.ts', 'Dashboard Application');
        await files.add('icon-ts-file', 'apps/dashboard/dashboard.manifest.ts', 'apps/dashboard/dashboard.manifest.ts', 'Dashboard Application');

        await files.add('icon-html-file', 'apps/error/error.html', 'apps/error/error.html', 'Error Application');
        await files.add('icon-ts-file', 'apps/error/error.ts', 'apps/error/error.ts', 'Error Application');

        await files.add('icon-html-file', 'apps/settings/settings.html', 'apps/settings/settings.html', 'Settings Application');
        await files.add('icon-ts-file', 'apps/settings/settings.ts', 'apps/settings/settings.ts', 'Settings Application');
        await files.add('icon-ts-file', 'apps/settings/settings.manifest.ts', 'apps/settings/settings.manifest.ts', 'Settings Application');
        
    });
}