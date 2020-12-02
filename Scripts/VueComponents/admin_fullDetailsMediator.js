"use strict";

Vue.component('adminFullDetailsMediator', {
    data() {
        return {
            Mediator: new MediatorForm(),
            mediatorGUID: window.location.pathname.split("/").pop(),
            loading: true,
            loadedData: [],

            AllowedActions: [],
            inReadonlyMode: true,


            PermanentAddress: {
                countries: [],
                districts: [],
                municipalities: [],
                settlements: []
            },

            CurrentAddress: {
                countries: [],
                districts: [],
                municipalities: [],
                settlements: []
            },

            MailingAddress: {
                countries: [],
                districts: [],
                municipalities: [],
                settlements: []
            },

            educationDegrees: [],
            educationFields: [],
            foreignLanguages: [],
            specializations: [],
            mediatorStatuses: [],
            organizations: [],
            professions: [],
            professionalDirectionsGlobal: [],
            professionalDirectionsLocal: [],
            citizenships: [],
            noDataText: {
                citizenships: 'Няма налични гражданства',
                countries: 'Няма налични държави',
                districts: 'Няма налични области',
                municipalities: 'Няма налични общини',
                settlements: 'Няма налични населени места',
                degrees: 'Няма налични степени',
                educations: 'Няма налични образования',
                professions: 'Няма налични професии',
                languages: 'Няма налични чужди езици',
                organizations: 'Няма налични организации',
                documentTypes: 'Няма налични типове',
                professionalDirections: 'Няма налични професионални направления'
            },

            incomingNumberModal: {
                open: false,
                loading: false,
                data: {
                    number: ''
                }
            },

            BG_GUID: BULGARIA_GUID
        }
    },
    created: function () {
        let vue = this;

        loadCountriesPromise().then(function (data) {
            vue.PermanentAddress.countries = data;
            vue.CurrentAddress.countries = data;
            vue.MailingAddress.countries = data;
            vue.loadedData.push(true);
        });

        loadDistrictsPromise().then((data) => {
            vue.PermanentAddress.districts = data;
            vue.CurrentAddress.districts = data;
            vue.MailingAddress.districts = data;
            vue.loadedData.push(true);
        });

        loadCitizenships(vue);
        loadEducationDegrees(vue);
        loadEducationFields(vue);
        loadForeignLanguages(vue);
        loadSpecializations(vue);
        loadOrganizations(vue);
        loadProfessions(vue);
        loadProfessionalDirectionsLocal(vue);

        loadMediatorFullDetails(vue);
        loadAllowedActions(vue);
    },
    methods: {
        formatDate(date) {
            return dateFormated(date);
        },
        onAddNewEducation() {
            // add new education to list
            getNewGuid().then((guid) => {
                let newEducation = new Education();
                newEducation.TrackGuid = guid.data;
                this.Mediator.Educations.unshift(newEducation);

                let professionalDirections = guid.data;
                this.professionalDirectionsGlobal.push({ [professionalDirections]: [] })
            });
        },
        loadProfessionalDirections(educationFieldGUID, trackGuid) {
            let vue = this;
            if (educationFieldGUID) {
                makeServerCall('GET', '/MetaData/GetProfessionalDirectionsFiltered?educationFieldGUID=' + educationFieldGUID, null, (ResultData) => {
                    vue.professionalDirectionsGlobal[trackGuid] = ResultData;
                    vue.$forceUpdate();
                }, false);
            } else {
                vue.professionalDirectionsGlobal[trackGuid] = [];
            }
        },
        onAddNewEducation() {
            // add new education to list
            getNewGuid().then((guid) => {
                let newEducation = new Education();
                newEducation.TrackGuid = guid.data;
                this.Mediator.Educations.unshift(newEducation);

                let professionalDirections = guid.data;
                this.professionalDirectionsGlobal.push({ [professionalDirections]: [] })
            });
        },
        removeEducation: function (index) {
            let vue = this;
            vue.Mediator.Educations.splice(index, 1);
        },
        onCountryChange: function (fullAddressClassName, countryGUID) {
            onCountryChange(fullAddressClassName, countryGUID);
        },
        onDistrictChange: function (fullAddressClassName, objSet) {
            onDistrictChange(this, fullAddressClassName, objSet);
        },
        onMunicipalityChange: function (fullAddressClassName, objSet) {
            onMunicipalityChange(this, fullAddressClassName, objSet);
        },
        saveMediator: function () {
            let vue = this;
            loadingShow();
            makeServerCall("POST", "/Administration/MediatorsForAdmins/Save", this.Mediator, ResultData => {
                loadingHide();
                vue.inReadonlyMode = true;
            })
        },
        saveIncomingNumber: function () {
            loadingShow();

            let vue = this;

            let data = Object.assign({}, vue.Mediator);
            data.IncomingNumber = vue.incomingNumberModal.data.number;
            console.log(data);
            makeServerCall("POST", "/Administration/MediatorsForAdmins/SaveIncomingNumber", data, ResultData => {
                vue.Mediator = ResultData;
                vue.incomingNumberModal.open = false;
                loadingHide();
            })
        },
        onCopyCurrentAddress() {
            let newValues = {
                CountryGUID: this.Mediator.PermanentAddress.CountryGUID,
                DistrictGUID: this.Mediator.PermanentAddress.DistrictGUID,
                MunicipalityGUID: this.Mediator.PermanentAddress.MunicipalityGUID,
                SettlementGUID: this.Mediator.PermanentAddress.SettlementGUID,
                Address: this.Mediator.PermanentAddress.Address
            };


            loadMunicipalities(this, this.Mediator.PermanentAddress.DistrictGUID, this.CurrentAddress);
            loadSettlements(this, this.Mediator.PermanentAddress.MunicipalityGUID, this.CurrentAddress);

            this.Mediator.CurrentAddress = newValues;
        },
        onCopyMailingAddress() {
            let newValues = {
                CountryGUID: this.Mediator.PermanentAddress.CountryGUID,
                DistrictGUID: this.Mediator.PermanentAddress.DistrictGUID,
                MunicipalityGUID: this.Mediator.PermanentAddress.MunicipalityGUID,
                SettlementGUID: this.Mediator.PermanentAddress.SettlementGUID,
                Address: this.Mediator.PermanentAddress.Address
            };


            loadMunicipalities(this, this.Mediator.PermanentAddress.DistrictGUID, this.MailingAddress);
            loadSettlements(this, this.Mediator.PermanentAddress.MunicipalityGUID, this.MailingAddress);

            this.Mediator.MailingAddress = newValues;
        },
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 12 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    }
});

