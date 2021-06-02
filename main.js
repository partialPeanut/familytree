// It's main!
function main() {
    applySettings()
    createContainerDivs()

    allResizers = document.querySelectorAll('.resizer')
    allResizers.forEach(resizer => makeResizer(resizer))

    // Loops through every container and builds individual trees for each
    containers.forEach(container => {
        copySiblingSet(container)

        createUnspacedTree(container)
        setTimeout(function(){
            spaceTree(container)
            drawAcrossLines(container)
            makeDraggable(container.containerDiv)
        }, 480);
    })
}

// Apply settings JSON to stylesheet and other places
function applySettings() {
    console.log(`Applying settings...`)

    // Size settings
    $.each(settings.sizes, function(prop, val) {
        document.body.style.setProperty('--' + prop, val + 'px')
    })

    // Tag data
    stylesheet = document.styleSheets[0]
    settings.tagData.forEach(tag => {
        if (tag.type.includes("STYLE")) {
            rule = "." + cleanStr(tag.name) + " {\n"
            if (tag.borderWidth) {
                rule += "border-width: " + tag.borderWidth + "px;\n"
                rule += "outline-offset: -" + tag.borderWidth + "px;\n"
                rule += "outline-width: -" + tag.borderWidth + "px;\n"
            }
            if (tag.borderColor) rule += "border-color: " + tag.borderColor + ";\n"
            if (tag.backgroundColor) rule += "background-color: " + tag.backgroundColor + ";\n"
            if (tag.textColor) rule += "color: " + tag.textColor + ";\n"
            if (tag.fontSize) rule += "font-size: " + tag.fontSize + "px;\n"
            if (tag.lineHeight) rule += "line-height: " + tag.lineHeight + "px;\n"
            if (tag.fontName) rule += "font-family: " + tag.fontName + ";\n"
            if (tag.outlineType) rule += "outline-style: " + tag.outlineType + ";\n"
            if (tag.outlineColor) rule += "outline-color: " + tag.outlineColor + ";\n"
            rule += "}"

            stylesheet.insertRule(rule, stylesheet.cssRules.length)
        }
        if (tag.type.includes("HOUSE")) {
            rule = "." + cleanStr(tag.name) + ".line {\n"
            rule += "background-color: " + tag.borderColor + ";\n"
            rule += "}"

            stylesheet.insertRule(rule, stylesheet.cssRules.length)

            rule = "." + cleanStr(tag.name) + ".stub {\n"
            rule += "background-color: " + tag.borderColor + ";\n"
            rule += "}"

            stylesheet.insertRule(rule, stylesheet.cssRules.length)
        }
    })
}

// Create a whole fuck ton of nested divs to hold all the trees
function createContainerDivs() {
    console.log(`Creating all container divs...`)

    crc = document.querySelector('#containerRowContainer')
    containerRows = maxValue(containers, 'row') + 1
    for (i = 0; i < containerRows; i++) {
        if (i != 0) {
            rowResizer = document.createElement('div')
            rowResizer.classList.add('resizer')
            rowResizer.setAttribute('resize-direction', 'vertical')
            crc.append(rowResizer)
        }

        containerRow = document.createElement('div')
        containerRow.id = "container-row-" + i
        containerRow.classList.add('containerRow')
        crc.append(containerRow)

        thisRowContents = containers.filter(cont => cont.row == i)
        for (j = 0; j < thisRowContents.length; j++) {
            if (j != 0) {
                colResizer = document.createElement('div')
                colResizer.classList.add('resizer')
                colResizer.setAttribute('resize-direction', 'horizontal')
                containerRow.append(colResizer)
            }
            
            containerColumn = document.createElement('div')
            containerColumn.id = "container-column-" + j
            containerColumn.classList.add('containerColumn')
            containerRow.append(containerColumn)

            treeContainerDiv = document.createElement('div')
            treeContainerDiv.id = "tree-container-" + i + "-" + j
            treeContainerDiv.classList.add('treeContainer')
            containerColumn.append(treeContainerDiv)

            // Create the tree div and add it to the container div
            treeDiv = document.createElement('div')
            treeDiv.classList.add('tree')
            treeContainerDiv.append(treeDiv)

            thisContainer = containers.find(cont => cont.row == i && cont.column == j)
            thisContainer.containerDiv = treeContainerDiv
            thisContainer.treeDiv = treeDiv
        }
    }
}

