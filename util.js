// Converts a single sibling into a JSON format
function sibRowToJSON(row) {
    sibJSON = {}
    sibJSON.name = row[0]
    sibJSON.pledgeClass = row[1]
    sibJSON.pledgeClassNumber = parseInt(row[6])
    sibJSON.gradYear = row[2]
    sibJSON.bigName = row[3] == '' ?  null : row[3]
    sibJSON.littleNames = []
    sibJSON.house = row[4] == '' ? null : row[4]
    sibJSON.tags = row[5] == '' ? [] : row[5].split(';')

    return sibJSON
}

// Converts a single set of tag data into a JSON format
function tagRowToJSON(row) {
    tagJSON = {}
    tagJSON.name = row[0]
    tagJSON.description = row[1]
    tagJSON.relatedTags = row[2] == '' ? [] : row[2].split(';')
    tagJSON.type = row[3]
    if (row[3] != '') tagJSON.imageAddress = row[4]
    if (row[4] != '') tagJSON.borderWidth = row[5]
    if (row[5] != '') tagJSON.borderColor = row[6]
    if (row[6] != '') tagJSON.backgroundColor = row[7]
    if (row[7] != '') tagJSON.textColor = row[8]
    if (row[8] != '') tagJSON.fontSize = row[9]
    if (row[9] != '') tagJSON.lineHeight = row[10]
    if (row[10] != '') tagJSON.fontName = row[11]
    if (row[11] != '') tagJSON.outlineType = row[12]
    if (row[12] != '') tagJSON.outlineColor = row[13]

    return tagJSON
}

// Converts a single container into a JSON format
function contaierRowToJSON(row) {
    contJSON = {}
    contJSON.name = row[0]
    contJSON.tabPos = row[1]
    contJSON.row = parseInt(row[2])
    contJSON.column = parseInt(row[3])
    contJSON.houses = row[4].split(';')

    return contJSON
}

