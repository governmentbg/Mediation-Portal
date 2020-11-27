"use strict";

Vue.component('representativePartyConfirmation', {
    moment: moment,
    data: function () {
        return {
            //Objects
            Form: new MediationForm(), //MediationForm
            applicantIsPerson: true,
            respondingPartyIsPerson: true,
            inReadonlyMode: true,
            inCreateMode: false,
            formLog: [],
            AllowedActions: [],
            chosenMediatorMessage: null,
            caseGuid: getParameter('caseGuid'),
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
            modalwindow: false,
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
            isCurrentUserLogged: false,
            actionButtons: {
                loading: false,
                show: true
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
            representativePartyApproveMediation: {
                open: false,
                loadingDeclaration: false,
                privacyDeclaration: {
                    Name: '',
                    HTMLContent: ''
                }
            },
            noAccess: false,
            BG_GUID: BULGARIA_GUID
        };
    },
    created: function () {
        let vue = this;

        makeDefaultServerCall("GET", "/UserManagement/GetCurrentUserInfo", null, response => {
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
            loadCitizenships(vue);
            loadDisputeSubjects(vue);

            if (response.Type) {
                this.isCurrentUserLogged = true;
            } else {
                this.isCurrentUserLogged = false;
                this.loadedData.push(true);
            }

            
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
        confirmParticipation: function () {
            let vue = this;
            vue.representativePartyApproveMediation.loadingDeclaration = true;

            makeServerCall('GET', '/Mediation/Case/GetRepresentativePrivacyDeclaration', null, ResultData => {
                vue.representativePartyApproveMediation.privacyDeclaration = ResultData;
                vue.representativePartyApproveMediation.loadingDeclaration = false;
                vue.representativePartyApproveMediation.open = true;
            })
        },
        confirmRepresentativePartyParticipation: function () {
            if (this.isCurrentUserLogged ) {
                let vue = this;
                this.actionButtons.loading = true;
                var caseLink = "/Mediation/Case/Preview/" + vue.caseGuid;

                makeServerCall('POST', '/Mediation/Case/ConfirmRepresentativePerson', { caseGuid: vue.caseGuid, cred: vue.cred }, (ResultData) => {
                    vue.actionButtons.loading = false;
                    vue.actionButtons.show = false;
                    vue.representativePartyApproveMediation.open = false;

                    setTimeout(function () {
                        window.location = caseLink;
                    }, 3000);
                });
            } else {
                this.openLoginModal();
            }
        },
        refuseRepresentativePartyParticipation: function () {
            let vue = this;
            this.actionButtons.loading = true;

            makeServerCall('POST', '/Mediation/Case/RejectRepresentativePerson', { caseGuid: vue.caseGuid, cred: vue.cred }, (ResultData) => {

                vue.actionButtons.loading = false;
                vue.actionButtons.show = false;

                setTimeout(function () {
                    window.location = "/";
                }, 3000);
            });
        },
        convertDate(d) {
            return moment(d).format("DD.MM.YYYYг. HH:mmч.");
        },
        openLoginModal() {
            this.$refs.loginDialog.dialog.open = true;
        },
        showApplicantCheckBtns() { },
        showRespondingPartyCheckBtns() { },
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 7 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    },
    computed: {
        getConfirmedParticipants() {
            return null;
        },
        showSendInvitationToRespondingPartyBtn: function () {
            return false;
        },
        // if user has already accepted/rejected the event he won't be able change event participation flag
        showButton() {
            let vue = this;
            //var caseparticipants = vue.EventData.CaseParticipants;
            vue.cred = vue.cred.toLowerCase(); // we have to lower case guid because it is case sensitive and won't work properly

            //if (caseparticipants.filter(x => x.UserId === vue.cred && x.IsParticipating === null).pop() !== undefined ||
            //    caseparticipants.filter(x => x.AccessToken === vue.cred && x.IsParticipating === null).pop() !== undefined) {
            //    return true;
            //}

            return true;
        }
    }
});

function loadMediationFormContent(vue) {
    // check if user has responding party token so we will know if is anonymous or not (token comes from responding party link sent to e-mail)
    let respondingPartyVerificationTokenGUID = getParameter('cred')

    let formGuid = getParameter('caseGuid');
    let cred = getParameter('cred');

    makeDefaultServerCall('GET', '/Mediation/Case/GetFormData/' + formGuid + '?respondingPartyAccessToken=' + cred, null, (response) => {
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
        } else {
            vue.noAccess = true;
        }

        vue.loadedData.push(true);
    }, false);

    vue.inReadonlyMode = true;
    vue.inCreateMode = false;
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