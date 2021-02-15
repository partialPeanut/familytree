// Get raw spreadsheet data and convert it into a dope-ass data structure
function placeSiblings(result) {
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
                console.log(sibJSON.pledgeClass)
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

    drawTree()
}

// Covert tag set into a usable json
function parseTags(result) {
    tagData = {}
    result.values.forEach(function(row) {
        tagData[cleanStr(row[0])] = tagRowToJSON(row)
    })

    console.log(JSON.stringify)
    console.log(tagData)
}

// Draw the whole tree
function drawTree() {
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
            // Create a space before the block, can be empty
            space = document.createElement('div')
            space.classList.add('space')
            // space.style.width = '200px'
            row.append(space)

            // Create a block where all the stuff for an individual sibling is held
            block = document.createElement('div')
            block.classList.add('block')
            row.append(block)

            // Get a class name from the sib's house
            houseClean = cleanStr(sib.house)

            // If the sib has a big, add a line above the nas
            if (sib.bigName) {
                topLine = document.createElement('div')
                topLine.classList.add('line')
                topLine.classList.add('vert')
                topLine.classList.add(houseClean)
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

            // Some debugging stuff with the position and width of the block
            nameBreak = document.createElement("br")
            nameInfo = document.createTextNode(block.offsetLeft + ' ' + block.offsetWidth)
            nameButton.appendChild(nameBreak)
            nameButton.appendChild(nameInfo)

            // Add tag images to nas
            nameButton.classList.forEach(function(tag) {
                if (tagData.hasOwnProperty(tag)) {
                    tagJSON = tagData[tag]
                    if (tagJSON.hasOwnProperty(imageAddress)) {
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

        // Temporary across lines
        if (i != siblings.length-1) {
            across = document.createElement('div')
            across.id = 'across-' + i
            across.classList.add('across')
            tree.append(across)

            space = document.createElement('div')
            space.classList.add('space')
            // space.style.width = '200px'
            across.append(space)

            line = document.createElement('div')
            line.classList.add('line')
            line.classList.add('horiz')
            // line.style.width = '200px'
            across.append(line)
        }
    })
}