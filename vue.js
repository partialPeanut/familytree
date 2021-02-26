function loadVue() {
    dataGetter = new Vue({
        el: '#dataGetter',
        data: {
            manuals: true,
            internets: false
        }
    })

    app = new Vue({
        el: '#app',
        data: {
            displayTab: 'tree'
        },
        methods: {
            showTab: function(tab) {
                displayTab = tab
            }
        }
    })
}