// Prepares a string to be used as a class name
function cleanStr(string) {
    newStr = string.replace(/ |\'|\"|\.|\+|@/g, '')
    return newStr
}

// Makes invisible text invisible
function filterInvisText(string) {
    newStr = string.split('_')[0]
    return newStr
}

// Makes special text not special
function unspecialText(string) {
    newStr = filterInvisText(string).replace(/@/g, 'o')
    return newStr
}

// Turns a number of pixels into an integer
function pxToInt(pixels) {
    return parseInt(pixels.replace(/px/g, ''))
}

// Turns a pledge class's number into its corresponding unicode symbols
function pledgeClassToSymbols(pledgeClassNumber) {
    classNum = (pledgeClassNumber-1) % 24
    metaClassNum = Math.floor((pledgeClassNumber-1)/24)

    classSymbols = ["Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ", "Ν", "Ξ", "Ο", "Π", "Ρ", "Σ", "Τ", "Υ", "Φ", "Χ", "Ψ", "Ω"]
    metaClassSymbols = ['', "δ", "ψ", "τ"]

    return classSymbols[classNum] + metaClassSymbols[metaClassNum]
}

// Returns a little's big's JSON
function getBig(sibSet, sib) {
    return sibSet.find(sibling => sibling.name == sib.bigName)
}

// Returns a big's little's JSON from their index
function getLittle(sibSet, big, littleIndex) {
    return sibSet.find(sibling => sibling.name == big.littleNames[littleIndex])
}

// Returns the minimum value of a key in an array of JSONs.
function minValue(JSONArray, key) {
    value = JSONArray[0][key]
    while (JSONArray.some(JSON => JSON[key] < value)) value--
    return value
}

// Returns the maximum value of a key in an array of JSONs.
function maxValue(JSONArray, key) {
    value = 0
    while (JSONArray.some(JSON => JSON[key] > value)) value++
    return value
}

// Returns the value at the middle index (left bias) of an array.
function getValueAtMiddleIndex(array) {
    midIdx = Math.floor((array.length-1)/2)
    return array[midIdx]
}

// Determines the distance of separation needed to make two siblings touch
function distToTouch(sibLeft, sibRight) {
    leftWidths = sibLeft.branchWidths
    rightWidths = sibRight.branchWidths

    // The difference in height between the two siblings
    heightDiff = sibLeft.height - sibRight.height

    // If they wouldn't touch, they can go on top of each other
    if ((heightDiff > 0 && leftWidths.length <= heightDiff)
    || (heightDiff < 0 && rightWidths.length <= -heightDiff))
        return 0

    // Loop through heights looking for the most conflicting littles
    start = Math.max(heightDiff, 0)
    end = Math.min(leftWidths.length, rightWidths.length + heightDiff)
    dist = 0
    for (j = start; j < end; j++) {
        thisDist = leftWidths[j][1] - rightWidths[j-heightDiff][0]
        dist = Math.max(dist, thisDist)
    }

    return dist
}

// Evenly spaces all littles between two "cap" littles
function evenSpacing(container, big, leftCap, rightCap) {
    capDiff = rightCap - leftCap
    if (capDiff == 1) {
        console.log("Something's gone horribly wrong with the evenSpacing thing")
        return
    }

    // Do a bunch of calculating
    rightestMiddleLittle = getLittle(container.siblings, big, rightCap-1)
    rightestMiddlePos = big.littleRelPos[rightCap-1]
    rightLittle = getLittle(container.siblings, big, rightCap)
    rightPos = big.littleRelPos[rightCap]
    gap = rightPos + rightLittle.branchWidths[0][0] - rightestMiddlePos - rightestMiddleLittle.branchWidths[0][1] - settings.sizes['blockMargin']

    // Evenly space them
    for (Ldx = leftCap+1; Ldx < rightCap; Ldx++) {
        marginIncrease = Math.floor(gap*(Ldx-leftCap)/capDiff)
        big.littleRelPos[Ldx] += marginIncrease
    }

    console.log("Making " + big.name + "'s littles more evenly spaced!")
}

// Stores the corrected relative positions and hitboxes of a sib's descendants.
function calculateRelativePositions(container, sib) {
    thisBlock = sib.div
    thisW = $(thisBlock).width()
    thisW = Math.ceil(thisW)
    $(thisBlock).width(thisW)

    sib.width = thisW
    sib.branchWidths = [[]]
    sib.branchWidths[0] = [-thisW/2, thisW/2]
    sib.littleRelPos = [0]

    // If has no littles, return, else do recursion
    if (sib.littleNames.length == 0) return
    else sib.littleNames.forEach(function(littleName, idx) {
        calculateRelativePositions(container, getLittle(container.siblings, sib, idx))
    })

    // Do simple case of one little
    if (sib.littleNames.length == 1) {
        little = getLittle(container.siblings, sib, 0)
        sib.branchWidths = sib.branchWidths.concat(little.branchWidths)
        return
    }

    // FOR MULTIPLE LITTLES:
    // Loop through other littles and determine the necessary distance from each previous other little
    sib.littleNames.forEach(function(littleName, idx) {
        if (idx == 0) return
        little = getLittle(container.siblings, sib, idx)

        pos = 0
        limiter = idx-1
        for (jdx = idx-1; jdx >= 0; jdx--) {
            testLittle = getLittle(container.siblings, sib, jdx)
            thisPos = Math.floor(sib.littleRelPos[jdx] + distToTouch(testLittle, little) + settings.sizes['blockMargin'])

            // This little is indeed pushed back by a prior little
            if (thisPos > pos) {
                pos = thisPos
                limiter = jdx
            }
        }

        sib.littleRelPos.push(pos)

        // If it can, evenly space littles that have wiggle room
        if (limiter < idx-1) {
            evenSpacing(container, sib, limiter, idx)
        }
    })

    // Adjust to make big in the center // TODO: SNAP TO FIRST SETTING
    rightestPos = sib.littleRelPos[sib.littleRelPos.length-1]
    sib.littleRelPos.forEach(function(val, vdx) {
        sib.littleRelPos[vdx] = val - Math.floor(rightestPos/2)
    })

    // Adjust slightly for ocd if littles are close enough to make a straight line
    adj = 0
    sib.littleRelPos.forEach(function(val, vdx) {
        if (Math.abs(val) < 10) { // TODO: OCD TOLERANCE SETTING (snap to option?)
            adj = -val
            if (adj != 0) console.log("Adjusting " + sib.name +"'s littles by " + val + " for OCD reasons!")
            return false
        }
    })
    sib.littleRelPos.forEach(function(val, vdx) {
        sib.littleRelPos[vdx] = val + adj
    })

    // Determine the deepest this rabbit hole goes
    longestLength = 0
    sib.littleNames.forEach(function(littleName, idx) {
        little = getLittle(container.siblings, sib, idx)
        longestLength = Math.max(longestLength, little.branchWidths.length)
    })

    // Add littles' hitboxes
    leftIdx = 0
    rightIdx = sib.littleNames.length-1
    for (i = 0; i < longestLength; i++) {
        // Find the leftest little with a descendent of this height and get how far left it is
        leftLittle = getLittle(container.siblings, sib, leftIdx)
        while (leftLittle.branchWidths.length <= i) {
            leftIdx++
            leftLittle = getLittle(container.siblings, sib, leftIdx)
        }
        leftWidth = leftLittle.branchWidths[i][0] + sib.littleRelPos[leftIdx]

        // Find the rightest little with a descendent of this height and get how far right it is
        rightLittle = getLittle(container.siblings, sib, rightIdx)
        while (rightLittle.branchWidths.length <= i) {
            rightIdx--
            rightLittle = getLittle(container.siblings, sib, rightIdx)
        }
        rightWidth = rightLittle.branchWidths[i][1] + sib.littleRelPos[rightIdx]

        // Append that to the sib's widths
        sib.branchWidths.push([leftWidth, rightWidth])
    }
}

// Sets littles' absolute positions recursively
function setLittleAbsolutePositions(container, sib) {
    sib.littleNames.forEach(function(littleName, idx) {
        little = getLittle(container.siblings, sib, idx)
        relPos = sib.littleRelPos[idx]

        little.position = Math.floor(sib.position + relPos)
        setLittleAbsolutePositions(container, little)
    })
}

// Sets the position that the container will be focused on
function setScrollLock(container) {
    thisTreeContainer = container.containerDiv
    slx = thisTreeContainer.scrollLeft + thisTreeContainer.clientWidth/2
    container.scrollLock = [slx, thisTreeContainer.scrollTop]
}

// Scrolls a container to the position it should be locked at
function goToScrollLock(container) {
    thisTreeContainer = container.containerDiv
    stx = container.scrollLock[0] - thisTreeContainer.clientWidth/2
    thisTreeContainer.scrollTo(stx, container.scrollLock[1])
}

// Changes tab displayed alongside tree, or only the tree itself.
function showTab(tabData) {
    containers.forEach(cont => setScrollLock(cont))

    if (!appElement.split) {
        appElement.split = Split(['#leftColContainer', '#rightColContainer'], {
            gutterSize: 12,
            sizes: [67, 33],
            onDragStart: function (sizes) {
                containers.forEach(cont => setScrollLock(cont))
            },
            onDrag: function (sizes) {
                containers.forEach(cont => goToScrollLock(cont))
            },
        })
    }

    appElement.tabHistory = appElement.tabHistory.slice(0, appElement.tabPosition+1)
    appElement.tabHistory.push(tabData)
    appElement.tabPosition++

    setTimeout(function() {
        containers.forEach(cont => goToScrollLock(cont))
        if (tabData.div)
            tabData.div.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
    }, 0)
}

// Goes back one tab in the tab nav
function goBack() {
    if (appElement.tabPosition == 1) exitTab()
    else {
        appElement.tabPosition--
        if (appElement.getTabData().div) {
            setTimeout(function() {
                appElement.getTabData().div.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
            }, 0)
        }
    }
}
// Goes forward one tab in the tab nav
function goForward() {
    appElement.tabPosition++
    if (appElement.getTabData().div) {
        setTimeout(function() {
            appElement.getTabData().div.scrollIntoView({behavior: "smooth", block: "center", inline: "center"})
        }, 0)
    }
}

// Goes back to tree
function exitTab() {
    containers.forEach(cont => setScrollLock(cont))

    appElement.tabHistory = [{
        tabType: 'tree',
        name: 'Name',
        imgSrc: 'https://drive.google.com/thumbnail?id=1pIIIWQAERbpfE7mdgzFOvIzZnF7RKVjs',
        description: 'Description',
        pledgeClass: 'Pledge Class',
        house: 'House',
        tags: ['Tag 1', 'Tag 2'],
        bigName: 'Big Name',
        littleNames: ['Little 1', 'Little 2'],
        div: undefined
    }]
    appElement.tabPosition = 0
    if (appElement.split) {
        appElement.split.destroy()
        appElement.split = null
    }

    setTimeout(function() {
        containers.forEach(cont => goToScrollLock(cont))
    }, 0)
}