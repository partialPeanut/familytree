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
    tagJSON.type = row[1]
    if (row[2] != '') tagJSON.imageAddress = row[2]
    if (row[3] != '') tagJSON.borderWidth = row[3]
    if (row[4] != '') tagJSON.borderColor = row[4]
    if (row[5] != '') tagJSON.backgroundColor = row[5]
    if (row[6] != '') tagJSON.textColor = row[6]
    if (row[7] != '') tagJSON.fontSize = row[7]
    if (row[8] != '') tagJSON.lineHeight = row[8]
    if (row[9] != '') tagJSON.fontName = row[9]

    return tagJSON
}

// Prepares a string to be used as a class name
function cleanStr(string) {
    newStr = string.replace(/ |\'|\"|\.|@/g, '')
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
function getBig(sib) {
    return siblings[sib.height-1][sib.bigName]
}

// Returns a big's little's JSON from their index
function getLittle(big, littleIndex) {
    return siblings[big.height+1][big.littleNames[littleIndex]]
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
function evenSpacing(big, leftCap, rightCap) {
    capDiff = rightCap - leftCap
    if (capDiff == 1) {
        console.log("Something's gone horribly wrong with the evenSpacing thing")
        return
    }

    // Do a bunch of calculating
    rightestMiddleLittle = getLittle(big, rightCap-1)
    rightestMiddlePos = big.littleRelPos[rightCap-1]
    rightLittle = getLittle(big, rightCap)
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
function calculateRelativePositions(sib) {
    thisBlockName = '#' + cleanStr(sib.name)
    thisW = $(thisBlockName).width()
    thisW = Math.ceil(thisW)
    $(thisBlockName).width(thisW)

    sib.width = thisW
    sib.branchWidths = [[]]
    sib.branchWidths[0] = [-thisW/2, thisW/2]
    sib.littleRelPos = [0]

    // If has no littles, return, else do recursion
    if (sib.littleNames.length == 0) return
    else sib.littleNames.forEach(function(littleName, idx) {
        calculateRelativePositions(getLittle(sib, idx))
    })

    // Do simple case of one little
    if (sib.littleNames.length == 1) {
        little = getLittle(sib, 0)
        sib.branchWidths = sib.branchWidths.concat(little.branchWidths)
        return
    }

    // FOR MULTIPLE LITTLES:
    // Loop through other littles and determine the necessary distance from each previous other little
    sib.littleNames.forEach(function(littleName, idx) {
        if (idx == 0) return
        little = getLittle(sib, idx)

        pos = 0
        limiter = idx-1
        for (jdx = idx-1; jdx >= 0; jdx--) {
            testLittle = getLittle(sib, jdx)
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
            evenSpacing(sib, limiter, idx)
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
        little = getLittle(sib, idx)
        longestLength = Math.max(longestLength, little.branchWidths.length)
    })

    // Add littles' hitboxes
    leftIdx = 0
    rightIdx = sib.littleNames.length-1
    for (i = 0; i < longestLength; i++) {
        // Find the leftest little with a descendent of this height and get how far left it is
        leftLittle = getLittle(sib, leftIdx)
        while (leftLittle.branchWidths.length <= i) {
            leftIdx++
            leftLittle = getLittle(sib, leftIdx)
        }
        leftWidth = leftLittle.branchWidths[i][0] + sib.littleRelPos[leftIdx]

        // Find the rightest little with a descendent of this height and get how far right it is
        rightLittle = getLittle(sib, rightIdx)
        while (rightLittle.branchWidths.length <= i) {
            rightIdx--
            rightLittle = getLittle(sib, rightIdx)
        }
        rightWidth = rightLittle.branchWidths[i][1] + sib.littleRelPos[rightIdx]

        // Append that to the sib's widths
        sib.branchWidths.push([leftWidth, rightWidth])
    }
}

// Sets littles' absolute positions recursively
function setLittleAbsolutePositions(sib) {
    sib.littleNames.forEach(function(littleName, idx) {
        little = getLittle(sib, idx)
        relPos = sib.littleRelPos[idx]

        little.position = Math.floor(sib.position + relPos)
        setLittleAbsolutePositions(little)
    })
}