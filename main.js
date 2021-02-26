// It's main!
function main() {
    applySettings()
    drawTree()
}

// Apply settings JSON to stylesheet and other places
function applySettings() {
    // Size settings
    $.each(settings.sizes, function(prop, val) {
        document.body.style.setProperty('--' + prop, val + 'px')
    })

    // Tag data
    stylesheet = document.styleSheets[1]
    $.each(settings.tagData, function(tagName, tag) {
        if (tag.type.includes("STYLE")) {
            rule = "." + cleanStr(tag.name) + " {\n"
            if (tag.borderWidth) rule += "border-width: " + tag.borderWidth + "px;\n"
            if (tag.borderColor) rule += "border-color: " + tag.borderColor + ";\n"
            if (tag.backgroundColor) rule += "background-color: " + tag.backgroundColor + ";\n"
            if (tag.textColor) rule += "color: " + tag.textColor + ";\n"
            if (tag.fontSize) rule += "font-size: " + tag.fontSize + "px;\n"
            if (tag.lineHeight) rule += "line-height: " + tag.lineHeight + "px;\n"
            if (tag.fontName) rule += "font-family: " + tag.fontName + ";\n"
            rule += "}"

            stylesheet.insertRule(rule, stylesheet.cssRules.length)
        }
        if (tag.type.includes("HOUSE")) {
            rule = "." + cleanStr(tag.name) + ".line {\n"
            rule += "background-color: " + tag.borderColor + ";\n"
            rule += "}"

            stylesheet.insertRule(rule, stylesheet.cssRules.length)
        }
    })
}

// Draw the whole tree
function drawTree() {
    createUnspacedTree()
    setTimeout(function(){
        spaceTree()
        drawAcrossLines()
       }, 1000);
}

// Places all blocks roughly down, in the right order but not correctly positioned
function createUnspacedTree() {
    console.log("createUnspacedTree Ver. Probably Done")

    // Loop through the rows
    $.each(siblings, function(key, val) {
        i = parseInt(key)

        // Create the row element where all of the blocks and spaces will be stored
        row = document.createElement('div')
        row.id = 'row-' + i
        row.classList.add('row')
        if (i == 0 || i == siblings.length-1) {
            row.classList.add('end')
        }
        
        // Find the tree and add the row to it
        tree = document.querySelector('#tree')
        tree.append(row)

        // Loop through the siblings in this row
        $.each(val, function(sibName, sib) {
            // Create a block where all the stuff for an individual sibling is held
            block = document.createElement('div')
            block.classList.add('block')
            block.id = cleanStr(sibName)
            row.append(block)

            // Get a class name from the sib's house
            houseClean = cleanStr(sib.house)

            // If the sib has a big, add a line above the nas
            if (sib.bigName) {
                topLine = document.createElement('div')
                topLine.classList.add('line')
                topLine.classList.add('vert')
                topLine.classList.add(cleanStr(getBig(sib).house))
                block.append(topLine)
            }

            // The nas (name and symbols), which contains the sib's name and all the symbols attached to them
            nas = document.createElement('div')
            nas.classList.add('nameAndSymbols')
            block.append(nas)

            // The name button, a button with the sib's name on it
            nameButton = document.createElement("BUTTON")
            nameButton.classList.add('name')
            nameButton.classList.add(houseClean)
            nas.append(nameButton)

            // Add all tags to classes
            sib.tags.forEach(function(tag) {
                nameButton.classList.add(cleanStr(tag))
            })

            // The name itself
            nameName = document.createTextNode(sib.name + ' ' + pledgeClassToSymbols(sib.pledgeClassNumber))
            nameButton.appendChild(nameName)

            // Apply tag effects to nas
            nameButton.classList.forEach(function(tag) {
                // If the class is a tag, do stuff
                if (settings.tagData.hasOwnProperty(tag)) {
                    tagJSON = settings.tagData[tag]
                    // If it's a symbol, add the symbol
                    if (tagJSON.type.includes("SYMBOL")) {
                        tagImage = document.createElement("img")
                        tagImage.src = "img/" + tagJSON.imageAddress
                        tagImage.classList.add("tagSymbol")
                        nas.appendChild(tagImage)
                    }
                    // If it's special, do whatever crazy bullshit
                    else if (tagJSON.type.includes("SPECIAL")) {
                        if (tagJSON.name == "Dropped") {
                            buttonStyle = window.getComputedStyle(nameButton)
                            backgroundCol = buttonStyle.backgroundColor
                            borderCol = buttonStyle.borderColor
                            struckThroughString = "linear-gradient(0deg, " + backgroundCol + " 45%, " + borderCol + " 45%, " + borderCol + " 55%, " + backgroundCol + " 55%)"
                            nameButton.style.background = struckThroughString
                        }
                        if (tagJSON.name == "Malcolm Tartan") {
                            buttonStyle = window.getComputedStyle(nameButton)
                            borderCol = buttonStyle.borderColor
                            nameButton.style.color = borderCol

                            nameButton.style.backgroundImage = 'url("img/' + tagJSON.imageAddress + '")'
                            nameButton.style.backgroundRepeat = "repeat-x"
                            nameButton.style.backgroundSize = "contain"
                        }
                    }
                }
            })

            // If the sib has any littles, add a line below the nas
            if (sib.littleNames.length > 0) {
                botLine = document.createElement('div')
                botLine.classList.add('line')
                botLine.classList.add('vert')
                botLine.classList.add(houseClean)
                block.append(botLine)
            }
        })
    })
}

