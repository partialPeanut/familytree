function loadVue() {
    dataGetter = new Vue({
        el: '#dataGetter',
        data: {
            manuals: true
        }
    })

    app = new Vue({
        el: '#app',
        data: {
            displayTab: 'tree',
            tabCount: 1
        },
        methods: {
            showTab: function(tab) {
                displayTab = tab
            }
        }
    })
}