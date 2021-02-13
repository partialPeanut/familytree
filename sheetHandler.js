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
    console.log("Running...")
    gapi.load('client:auth2', initClient)
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    console.log("Running 2...")
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        console.log("Worked!")
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
        listNames()
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

function appendName(text) {
    nameButton = document.querySelector('#namesList')
    aName = document.createTextNode(text + '\n')
    nameButton.appendChild(aName)
}

function listNames() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1tmPGcVRGJIzRfyHdBvNvPNYUoEfSKlbbklQR54dzoAQ',
        range: 'Brothers!A1:A25'
      }).then((response) => {
        var result = response.result
        for (i = 0; i < result.values.length; i++) {
            appendName(result.values[i][0])
        }
        var numRows = result.values ? result.values.length : 0
        console.log(`${numRows} rows retrieved.`)
      })
}