namespace apps {
    export const portal = new intell.portal.Portal(document.querySelectorAll<HTMLElement>('.Portal')[0]);
    portal.taskbar.enableStoringCollapse();

    /* built-in features: You can store the selectedApplication state of the portal
    1. In the URL query string, for example: i.com/portal?{key}=dashboard
        > let id = portal.enableStoringSelectedApplicationInUrl();
    2. In localStorage
        > let id = portal.enableStoringSelectedApplicationInLocalStorage(); */ 

    let id = portal.enableStoringSelectedApplicationInUrl();

    portal.addManifest(apps.dashboard.manifest);

    // Another way to register an application when the manifest and post-initialization tasks are in the same file
    portal.addManifest(apps.error.manifest).addPostInitTask(apps.error.init); 
    portal.addManifest(apps.settings.manifest);
    portal.open(id); // Opens the first application that has startup set to true
}