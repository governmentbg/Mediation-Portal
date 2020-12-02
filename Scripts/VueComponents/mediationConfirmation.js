"use strict"

Vue.component('mediationConfirmation', {
    data: function () {
        return {
            Form: null, //MediationForm
            applicantIsPerson: true,
            respondingPartyIsPerson: true,
            currentUser: null,

            mediatorApproveMediation: {
                open: false,
                mediatorsPrivacyDeclaration: {},
                loadingDeclaration: false
            },

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
            loadedData: [],
            formGuid: getParameter('caseGuid'),
            newMediatorGuid: getParameter('newMediatorGuid'),
            noDataText: {
                citizenships: 'Няма налични гражданства',
                countries: 'Няма налични държави',
                districts: 'Няма налични области',
                municipalities: 'Няма налични общини',
                settlements: 'Няма налични населени места',
                disputeSubjects: 'Няма информация за предмет на спора'
            },
            BG_GUID: BULGARIA_GUID,

            validationRules: {
                requiredField: v => !!v || 'Полето е задължително.',
                email: v => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Въведете коректен e-mail'
            },
            validateRejectTextarea() {
                if (this.rejectMediationModal.message.length) {
                    this.rejectMediationModal.errorMessage = ''
                } else {
                    this.rejectMediationModal.errorMessage = 'Моля въведете причина за отказ от медиацията.';
                }
            },
            rejectMediationModal: {
                open: false,
                message: '',
                loading: false,
                errorMessage: ''
            },
            doesMediatorAlreadyExistsInMediation: false,
            rejectedMediatorLog: {},
        }
    },
    created: function () {
        let vue = this;

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
        loadDisputeSubjects(vue);
        loadMediationFormContent(vue);
    },
    methods: {
        confirmCaseParticipation() {
            console.log('confirmCaseParticipation');
        },
        refuseCaseParticipation() {
            console.log('refuseCaseParticipation');
        },
        mediatorApproveForm() {
            let vue = this;
            vue.mediatorApproveMediation.loadingDeclaration = true;

            makeServerCall('GET', '/ContentManagement/Services/GetMediatorsSignedPrivacyStatement?privacyStatementGuid=' + this.Form.PrivacyDeclarationGUID, null, ResultData => {
                vue.mediatorApproveMediation.mediatorsPrivacyDeclaration = ResultData;
                vue.mediatorApproveMediation.open = true;
                vue.mediatorApproveMediation.loadingDeclaration = false;
            })
        },
        mediatorRefusePrivacyDeclaration() {
            this.mediatorApproveMediation.open = false;
        },
        mediatorAgreeMediation() {
            let vue = this;
            //TODO - rework better
            makeServerCall('POST', '/Mediation/Case/GrantAccessAdditionalMediator', { caseGuid: this.formGuid, newMediatorGuid: this.newMediatorGuid }, (ResultData) => {
                vue.mediatorApproveMediation.open = false;
                vue.doesMediatorAlreadyExistsInMediation = true;
                ////Force update
                ////vue.$forceUpdate() is not working in this case. Maybe no changes are tracked
                const link = document.createElement('a');
                link.href = "/Mediation/Case/Preview/" + vue.formGuid;
                link.click();
            }, true);
        },
        mediatorRejectForm() {
            let vue = this;
            this.rejectMediationModal.loading = true;
            if (this.rejectMediationModal.message.length) {
                makeServerCall('POST', '/Mediation/Case/AdditionalMediatorRefuseToMediate', { caseGuid: this.formGuid, message: this.rejectMediationModal.message }, (ResultData) => {
                    vue.rejectMediationModal.loading = false;
                    vue.rejectMediationModal.errorMessage = '';
                    vue.rejectMediationModal.message = '';
                    vue.rejectMediationModal.open = false;

                    const link = document.createElement('a');
                    link.href = "/";
                    link.click();
                }, true)

            } else {
                this.rejectMediationModal.errorMessage = 'Моля въведете причина за отказ от медиацията.';
                this.rejectMediationModal.loading = false;
            }
        },
        cancelRejectMediationByMediatorModal() {
            this.rejectMediationModal = {
                open: false,
                message: '',
                error: false,
                errorMessage: ''
            }
        },
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 4 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    },
    computed: {
        showButton() {
            return this.currentUser;
        },
        showApplicantCheckBtns() {
            return false;
        },
        showRespondingPartyCheckBtns() {
            return false;
        }
    }
});

function loadMediationFormContent(vue) {
    let formGuid = getParameter('caseGuid');
    let newMediatorGuid = getParameter('newMediatorGuid');

    makeServerCall('POST', '/Mediation/Case/GetFormDataForMediatorConfirmation', { caseGuid: formGuid, newMediatorGuid: newMediatorGuid}, (formData) => {
        vue.Form = Object.assign(new MediationForm(), formData);

        makeServerCall('GET', '/UserManagement/GetAdditinalMediatorInfo?caseGuid=' + formGuid + '&newMediatorGuid=' + newMediatorGuid, null, (ResultData) => {
            vue.currentUser = ResultData;
            vue.loadedData.push(true);
            if (newMediatorGuid) {
                if (vue.Form.CaseMediators.length) {
                    var mediators = vue.Form.CaseMediators;
                    for (var i = 0; i < mediators.length; i++) {
                        if (mediators[i].MediatorGUID.toLowerCase() === newMediatorGuid.toLowerCase()) {
                            vue.doesMediatorAlreadyExistsInMediation = true;
                        }
                    }
                }
            }
        }, false);

        if (vue.Form.ApplicantRepresentativePerson === null) {
            vue.Form.ApplicantRepresentativePerson = new RepresentativePerson();
        }

        if (vue.Form.RespondingPartyRepresentativePerson === null) {
            vue.Form.RespondingPartyRepresentativePerson = new RepresentativePerson();
        }

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

    vue.inReadonlyMode = true;
    vue.inCreateMode = false;
}