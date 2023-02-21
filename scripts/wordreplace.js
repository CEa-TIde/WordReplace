

let words = [
    {s: /relace/g, r: "replaca"},
    {s: /girl/g, r: "catgirl"}
];

let elems = document.querySelectorAll("body *:not(script):not(noscript):not(style)");
let b = document.body;
words.forEach(x => {
    try {
        b.innerHTML = b.innerHTML.replace(x.s, x.r);
        // TODO: Figure out how to regex match for a pair of <script> tags
        // https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word

        
        // elems.forEach(y => {
        //     y.innerHTML = y.innerHTML.replace(x.s, x.r);
        // });
    }
    catch (e) {
        console.warn(`[WordReplace] query (${x.s}) or replacement (${x.r}) is not a valid value. \n\n Error: ${e}`);
    }
});