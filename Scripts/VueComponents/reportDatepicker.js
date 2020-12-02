var datepickerComponent = Vue.component('datepickerfilter', {
    props: {
        placeholder: String,
        func: Function,
        label: String
    },
    data() {
        return {
            popUp: false,
            selectedElement: '',
            date: '',
            append: ' 23:59:59'
        };
    },
    created: function () {
        let vue = this;
    },
    methods: {
        collectData: function (value, filterParameterName) {
            if (value === null) {
                this.date = '';
            }
            if (this.label === "До Дата" && value) {
                value += this.append;
            }

            this.func(value, filterParameterName);
        },

        datePickerFormated: function (date) {
            var convertedDate = moment(date).format('DD.MM.YYYY');
            if (convertedDate === "Invalid date") {
                return date;
            }
            return moment(date).format('DD.MM.YYYY');
        },
        saveSelectedDropdownValue: function (value, filterParameterName) {
            this.func(value, filterParameterName);
        }
    }
});