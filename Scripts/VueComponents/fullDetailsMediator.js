"use strict";

Vue.component('fullDetailsMediator', {
    data() {
        return {
            mediatorGUID: window.location.pathname.split("/").pop(),
            loading: true,
            loadedData: [],

            AllowedActions: [],
            mediatorRevisions: []
        }
    },
    created: function () {
        let vue = this;

        loadMediatorFullDetails(vue);
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
            if (this.loadedData.length === 2 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    }
});

function loadMediatorFullDetails(vue) {
    makeServerCall('GET', '/Register/Mediators/GetMediatorFullDetails/' + vue.mediatorGUID, null, (ResultData) => {
        vue.mediatorRevisions = ResultData;
        vue.loadedData.push(true);
    }, false);
}