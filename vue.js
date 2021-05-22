function loadVue() {
    dataGetter = new Vue({
        el: '#dataGetter',
        data: {
            manuals: true
        }
    })

    appElement = new Vue({
        el: '#app',
        data: {
            tabHistory: ['tree'],
            tabPosition: 0,
            nameTabData: {
                name: 'Name',
                pledgeClass: 'Pledge Class',
                house: 'House',
                tags: ['Tag 1', 'Tag 2'],
                bigName: 'Big Name',
                littleNames: ['Little 1', 'Little 2']
            },
            tagTabData: {
                name: 'Name',
                imgSrc: 'img/gay.png',
                description: 'Description'
            }
        },
        methods: {
            getDisplayTab: function() {
                return this.tabHistory[this.tabPosition]
            },
            canGoForward: function() {
                return this.tabPosition < this.tabHistory.length - 1
            },
            displayTagInfo: function(tagName) {
                console.log("Displaying " + tagName + " from menu")
                tag = settings.tagData[cleanStr(tagName)]
                displayTagInfo(tag)
            },
            goToName: function(sibName) {
                console.log("Displaying " + sibName + " from menu")
                $('#' + cleanStr(sibName) + ' button').trigger("click")
            }
        }
    })
}