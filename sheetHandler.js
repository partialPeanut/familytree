var CLIENT_ID = '34121438684-a07qn39bisdcvvac89p690fdclhrtsc8.apps.googleusercontent.com'
var API_KEY = 'AIzaSyATtpy15MZCsqCjRWCpFjKWiOeSy7OTvq8'

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"]

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/drive.readonly";

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
        getImages()
        getSheetValues()
    }, function(error) {
        console.log(error)
    })
}

function getImages() {
    gapi.client.drive.files.list({
        q: "'14DZKB1KB-m61xvU-quLF6GA3VUeyyUbr' in parents",
      })
      .then((response) => {
        files = response.files
        for(i = 0; i < files.length; i++) {
            thisFile = files[i]
            if (thisFile.mimeType == "image/png")
                downloadImage(thisFile.id, thisFile.name)
        }
      })
}

function downloadImage(id, filename) {
    dest = fs.createWriteStream('/img/' + filename)
    gapi.client.drive.files.get({
        fileId: id,
        alt: 'media'
      })
      .on('end', function () {
        console.log('Done');
      })
      .on('error', function (err) {
        console.log('Error during download', err)
      })
      .pipe(dest)
}

// Get raw spreadsheet data and convert it into a dope-ass data structure.
function getSheetValues() {
    console.log("Getting sheet values...")

    // Get the spreadsheet bits and do stuff to em
    gapi.client.sheets.spreadsheets.values.batchGet({
        spreadsheetId: '1tmPGcVRGJIzRfyHdBvNvPNYUoEfSKlbbklQR54dzoAQ',
        ranges: ['Siblings!A2:G', 'Tag Settings!A2:M', 'Size Settings!A2:B']
      }).then((response) => {
        ranges = response.result.valueRanges
        settings = {}
        parseTags(ranges[1])
        placeSiblings(ranges[0])
        setDefaultSizeSettings(ranges[2])

        main()
      })
}

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
    defaultTagData = {}
    result.values.forEach(function(row) {
        tag = tagRowToJSON(row)
        defaultTagData[cleanStr(row[0])] = tag
    })

    settings.tagData = defaultTagData

    console.log("Tags:")
    console.log(JSON.stringify(settings.tagData))
    console.log(settings.tagData)
}

// Apply default settings given by spreadsheet
function setDefaultSizeSettings(result) {
    defaultSizes = {}
    docStyle = document.body.style
    result.values.forEach(function(row) {
        defaultSizes[cleanStr(row[0])] = parseInt(row[1])
    })

    nameHeight = defaultSizes['nameHeight']
    lineHeight = defaultSizes['lineHeight']
    endBlockHeight = nameHeight + lineHeight
    defaultSizes['endBlockHeight'] = endBlockHeight
    blockHeight = nameHeight + 2*lineHeight
    defaultSizes['blockHeight'] = blockHeight

    settings.sizes = defaultSizes

    console.log("Size Settings:")
    console.log(JSON.stringify(settings.sizes))
    console.log(settings.sizes)
}