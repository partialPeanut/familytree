defaultSiblings = [
    [
        {
            "name": "Penny Rose Scharf",
            "formalName": "Penelope Rose Scharf",
            "pledgeClass": "Psi Triton",
            "gradYear": "???",
            "bigName": null,
            "littleNames": [
                "Tommy \"Tank\" Bullock", "Ryan \"Mercedes\" Loucaides"
            ],
            "house": "Lazarus Clan",
            "tags": [
                "Transfem", "Pan Demi"
            ],
            "height": 0
        }
    ],
    [
        {
            "name": "Tommy \"Tank\" Bullock",
            "formalName": "Thomas Bullock",
            "pledgeClass": "Alpha Tetarton",
            "gradYear": "???",
            "bigName": "Penny Rose Scharf",
            "littleNames": [
                "Finn Pfeifer", "Jonathan Couta"
            ],
            "house": "Lazarus Clan",
            "tags": [],
            "height": 1
        },
        {
            "name": "Ryan \"Mercedes\" Loucaides",
            "formalName": "Ryan Loucaides",
            "pledgeClass": "Beta Tetarton",
            "gradYear": "???",
            "bigName": "Penny Rose Scharf",
            "littleNames": [],
            "house": "Lazarus Clan",
            "tags": [],
            "height": 1
        }
    ],
    [
        {
            "name": "Finn Pfeifer",
            "formalName": "Finn Pfeifer",
            "pledgeClass": "Beta Tetarton",
            "gradYear": "???",
            "bigName": "Tommy \"Tank\" Bullock",
            "littleNames": [],
            "house": "Lazarus Clan",
            "tags": [],
            "height": 2
        },
        {
            "name": "Jonathan Couta",
            "formalName": "Jonathan Couta",
            "pledgeClass": "Gamma Tetarton",
            "gradYear": "???",
            "bigName": "Tommy \"Tank\" Bullock",
            "littleNames": [],
            "house": "Lazarus Clan",
            "tags": [],
            "height": 2
        }
    ]
]

localStorage.removeItem('siblings')

if (!localStorage.getItem('siblings')) {
    localStorage.setItem('siblings', JSON.stringify(defaultSiblings))
    siblings = defaultSiblings
}
else siblings = JSON.parse(localStorage.getItem('siblings'))