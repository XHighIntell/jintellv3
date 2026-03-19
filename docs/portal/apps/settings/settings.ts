namespace apps.settings {
    const application = portal.get('settings');

    application.addPostInitTask(async function () {
        await intell.wait(500000);
    });
}