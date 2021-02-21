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
        getSheetValues()
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

// Get raw spreadsheet data and convert it into a dope-ass data structure.
function getSheetValues() {
    console.log("Getting sheet values...")

    // Get the spreadsheet, but the settings one
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1tmPGcVRGJIzRfyHdBvNvPNYUoEfSKlbbklQR54dzoAQ',
        range: 'Size Settings!A2:B'
      }).then((response) => {
        setDefaultSettings(response.result)
      })

    // Get the spreadsheet, but the tags one
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1tmPGcVRGJIzRfyHdBvNvPNYUoEfSKlbbklQR54dzoAQ',
        range: 'Tag Data!A2:B'
      }).then((response) => {
        parseTags(response.result)
      })

    // Get the spreadsheet
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1tmPGcVRGJIzRfyHdBvNvPNYUoEfSKlbbklQR54dzoAQ',
        range: 'Siblings!A2:G'
      }).then((response) => {
        placeSiblings(response.result)
      })
}