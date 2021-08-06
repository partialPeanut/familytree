function loadVue() {
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
            sibToName: function(sibName) {
                console.log("Displaying " + sibName + " from a sibling")
                currSib = this.getTabData().sib
                newSib = currSib.container.siblings.find(sib => sib.name == sibName)
                tabData = nameToTag(newSib)
                showTab(tabData)
            },
            tagToName: function(sibName) {
                console.log("Displaying " + sibName + " from a tag")
                var newSib
                containers.some(cont => {
                    newSib = cont.siblings.find(sib => sib.name == sibName)
                    if (newSib) return true
                })
                tabData = nameToTag(newSib)
                showTab(tabData)
            }
        }
    })
}