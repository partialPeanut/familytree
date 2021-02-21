// Get raw spreadsheet data and convert it into a dope-ass data structure
function placeSiblings(result) {
    console.log("placeSiblings Ver. All Done, I Fuckin' Hope")
    
    // Log the number of siblings
    var numRows = result.values ? result.values.length : 0
    console.log(`${numRows} siblings retrieved.`)

    // Put all siblings into a JSON structure. This only works if the sheet is properly sorted and there are no spelling errors.
    siblings = {'0': {}}
    for (x = 0; x < result.values.length; x++) {
        sibJSON = sibRowToJSON(result.values[x])
        // If the sib has no big, they're at height 0.
        if (sibJSON.bigName === null) {
            // If they have no house, they're in the Lone Wolves or FoLS, otherwise, they're a founder
            if (sibJSON.house === null) {
                //console.log(sibJSON.pledgeClass)
                if (sibJSON.pledgeClass == "Alpha") sibJSON.house = "Lone Wolves"
                else sibJSON.house = "Field of Lost Souls"
            }
            else sibJSON.tags.push("Founder")

            // Place them in the structure at height 0
            sibJSON.height = 0
            siblings['0'][sibJSON.name] = sibJSON
        }
        else {
            found = false

            // Scan iteratively through each structure level for the sib's big
            $.each(siblings, function(key, val) {
                i = parseInt(key)
                //console.log("key is: " + key + " and i is: " + i)
                if (val.hasOwnProperty(sibJSON.bigName)) {
                    //console.log(sibJSON.name + "'s big is in this layer!")
                    found = true

                    // Create a new level if necessary
                    if (!siblings.hasOwnProperty(i+1)) {
                        //console.log("Creating new layer: " + (i+1))
                        siblings[i+1] = {}
                        //console.log("Siblings is now: " + JSON.stringify(siblings))
                    }

                    // If they have no house, inherit their big's, otherwise, they're a founder
                    if (sibJSON.house === null) sibJSON.house = val[sibJSON.bigName].house
                    else sibJSON.tags.push("Founder")

                    // Add themselves to their big's list of littles
                    val[sibJSON.bigName].littleNames.push(sibJSON.name)

                    // Place them in the structure at the level just below their big
                    sibJSON.height = i+1
                    siblings[i+1][sibJSON.name] = sibJSON
                    return false
                } //else console.log(sibJSON.name + "'s big is not in this layer.")
            })

            // There has been some error or misspelling.
            if (!found) {
                // Create a new level if necessary
                if (!siblings.hasOwnProperty('-1')) {
                    console.log("Creating error layer.")
                    siblings['-1'] = {}
                }

                // If they have no house, inherit their big's, otherwise, they're a founder
                if (sibJSON.house === null) sibJSON.house = "Field of Lost Souls"
                else sibJSON.tags.push("Founder")

                // Place them in the structure at height -1
                sibJSON.height = -1
                siblings['-1'][sibJSON.name] = sibJSON
            }
        }
    }

    // Sorts siblings into the order they should appear in on the tree.
    $.each(siblings, function(key, val) {
        nextRow = parseInt(key) + 1
        $.each(val, function(sibName, sib) {
            sib.littleNames.forEach(function(littleName) {
                little = siblings[nextRow][littleName]
                delete siblings[nextRow][littleName]
                siblings[nextRow][littleName] = little
            })
        })
    })

    console.log("Siblings:")
    console.log(JSON.stringify(siblings))
    console.log(siblings)
}

// Convert tag set into a usable json
function parseTags(result) {
    tagData = {}
    result.values.forEach(function(row) {
        tagData[cleanStr(row[0])] = tagRowToJSON(row)
    })

    console.log("Tags:")
    console.log(JSON.stringify(tagData))
    console.log(tagData)
}

// Apply default settings given by spreadsheet
function setDefaultSizeSettings(result) {
    settings = {}
    docStyle = document.body.style
    result.values.forEach(function(row) {
        docStyle.setProperty('--' + cleanStr(row[0]), row[1] + 'px')
        settings[cleanStr(row[0])] = parseInt(row[1])
    })

    nameHeight = settings['nameHeight']
    lineHeight = settings['lineHeight']
    endBlockHeight = nameHeight + lineHeight
    docStyle.setProperty('--endBlockHeight', endBlockHeight + 'px')
    blockHeight = nameHeight + 2*lineHeight
    docStyle.setProperty('--blockHeight', blockHeight + 'px')

    console.log("Settings:")
    console.log(JSON.stringify(settings))
    console.log(settings)
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

            // Strikethrough if the sib dropped
            if (nameButton.classList.contains("Dropped")) {
                buttonStyle = window.getComputedStyle(nameButton)
                backgroundCol = buttonStyle.backgroundColor
                borderCol = buttonStyle.borderColor
                struckThroughString = "linear-gradient(0deg, " + backgroundCol + " 45%, " + borderCol + " 45%, " + borderCol + " 55%, " + backgroundCol + " 55%)"
                nameButton.style.background = struckThroughString
            }

            // Add tag images to nas
            nameButton.classList.forEach(function(tag) {
                if (tagData.hasOwnProperty(tag)) {
                    tagJSON = tagData[tag]
                    if (tagJSON.hasOwnProperty("imageAddress")) {
                        tagImage = document.createElement("img")
                        tagImage.src = "img/" + tagJSON.imageAddress
                        tagImage.classList.add("tagSymbol")
                        nas.appendChild(tagImage)
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
    blockMargin = settings['blockMargin']
    treeMarginLeft = settings['treeMarginLeft']
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
    lineWeight = settings['lineWeight']

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