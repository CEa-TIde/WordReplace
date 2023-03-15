/**
 * Script for handling saving and loading the settings to and from local storage (of this extension)
 */


class ErrorHandler {

    constructor(prefix) {
        this.prefix = String(prefix);
    }

    throw(err, silent = false) {
        console.error(`[${this.prefix}] ${err}`);
        if (!silent) {
            // return error to popup script to display
        }
    }

    warn(err) {
        console.warn(`[${this.prefix}] ${err}`);
    }

    log(msg) {
        console.log(`[${this.prefix}] ${msg}`)
    }
}

class StorageAPI {

    constructor() {
        this.errHandler = new ErrorHandler("Background | Storage");
    }
    
    async loadAsync(keys) {
        return browser.storage.local.get(keys);
    }

    load(keys, callback = null, onError = null) {
        this.loadAsync(keys).then(this.#withOnSuccessCallback(callback), this.#withErrCallback(onError)).catch(this.#withErrCallback(onError));
    }

    async saveAsync(keys) {
        browser.storage.local.set(keys);
    }

    save(keys, callback = null, onError = null) {
        this.saveAsync(keys).then(this.#withOnSuccessCallback(callback), this.#withErrCallback(onError)).catchthis.#withErrCallback(onError));
    }

    saveWithNewKeys(entries, callback = null, onError = null) {
        let keys = entries.map(x => {
            let keyPair = {}
            keyPair[this.#getGuidv4()] = x;
            return keyPair;
        });
        this.save(keys, callback, onError);
    }

    #withErrCallback(callback) {
        return function(err) {
            this.errHandler.warn(`Error loading from/saving to local storage: ${err.message}`);

            if (callback) callback(err);
        };
    }

    /**
     * Create callback function that will also call user-defined callback function (if provided)
     * @param {Function} callback 
     * @returns callback function
     */
    #withOnSuccessCallback(callback) {
        return function(value) {
            // do something needed in wrapper
            this.errHandler.log(`operation succeeded: ${value}`);

            // call user-defined callback
            if (callback) callback(value);

            // do something else
        };
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
const errHandler = new errHandler("Background");

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
    if (null == msg || null == msg.type || null == msg.content) {
        errHandler.warn(`message ill-formatted: msg, msg.type, or msg.content is null: ${msg}`);
    }
    switch(msg.type) {
        case "save":
            // Save entry to storage and return uid
            break;
        case "load":
            // Load entry from storage
            break;
        case "loadall":
            // Load all entries
            break;
        case "delete":
            break;
        default:
            console.warn(`Unknown command found of type '${msg.type}' with payload '${msg.content}'`);
    }
    // TODO: send the error back instead using sendResponse()
}

/**
 * Create all the items in the mouse context menu used by the extension.
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