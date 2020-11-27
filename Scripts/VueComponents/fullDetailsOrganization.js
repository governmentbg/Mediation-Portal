Vue.component('fullDetailsOrganization', {
    data: function () {
        return {
            organizationGUID: window.location.pathname.split("/").pop(),
            loading: true,
            loadedData: [],

            organizationRevisions: [],
            AllowedActions: [],
        }
    },
    created: function () {
        let vue = this;

        loadOrganizationFullDetails(vue);
        loadAllowedActions(vue);
    },
    methods: {
        formatDate(date) {
            return dateFormated(date);
        },
        fullAddress(addressObj) {
            let result = '';

            result += addressObj['CountryName'] ? `${addressObj['CountryName']}, ` : '';
            result += addressObj['DistrictName'] ? `област ${addressObj['DistrictName']}, ` : '';
            result += addressObj['MunicipalityName'] ? `община ${addressObj['MunicipalityName']}, ` : '';
            result += addressObj['SettlementName'] ? `нас. място ${addressObj['SettlementName']}, ` : '';
            result += addressObj['Address'] || '';

            return result;
        }
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 1 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    },
    computed: {

    }
});

function loadOrganizationFullDetails(vue) {
    makeServerCall('GET', '/Register/TrainingOrganizations/GetOrganizationsFullDetails/' + vue.organizationGUID, null, (ResultData) => {
        vue.organizationRevisions = ResultData;
        vue.loadedData.push(true);
    }, false);
}