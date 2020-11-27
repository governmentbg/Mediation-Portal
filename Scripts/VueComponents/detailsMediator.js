"use strict";

Vue.component('detailsMediator', {
    data() {
        return {
            // Mediator object with loaded detailed information
            Mediator: null,

            // Common props
            organizationGUID: window.location.pathname.split("/")[4],
            loading: true,
            loadedData: [],
            panels: [0, 1, 2],
            addresses: Object.freeze({permanent: 0, current: 1, mailing: 2})
        }
    },
    created: function () {
        let vue = this;

        loadMediatorDetails(vue);
    },
    computed: {
        citizenships() {
            return (this.Mediator && this.Mediator.Citizenships.length ? this.Mediator.Citizenships.join(", ") : '');
        },
        professions() {
            return (this.Mediator && this.Mediator.Professions.length ? this.Mediator.Professions.join(", ") : '');
        },
        foreignLanguages() {
            return (this.Mediator && this.Mediator.ForeignLanguages.length ? this.Mediator.ForeignLanguages.join(", ") : '');
        },
        organizationMemberships() {
            return (this.Mediator && this.Mediator.OrganizationMemberships.length ? this.Mediator.OrganizationMemberships.join(", ") : '');
        },
        specializations() {
            return (this.Mediator && this.Mediator.Specializations.length ? this.Mediator.Specializations.join(", ") : '');
        },
        additionalQualifications() {
            return (this.Mediator && this.Mediator.AdditionalQualifications.length ? this.Mediator.AdditionalQualifications.join(", ") : '');
        }
    },
    methods: {
        fullAddress(type) {
            var addressType = ""
            switch (type) {
                case 0:
                    addressType = "PermanentAddress";
                    break;
                case 1:
                    addressType = "CurrentAddress";
                    break;
                case 2:
                    addressType = "MailingAddress";
                    break;
            }

            if (this.Mediator) {
                let address = this.Mediator[addressType];

                if (address) {
                    return mergeAddress([address.CountryName, address.DistrictName, address.MunicipalityName, address.SettlementName, address.Address]);
                }
            }

            return '';
        },
        formatDate(date) {
            return dateFormated(date);
        },
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 1 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    }
});

function loadMediatorDetails(vue) {
    makeServerCall('get', '/Register/Mediators/GetMediatorDetails/' + vue.organizationGUID, null, (ResultData) => {
        vue.Mediator = ResultData;

        vue.loadedData.push(true);
    }, false);
}