const adjustLine = (from, to, line) => {

    var fT = from.offsetTop  + from.offsetHeight/2;
    var tT = to.offsetTop 	 + to.offsetHeight/2;
    var fL = from.offsetLeft + from.offsetWidth/2;
    var tL = to.offsetLeft 	 + to.offsetWidth/2;
    
    var CA   = Math.abs(tT - fT);
    var CO   = Math.abs(tL - fL);
    var H    = Math.sqrt(CA*CA + CO*CO);
    var ANG  = 180 / Math.PI * Math.acos( CA/H );

    if(tT > fT){
        var top  = (tT-fT)/2 + fT;
    }else{
        var top  = (fT-tT)/2 + tT;
    }
    if(tL > fL){
        var left = (tL-fL)/2 + fL;
    }else{
        var left = (fL-tL)/2 + tL;
    }

    if(( fT < tT && fL < tL) || ( tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)){
        ANG *= -1;
    }
    top-= H/2;
    line.style.display = 'block'
    line.style["-webkit-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-moz-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-ms-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-o-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-transform"] = 'rotate('+ ANG +'deg)';
    line.style.top    = top+'px';
    line.style.left   = left+'px';
    line.style.height = H + 'px';
};
const removeLine = (line) => {
    // line.style.display = 'none'
    line.remove()

};

const replaceTerms = [
    {ours: '{T}', theirs: '{tap}'},
];
const insertSymbols = (text) => {
    //Replace EVERYTHING in between {}, hoping the Gatherer has a resource for it.
    //Because they don't follow the same system as we do, some things need to be replaced, like tap (we use T, they use tap).
    //Just replace our versions to theirs, and BOOM! They all convert!
    replaceTerms.forEach(term => {
        text = text.replace(new RegExp(term.ours, 'g'), term.theirs);
    });
    //Change beginning { to the beginning of a declaration of an image
    text = text.replace(/\{/g, '<img src=\'https://gatherer.wizards.com/Handlers/Image.ashx?size=small&name=');
    //And the closing one closes it
    text = text.replace(/\}/g, '&type=symbol\'>');

    return text
};