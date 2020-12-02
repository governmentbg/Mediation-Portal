var textfieldComponent = Vue.component('textfieldfilter', {
    props: {
        func: Function
    },
    data() {
        return {
            selectedElement: ''
        };
    },
    created: function () {
        let vue = this;
    },
    methods: {
        saveInsertedValue: function (value, filterParameterName) {
            this.func(value, filterParameterName);
        },
        saveSelectedDropdownValue: function (value, filterParameterName) {
            this.func(value, filterParameterName);
        }
    }
})