(() => {
    // TODO:
    //  - Listen to message channel for word replacements
    //  - Replace let bindings, as error is thrown when run twice
    // let words = [
    //     {s: /relace/gi, r: "replaca"},
    //     {s: /girl/gi, r: "catgirl"},
    //     {s: /the /gi, r: "tha "}
    // ];


    // Don't run the content script twice
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    // TODO: optionally exclude elements with notranslate attribute
    let b = document.body;
    let txtNodes = textNodesUnder(b);
    let inputNodes = document.querySelectorAll("input");
    let altNodes = document.querySelectorAll("area, img, input");
    let titleNodes = document.querySelectorAll("body *");


    // Listen to message from popup
    browser.runtime.onMessage.addListener(listen);


    function listen(msg) {
        replaceMatches(msg.entries);
        // TODO: send the error back instead using sendResponse()
    }


    function replaceMatches(expressions) {
        expressions.forEach(x => {
            try {
                // Replace all text nodes
                txtNodes.forEach(y => y.textContent = y.textContent.replace(x.s, x.r));

                // Replace all input values
                inputNodes.forEach(y => { if(y.value) y.value = y.value.replace(x.s, x.r)});

                // Replace alt text
                altNodes.forEach(y => { if(y.alt) y.alt = y.alt.replace(x.s, x.r)});

                // Replace title text
                titleNodes.forEach(y => { if(y.title) y.title = y.title.replace(x.s, x.r)});
            }
            catch (e) {
                console.warn(`[WordReplace]: Query (${x.s}) or replacement (${x.r}) is not a valid value. \n\n Error: ${e}`);
            }
        });
    }

    // https://gist.github.com/Sphinxxxx/ed372d176c5c2c1fd9ea1d8d6801989b
    // Modification by Sphinxxxx to solution on SO page to allow for filtering on style/script
    /**
     * Finds all text nodes in the DOM under an element. `script` and `style` nodes are excluded.
     * @param {*} el the element to check under
     * @returns a list of text nodes
     */
    function textNodesUnder(el) {
        return walkNodeTree(el, {
            inspect: n => !['STYLE', 'SCRIPT'].includes(n.nodeName),
            collect: n => (n.nodeType === Node.TEXT_NODE)
        });
    }

    // https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
    /**
     * Walks the node tree and returns text nodes.
     * @param {Element} root root of the tree
     * @param {*} options options for what nodes to accept
     * @returns a list of text nodes
     */
    function walkNodeTree(root, options) {
        options = options || {};

        const inspect = options.inspect || (n => true),
            collect = options.collect || (n => true);
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_ALL,
            {
                acceptNode: function(node) {
                    if(!inspect(node)) { return NodeFilter.FILTER_REJECT; }
                    if(!collect(node)) { return NodeFilter.FILTER_SKIP; }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodes = []; let n;
        while(n = walker.nextNode()) {
            nodes.push(n);
        }

        return nodes;
    }

})()
