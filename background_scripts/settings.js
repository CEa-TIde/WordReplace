/**
 * Script for handling saving and loading the settings to and from local storage (of this extension)
 */


class StorageAPI {

    
    async loadAsync(keys) {
        return browser.storage.local.get(keys);
    }

    load(keys, callback = null, onError = null) {
        this.loadAsync(keys).then(callback || (_ => {}), onError || this.#onError).catch(this.#onError);
    }

    async saveAsync(keys) {
        browser.storage.local.set(keys);
    }

    save(keys, callback = null, onError = null) {
        this.saveAsync(keys).then(callback || (_ => {}), onError || this.#onError).catch(this.#onError);
    }

    #onError(e) {
        console.warn(`Error loading from/saving to local storage: ${e.message}`);
    }

    clear = () => browser.storage.local.clear();

    /**
     * Generates a new GUID (globally unique ID).
     * Implementation taken from: https://gist.github.com/jed/982883
     * @returns A new GUID.
     */
    #getGuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
}


const storageApi = new StorageAPI();

/* 
  One-time install of the extension: 
*/
browser.runtime.onInstalled.addListener(() => {
    // Create the items in the context menu
    createContextMenus();

    // Store default state in local storage
    resetStorageToDefault();
});

// Listen to message from popup
browser.runtime.onMessage.addListener(listen);


function listen(msg) {
    if (msg.type == "save") {
        // TODO save entry to storage and return uid
    } else if (msg.type == "load") {
        // TODO load entry from storage
    } else {
        console.warn(`Unknown command found of type '${msg.type}' with payload '${msg.content}'`);
    }
    // TODO: send the error back instead using sendResponse()
}

/**
 * Create all the items in the context menu used by the extension.
 */
function createContextMenus() {

    browser.menus.create({
        "id": "wrReplacePage",
        "title": "Word replace current page",
        "contexts": ["all"]
    });

    // ---  Implement replacing selected content first
    // browser.menus.create({
    //     "id": "wrReplaceSelected",
    //     "title": "Word replace selected content",
    //     "contexts": ["all"]
    // });
}

/**
 * Reset the local storage to its default state.
 */
function resetStorageToDefault() {
    storageApi.clear();
}