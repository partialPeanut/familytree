var CLIENT_ID = '34121438684-a07qn39bisdcvvac89p690fdclhrtsc8.apps.googleusercontent.com'
var API_KEY = 'AIzaSyATtpy15MZCsqCjRWCpFjKWiOeSy7OTvq8'

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"]

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

var authorizeButton = document.querySelector('#authorize_button')
var signoutButton = document.querySelector('#signout_button')
console.log(authorizeButton)
console.log(signoutButton)

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
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus)

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
        authorizeButton.onclick = handleAuthClick
        signoutButton.onclick = handleSignoutClick
    }, function(error) {
        console.log(error)
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none'
        signoutButton.style.display = 'block'
        placeSiblings()
    } else {
        authorizeButton.style.display = 'block'
        signoutButton.style.display = 'none'
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn()
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut()
}

// Converts a single sibling into a JSON format
function rowToJSON(row) {
    sibJSON = {}
    sibJSON.name = row[0]
    sibJSON.pledgeClass = row[1]
    sibJSON.gradYear = row[2]
    sibJSON.bigName = row[3] == 'XXX' ?  null : row[3]
    sibJSON.littleNames = []
    sibJSON.house = row[4] == 'XXX' ? null : row[4]
    sibJSON.tags = row[5] == 'XXX' ? [] : row[5].split(';')

    return sibJSON
}

function placeSiblings() {
    console.log("Place siblings: Layer Spam ver.")

    // Get the spreadsheet
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1tmPGcVRGJIzRfyHdBvNvPNYUoEfSKlbbklQR54dzoAQ',
        range: 'Brothers!A2:F'
      }).then((response) => {
        var result = response.result
        
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
                // Scan iteratively through each structure level for the sib's big
                $.each(siblings, function(key, val) {
                    i = parseInt(key)
                    console.log("i is: " + i)
                    if (val.hasOwnProperty(sibJSON.bigName)) {
                        // Create a new level if necessary
                        if (!siblings.hasOwnProperty(toString(i+1)))
                            siblings[toString(i+1)] = {}

                        // If they have no house, inherit their big's, otherwise, they're a founder
                        if (sibJSON.house === null) sibJSON.house = val[sibJSON.bigName].house
                        else sibJSON.tags.push("Founder")

                        // Place them in the structure at the level just below their big
                        sibJSON.height = i+1
                        siblings[toString(i+1)][sibJSON.name] = sibJSON
                    } else console.log(sibJSON.name + "'s big is not in this layer.")
                })
            }
        }

        console.log(siblings)
      })
}