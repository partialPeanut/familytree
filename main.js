// Get raw spreadsheet data and convert it into a dope-ass data structure.
function placeSiblings(result) {
    console.log("Place Siblings: Workable Ver.")

    // Log the number of siblings
    var numRows = result.values ? result.values.length : 0
    console.log(`${numRows} siblings retrieved.`)

    // Put all siblings into a JSON structure. This only works if the sheet is properly sorted and there are no spelling errors.
    siblings = {'0': {}}
    for (x = 0; x < result.values.length; x++) {
        sibJSON = rowToJSON(result.values[x])
        // If the sib has no big, they're at height 0.
        if (sibJSON.bigName === null) {
            // If they have no house, they're in the FoLS, otherwise, they're a founder
            if (sibJSON.house === null) sibJSON.house = "Field of Lost Souls"
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

    console.log("Siblings:")
    console.log(JSON.stringify(siblings))
    console.log(siblings)

    drawTree()
}

function drawTree() {
    console.log("Main: Slap Em Down ver. 1")

    // Loop through the rows
    $.each(siblings, function(key, val) {
        i = parseInt(key)

        // Create rows
        row = document.createElement('div')
        row.id = 'row-' + i
        row.className = 'row'
        if (i == 0 || i == siblings.length-1) {
            row.className = 'row end'
        }
        
        tree = document.querySelector('#tree')
        tree.append(row)

        $.each(val, function(sibName, sib) {
            space = document.createElement('div')
            space.className = 'space'
            // space.style.width = '200px'
            row.append(space)

            block = document.createElement('div')
            block.className = 'block'
            row.append(block)

            if (sib.bigName) {
                topLine = document.createElement('div')
                topLine.className = 'line vert'
                block.append(topLine)
            }

            nas = document.createElement('div')
            nas.className = 'nameAndSymbols'
            block.append(nas)

            nameButton = document.createElement("BUTTON")
            nameButton.className = 'name'
            nas.append(nameButton)

            nameName = document.createTextNode(sib.name + ' ' + nameButton.offsetLeft)
            nameButton.appendChild(nameName)

            if (sib.littleNames.length > 0) {
                botLine = document.createElement('div')
                botLine.className = 'line vert'
                block.append(botLine)
            }
        })

        if (i != siblings.length-1) {
            across = document.createElement('div')
            across.id = 'across-' + i
            across.className = 'across'
            tree.append(across)

            space = document.createElement('div')
            space.className = 'space'
            // space.style.width = '200px'
            across.append(space)

            line = document.createElement('div')
            line.className = 'line horiz'
            // line.style.width = '200px'
            across.append(line)
        }
    })
}