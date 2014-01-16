var capitalLetterExp = /([A-Z])/g;

function hyphenate(property) {
    return property.replace(capitalLetterExp, "-$1");
}

module.exports = hyphenate;
