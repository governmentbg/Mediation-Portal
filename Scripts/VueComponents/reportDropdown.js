var dropdownComponent = Vue.component('dropdownfilter', {
    props: {
        rdtorp: String,
        func: Function
    },
    data() {
        return {
            dropdownItems: [],
            elementsAreLoaded: false,
            selectedElement: ''
        };
    },
    created: function () {
        this.handleFilterDropdownValues();
    },
    methods: {
        handleFilterDropdownValues: function () {
            let vue = this;
            loadFilterDropdownValues(vue);
        },
        saveSelectedDropdownValue: function (value, filterParameterName) {
            this.func(value, filterParameterName);
        }
    }
});

function loadFilterDropdownValues(vue) {
    loadingShow();

    let data = {
        params: {
            RepDefFilterToRepFilterId: (vue.rdtorp)
        }
    };

    axios.get('/Reports/Reporting/GetDropdownFilterValues', data)
        .then(response => {
            vue.dropdownItems = response.data;
            vue.elementsAreLoaded = true;
        })
        .catch(error => {
            iziToast.error({
                title: 'Грешка при зареждане на филтри!'
            });
            console.error(error);
        })
        .finally(() => {
            loadingHide();
        });
}