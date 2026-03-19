namespace apps {
    export const portal = new intell.portal.Portal(document.querySelectorAll<HTMLElement>('.Portal')[0]);
    portal.taskbar.enableCollapseStorage('portal.taskbar.collapsed');

    portal.addManifest(apps.dashboard.manifest);

    // Another way to register an application when the manifest and post-initialization tasks are in the same file
    portal.addManifest(apps.error.manifest).addPostInitTask(apps.error.init); 
    portal.addManifest(apps.settings.manifest);
    portal.open(); // Opens the first application that has startup set to true
}