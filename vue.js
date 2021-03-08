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
            displayTab: 'tree',
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
                description: 'Description'
            }
        },
        methods: {
            displayTagInfo: function(tagName) {
                console.log("Displaying " + tagName)
                tag = settings.tagData[tagName]
                displayTagInfo(tag)
            },
            goToName: function(sibName) {
                console.log("Displaying " + sibName)
                sibBlock = document.querySelector(('#' + cleanStr(sibName)))
                console.log(sibBlock)
                sibBlock.trigger("click")
            }
        }
    })
}