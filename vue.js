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
            tabHistory: [{
                tabType: 'load',
                name: 'Name',
                imgSrc: 'https://drive.google.com/thumbnail?id=1pIIIWQAERbpfE7mdgzFOvIzZnF7RKVjs',
                description: 'Description',
                pledgeClass: 'Pledge Class',
                house: 'House',
                tags: ['Tag 1', 'Tag 2'],
                bigName: 'Big Name',
                littleNames: ['Little 1', 'Little 2'],
                div: undefined
            }],
            tabPosition: 0,
            split: null
        },
        methods: {
            getDisplayTab: function() {
                return this.tabHistory[this.tabPosition].tabType
            },
            getTabData: function() {
                return this.tabHistory[this.tabPosition]
            },
            canGoForward: function() {
                return this.tabPosition < this.tabHistory.length - 1
            },
            displayTagInfo: function(tagName) {
                console.log("Displaying " + tagName + " from menu")
                tag = settings.tagData.find(td => td.name == tagName)
                tabData = {
                    tabType: "tagTab",
                    name: tag.name,
                    imgSrc: tag.imageAddress ? "https://drive.google.com/thumbnail?id=" + tag.imageAddress : undefined,
                    description: tag.description
                }
                showTab(tabData)
            },
            goToName: function(sibName) {
                console.log("Displaying " + sibName + " from menu")
                $('#' + cleanStr(sibName) + ' button').trigger("click")
            }
        }
    })
}