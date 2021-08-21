// It's main!
function main() {
    applySettings()
    createAllContainerDivs()
    createMenu()
    exitTab()

    // Loops through every container and builds individual trees for each
    containers.forEach(container => {
        copySiblingSet(container)
        createUnspacedTree(container)
        setTimeout(function(){
            spaceTree(container)
            drawAcrossLines(container)
            makeDraggable(container.containerDiv)
        }, 1200)
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

// Create all the elements necessary to display the tree in every way
function createAllContainerDivs() {
    console.log(`Creating all container divs...`)
    createLocalContainerDivs()
    createMWContainerDivs()
    createTabContainerDivs()
    addLocalDivsToStructure()
}

// Create the local elements to hold the trees
function createLocalContainerDivs() {
    containers.forEach(container => {
        // Create container div
        treeContainerDiv = document.createElement('div')
        treeContainerDiv.id = "tree-container-" + cleanStr(container.name)
        treeContainerDiv.classList.add('treeContainer')

        treeDiv = document.createElement('div')
        treeDiv.classList.add('tree')
        treeContainerDiv.appendChild(treeDiv)

        container.containerDiv = treeContainerDiv
        container.treeDiv = treeDiv
    })

    window.onresize = onResizeEvent
}

// Create a whole fuck ton of nested divs to hold all the trees for multi-window
function createMWContainerDivs() {
    containerSplits = {
        horizSplits: [],
        vertSplit: null
    }
    crc = document.querySelector('#mwContainerContainer')
    containerRows = maxValue(containers, 'row') + 1
    cRowIDList = []
    for (i = 0; i < containerRows; i++) {
        containerRow = document.createElement('div')
        containerRow.id = "container-row-" + i
        containerRow.classList.add("container")
        containerRow.classList.add("row")
        crc.append(containerRow)
        cRowIDList.push('#' + containerRow.id)

        thisRowContents = containers.filter(cont => cont.row == i)
        cColIDList = []
        for (j = 0; j < thisRowContents.length; j++) {
            containerColumn = document.createElement('div')
            containerColumn.id = "container-column-" + i + "-" + j
            containerColumn.classList.add("container")
            containerColumn.classList.add("column")
            containerRow.append(containerColumn)
            cColIDList.push('#' + containerColumn.id)

            thisContainer = containers.find(cont => cont.row == i && cont.column == j)
            thisContainer.structure['multi-window'] = containerColumn
        }

        // Create a split between all elements in this row that keeps the content in the center in the center
        thisRowSplit = Split(cColIDList, {
            snapOffset: 0,
            onDragStart: function (sizes) {
                thisRowContents.forEach(cont => setScrollLock(cont))
            },
            onDrag: function (sizes) {
                thisRowContents.forEach(cont => goToScrollLock(cont))
            },
        })
        containerSplits.horizSplits.push(thisRowSplit)
    }
    // Creates a split between all the rows
    colSplit = Split(cRowIDList, {
        direction: 'vertical',
        cursor: 'row-resize',
        snapOffset: 0,
    })
    containerSplits.vertSplit = colSplit
}

// Create all the containers for the tabs
function createTabContainerDivs() {
    tcc = document.querySelector("#tabsContainerContainer")
    tbc = document.querySelector("#tabButtonsContainer")
    containers.forEach(container => {
        containerDiv = document.createElement('div')
        containerDiv.id = "container-tab-" + container.tabPos
        containerDiv.classList.add("containerTab")
        tcc.insertBefore(containerDiv, tbc)

        tabButton = document.createElement('li')
        tabButton.classList.add("tabForContainer")
        tbc.append(tabButton)

        tabLink = document.createElement('a')
        tabLink.setAttribute('href', '#' + containerDiv.id)
        tabLink.setAttribute('data-href', '#' + containerDiv.id)
        tabButton.appendChild(tabLink)

        nameName = document.createTextNode(container.name)
        tabLink.appendChild(nameName)

        container.structure['tabs'] = containerDiv
        container.structure['tabsTab'] = tabButton
    })
    tabs = $( tcc ).tabs({
        create: function(e, ui) {
            anchors = $( tcc ).find( ".ui-tabs-anchor" )
            anchors.removeAttr('href')

            panels = $( tcc ).find( ".ui-tabs-panel" )
            panels.removeAttr('aria-hidden')
            panels.css("display", "")
            ui.panel.height('100%')
        },
        beforeActivate: function(e, ui) {
            thisLink = $( ui.newTab ).children()
            href = thisLink.attr('data-href')
            thisLink.attr('href', href)
        },
        activate: function(e, ui) {
            panels = $( tcc ).find( ".ui-tabs-panel" )
            panels.removeAttr('aria-hidden')
            panels.css("display", "")
            ui.oldPanel.height('0%')
            ui.newPanel.height('100%')

            thisLink = $( ui.newTab ).children()
            thisLink.removeAttr('href')
        }
    })
    tabs.find( ".ui-tabs-nav" ).sortable({
        axis: "x",
        containment: "parent",
        items: "> .tabForContainer",
        revert: true,
        start: function(e, ui) {
            ui.item.css("margin", "calc(.2em + 1px) 0")
        },
        stop: function(e, ui) {
            ui.item.css("margin", "")

            $( '[data-href]' ).each((idx, el) => {
                el.setAttribute('href', el.getAttribute('data-href'))
            })
            tabs.tabs( "refresh" )
            $( '[data-href]' ).removeAttr('href')
        }
    })
}

// Adds container divs to structure
function addLocalDivsToStructure() {
    containers.forEach(cont => {
        if (cont.containerDiv.parentNode) cont.containerDiv.parentNode.removeChild(cont.containerDiv)
        cont.structure[settings.containerStyle].appendChild(cont.containerDiv)
    })
}

// Gives the menu items functionality
function createMenu() {
    // Applies tooltips to all elements with the title attribute
    $( document ).tooltip()

    // Creates the autocomplete/search element
    createCatComplete()
    $( "#searchInput" ).catcomplete({
        delay: 0,
        source: function(request, response) {
            matcher = new RegExp( $.ui.autocomplete.escapeRegex( request.term ), "i" )
            dataSet = []
            containers.forEach(cont => {
                cont.siblings.filter(sib => matcher.test(sib.name)).forEach(sib => {
                    dataSet.push({
                        name: sib.name,
                        label: unspecialText(sib.name),
                        category: cont.name,
                        link: sib
                    })
                })
            })
            siblings.filter(sib => !dataSet.some(dat => dat.name == sib.name) && matcher.test(sib.name)).forEach(sib => {
                dataSet.push({
                    name: sib.name,
                    label: unspecialText(sib.name),
                    category: "Other Siblings",
                    link: sib
                })
            })
            settings.tagData.filter(tag => matcher.test(tag.name)).forEach(tag => {
                dataSet.push({
                    name: tag.name,
                    label: unspecialText(tag.name),
                    category: "Tags",
                    link: tag
                })
            })

            response(dataSet)
        },
        select: function(e, ui) {
            if (ui.item.category == "Other Siblings") tabData = containerlessSibToTab(ui.item.link)
            else if (ui.item.category == "Tags") tabData = tagToTab(ui.item.link)
            else tabData = sibToTab(ui.item.link)

            showTab(tabData)
        }
    })
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
        if (belongsUnaltered(sib)) {
            sib.container = container
            return sib
        }
        else if (belongsUnaltered(getBig(siblings, sib))) return {
            name: sib.house,
            bigName: sib.bigName,
            littleNames: [],
            house: sib.house,
            tags: ['stub'],
            height: sib.height,
            container: container
        }
        else {
            validLittleNames = []
            sib.littleNames.forEach((littleName, idx) => {
                little = getLittle(siblings, sib, idx)
                if (belongsUnaltered(little)) validLittleNames.push(littleName)
            })
            return {
                name: sib.house,
                bigName: null,
                littleNames: validLittleNames,
                house: sib.house,
                tags: ['stub'],
                height: sib.height,
                container: container
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

            // If stub. should redirect to house info. Otherwise, redirects to sibling.
            if (sib.tags.includes('stub')) {
                tag = getTag(sib.house)
                addTagClicker(nameButton, tag)
            } else addNameClicker(nameButton, sib)
            nas.append(nameButton)

            // Apply tags to nas
            toPotentiallyConjunct = []
            conjunction = []
            sib.tags.forEach(tagName => {
                tag = getTag(tagName)

                // Apply tags to classes for formatting
                nameButton.classList.add(cleanStr(tagName))
                    
                // If it's a symbol, add the symbol
                if (tag.type.includes("SYMBOL")) {
                    tagImage = createTagImage(tag)
                    nas.appendChild(tagImage)

                    // Register conjunction of conjunctable tags
                    if (tag.type.includes("CONJ")) {
                        toPotentiallyConjunct.push(tagImage)
                        conjunction.push(tag)

                        // If this is the last to be conjuncted, do the conjoining!
                        if (sib.tags.indexOf(tagName) == sib.tags.length - 1 ||
                            !getTag(nextValueOf(sib.tags, tagName)).type.includes("CONJ")) {

                            if (conjunction.length > 1) {
                                toPotentiallyConjunct.forEach(forsakenChild => nas.removeChild(forsakenChild))
                                conjunctionImage = createTagImage(createTagConjunction(sib, conjunction))
                                nas.appendChild(conjunctionImage)
                            }

                            toPotentiallyConjunct = []
                            conjunction = []
                        }
                    }
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
                }
            })


            // The name itself
            if (sib.tags.includes('stub')) nameNameName = filterInvisText(sib.house)
            else nameNameName = filterInvisText(sib.name) + ' ' + pledgeClassToSymbols(sib.pledgeClassNumber)
            nameName = document.createTextNode(nameNameName)
            nameButton.appendChild(nameName)

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

        // Put siblings at the top in the correct position*
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

    centerTopSib = getValueAtMiddleIndex(minHeightSibs)
    centerTopSib.div.scrollIntoView({behavior: "auto", block: "start", inline: "center"})
    container.containerDiv.scrollTop = 0
    console.log(`With spacing, container ${container.name} has these siblings:`)
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