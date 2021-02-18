// Converts a single sibling into a JSON format
function sibRowToJSON(row) {
    sibJSON = {}
    sibJSON.name = row[0]
    sibJSON.pledgeClass = row[1]
    sibJSON.pledgeClassNumber = parseInt(row[6])
    sibJSON.gradYear = row[2]
    sibJSON.bigName = row[3] == 'XXX' ?  null : row[3]
    sibJSON.littleNames = []
    sibJSON.house = row[4] == 'XXX' ? null : row[4]
    sibJSON.tags = row[5] == 'XXX' ? [] : row[5].split(';')

    return sibJSON
}

// Converts a single set of tag data into a JSON format
function tagRowToJSON(row) {
    tagJSON = {}
    tagJSON.name = row[0]
    tagJSON.imageAddress = row[1]

    return tagJSON
}

// Prepares a string to be used as a class name
function cleanStr(string) {
    newStr = string.replace(/ |\'|\"|\./g, '')
    return newStr
}

// Turns a pledge class's number into its corresponding unicode symbols
function pledgeClassToSymbols(pledgeClassNumber) {
    classNum = (pledgeClassNumber-1) % 24
    metaClassNum = Math.floor((pledgeClassNumber-1)/24)

    classSymbols = ["Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ", "Ν", "Ξ", "Ο", "Π", "Ρ", "Σ", "Τ", "Υ", "Φ", "Χ", "Ψ", "Ω"]
    metaClassSymbols = ['', "δ", "ψ", "τ"]

    return classSymbols[classNum] + metaClassSymbols[metaClassNum]
}