// Copies and edits the set of siblings to a container
function copySiblingSet(container) {
    console.log(`Copying the sibling set for container ${container.name}...`)

    function belongsUnaltered(sib) {
        if (sib !== undefined) return container.houses.includes(sib.house)
        else return false
    }

    // Filters the set of all siblings down to the siblings that belong in this container
    filteredSibs = siblings.filter(sib => {
        if (belongsUnaltered(sib) || belongsUnaltered(getBig(siblings, sib))) return true
        else {
            found = false
            sib.littleNames.forEach((littleName, idx) => {
                little = getLittle(siblings, sib, idx)
                if (belongsUnaltered(little)) {
                    console.log(`${littleName} granted ${sib.name} above stub rights.`)
                    found = true
                    return false
                }
            })
            return found
        }
    })
    // Launders the JSON to make it a copy rather than a reference
    newFilteredSibs = JSON.parse(JSON.stringify(filteredSibs))
    // Edits siblings into stubs if necessary
    container.siblings = newFilteredSibs.map(sib => {
        if (belongsUnaltered(sib)) return sib
        else if (belongsUnaltered(getBig(siblings, sib))) return {
            name: sib.name,
            bigName: sib.bigName,
            littleNames: [],
            house: sib.house,
            tags: ['stub'],
            height: sib.height
        }
        else {
            validLittleNames = []
            sib.littleNames.forEach((littleName, idx) => {
                little = getLittle(siblings, sib, idx)
                if (belongsUnaltered(little)) validLittleNames.push(littleName)
            })
            return {
                name: sib.name,
                bigName: null,
                littleNames: validLittleNames,
                house: sib.house,
                tags: ['stub'],
                height: sib.height
            }
        }
    })
}

