namespace apps.error {
    export const manifest: intell.portal.ApplicationManifest = {
        id: 'error',
        name: 'Error',
        description: 'Demo error while loading the application.',
        group: 'Others',
        icon: 'class://icon-bug',
        content: {
            html: '/portal/apps/error/error.html',
        },
    }

    export async function init(this: intell.portal.Application) {
        await intell.wait(1000);
        throw new Error('Hello, We got Error');
    }
}