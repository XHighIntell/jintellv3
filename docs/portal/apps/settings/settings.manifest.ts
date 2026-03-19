namespace apps.settings {
    export const manifest: intell.portal.ApplicationManifest = {
        id: 'settings',
        name: 'Settings',
        description: 'Manages your account',
        group: 'Others',
        icon: 'class://icon-cog',
        content: {
            html: '/portal/apps/settings/settings.html',
            js: ['/portal/apps/settings/settings.js']
        },
    }
}