// Places all blocks roughly down, in the right order but not correctly positioned
function createUnspacedTree(container) {
    console.log(`Creating the unspaced tree for ${container.name}...`)
    treeDiv = container.treeDiv

    // Loop through the rows
    minSibHeight = minValue(container.siblings, 'height')
    maxSibHeight = maxValue(container.siblings, 'height')
    for (i = minSibHeight; i <= maxSibHeight; i++) {
        // Create the row element where all of the blocks and spaces will be stored
        row = document.createElement('div')
        row.id = 'row-' + i
        row.classList.add('row')
        if (i == minSibHeight || i == maxSibHeight)
            row.classList.add('end')
        treeDiv.append(row)

        // Loop through the siblings in this row
        thisHeightSibs = container.siblings.filter(sib => sib.height == i)
        thisHeightSibs.forEach(sib => {
            // Create a block where all the stuff for an individual sibling is held
            block = document.createElement('div')
            block.classList.add('block')
            block.id = cleanStr(sib.name)
            row.append(block)

            sib.div = block

            // Get a class name from the sib's house
            houseClean = cleanStr(sib.house)

            // If the sib has a big, add a line above the nas
            if (sib.bigName) {
                topLine = document.createElement('div')
                topLine.classList.add('line')
                topLine.classList.add('vert')
                topLine.classList.add(cleanStr(getBig(container.siblings, sib).house))
                block.append(topLine)
            }

            // The nas (name and symbols), which contains the sib's name and all the symbols attached to them
            nas = document.createElement('div')
            nas.classList.add('nameAndSymbols')
            block.append(nas)

            // The name button, a button with the sib's name on it
            nameButton = document.createElement("BUTTON")
            nameButton.classList.add('name')
            nameButton.classList.add('clickable')
            nameButton.classList.add(houseClean)
            addNameClicker(nameButton, sib)
            nas.append(nameButton)

            // Add all tags to classes
            sib.tags.forEach(function(tag) {
                nameButton.classList.add(cleanStr(tag))
            })

            // The name itself
            if (sib.tags.includes('stub')) nameNameName = filterInvisText(sib.house)
            else nameNameName = filterInvisText(sib.name) + ' ' + pledgeClassToSymbols(sib.pledgeClassNumber)
            nameName = document.createTextNode(nameNameName)
            nameButton.appendChild(nameName)

            // Apply tag effects to nas
            nameButton.classList.forEach(function(tagName) {
                // If the class is a tag, do stuff
                if (settings.tagData.includes(td => td.name == tagName)) {
                    tag = settings.tagData.find(td => td.name == tagName)
                    // If it's a symbol, add the symbol
                    if (tag.type.includes("SYMBOL")) {
                        tagImage = document.createElement("img")
                        tagImage.src = "https://drive.google.com/thumbnail?id=" + tag.imageAddress
                        tagImage.classList.add("tagSymbol")
                        tagImage.classList.add("clickable")
                        addTagClicker(tagImage, tag)
                        nas.appendChild(tagImage)
                    }
                    // If it's an image background, add the image to the background
                    if (tag.type.includes("IMGBACKGROUND")) {
                        nameButton.style.backgroundImage = 'url("https://drive.google.com/thumbnail?id=' + tag.imageAddress + '")'
                        nameButton.style.backgroundRepeat = "repeat-x"
                        nameButton.style.backgroundSize = "contain"
                    }
                    // If it's special, do whatever crazy bullshit
                    if (tag.type.includes("SPECIAL")) {
                        if (tag.name == "Dropped") {
                            buttonStyle = window.getComputedStyle(nameButton)
                            backgroundCol = buttonStyle.backgroundColor
                            borderCol = buttonStyle.borderColor
                            struckThroughString = "linear-gradient(0deg, " + backgroundCol + " 45%, " + borderCol + " 45%, " + borderCol + " 55%, " + backgroundCol + " 55%)"
                            nameButton.style.background = struckThroughString
                        }
                        if (tag.name == "Malcolm Tartan") {
                            buttonStyle = window.getComputedStyle(nameButton)
                            borderCol = buttonStyle.borderColor
                            nameButton.style.color = borderCol

                            nameButton.style.backgroundImage = 'url("https://drive.google.com/thumbnail?id=' + tag.imageAddress + '")'
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
    }
}

// Spaces the tree correctly
function spaceTree(container) {
    console.log(`Spacing the tree for container ${container.name}...`)
    treeDiv = container.treeDiv

    prevEnd = 0
    blockMargin = settings.sizes['blockMargin']
    treeMarginLeft = settings.sizes['treeMarginLeft']

    minSibHeight = minValue(container.siblings, 'height')
    minHeightSibs = container.siblings.filter(thisSib => thisSib.height == minSibHeight)
    minHeightSibs.forEach(sib => {
        calculateRelativePositions(container, sib)

        // Put siblings at height 0 in the correct position*
        position = 0
        minHeightSibs.every(prevSib => {
            if (prevSib.name == sib.name) {
                position = Math.max(sib.branchWidths[0][0] + blockMargin, position)
                return false
            }
            else position = Math.max(prevSib.position + distToTouch(prevSib, sib) + blockMargin, position)
            return true
        })
        sib.position = Math.floor(position)

        // *Prevent boxes from going negative
        sib.branchWidths.forEach((widths, height) => {
            if (widths[0] + sib.position < blockMargin) sib.position = blockMargin - Math.floor(widths[0])
        })

        setLittleAbsolutePositions(container, sib)

        space = sib.position - prevEnd + sib.branchWidths[0][0]

        sibBlock = sib.div
        sibBlock.style.marginLeft = space + "px"

        prevEnd = sib.position + sib.branchWidths[0][1]
    })

    maxSibHeight = maxValue(container.siblings, 'height')
    for (i = minSibHeight + 1; i <= maxSibHeight; i++) {
        prevSib = {
            position: 0,
            height: 0,
            branchWidths: [[0,0]]
        }
        prevEnd = 0

        thisRowSibs = container.siblings.filter(thisSib => thisSib.height == i)
        thisRowSibs.forEach(sib => {
            space = sib.position - prevEnd + sib.branchWidths[0][0]

            sibBlock = sib.div
            sibBlock.style.marginLeft = space + "px"

            prevSib = sib
            prevEnd = sibBlock.getBoundingClientRect().right - container.containerDiv.getBoundingClientRect().left - treeMarginLeft
        })
    }

    console.log(`Without spacing, container ${container.name} has these siblings:`)
    console.log(container.siblings)
}

// Draws the lines that connect littles across to their big
function drawAcrossLines(container) {
    console.log(`Drawing across lines for container ${container.name}...`)
    treeDiv = container.treeDiv

    lineWeight = settings.sizes['lineWeight']

    minSibHeight = minValue(container.siblings, 'height')
    maxSibHeight = maxValue(container.siblings, 'height')
    for (height = minSibHeight; height < maxSibHeight; height++) {
        prevEnd = 0

        divRow = treeDiv.querySelector('#row-' + height)
        divAcross = document.createElement("div")
        divAcross.id = "across-" + height
        divAcross.classList.add("across")
        treeDiv.insertBefore(divAcross, divRow.nextSibling)

        thisRowSibs = container.siblings.filter(thisSib => thisSib.height == height)
        thisRowSibs.forEach(sib => {
            if (sib.littleNames.length == 1) {
                little = getLittle(container.siblings, sib, 0)

                leftSpace = little.position - prevEnd - lineWeight/2
                lineWidth = lineWeight
            }
            else if (sib.littleNames.length > 1) {
                firstLittle = getLittle(container.siblings, sib, 0)
                lastLittle = getLittle(container.siblings, sib, sib.littleNames.length-1)

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
    }
}