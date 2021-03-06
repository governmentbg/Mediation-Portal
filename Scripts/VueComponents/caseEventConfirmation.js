﻿"use strict";

Vue.component('caseEventConfirmation', {
    moment: moment,
    data: function () {
        return {
            //Objects
            Form: new MediationForm(), //MediationForm
            EventData: null, //EventData
            applicantIsPerson: true,
            respondingPartyIsPerson: true,
            inReadonlyMode: true,
            inCreateMode: false,
            formLog: [],
            dialog: false,
            showForm: false,
            AllowedActions: [],
            chosenMediatorMessage: null,
            currentUser: null,
            refusedEvent: false,
            confirmedEvent: false,
            
            formGuid: getParameter('caseGuid'),
            eventGuid: getParameter('eventGuid'),
            cred: getParameter('cred'),
            
            //Data
            ApplicantMailingAddress: {
                countries: [],
                districts: [],
                municipalities: [],
                settlements: []
            },
            RespondingPartyMailingAddress: {
                countries: [],
                districts: [],
                municipalities: [],
                settlements: []
            },
            RespondingPartyLegalEntityMailingAddress: {
                countries: [],
                districts: [],
                municipalities: [],
                settlements: []
            },
            citizenships: [],
            disputeSubjects: [],

            //Common
            showLog: false,
            loading: true,
            buttonsLoading: false,
            loadedData: [],
            page: window.location.pathname.split("/")[3].toUpperCase(), // CREATE/EDIT/PREVIEW,
            noDataText: {
                citizenships: 'Няма налични гражданства',
                countries: 'Няма налични държави',
                districts: 'Няма налични области',
                municipalities: 'Няма налични общини',
                settlements: 'Няма налични населени места',
                disputeSubjects: 'Няма информация за предмет на спора'
            },
            validationRules: {
                requiredField: v => !!v || 'Полето е задължително.',
                email: v => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Въведете коректен e-mail'
            },
            Regix: {
                Applicant: {
                    Checked: false,
                    Name: "",
                    Data: {
                        Name: "",
                        Representatives: [],
                        Owners: []
                    }
                },
                RespondingParty: {
                    Checked: false,
                    Name: "",
                    Data: {
                        Name: "",
                        Representatives: [],
                        Owners: []
                    }
                }
            },
            BG_GUID: BULGARIA_GUID
        };
    },
    created: function () {
        let vue = this;

        makeDefaultServerCall("GET", "/UserManagement/GetCurrentUser", null, (response) => {

            if (response.Type) {
                vue.currentUser = response.ResultData;
            }

            loadCountriesPromise().then(function (data) {
                vue.ApplicantMailingAddress.countries = data;
                vue.RespondingPartyMailingAddress.countries = data;
                vue.RespondingPartyLegalEntityMailingAddress.countries = data;
                vue.loadedData.push(true);
            });

            loadDistrictsPromise().then((data) => {
                vue.ApplicantMailingAddress.districts = data;
                vue.RespondingPartyMailingAddress.districts = data;
                vue.RespondingPartyLegalEntityMailingAddress.districts = data;
                vue.loadedData.push(true);
            });

            loadAllowedActions(vue);

            loadMediationFormContent(vue);
            loadMediationEventData(vue);
        })
    },
    methods: {
        onCountryChange: function (fullAddressClassName, countryGUID) {
            onCountryChange(fullAddressClassName, countryGUID);
        },
        onDistrictChange: function (fullAddressClassName, objSet) {
            onDistrictChange(this, fullAddressClassName, objSet);
        },
        onMunicipalityChange: function (fullAddressClassName, objSet) {
            onMunicipalityChange(this, fullAddressClassName, objSet);
        },
        handleChange: function () {
            this.mediatorHasSavedData = false;
        },
        confirmEventParticipation: function () {
            let vue = this;
            vue.buttonsLoading = true;

            makeServerCall('POST', '/Event/ConfirmEventParticipating?eventGuid=' + vue.eventGuid + '&cred=' + vue.cred, null, (ResultData) => {
                // if user is logged in - redirect to case
                if (vue.currentUser != null) {
                    window.location = "/Mediation/Case/Preview/" + vue.Form.GUID;
                }

                vue.showForm = false;
                vue.confirmedEvent = true;
                vue.buttonsLoading = false;
            }, false);
        },
        refuseEventParticipation: function () {
            let vue = this;
            vue.buttonsLoading = true;
            makeServerCall('POST', '/Event/RejectEventParticipating?eventGuid=' + vue.eventGuid + '&cred=' + vue.cred, null, (ResultData) => {

                // if user is logged in - redirect to case
                if (vue.currentUser != null) {
                    window.location = "/Mediation/Case/Preview/" + vue.Form.GUID;
                }

                vue.showForm = false;
                vue.refusedEvent = true;
                vue.buttonsLoading = false;

            }, false);
        },
        convertDate(d) {
            return moment(d).format("DD.MM.YYYYг. HH:mmч.");
        },
        showApplicantCheckBtns() {

        },
        showRespondingPartyCheckBtns() {

        },

    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 6 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    },
    computed: {
        getConfirmedParticipants() {
            //return this.EventData.ConfirmedBy.join(", ");
            return null;
        },
        getEventTypeLabel() {
            return (this.EventData.TypeGUID.toLowerCase() === eCaseEventType.Audio.toLowerCase() ? 'АУДИО/ЧАТ' : this.EventData.TypeGUID.toLowerCase() === eCaseEventType.Video.toLowerCase() ? 'ВИДЕО/ЧАТ' : '');
        },
        showSendInvitationToRespondingPartyBtn: function () {
            return false;
        },
        // if user has already accepted/rejected the event he won't be able change event participation flag
        showButton() {
            let vue = this;
            var caseparticipants = vue.EventData.CaseParticipants;
            vue.cred = vue.cred.toLowerCase(); // we have to lower case guid because it is case sensitive and won't work properly

            if (caseparticipants.filter(x => x.UserId === vue.cred && x.IsParticipating === null).pop() !== undefined ||
                caseparticipants.filter(x => x.AccessToken === vue.cred && x.IsParticipating === null).pop() !== undefined) {
                return true;
            }
        }
    }
});