function loadMediatorFullDetails(vue) {
    makeServerCall('GET', '/Administration/MediatorsForAdmins/GetMediatorFullDetails/' + vue.mediatorGUID, null, (ResultData) => {
        vue.Mediator = ResultData;

        loadMunicipalities(vue, vue.Mediator.PermanentAddress.DistrictGUID, vue.PermanentAddress);
        loadSettlements(vue, vue.Mediator.PermanentAddress.MunicipalityGUID, vue.PermanentAddress);

        loadMunicipalities(vue, vue.Mediator.CurrentAddress.DistrictGUID, vue.CurrentAddress);
        loadSettlements(vue, vue.Mediator.CurrentAddress.MunicipalityGUID, vue.CurrentAddress);

        loadMunicipalities(vue, vue.Mediator.MailingAddress.DistrictGUID, vue.MailingAddress);
        loadSettlements(vue, vue.Mediator.MailingAddress.MunicipalityGUID, vue.MailingAddress);

        vue.Mediator.Educations.forEach(x => {
            getNewGuid().then((guid) => {
                x.TrackGuid = guid.data;
                vue.loadProfessionalDirections(x.EducationFieldGUID, x.TrackGuid);
            });
        });
        vue.loadedData.push(true);
    }, false);
}


function loadOrganizations(vue) {
    makeServerCall('GET', '/Administration/MediatorsForAdmins/GetOrganizations', null, (ResultData) => {
        vue.organizations = ResultData;
        vue.loadedData.push(true);
    });
}


function loadProfessionalDirectionsLocal(vue) {
    makeServerCall('GET', '/MetaData/GetProfessionalDirections', null, (ResultData) => {
        vue.professionalDirectionsLocal = ResultData;
        vue.loadedData.push(true);
    }, false);
}