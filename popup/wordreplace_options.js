/**
 * Class for handling the creation and deletion of regex entries.
 */
class HtmlHandler {

    constructor() {
        this.entryListEl = document.querySelector(".entry-list");
        if (this.entryListEl == null) return null;

        let entryForm = document.querySelector(".add-entry");
        if (entryForm == null) return null;

        this.entryFormRgx = entryForm.querySelector("input[name=regexexpr");
        this.entryFormFlgs = entryForm.querySelector("input[name=regexflags]");
        this.entryFormValue = entryForm.querySelector("input[name=replacevalue]");
        if (this.entryFormRgx == null || this.entryFormFlgs == null || this.entryFormValue == null) {
            return null;
        }
    }

    get entries() {
        return this.entryListEl.childNodes.map(x => {
            try {
                let regexStr = x.querySelector(".entry-regex").innerHTML;
                let flgs = x.querySelector(".entry-flags").innerHTML;
                let replace = x.querySelector(".entry-value").innerHTML;
                let regex = new RegexExp(regexStr, flgs);
                return ({s: regex, r: replace});
            }
            catch (e) {
                console.warn(`Something went wrong parsing regex entry ${x} (skipping entry): ${e}.`);
            }
        });
    }

    addEntry() {
        try {
            let el = this.#createNewEntry(this.entryFormRgx.value, this.entryFormFlgs.value, this.entryFormValue.value);
            this.entryListEl.appendChild(el);
        }
        catch (e) {
            console.warn(`Something went wrong creating a new entry: ${e}`);
        }
    }

    removeEntry(el) {
        console.log(el);
        let entry = el.parentElement;
        console.log(entry);
        if (entry.remove) {
            entry.remove();
        } else {
            entry.parentElement.removeChild(entry);
        }
    }


    #createNewEntry(regexStr, regexFlags, replaceValue) {
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
        entryRgx.classList.add("entry-flags");
        let larr = document.createTextNode(" → ");
        let entryVal = document.createElement("span");
        entryVal.innerHTML = replaceValue;
        entryRgx.classList.add("entry-value");

        expr.appendChild(slash1);
        expr.appendChild(entryRgx);
        expr.appendChild(slash2);
        expr.appendChild(entryFlgs);
        expr.appendChild(larr);
        expr.appendChild(entryVal);

        let entryDel = document.createElement("button");
        entryDel.classList.add("entry-del");
        entryDel.innerText = "X";
        entryDel.addEventListener("click", (e) => this.removeEntry(e.target));

        entry.appendChild(expr);
        entry.appendChild(entryDel);

        return entry;
    }
}



// Initialise html handler and event listeners
const htmlHandler = new HtmlHandler();
document.querySelector("#exec-btn").addEventListener("click", (e) => wordReplace());
document.querySelector("#addentrybtn").addEventListener("click", (e) => htmlHandler.addEntry());
document.querySelectorAll(".entry-del").forEach(x => x.addEventListener("click", (e) => htmlHandler.removeEntry(e.target)));

function wordReplace() {
    browser.tabs.executeScript({ file: "../content_scripts/wordreplace.js" })
    .then(listen)
    .catch(handleError)
}

function listen() {
    console.log("Listening...");
}

function handleError(err) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute content script: ${err.message}`);
}
