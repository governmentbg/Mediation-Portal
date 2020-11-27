"use strict";

Vue.component('detailsTrainingOrganization', {
    data() {
        return {
            // Organization object with loaded detailed information
            Organization: null,

            // Common props
            organizationGUID: window.location.pathname.split("/")[4],
            loading: true,
            loadedData: [],
            panels: [0, 1, 2],
            addresses: Object.freeze({ registration: 0, mailing: 1 })
        }
    },
    created: function () {
        console.log("urlTrainingOrganization = " + this.urlTrainingOrganization)
        let vue = this;

        loadTrainingOrganizationDetails(vue);
    },
    computed: {
        contactPerson() {
            if (this.Organization.Person) {
                let contactPerson = this.Organization.Person;
                return contactPerson.FirstName + ' ' + (contactPerson.MiddleName ? contactPerson.MiddleName + ' ' : '') + contactPerson.LastName;
            }

            return '';
        }
    },
    methods: {
        fullAddress(type) {
            var addressType = ""
            switch (type) {
                case 0:
                    addressType = "RegistrationAddress";
                    break;
                case 1:
                    addressType = "MailingAddress";
                    break;
            }

            if (this.Organization) {
                let address = this.Organization[addressType];

                if (address) {
                    return mergeAddress([address.CountryName, address.DistrictName, address.MunicipalityName, address.SettlementName, address.Address]);
                }
            }

            return '';
        }
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


function loadTrainingOrganizationDetails(vue) {
    makeServerCall('GET', '/Register/TrainingOrganizations/GetTrainingOrganizationDetails/' + vue.organizationGUID, null, (ResultData) => {
        vue.Organization = ResultData;

        vue.Organization.DateCreated = dateFormated(vue.Organization.DateCreated);
        vue.Organization.EffectiveFrom = dateFormated(vue.Organization.EffectiveFrom);
        vue.Organization.EffectiveTo = dateFormated(vue.Organization.EffectiveTo);

        vue.loadedData.push(true);
    }, false);
}