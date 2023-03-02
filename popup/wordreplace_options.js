document.querySelector("#exec-btn").addEventListener("click", (e) => wordReplace());


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