// Spaces the tree correctly
function spaceTree() {
    console.log("spaceTree ver. Foolish Mortals I Am The Goddess Of Creation And All Will Tremble Before Me")
    prevEnd = 0
    blockMargin = settings.sizes['blockMargin']
    treeMarginLeft = settings.sizes['treeMarginLeft']
    $.each(siblings[0], function(sibName, sib) {
        calculateRelativePositions(sib)

        // Put siblings at height 0 in the correct position*
        position = 0
        $.each(siblings[0], function(prevSibName, prevSib) {
            if (prevSibName == sibName) {
                position = Math.max(sib.branchWidths[0][0] + blockMargin, position)
                return false
            }
            else position = Math.max(prevSib.position + distToTouch(prevSib, sib) + blockMargin, position)
        })
        sib.position = Math.floor(position)

        // *Prevent boxes from going negative
        sib.branchWidths.forEach(function(widths, height) {
            if (widths[0] + sib.position < blockMargin) sib.position = blockMargin - widths[0]
        })

        setLittleAbsolutePositions(sib)

        space = sib.position - prevEnd + sib.branchWidths[0][0]

        sibBlockName = '#' + cleanStr(sib.name)
        sibBlock = document.querySelector(sibBlockName)
        sibBlock.style.marginLeft = space + "px"

        prevEnd = sib.position + sib.branchWidths[0][1]
    })

    $.each(siblings, function(height, row) {
        if (height == 0) return

        prevSib = {
            position: 0,
            height: 0,
            branchWidths: [[0,0]]
        }
        prevEnd = 0

        $.each(row, function(sibName, sib) {
            space = sib.position - prevEnd + sib.branchWidths[0][0]

            sibBlockName = '#' + cleanStr(sib.name)
            sibBlock = document.querySelector(sibBlockName)
            sibBlock.style.marginLeft = space + "px"

            prevSib = sib
            prevEnd = sibBlock.getBoundingClientRect().right - treeMarginLeft
        })
    })
    console.log(siblings)
}

// Draws the lines that connect littles across to their big
function drawAcrossLines() {
    console.log("drawAcrossLines Ver. Fucking Gucci")
    lineWeight = settings.sizes['lineWeight']

    tree = document.querySelector('#tree')

    $.each(siblings, function(height, row) {
        prevEnd = 0

        divRow = document.querySelector('#row-' + height)
        divAcross = document.createElement("div")
        divAcross.id = "across-" + height
        divAcross.classList.add("across")
        tree.insertBefore(divAcross, divRow.nextSibling)

        if (parseInt(height)+1 >= Object.keys(siblings).length) return false
        $.each(row, function(idx, sib) {
            if (sib.littleNames.length == 1) {
                little = getLittle(sib, 0)

                leftSpace = little.position - prevEnd - lineWeight/2
                lineWidth = lineWeight
            }
            else if (sib.littleNames.length > 1) {
                firstLittle = getLittle(sib, 0)
                lastLittle = getLittle(sib, sib.littleNames.length-1)

                leftSpace = firstLittle.position - prevEnd - lineWeight/2
                lineWidth = lastLittle.position - firstLittle.position + lineWeight
            }
            else return

            acrossLine = document.createElement("div")
            acrossLine.classList.add("line")
            acrossLine.classList.add("horiz")
            acrossLine.classList.add(cleanStr(sib.house))
            acrossLine.style.marginLeft = leftSpace + "px"
            acrossLine.style.width = lineWidth.toFixed(0) + "px"

            divAcross.appendChild(acrossLine)

            prevEnd += leftSpace + lineWidth
        })
    })
}