function loadMediationFormContent(vue) {
    // check if user has responding party token so we will know if is anonymous or not (token comes from responding party link sent to e-mail)
    let respondingPartyVerificationTokenGUID = window.location.search.split("=").pop();

    let formGuid = getParameter('caseGuid');
    let eventGuid = getParameter('eventGuid');
    let cred = getParameter('cred');

    /*makeServerCall('GET', '/Mediation/Case/GetFormDataForConfirmation?caseGuid=' + formGuid + "&eventGuid=" + eventGuid + '&cred=' + cred, null, (formData) => {
        vue.Form = Object.assign(new MediationForm(), formData);

        vue.applicantIsPerson = !vue.Form.ApplicantIsLegalEntity;
        vue.respondingPartyIsPerson = !vue.Form.RespondingPartyIsLegalEntity;

        loadMunicipalities(vue, vue.Form.ApplicantMailingAddress.DistrictGUID, vue.ApplicantMailingAddress);
        loadSettlements(vue, vue.Form.ApplicantMailingAddress.MunicipalityGUID, vue.ApplicantMailingAddress);

        if (vue.Form.RespondingPartyMailingAddress) {
            loadMunicipalities(vue, vue.Form.RespondingPartyMailingAddress.DistrictGUID, vue.RespondingPartyMailingAddress);
            loadSettlements(vue, vue.Form.RespondingPartyMailingAddress.MunicipalityGUID, vue.RespondingPartyMailingAddress);
        }

        if (vue.Form.RespondingPartyLegalEntity.EntityAddress) {
            loadMunicipalities(vue, vue.Form.RespondingPartyLegalEntity.EntityAddress.DistrictGUID, vue.RespondingPartyLegalEntityMailingAddress);
            loadSettlements(vue, vue.Form.RespondingPartyLegalEntity.EntityAddress.MunicipalityGUID, vue.RespondingPartyLegalEntityMailingAddress);
        }

        vue.loadedData.push(true);
    }, false);
    */

    makeDefaultServerCall('GET', '/Mediation/Case/GetFormDataForConfirmation?caseGuid=' + formGuid + "&eventGuid=" + eventGuid + '&cred=' + cred, null, (response) => {
        if (response.Type) {
            var formData = response.ResultData;
            vue.Form = Object.assign(new MediationForm(), formData);

            vue.applicantIsPerson = !vue.Form.ApplicantIsLegalEntity;
            vue.respondingPartyIsPerson = !vue.Form.RespondingPartyIsLegalEntity;

            loadMunicipalities(vue, vue.Form.ApplicantMailingAddress.DistrictGUID, vue.ApplicantMailingAddress);
            loadSettlements(vue, vue.Form.ApplicantMailingAddress.MunicipalityGUID, vue.ApplicantMailingAddress);

            if (vue.Form.RespondingPartyMailingAddress) {
                loadMunicipalities(vue, vue.Form.RespondingPartyMailingAddress.DistrictGUID, vue.RespondingPartyMailingAddress);
                loadSettlements(vue, vue.Form.RespondingPartyMailingAddress.MunicipalityGUID, vue.RespondingPartyMailingAddress);
            }

            if (vue.Form.RespondingPartyLegalEntity.EntityAddress) {
                loadMunicipalities(vue, vue.Form.RespondingPartyLegalEntity.EntityAddress.DistrictGUID, vue.RespondingPartyLegalEntityMailingAddress);
                loadSettlements(vue, vue.Form.RespondingPartyLegalEntity.EntityAddress.MunicipalityGUID, vue.RespondingPartyLegalEntityMailingAddress);
            }
            vue.showForm = true;
            vue.loadedData.push(true);
        } else {
            vue.loadedData.push(true);
        }
    }, false);

    vue.inReadonlyMode = true;
    vue.inCreateMode = false;
}

function loadMediationEventData(vue) {
    let eventGuid = getParameter('eventGuid');
    let caseGuid = getParameter('caseGuid');
    let cred = getParameter('cred');

    makeServerCall('GET', '/MediationCaseEvent/Event/GetEventData?caseGuid=' + caseGuid + "&eventGuid=" + eventGuid + '&cred=' + cred, null, (ResultData) => {
        vue.EventData = Object.assign(new CaseEventFormModel(), ResultData);

        vue.EventData.CaseParticipantsDetails = vue.EventData.CaseParticipants;
        vue.EventData.Caseparticipants = [];

        for (var i = 0; i < vue.EventData.CaseEventParticipants.length; i++) {
            vue.EventData.CaseParticipants.push(vue.EventData.CaseEventParticipants[i].Key)
        }

        vue.loadedData.push(true);
    }, false);

    vue.loadedData.push(true);
}

function promptInfo() {
    iziToast.info({
        timeout: 5000,
        close: false,
        displayMode: 'once',
        closeOnEscape: true,
        transitionIn: 'flipInX',
        transitionOut: 'flipOutX',
        id: 'info',
        zindex: 1000,
        title: 'Моля запазете промените, преди да пратите е-мейл',
        position: 'center'
    });
}