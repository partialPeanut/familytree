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
            tabHistory: [{ tabType: 'load' }],
            tabPosition: 0,
            split: null,
            settings: null
        },
        methods: {
            getDisplayTab: function() {
                return this.tabHistory[this.tabPosition].tabType
            },
            getTabData: function() {
                return this.tabHistory[this.tabPosition]
            },
            getSettings: function() {
                return this.settings
            },
            canGoForward: function() {
                return this.tabPosition < this.tabHistory.length - 1
            },
            displayTagInfo: function(tagName) {
                console.log("Displaying " + tagName + " from menu")
                tag = getTag(tagName)
                tabData = tagToTab(tag)
                showTab(tabData)
            },
            goToName: function(sibName) {
                console.log("Displaying " + sibName + " from menu")
                $('#' + cleanStr(sibName) + ' button').trigger("click")
            }
        }
    })
}