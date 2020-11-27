"use strict";

Vue.component('repondingPartyAuthentication', {
    data: function () {
        return {
            Form: null,
            formGuid: window.location.pathname.split("/").pop(),
            respondingPartyVerificationTokenGUID: window.location.search.split("=").pop(),

            loading: true,
            loadedData: [],
            roles: [],

            // validations
            valid: true,
            emailRules: [
                v => !!v || 'Имейлът е задължителен.',
                v => /.+@.+\..+/.test(v) || 'Невалитен имейл'
            ],
            validationRules: {
                requiredField: v => !!v || 'Полето е задължително.',
                minlenght: v => (v && v.length >= 6) || 'Паролата трябва да бъде поне 6 символа дълга'
            },
            showPassword: false,
            inReadonlyModeRegister: false,
            tab: 'tab1',
            showSuccessMessage: false,
            isCurrentUserLogged: false,
            respondMessage: null,
            isDisabled: false,
            respondingPartyAgreeMediation: false,
            responded: false,

            caseGuid: window.location.pathname.split("/").pop(),
            respondingPartyAccessToken: getParameter('respondingPartyAccessToken'),

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
            noAccess: false,
            BG_GUID: BULGARIA_GUID
        };
    },
    created: function () {
        let vue = this;
        vue.RegisterForm = new Register();
        vue.LogInForm = new LogIn();

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

            if (response.Type) {
                this.isCurrentUserLogged = true;
            } else {
                this.isCurrentUserLogged = false;
            }

            this.loadedData.push(true);

        })
    },
    watch: {
        loadedData: function () {
            console.log(this.loadedData.length)
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 5 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
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
        confirmRepresentativePartyParticipation: function () {
            if (this.isCurrentUserLogged) {
                let vue = this;
                this.actionButtons.loading = true;
                var caseLink = "/Mediation/Case/Preview/" + vue.caseGuid;

                makeServerCall('POST', '/Mediation/Case/ConfirmRepresentativePerson', { caseGuid: vue.caseGuid, cred: vue.cred }, (ResultData) => {
                    vue.actionButtons.loading = false;
                    vue.actionButtons.show = false;

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

        respondingPartyAgreeMediationAction() {
            let vue = this;
            
            if (this.isCurrentUserLogged) {
                loadingShow();
                makeServerCall('POST', '/Mediation/Case/SendConfirmationEmailForActiveMediation', { caseGuid: this.Form.GUID, respondingPartyAccessToken: this.Form.RespondingPartyAccessTokenGUID }, (ResultData) => {
                    vue.respondingPartyAgreeMediation = true;
                    vue.responded = true;
                    loadingHide()
                }, true);
            } else {
                this.openLoginModal();
            }
        },
        respondingPartyRefuseMediationAction() {
            let vue = this;
            loadingShow();

            makeServerCall('POST', '/Mediation/Case/SendRefuseEmailForMediation', { caseGuid: vue.caseGuid, respondingPartyAccessToken: vue.respondingPartyAccessToken }, (ResultData) => {
                vue.respondingPartyAgreeMediation = false;
                vue.responded = true;
                loadingHide();
            }, true);
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
            vue.respondingPartyAccessToken = vue.respondingPartyAccessToken.toLowerCase(); // we have to lower case guid because it is case sensitive and won't work properly

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

    let formGuid = window.location.pathname.split("/").pop();
    let respondingPartyAccessToken = getParameter('respondingPartyAccessToken');

    makeDefaultServerCall('GET', '/Mediation/Case/GetFormData/' + formGuid + '?respondingPartyAccessToken=' + respondingPartyAccessToken, null, (response) => {
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