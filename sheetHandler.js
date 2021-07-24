var CLIENT_ID = '34121438684-a07qn39bisdcvvac89p690fdclhrtsc8.apps.googleusercontent.com'
var API_KEY = 'AIzaSyATtpy15MZCsqCjRWCpFjKWiOeSy7OTvq8'

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4", "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load('client:auth2', initClient)
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        getSheetValues()
    }, function(error) {
        console.log(error)
    })
}

// Get raw spreadsheet data and convert it into a dope-ass data structure.
function getSheetValues() {
    console.log("Getting sheet values...")

    // Get the spreadsheet bits and do stuff to em
    gapi.client.sheets.spreadsheets.values.batchGet({
        spreadsheetId: '1tmPGcVRGJIzRfyHdBvNvPNYUoEfSKlbbklQR54dzoAQ',
        ranges: ['Siblings!A2:G', 'Size Settings!A2:B', 'Tag Settings!A2:N', 'Conjunction Grid!A1:N', 'Container Settings!A2:E']
      }).then((response) => {
        ranges = response.result.valueRanges
        settings = {}
        parseTags(ranges[2])
        parseConjunctionGrid(ranges[3])
        placeSiblings(ranges[0])
        setDefaultSizeSettings(ranges[1])
        createContainerSettings(ranges[4])

        main()
      })
}

// Get raw spreadsheet data and convert it into a dope-ass data structure
function placeSiblings(result) {
    // Log the number of siblings
    var numRows = result.values ? result.values.length : 0
    console.log(`${numRows} siblings retrieved.`)

    // Put all siblings into a JSON structure. This only works if the sheet is properly sorted and there are no spelling errors.
    siblings = []
    result.values.forEach(val => {
        sibJSON = sibRowToJSON(val)
        // If the sib has no big, they're at height 0.
        if (sibJSON.bigName === null) {
            // If they have no house, they're in the Lone Wolves or Asphodel
            if (sibJSON.house === null) {
                //console.log(sibJSON.pledgeClass)
                if (sibJSON.pledgeClass == "Alpha") sibJSON.house = "Lone Wolves"
                else sibJSON.house = "Asphodel Clan"
            }

            // Place them in the structure at height 0
            sibJSON.height = 0
            siblings.push(sibJSON)
        }
        else {
            // Find the sib's big
            bigSib = siblings.find(sib => sib.name == sibJSON.bigName)
            if (bigSib !== undefined) {
                // If they have no house, inherit their big's
                if (sibJSON.house === null) sibJSON.house = bigSib.house

                // Add themselves to their big's list of littles
                bigSib.littleNames.push(sibJSON.name)

                // Put em in the array!
                sibJSON.height = bigSib.height+1
                siblings.push(sibJSON)
            }

            // There has been some error or misspelling.
            else {
                // If they have no house, inherit their big's, otherwise, they're Asphodel
                if (sibJSON.house === null) sibJSON.house = "Asphodel Clan"

                // Put em in the array! But at -1.....
                sibJSON.height = -1
                siblings.push(sibJSON)

                console.log("Something went wrong and " + sibJSON.name + " could not find their big, " + sibJSON.bigName)
            }
        }
    })

    // Sorts siblings into the order they should appear in on the tree.
    function recursiveSort(sibA, sibB) {
        if (sibA.height != sibB.height) return sibA.height < sibB.height ? -1 : 1
        else if (sibA.height == 0 || sibA.bigName == sibB.bigName) {
            if (sibA.pledgeClassNumber != sibB.pledgeClassNumber) return sibA.pledgeClassNumber - sibB.pledgeClassNumber
            else return sibA.name < sibB.name ? -1 : 1
        }
        else return recursiveSort(getBig(siblings, sibA), getBig(siblings, sibB))
    }
    siblings.sort(recursiveSort)

    // Add siblings to their tags' references
    siblings.forEach(sib => {
        sib.tags.forEach(tagName => {
            tag = getTag(tagName)
            tag.taggedSibs.push(sib)
        })
    })
        
    console.log("All Siblings:")
    console.log(siblings)
}

// Convert tag set into a usable json
function parseTags(result) {
    defaultTagData = []
    result.values.forEach(row => {
        tag = tagRowToJSON(row)
        defaultTagData.push(tag)
    })

    settings.tagData = defaultTagData

    console.log("Tags:")
    console.log(settings.tagData)
}

// Translate the Conjunction Grid
function parseConjunctionGrid(result) {
    conjunctionGrid = {}
    romTypes = result.values[0]
    result.values.forEach(row => {
        if (row != romTypes)  {
            thisRowIDs = {}
            for (i = 1; i < row.length; i++) {
                if (row[i] != '') thisRowIDs[romTypes[i]] = { imageAddress: row[i] }
            }
            conjunctionGrid[row[0]] = thisRowIDs
        }
    })

    settings.conjunctionGrid = conjunctionGrid

    console.log("Conjunction Grid:")
    console.log(settings.conjunctionGrid)
}

// Apply default size settings given by spreadsheet
function setDefaultSizeSettings(result) {
    defaultSizes = {}
    docStyle = document.body.style
    result.values.forEach(row => defaultSizes[cleanStr(row[0])] = parseInt(row[1]))

    nameHeight = defaultSizes['nameHeight']
    lineHeight = defaultSizes['lineHeight']
    endBlockHeight = nameHeight + lineHeight
    defaultSizes['endBlockHeight'] = endBlockHeight
    blockHeight = nameHeight + 2*lineHeight
    defaultSizes['blockHeight'] = blockHeight

    settings.sizes = defaultSizes

    console.log("Size Settings:")
    console.log(settings.sizes)
}

// Apply default container settings given by spreadsheet
function createContainerSettings(result) {
    containers = []
    docStyle = document.body.style
    result.values.forEach(function(row) {
        container = contaierRowToJSON(row)
        containers.push(container)
    })

    settings.containers = containers

    console.log("Containers:")
    console.log(settings.containers)
}