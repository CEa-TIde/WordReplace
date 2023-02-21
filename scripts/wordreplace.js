

let words = [
    {s: /relace/g, r: "replaca"},
    {s: /girl/g, r: "catgirl"}
];

let elems = document.querySelectorAll("body *:not(script):not(noscript):not(style)")
words.forEach(x => {
    try {
        b.innerHTML = b.innerHTML.replace(x.s, x.r);
    }
    catch (e) {
        console.warn(`[WordReplace] query (${x.s}) or replacement (${x.r}) is not a valid value. \n\n Error: ${e}`);
    }
});