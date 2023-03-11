/**
 * Script for handling saving and loading the settings to and from local storage (of this extension)
 */


class StorageAPI {

    
    async load(keys) {
        return browser.storage.local.get(keys);
    }


    async save(keys) {
        browser.storage.local.set(keys);
    }
}


const storageAPI = new StorageAPI();