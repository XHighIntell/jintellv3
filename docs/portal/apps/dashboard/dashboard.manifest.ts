namespace apps.dashboard {
    export const manifest: intell.portal.ApplicationManifest = {
        id: 'dashboard',
        name: 'Dashboard',
        description: 'Welcome the portal...',
        title: "Quick summary of your account",
        icon: 'class://icon-home-1',
        content: {
            html: '/portal/apps/dashboard/dashboard.html',
            js: ['/portal/apps/dashboard/dashboard.js'],
            css: ['/portal/apps/dashboard/dashboard.css'],
        },
        startup: true,
    }
}