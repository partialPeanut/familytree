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
            displayTab: 'tree'
        }
    })

    nameTab = new Vue({
        el: '#nameTab',
        data: {
            name: 'Name',
            pledgeClass: 'Pledge Class',
            house: 'House',
            tags: ['Tag 1', 'Tag 2'],
            bigName: 'Big Name',
            littleNames: ['Little 1', 'Little 2']
        }
    })
}