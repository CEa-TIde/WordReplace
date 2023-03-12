// Script for displaying and handling the popup interactions.
// It saves and loads the data by communicating with the background script.
// Running the replacement operation is done by sending a message to the content script.


/**
 * Class for handling the creation and deletion of regex entries.
 */
class HtmlHandler {

    constructor() {
        // get all elements needed from DOM.
        this.entryListEl = document.querySelector(".entry-list");
        if (null == this.entryListEl) return null;

        let entryForm = document.querySelector(".add-entry");
        if (null == entryForm) return null;

        this.entryFormRgx = entryForm.querySelector("input[name=regexexpr");
        this.entryFormFlgs = entryForm.querySelector("input[name=regexflags]");
        this.entryFormValue = entryForm.querySelector("input[name=replacevalue]");
        if (null == this.entryFormRgx || null == this.entryFormFlgs || null == this.entryFormValue) {
            return null;
        }
    }

    /**
     * Get all the current entries as regex-value pair objects.
     * Format regex-value pair => {s: [regex], r: [value]}
     */
    get entries() {
        console.log(this.entryListEl.querySelectorAll(".wr-entry"));
        return Array.from(this.entryListEl.querySelectorAll(".wr-entry")).map(x => {
            try {
                let regexStr = x.querySelector(".entry-regex").innerHTML;
                let flgs = x.querySelector(".entry-flags").innerHTML;
                let replaceValue = x.querySelector(".entry-value").innerHTML;
                let regex = new RegExp(regexStr, flgs);
                return ({s: regex, r: replaceValue});
            }
            catch (e) {
                console.warn(`Something went wrong parsing regex entry (skipping entry): ${e.message}.`, x);
            }
        });
    }

    /**
     * Creates a new entry using the values from the form and adds it to the DOM.
     */
    addEntry() {
        try {
            let el = this.#createNewEntry(this.entryFormRgx.value, this.entryFormFlgs.value, this.entryFormValue.value);
            this.entryListEl.appendChild(el);
        }
        catch (e) {
            console.warn(`Something went wrong creating a new entry: ${e.name}: ${e.message}`);
        }
    }
    
    /**
     * Removes an entry from the entry list.
     * @param {Element} entry the entry to remove.
     */
    removeEntry(entry) {
        if (entry.remove) {
            entry.remove();
        } else {
            entry.parentElement.removeChild(entry);
        }
    }

    /**
     * Creates a new DOM element for an entry with the information from the form.
     * @param {String} regexStr the regex expression itself.
     * @param {String} regexFlags the flags to apply to the regex.
     * @param {String} replaceValue the string to replace the match with.
     * @returns a DOM element for an entry. This element is not yet added to the DOM.
     */
    #createNewEntry(regexStr, regexFlags, replaceValue) {
        this.#throwInvalid(regexStr, regexFlags, replaceValue);

        let entry = document.createElement("li");
        entry.classList.add("wr-entry");

        let expr = document.createElement("div");
        expr.classList.add("entry-expr");
        let slash1 = document.createTextNode("/");
        let slash2 = document.createTextNode("/");
        let entryRgx = document.createElement("span");
        entryRgx.innerHTML = regexStr;
        entryRgx.classList.add("entry-regex");
        let entryFlgs = document.createElement("span");
        entryFlgs.innerHTML = regexFlags;
        entryFlgs.classList.add("entry-flags");
        let larr = document.createTextNode(" → ");
        let entryVal = document.createElement("span");
        entryVal.innerHTML = replaceValue;
        entryVal.classList.add("entry-value");

        expr.appendChild(slash1);
        expr.appendChild(entryRgx);
        expr.appendChild(slash2);
        expr.appendChild(entryFlgs);
        expr.appendChild(larr);
        expr.appendChild(entryVal);

        let entryDel = document.createElement("button");
        entryDel.classList.add("entry-del");
        entryDel.innerText = "X";
        entryDel.addEventListener("click", (e) => this.removeEntry(e.target.parentElement));

        entry.appendChild(expr);
        entry.appendChild(entryDel);

        return entry;
    }

    /**
     * Check if the provided value are valid to create an entry with. It is not checked if expression itself is valid syntax.
     * Throws and error if not valid.
     * @param {String} regexStr the regex expression itself (as a string). Needs to be non-empty.
     * @param {String} regexFlags regex flags applied on the expression. Needs to consist of 0 or more of the following flags: igsmyu.
     * @param {String} replaceValue string to replace the match with.
     */
    #throwInvalid(regexStr, regexFlags, replaceValue) {
        if ("" == regexStr || null == regexStr) throw { name: "InvalidExprError", message : "regex expression cannot be empty." };
        if (!(/^[igsmyud]{0,7}$/.test(regexFlags))) throw { name: "InvalidExprError", message : "Regex flags are not valid. Must be zero or more of the following: igsmyud."};
    }
}



// Initialise html handler
const htmlHandler = new HtmlHandler();

// Start up content script
browser.tabs.executeScript({ file: "../content_scripts/wordreplace.js" })
.then(listen)
.catch(handleError)


function wordReplace() {
    browser.tabs.query({active: true, currentWindow: true})
    .then(sendMsg)
    .catch(handleError)
}

function sendMsg(tabs) {
    // Get current entries and send to content script
    msg = { entries: htmlHandler.entries }
    browser.tabs.sendMessage(tabs[0].id, msg);
}

// function wordReplace2() {
//     browser.tabs.executeScript({ file: "../content_scripts/wordreplace.js" })
//     .then(listen)
//     .catch(handleError)
// }

function listen() {
    console.log("Listening...");

    // Set up the event listeners.
    document.querySelector("#exec-btn").addEventListener("click", (e) => wordReplace());
    document.querySelector("#addentrybtn").addEventListener("click", (e) => htmlHandler.addEntry());
    document.querySelectorAll(".entry-del").forEach(x => x.addEventListener("click", (e) => htmlHandler.removeEntry(e.target.parentElement)));
}

function handleError(err) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute content script: ${err.message}`);
}
