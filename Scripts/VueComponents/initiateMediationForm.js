"use strict";

Vue.component('initiateMediationForm', {
    components: {
        quillEditor: VueQuillEditor.quillEditor
    },
    moment: moment,
    data: function () {
        return {
            //Objects
            Form: null, //MediationForm
            currentUser: {},
            dialog: false,
            message: 'До Страна 2 ще бъде изпратен e-mail в който се описва, че е поканен да се присъедини към онлайн медиация. Посредством изпратен линк, той ще трябва да приеме или откаже поканата.',
            applicantIsPerson: true,
            respondingPartyIsPerson: true,
            inReadonlyMode: true,
            inCreateMode: false,
            formLog: [],
            AllowedActions: [],
            chosenMediatorMessage: null,

            respondingPartyTabUnlocked: false,
            mediatorHasSavedData: false,

            applicantRequestTermination: false,
            applicantRequestTerminationMessage: null,
            respondingPartyRequestTermination: false,
            respondingPartyRequestTerminationMessage: null,
            mediatorTermination: false,
            mediatorTerminationMessage: null,
            respondingPartyAgreeMediation: false,
            // IS SENT CONFIRMATION MAIL TO RESPONDING PARTY
            RespondingPartySentConfirmationEmail: false,

            mediatorApproveMediation: {
                open: false,
                mediatorsPrivacyDeclaration: {
                    PreviousName: '',
                    PreviousHTMLContent: ''
                },
                loadingDeclaration: false
            },


            hasAgreed: false,
            signedPriv: false,
            feesAgreed: false,

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
            RepresentativeApplicantAddress: {
                countries: [],
                districts: [],
                municipalities: [],
                settlements: []
            },
            RepresentativeRespondingPartyAddress: {
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
            showApplication: false,
            page: window.location.pathname.split("/")[3].toUpperCase(), // CREATE/EDIT/PREVIEW,
            noDataText: {
                citizenships: 'Няма налични гражданства',
                countries: 'Няма налични държави',
                districts: 'Няма налични области',
                municipalities: 'Няма налични общини',
                settlements: 'Няма налични населени места',
                disputeSubjects: 'Няма информация за предмет на спора'
            },
            rejectMediationModal: {
                open: false,
                message: '',
                loading: false,
                errorMessage: ''
            },
            rejectedMediatorLog: {},
            BG_GUID: BULGARIA_GUID,

            // Repsresentative PERSONS
            inReadonlyModeApplicantRepsresentativePerson: false,
            inReadonlyModeRespondingPartyRepsresentativePerson: false,
            RespondingPartyRepresentativePersonIsShown: false,
            ApplicantRepresentativePersonIsShown: false,
            replaceRepresentativeModal: {
                open: false,
                loading: false
            },
            rejectRepresentativeModal: {
                open: false,
                loading: false
            },

            applicantFormValid: false,
            validationRules: {
                requiredField: v => !!v || 'Полето е задължително.',
                email: v => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Въведете коректен e-mail'
            },

            mediationFormValid: true,

            quillOptions: {
                theme: 'snow',
                placeholder: 'Въведете споразумение за започване на медиацията',
                modules: {
                    toolbar: {
                        container: [
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote', 'code-block'],
                            [{ 'header': 1 }, { 'header': 2 }],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            [{ 'script': 'sub' }, { 'script': 'super' }],
                            [{ 'indent': '-1' }, { 'indent': '+1' }],
                            [{ 'direction': 'rtl' }],
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            [{ 'font': [] }],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'align': [] }],
                            ['clean'],
                            ['link', 'image', 'video']
                        ]
                    }
                }
            },
            quillOptionsFinalize: {
                theme: 'snow',
                placeholder: 'Въведете споразумение (спогодба)',
                modules: {
                    toolbar: {
                        container: [
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote', 'code-block'],
                            [{ 'header': 1 }, { 'header': 2 }],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            [{ 'script': 'sub' }, { 'script': 'super' }],
                            [{ 'indent': '-1' }, { 'indent': '+1' }],
                            [{ 'direction': 'rtl' }],
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            [{ 'font': [] }],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'align': [] }],
                            ['clean'],
                            ['link', 'image', 'video']
                        ]
                    }
                }
            },
            agreementDialog: {
                open: false,
                title: '',
                content: '',
                type: -1
            },
            isCurrentUserLogged: false,
            ApplicationInformation: {},
            moment: moment,
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
            //global funcs
            isEmptyGUID: isEmptyGUID
        };
    },
    created: function () {
        let vue = this;

        makeDefaultServerCall("GET", "/UserManagement/GetCurrentUser", null, (response) => {
            makeServerCall('GET', '/Mediation/Case/GetApplicationInformation', null, (ApplicationInfo) => {
                vue.loadedData.push(true);
                vue.ApplicationInformation = ApplicationInfo;
            })
            loadCountriesPromise().then(function (data) {
                vue.ApplicantMailingAddress.countries = data;
                vue.RespondingPartyMailingAddress.countries = data;
                vue.RespondingPartyLegalEntityMailingAddress.countries = data;
                vue.RepresentativeApplicantAddress.countries = data;
                vue.RepresentativeRespondingPartyAddress.countries = data;
                vue.loadedData.push(true);
            });

            loadDistrictsPromise().then((data) => {
                vue.ApplicantMailingAddress.districts = data;
                vue.RespondingPartyMailingAddress.districts = data;
                vue.RespondingPartyLegalEntityMailingAddress.districts = data;
                vue.RepresentativeApplicantAddress.districts = data;
                vue.RepresentativeRespondingPartyAddress.districts = data;
                vue.loadedData.push(true);
            });

            loadCitizenships(vue);

            if (response.Type === 0) {
                this.isCurrentUserLogged = false;
            } else {
                this.currentUser = response.ResultData;
                this.isCurrentUserLogged = true;

                var pass = getParameter("pass");
                if (pass && pass.length) {
                    this.showApplication = true;
                }
            }

            vue.loadedData.push(true);
        })
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if ((this.isCurrentUserLogged && this.loadedData.length === 9) || (!this.isCurrentUserLogged && this.loadedData.length === 5) && !this.loadedData.includes(false)) {
                //if (this.loadedData.length === 7 && !this.loadedData.includes(false)) {
                this.loading = false;

                if (this.Form) {
                    if (this.loadedData.length === 9) {
                        if (
                            (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated && this.Form.PrimaryMediatorGUID === this.currentUser.PrimaryMediatorGUID && !this.Form.RespondingPartyUserId) ||
                            (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated && this.isCurrentUserMediator && !this.Form.RespondingPartyUserId) ||
                            (
                                (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated ||
                                    this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                                    this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested)
                                && this.isCurrentUserRespondingParty
                            )
                        ) {
                            this.respondingPartyTabUnlocked = true;
                        }
                    }

                    if (this.Form.RespondingPartyContactInfo.Email || this.Form.RespondingPartyLegalEntity.EntityContactInfo.Email) {
                        this.mediatorHasSavedData = true;
                    }

                    if (this.Form.CaseMediators && this.Form.CaseMediators.length) {
                        this.hasAgreed = this.Form.CaseMediators.find(x => x.MediatorGUID === this.Form.PrimaryMediatorGUID).HasAgreed;
                        this.signedPriv = this.Form.CaseMediators.find(x => x.MediatorGUID === this.Form.PrimaryMediatorGUID).PrivacyStatementSigned;
                        this.feesAgreed = this.Form.CaseMediators.find(x => x.MediatorGUID === this.Form.PrimaryMediatorGUID).FeesAgreed;
                    }
                }
            }
        },
        isCurrentUserLogged: function () {
            if (this.isCurrentUserLogged) {
                loadDisputeSubjects(this);
                loadAllowedActions(this);
                loadMediationFormContent(this);
            }
        },
        ApplicantRepresentativePersonIsShown: function () {
            let vue = this;

            if (this.Form.ApplicantRepresentativePerson == null) {
                if (this.ApplicantRepresentativePersonIsShown) {
                    getNewGuid().then((guid) => {
                        vue.Form.ApplicantRepresentativePerson = new RepresentativePerson();
                        vue.Form.ApplicantRepresentativePerson.AccessToken = guid.data;
                    });
                    vue.inReadonlyModeApplicantRepsresentativePerson = false;
                } else {
                    vue.Form.ApplicantRepresentativePerson = null;
                }
            }
        },
        RespondingPartyRepresentativePersonIsShown: function () {
            let vue = this;

            if (this.Form.RespondingPartyRepresentativePerson == null) {
                if (this.RespondingPartyRepresentativePersonIsShown) {
                    getNewGuid().then((guid) => {
                        vue.Form.RespondingPartyRepresentativePerson = new RepresentativePerson();
                        vue.Form.RespondingPartyRepresentativePerson.AccessToken = guid.data;
                    });
                    vue.inReadonlyModeRespondingPartyRepsresentativePerson = false;
                } else {
                    vue.Form.RespondingPartyRepresentativePerson = null;
                }
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
        saveForm() {
            var vue = this;
            vue.Form.ApplicantIsLegalEntity = !vue.applicantIsPerson;
            vue.Form.RespondingPartyIsLegalEntity = !vue.respondingPartyIsPerson;

            makeServerCall('POST', '/Mediation/Case/SaveForm', vue.Form, (ResultData) => {
                //get the generated case number
                vue.Form.CaseNumber = ResultData.CaseNumber;
                vue.$forceUpdate();
            }, true);
        },
        registerForm() {
            var vue = this;

            vue.Form.ApplicantIsLegalEntity = !vue.applicantIsPerson;
            vue.Form.RespondingPartyIsLegalEntity = !vue.respondingPartyIsPerson;

            makeServerCall('POST', '/Mediation/Case/RegisterForm', vue.Form, (ResultData) => {
                vue.Form.CaseNumber = ResultData.CaseNumber;
                vue.Form.CaseStatusGUID = ResultData.CaseStatusGUID;
                vue.Form.CaseStatusName = ResultData.CaseStatusName;
                vue.inReadonlyMode = true;

                setTimeout(function () {
                    window.location = '/Mediation/Case/Preview/' + vue.Form.GUID;
                }, 2000)

                vue.$forceUpdate();
            }, true);
        },
        clearApplicantData() {
            if (this.page !== 'PREVIEW') {
                if (this.applicantIsPerson) {
                    this.Form.ApplicantLegalEntity = new LegalEntity();
                    this.Form.ApplicantIsLegalEntity = false;
                } else {
                    this.Form.ApplicantLegalEntity = new LegalEntity();
                    this.Form.ApplicantIsLegalEntity = true;
                }
            }
        },
        clearRespondingPartyData() {
            if (this.page !== 'PREVIEW') {
                if (this.respondingPartyIsPerson) {
                    this.Form.RespondingPartyLegalEntity = new LegalEntity();
                    this.Form.RespondingPartyIsLegalEntity = false;
                } else {
                    this.Form.RespondingPartyLegalEntity = new LegalEntity();
                    this.Form.RespondingPartyIsLegalEntity = true;
                }
            }
        },
        mediatorApproveForm() {
            loadMediatorsPrivacyStatement(this);
        },
        mediatorRefusePrivacyDeclaration() {
            this.mediatorApproveMediation.open = false;
        },
        mediatorAgreeMediation() {
            let vue = this;
            //TODO - rework better

            this.Form.PrivacyDeclarationGUID = this.mediatorApproveMediation.mediatorsPrivacyDeclaration.GUID;
            makeServerCall('POST', '/Mediation/Case/AgreeToMediate', { formGuid: this.Form.GUID }, (ResultData) => {
                vue.Form.CaseStatusGUID = ResultData.CaseStatusGUID;
                vue.Form.CaseStatusName = ResultData.CaseStatusName;

                vue.mediatorApproveMediation.open = false;

                makeServerCall('POST', '/Mediation/Case/SignPrivacyStatement', { caseGuid: this.Form.GUID, privacyStatementGUID: this.Form.PrivacyDeclarationGUID }, (ResultData) => {
                    vue.Form.CaseMediators.find(x => x.MediatorGUID === this.Form.PrimaryMediatorGUID).PrivacyStatementSigned = true;
                }, true);

                //Force update
                //vue.$forceUpdate() is not working in this case. Maybe no changes are tracked
                const link = document.createElement('a');
                link.href = "/Mediation/Case/Preview/" + vue.Form.GUID;
                link.click();
            }, true);
        },
        openRejectMediationByMediatorModal() {
            this.rejectMediationModal.open = true;
        },
        cancelRejectMediationByMediatorModal() {
            this.rejectMediationModal = {
                open: false,
                message: '',
                error: false,
                errorMessage: ''
            };
        },
        validateRejectTextarea() {
            if (this.rejectMediationModal.message.length) {
                this.rejectMediationModal.errorMessage = ''
            } else {
                this.rejectMediationModal.errorMessage = 'Моля въведете причина за отказ от медиацията.';
            }
        },
        mediatorRejectForm() {
            let vue = this;
            this.rejectMediationModal.loading = true;
            if (this.rejectMediationModal.message.length) {
                makeServerCall('POST', '/Mediation/Case/RefuseToMediate', { formGuid: this.Form.GUID, message: this.rejectMediationModal.message }, (ResultData) => {
                    vue.Form.CaseStatusGUID = ResultData.CaseStatusGUID;
                    vue.Form.CaseStatusName = ResultData.CaseStatusName;
                    vue.$forceUpdate();
                    vue.rejectMediationModal.loading = false;
                    vue.rejectMediationModal.errorMessage = '';
                    vue.rejectMediationModal.message = '';
                    vue.rejectMediationModal.open = false;
                }, true);

            } else {
                this.rejectMediationModal.errorMessage = 'Моля въведете причина за отказ от медиацията.';
                this.rejectMediationModal.loading = false;
            }
        },
        createRequestNewMediator() {
            let vue = this;

            const link = document.createElement('a');
            link.href = "/Mediation/Case/Edit/" + vue.Form.GUID;
            //link.target = "_blank";
            link.click();
        },
        chooseMediator(mediatorGUID, chosenMediatorMessage) {
            let vue = this;

            vue.Form.PrimaryMediatorGUID = mediatorGUID;
            vue.chosenMediatorMessage = chosenMediatorMessage;
        },
        respondingPartyAgreeMediationAction() {
            let vue = this;
            loadingShow();

            makeServerCall('POST', '/Mediation/Case/SendConfirmationEmailForActiveMediation', { caseGuid: this.Form.GUID, respondingPartyAccessToken: this.Form.RespondingPartyAccessTokenGUID }, (ResultData) => {
                vue.respondingPartyAgreeMediation = true;
                vue.RespondingPartySentConfirmationEmail = true;
                loadingHide()
            }, true);
        },
        respondingPartyRefuseMediationAction() {
            let vue = this;
            loadingShow();

            makeServerCall('POST', '/Mediation/Case/SendRefuseEmailForMediation', { caseGuid: this.Form.GUID, respondingPartyAccessToken: this.Form.RespondingPartyAccessTokenGUID }, (ResultData) => {
                vue.respondingPartyAgreeMediation = false;
                vue.RespondingPartySentConfirmationEmail = true;
                loadingHide();
            }, true);
        },
        sendInvitationToRespondingParty() {
            if (!this.mediatorHasSavedData) {
                promptInfo();
            } else {
                makeServerCall('POST', '/Mediation/Case/SendRespondingPartyInvitation', { caseGuid: this.Form.GUID, respondingPartyAccessToken: this.Form.RespondingPartyAccessTokenGUID }, (ResultData) => {
                }, true);
            }
        },
        saveRespondingPartyChanges() {
            var vue = this;
            vue.Form.ApplicantIsLegalEntity = !vue.applicantIsPerson;
            vue.Form.RespondingPartyIsLegalEntity = !vue.respondingPartyIsPerson;

            makeServerCall('POST', '/Mediation/Case/SaveRespondingPartyChangedForm', vue.Form, (ResultData) => {
                vue.Form.CaseNumber = ResultData.CaseNumber;
                vue.mediatorHasSavedData = true;
            }, true);
        },
        handleChange: function () {
            this.mediatorHasSavedData = false;
        },
        partiesSignedInitializationAgreement() {
            let vue = this;
            loadingShow();
            makeServerCall('POST', '/Mediation/Case/SignAgreementForPocedureOpening', { caseGuid: this.Form.GUID }, (ResultData) => {
                vue.Form.ApplicantSignedAgreement = ResultData.ApplicantSignedAgreement
                vue.Form.ApplicantSignedAgreementTimestamp = ResultData.ApplicantSignedAgreementTimestamp;
                vue.Form.RespondingPartySignedAgreement = ResultData.RespondingPartySignedAgreement;
                vue.Form.RespondingPartySignedAgreementTimestamp = ResultData.RespondingPartySignedAgreementTimestamp;
                vue.Form.CaseStatusGUID = ResultData.CaseStatusGUID;
                vue.Form.CaseStatusName = ResultData.CaseStatusName;

                vue.agreementDialog.open = false;
                vue.$forceUpdate();
                loadingHide();
            }, true);
        },
        partiesSignedClosingAgreement() {
            let vue = this;
            loadingShow();
            makeServerCall('POST', '/Mediation/Case/SignAgreementForPocedureClosing', { caseGuid: this.Form.GUID }, (ResultData) => {
                vue.Form.ApplicantSignedClosing = ResultData.ApplicantSignedClosing
                vue.Form.ApplicantSignedClosingTimestamp = ResultData.ApplicantSignedClosingTimestamp;
                vue.Form.RespondingPartySignedClosing = ResultData.RespondingPartySignedClosing;
                vue.Form.RespondingPartySignedClosingTimestamp = ResultData.RespondingPartySignedClosingTimestamp;
                vue.Form.CaseStatusGUID = ResultData.CaseStatusGUID;
                vue.Form.CaseStatusName = ResultData.CaseStatusName;

                vue.agreementDialog.open = false;
                vue.$forceUpdate();
                loadingHide();
            }, true);
        },
        mediatorTaxAgreed() {
            let vue = this;
            makeServerCall('POST', '/Mediation/Case/MarkTaxesAgreed', { caseGuid: this.Form.GUID }, (ResultData) => {
                vue.Form.CaseMediators.find(x => x.MediatorGUID === vue.Form.PrimaryMediatorGUID).FeesAgreed = true;
                vue.feesAgreed = true;
                vue.$forceUpdate();
            }, true);
        },
        requestTerminationApplicant() {
            this.applicantRequestTermination = true;
        },
        requestTerminationRespondingParty() {
            this.respondingPartyRequestTermination = true;
        },
        partiesRequestTermination() {
            let vue = this;
            let message = this.applicantRequestTerminationMessage || this.respondingPartyRequestTerminationMessage;
            makeServerCall('POST', '/Mediation/Case/RequestTermination', { caseGuid: this.Form.GUID, message: message }, (ResultData) => {
                vue.Form.CaseStatusGUID = ResultData.CaseStatusGUID;
                vue.Form.CaseStatusName = ResultData.CaseStatusName;
                vue.applicantRequestTermination = false;
                vue.respondingPartyRequestTermination = false;
                vue.$forceUpdate();
            }, true);
        },
        requestMediatorTerminate() {
            this.mediatorTermination = true;
        },
        mediatorTerminate() {
            let vue = this;
            let message = this.mediatorTerminationMessage;
            makeServerCall('POST', '/Mediation/Case/Termination', { caseGuid: this.Form.GUID, message: message }, (ResultData) => {
                vue.Form.CaseStatusGUID = ResultData.CaseStatusGUID;
                vue.Form.CaseStatusName = ResultData.CaseStatusName;
                vue.mediatorTermination = false;
                vue.$forceUpdate();
            }, true);
        },
        mediatorStartProcedure() {
            let vue = this;
            makeServerCall('POST', '/Mediation/Case/StartMediationProcedure', { caseGuid: this.Form.GUID }, (ResultData) => {
                vue.Form.CaseStatusGUID = ResultData.CaseStatusGUID;
                vue.Form.CaseStatusName = ResultData.CaseStatusName;
                vue.$forceUpdate();
            }, true);
        },
        redirectToCase() {
            let vue = this;
            window.location = "/Mediation/Case/Preview/" + vue.Form.GUID;
        },
        saveFeesNotes(event) {
            if (!(event.which === 83 && event.ctrlKey) && !(event.which === 19)) return true;
            makeServerCall('POST', '/Mediation/Case/SaveMediatiorFeesNotes', { caseGuid: this.Form.GUID, note: this.Form.MediatorFeesNotes }, () => { });
            event.preventDefault();
            return false;
        },
        asd() {
            //TODO - change to dialog opening and show privacy policy
            alert('sgetdrey');
        },
        convertDate(d) {
            return moment(d).format("DD.MM.YYYYг. HH:mmч.");
        },
        signInRepresentativeApplicant() {
            let vue = this;

            makeServerCall('POST', '/Mediation/Case/SignInRepresentativeApplicant', this.Form, (ResultData) => {
                if (vue.isCurrentUserApplicant) {
                    vue.ApplicantRepresentativePersonIsShown = true;
                    vue.inReadonlyModeApplicantRepsresentativePerson = true;
                    vue.Form.ApplicantRepresentativePerson.isConfirmed = false;
                } else if (vue.isCurrentUserRespondingParty) {
                    vue.RespondingPartyRepresentativePersonIsShown = true;
                    vue.inReadonlyModeRespondingPartyRepsresentativePerson = true;
                    vue.Form.RespondingPartyRepresentativePerson.isConfirmed = false;
                }
            });
        },
        signInRepresentativeRespondingParty() {
            loadingShow();
            let vue = this;

            makeServerCall('POST', '/Mediation/Case/SignInRepresentativeRespondingParty', this.Form, (ResultData) => {
                if (vue.isCurrentUserApplicant) {
                    vue.ApplicantRepresentativePersonIsShown = true;
                    vue.inReadonlyModeApplicantRepsresentativePerson = true;
                    vue.Form.ApplicantRepresentativePerson.isConfirmed = false;
                } else if (vue.isCurrentUserRespondingParty) {
                    vue.RespondingPartyRepresentativePersonIsShown = true;
                    vue.inReadonlyModeRespondingPartyRepsresentativePerson = true;
                    vue.Form.RespondingPartyRepresentativePerson.isConfirmed = false;
                }
                loadingHide();
            });
        },
        removeRepresentativeApplicant() {
            this.rejectRepresentativeModal.open = true;
        },
        changeRepresentativeApplicant() {
            this.replaceRepresentativeModal.open = true;
        },
        doRepresentativeReject() {
            let vue = this;
            this.rejectRepresentativeModal.loading = true;
            let partySide = '';
            loadingShow();

            if (vue.isCurrentUserApplicant) {
                partySide = 'ApplicantRepresentativePerson';
            } else if (vue.isCurrentUserRespondingParty) {
                partySide = 'RespondingPartyRepresentativePerson';
            }

            makeServerCall('POST', '/Mediation/Case/RejectRepresentativePerson?caseGuid=' + this.Form.GUID + '&cred=' + this.Form[partySide].AccessToken, this.Form, (ResultData) => {
                getNewGuid().then((guid) => {
                    if (vue.isCurrentUserApplicant) {
                        vue.ApplicantRepresentativePersonIsShown = false;
                        vue.inReadonlyModeApplicantRepsresentativePerson = false;
                    } else if (vue.isCurrentUserRespondingParty) {
                        vue.RespondingPartyRepresentativePersonIsShown = false;
                        vue.inReadonlyModeRespondingPartyRepsresentativePerson = false;
                    }
                    vue.Form[partySide] = new RepresentativePerson();
                    vue.Form[partySide].AccessToken = guid.data;

                    vue.rejectRepresentativeModal.open = false;
                    vue.rejectRepresentativeModal.loading = false;
                    loadingHide();
                });
                loadingHide();
            });
        },
        doRepresentativeReplace() {
            let vue = this;
            this.replaceRepresentativeModal.loading = true;
            let partySide = '';
            loadingShow();

            if (vue.isCurrentUserApplicant) {
                partySide = 'ApplicantRepresentativePerson';
            } else if (vue.isCurrentUserRespondingParty) {
                partySide = 'RespondingPartyRepresentativePerson';
            }

            makeServerCall('POST', '/Mediation/Case/RejectRepresentativePerson?caseGuid=' + this.Form.GUID + '&cred=' + this.Form[partySide].AccessToken, this.Form, (ResultData) => {

                getNewGuid().then((guid) => {
                    if (vue.isCurrentUserApplicant) {
                        vue.ApplicantRepresentativePersonIsShown = true;
                        vue.inReadonlyModeApplicantRepsresentativePerson = false;
                    } else if (vue.isCurrentUserRespondingParty) {
                        vue.RespondingPartyRepresentativePersonIsShown = true;
                        vue.inReadonlyModeRespondingPartyRepsresentativePerson = false;
                    }
                    vue.Form[partySide] = new RepresentativePerson();
                    vue.Form[partySide].AccessToken = guid.data;

                    vue.replaceRepresentativeModal.open = false;
                    vue.replaceRepresentativeModal.loading = false;
                    loadingHide();
                });
                loadingHide();
            });
        },
        sendProcedureInitializationAgreementToSides() {
            let vue = this;
            loadingShow();
            makeServerCall('POST', '/Mediation/Case/SendProcedureInitializationAgreementToSides', { caseGuid: this.Form.GUID, agreementContent: this.Form.ProcedureInitializationContent }, (ResultData) => {
                vue.Form = ResultData;
                vue.Form.isProcedureInitializationAgreementSent = true;
                loadingHide()
            })
        },
        sendProcedureFinalizeAgreementToSides() {
            let vue = this;
            loadingShow();
            makeServerCall('POST', '/Mediation/Case/SendAgreementForPocedureClosing', { caseGuid: this.Form.GUID, agreementContent: this.Form.ProcedureAgreementContent }, (ResultData) => {
                vue.Form = ResultData;

                if (vue.Form.ProcedureAgreementContent === null) {
                    vue.Form.isProcedureFinalizeAgreementSent = false;
                } else {
                    vue.Form.isProcedureFinalizeAgreementSent = true;

                }

                if (vue.Form.ProcedureInitializationContent === null) {
                    vue.Form.isProcedureInitializationAgreementSent = false;
                } else {
                    vue.Form.isProcedureInitializationAgreementSent = true;
                }

                loadingHide();
            })
        },
        saveMediationTaxes() {
            let vue = this;
            makeServerCall('POST', '/Mediation/Case/MarkTaxesAgreed', { caseGuid: this.Form.GUID, taxesNotes: this.Form.MediatorFeesNotes }, (ResultData) => {
                if (ResultData && ResultData.GUID) {
                    vue.Form = ResultData;
                    vue.areFeesAgreed = true;
                }
            })
        },
        showExampleProcedureInitializationAgreement() {
            let vue = this;
            this.replaceRepresentativeModal.loading = true;

            makeServerCall('GET', '/Mediation/Case/GetExampleInitializationAgreement', null, (ResultData) => {
                if (ResultData && ResultData.GUID) {
                    vue.agreementDialog.title = ResultData.Name;
                    vue.agreementDialog.content = ResultData.HTMLContent;
                    this.agreementDialog.open = true;
                    this.agreementDialog.type = 3;

                    this.replaceRepresentativeModal.loading = false;
                }
            })
        },
        showInitializationAgreement() {
            this.agreementDialog.title = "Споразумение за започване на медиация"
            this.agreementDialog.open = true;
            this.agreementDialog.type = 1;
            this.agreementDialog.content = this.Form.ProcedureInitializationContent;
        },
        showFinalizingAgreement() {
            this.agreementDialog.title = "Споразумение (спогодба)"
            this.agreementDialog.open = true;
            this.agreementDialog.type = 2;
            this.agreementDialog.content = this.Form.ProcedureAgreementContent;
        },
        showPrivacyPolicy: function () {
            let vue = this;

            makeServerCall('GET', '/ContentManagement/Services/GetMediatorsSignedPrivacyStatement?privacyStatementGuid=' + this.Form.PrivacyDeclarationGUID, null, ResultData => {
                vue.agreementDialog.title = ResultData.PreviousName;
                vue.agreementDialog.open = true;
                vue.agreementDialog.type = 3;
                vue.agreementDialog.content = ResultData.PreviousHTMLContent;
            })
        },
        confirmApplication() {
            if (this.isCurrentUserLogged) {
                this.showApplication = true;
                $("html, body").animate({ scrollTop: 0 }, "slow");
            } else {
                this.openLoginModal();
            }
        },
        refuseApplication() {
            location.href = "/";
        },
        openLoginModal() {
            this.$refs.loginDialog.dialog.open = true;
        },
        GetBRRACheck(isApplicant) {
            loadingShow();

            let vue = this;

            var side = "";
            if (isApplicant) {
                side = "ApplicantLegalEntity"
                this.Regix.Applicant.Checked = false;
                this.Regix.Applicant.Name = "Резултат от проверка в Търговски Регистър";
            } else {
                side = "RespondingPartyLegalEntity"
                this.Regix.RespondingParty.Checked = false;
                this.Regix.RespondingParty.Name = "Резултат от проверка в Търговски Регистър";
            }

            makeServerCall("POST", "/Mediation/Case/GetActualState?Eik=" + this.Form[side].EntityEIK, null, ResultData => {
                if (isApplicant) {
                    vue.Regix.Applicant.Data.Name = ResultData.CompanyName;
                    vue.Regix.Applicant.Data.Representatives = ResultData.Representatives;
                    vue.Regix.RespondingParty.Data.Owners = ResultData.Owners;
                    vue.Regix.Applicant.Checked = true;
                } else {
                    vue.Regix.RespondingParty.Data.Name = ResultData.CompanyName;
                    vue.Regix.RespondingParty.Data.Representatives = ResultData.Representatives;
                    vue.Regix.RespondingParty.Data.Owners = ResultData.Owners;
                    vue.Regix.RespondingParty.Checked = true;
                }

                loadingHide();
            })
        },
        GetBulstatCheck(isApplicant) {
            loadingShow();
            let vue = this;
            let side = "";
            let key = "";

            if (isApplicant) {
                side = "ApplicantLegalEntity"
                this.Regix.Applicant.Name = "Резултат от проверка в Булстат Регистър"
                this.Regix.Applicant.Checked = false;
            } else {
                side = "RespondingPartyLegalEntity"
                this.Regix.RespondingParty.Name = "Резултат от проверка в Булстат Регистър"
                this.Regix.RespondingParty.Checked = false;
            }

            if (this.Form[side].EntityEIK && this.Form[side].EntityEIK.length) {
                key = this.Form[side].EntityEIK;
            } else if (this.Form[side].RespondingPartyLegalEntity && this.Form[side].RespondingPartyLegalEntity.length) {
                key = this.Form[side].RespondingPartyLegalEntity;
            }

            makeServerCall("POST", "/Mediation/Case/GetStateOfPlayRequest?Eik=" + key, null, ResultData => {
                if (isApplicant) {
                    vue.Regix.Applicant.Data.Name = ResultData.CompanyName;
                    vue.Regix.Applicant.Data.Representatives = ResultData.Representatives;
                    vue.Regix.Applicant.Data.Owners = ResultData.Owners;
                    vue.Regix.Applicant.Checked = true;
                } else {
                    vue.Regix.RespondingParty.Data.Name = ResultData.CompanyName;
                    vue.Regix.RespondingParty.Data.Representatives = ResultData.Representatives;
                    vue.Regix.RespondingParty.Data.Owners = ResultData.Owners;
                    vue.Regix.RespondingParty.Checked = true;
                }
                loadingHide();
            })
        }
    },
    computed: {
        showSaveBtn: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Draft || this.Form.CaseStatusGUID === eCaseFormStatus.ChoosingNewMediator) &&
                this.Form.ApplicantUserId === this.currentUser.Id &&
                this.inReadonlyMode === false;
        },
        showRegisterBtn: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Draft || this.Form.CaseStatusGUID === eCaseFormStatus.ChoosingNewMediator) &&
                this.Form.ApplicantUserId === this.currentUser.Id &&
                this.inReadonlyMode === false;
        },
        showMediatorApproveBtn: function () {
            return this.Form.PrimaryMediatorGUID === this.currentUser.PrimaryMediatorGUID && this.Form.CaseStatusGUID === eCaseFormStatus.Registered;
        },
        showMediatorRejectBtn: function () {
            return this.Form.PrimaryMediatorGUID === this.currentUser.PrimaryMediatorGUID && this.Form.CaseStatusGUID === eCaseFormStatus.Registered;
        },
        showRequestNewMediatorFormBtn: function () {
            return this.Form.CaseStatusGUID === eCaseFormStatus.ChoosingNewMediator &&
                this.Form.ApplicantUserId === this.currentUser.Id &&
                this.inReadonlyMode === true;
        },
        showTerminateMediationBtn: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Registered || this.Form.CaseStatusGUID === eCaseFormStatus.ChoosingNewMediator) &&
                this.Form.ApplicantUserId === this.currentUser.Id &&
                this.inReadonlyMode === true;
        },
        showRespondingPartyAgreeMediationBtn: function () {
            return (this.currentUser.Email === this.Form.RespondingPartyContactInfo.Email || this.currentUser.Email === this.Form.RespondingPartyLegalEntity.EntityContactInfo.Email) &&
                !this.RespondingPartySentConfirmationEmail &&
                !this.Form.RespondingPartyUserId;
        },
        showSendInvitationToRespondingPartyBtn: function () {
            return ((this.Form.PrimaryMediatorGUID === this.currentUser.PrimaryMediatorGUID) || this.isCurrentUserMediator) &&
                (this.Form.RespondingPartyContactInfo.Email || this.Form.RespondingPartyLegalEntity.EntityContactInfo.Email) &&
                this.Form.CaseStatusGUID === eCaseFormStatus.Initiated &&
                !this.Form.RespondingPartyUserId;
        },
        isCurrentUserPrimaryMediator: function () {
            return this.Form.PrimaryMediatorGUID === this.currentUser.PrimaryMediatorGUID &&
                (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated ||
                    this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                    this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested ||
                    this.Form.CaseStatusGUID === eCaseFormStatus.Terminated ||
                    this.Form.CaseStatusGUID === eCaseFormStatus.AgreementReached);
        },
        isCurrentUserMediator: function () {

            if (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.Registered ||
                this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested ||
                this.Form.CaseStatusGUID === eCaseFormStatus.Terminated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.AgreementReached) {

                let additionalMediators = [];

                this.Form.CaseMediators.forEach(mediator => {
                    if (!mediator.IsPrimary) {
                        additionalMediators.push(mediator.MediatorGUID);
                    }
                })

                return this.Form.PrimaryMediatorGUID === this.currentUser.PrimaryMediatorGUID ||
                    additionalMediators.indexOf(this.currentUser.AdditinalMediatorGUID) != -1
            }

            return false;
        },
        isCurrentUserHasRightsToCase: function () {
            return this.page !== 'CREATE' ? (this.isCurrentUserMediator || this.isCurrentUserSide) : true;
        },
        isCurrentUserSide: function () {
            return (this.Form.ApplicantUserId === this.currentUser.Id ||
                this.Form.RespondingPartyUserId === this.currentUser.Id ||
                this.Form.RepresentativeApplicantUserId === this.currentUser.Id ||
                this.Form.RepresentativeRespondingPartyUserId === this.currentUser.Id) &&
                (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated ||
                    this.Form.CaseStatusGUID === eCaseFormStatus.Registered ||
                    this.Form.CaseStatusGUID === eCaseFormStatus.ChoosingNewMediator ||
                    this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                    this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested ||
                    this.Form.CaseStatusGUID === eCaseFormStatus.Terminated ||
                    this.Form.CaseStatusGUID === eCaseFormStatus.AgreementReached);
        },
        isCurrentUserApplicant: function () {
            return this.Form.ApplicantUserId === this.currentUser.Id || this.Form.RepresentativeApplicantUserId === this.currentUser.Id;
        },
        isCurrentUserApplicantRepresentativePerson: function () {
            return this.Form.RepresentativeApplicantUserId === this.currentUser.Id;
        },
        isCurrentUserRespondingPartyRepresentativePerson: function () {
            return this.Form.RepresentativeRespondingPartyUserId === this.currentUser.Id;
        },
        isCurrentUserRespondingParty: function () {
            return this.Form.RespondingPartyUserId === this.currentUser.Id || this.Form.RepresentativeRespondingPartyUserId === this.currentUser.Id;
        },
        isMediationTerminated: function () {
            return eCaseFormStatus.Terminated === this.Form.CaseStatusGUID;
        },
        showSaveRespondingPartyChangesBtn: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated && this.Form.PrimaryMediatorGUID === this.currentUser.PrimaryMediatorGUID && !this.Form.RespondingPartyUserId) ||
                (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated && this.isCurrentUserMediator && !this.Form.RespondingPartyUserId) ||
                ((this.Form.CaseStatusGUID === eCaseFormStatus.Initiated ||
                    this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                    this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested)
                    && this.isCurrentUserRespondingParty)
        },
        showApplicantSignedAgreementBtn: function () {
            return this.Form.CaseStatusGUID === eCaseFormStatus.Initiated &&
                this.Form.ApplicantUserId === this.currentUser.Id &&
                !this.Form.ApplicantSignedAgreement &&
                this.Form.RespondingPartyUserId;
        },
        showRespondingPartySignedAgreementBtn: function () {
            return this.Form.CaseStatusGUID === eCaseFormStatus.Initiated &&
                this.currentUser.Id === this.Form.RespondingPartyUserId &&
                !this.Form.RespondingPartySignedAgreement;
        },
        showMediatorSignPrivacyBtn: function () {
            return this.Form.PrimaryMediatorGUID === this.currentUser.PrimaryMediatorGUID &&
                this.Form.CaseStatusGUID === eCaseFormStatus.Initiated &&
                this.Form.RespondingPartyUserId &&
                !this.Form.CaseMediators.find(x => x.MediatorGUID === this.Form.PrimaryMediatorGUID).PrivacyStatementSigned;
        },
        showMediatorTaxAgreedBtn: function () {
            return this.Form.PrimaryMediatorGUID === this.currentUser.PrimaryMediatorGUID &&
                this.Form.CaseStatusGUID === eCaseFormStatus.Initiated &&
                this.Form.RespondingPartyUserId &&
                !this.Form.CaseMediators.find(x => x.MediatorGUID === this.Form.PrimaryMediatorGUID).FeesAgreed;
        },
        showRequestTerminationApplicantBtn: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated || this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted) &&
                this.Form.ApplicantUserId === this.currentUser.Id &&
                !this.applicantRequestTermination;
        },
        showRequestTerminationRespondingPartyBtn: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated || this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted) &&
                this.Form.RespondingPartyUserId === this.currentUser.Id &&
                this.Form.RespondingPartyUserId &&
                !this.respondingPartyRequestTermination;
        },
        showRequestTerminationApplicantTextField: function () {
            return this.applicantRequestTermination;
        },
        showRequestTerminationRespondingPartyTextField: function () {
            return this.respondingPartyRequestTermination;
        },
        showRequestTerminationApplicantSendBtn: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated || this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted) &&
                this.applicantRequestTermination && this.applicantRequestTerminationMessage
        },
        showRequestTerminationRespondingPartySendBtn: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated || this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted) &&
                this.respondingPartyRequestTermination && this.respondingPartyRequestTerminationMessage
        },
        showMediatorTerminateBtn: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.FurtherClarificationsRequested ||
                this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested) &&
                this.Form.PrimaryMediatorGUID === this.currentUser.PrimaryMediatorGUID &&
                !this.mediatorTermination;
        },
        showMediatorTerminateTextField: function () {
            return this.mediatorTermination;
        },
        showMediatorTerminateSendBtn: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated || this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted || this.Form.CaseStatusGUID === eCaseFormStatus.FurtherClarificationRequested || this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested) &&
                this.mediatorTermination && this.mediatorTerminationMessage
        },
        showPrivacyDeclarationInfo: function () {
            return this.currentUser.PrimaryMediatorGUID === this.Form.PrimaryMediatorGUID &&
                (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated || this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted);
        },
        showMediatorFeesNotes: function () {
            return this.feesAgreed && this.currentUser.PrimaryMediatorGUID === this.Form.PrimaryMediatorGUID;
        },
        showMediatorRejected: function () {
            var result = false;
            var recordIdx = -1;

            let log = this.formLog;

            for (var i = 0; i < log.length; i++) {
                if (eCaseActionType.RejectedMediationByMediator.toUpperCase() === log[i].ActionTypeGUID.toUpperCase()) {
                    recordIdx = i;
                    this.rejectedMediatorLog = log[i];
                    result = true;
                    break;
                }
            }

            if (recordIdx === -1) {
                return false;
            }

            if (recordIdx > 0) {
                for (var i = recordIdx - 1; i >= 0; i--) {
                    if (eCaseActionType.Submission.toUpperCase() === log[i].ActionTypeGUID.toUpperCase()) {
                        result = false;
                        break;
                    }
                }
            } else {
                result = true;
            }
            return result;
        },
        showRepresentativePersons: function () {
            return this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                this.Form.CaseStatusGUID === eCaseFormStatus.Terminated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested ||
                this.Form.CaseStatusGUID === eCaseFormStatus.AgreementReached
        },
        showEvents: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                this.Form.CaseStatusGUID === eCaseFormStatus.Terminated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested ||
                this.Form.CaseStatusGUID === eCaseFormStatus.AgreementReached) &&
                this.Form.ApplicantUserId
        },
        showMediators: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Registered ||
                this.Form.CaseStatusGUID === eCaseFormStatus.Initiated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                this.Form.CaseStatusGUID === eCaseFormStatus.Terminated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested ||
                this.Form.CaseStatusGUID === eCaseFormStatus.AgreementReached)
        },
        unlockAddAdditionalMediators: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested ||
                this.Form.CaseStatusGUID === eCaseFormStatus.AgreementReached) &&
                (this.isCurrentUserPrimaryMediator || this.isCurrentUserMediator)
        },
        showNewEventButton: function () {
            return true;
            return this.Form.CaseStatusGUID !== eCaseFormStatus.Terminated
        },
        getCurrentMediator: function () {
            let vue = this;
            let currentMediator = null
            if (this.currentUser.PrimaryMediatorGUID !== null) {
                this.Form.CaseMediators.forEach(mediator => {
                    if (mediator.MediatorGUID.toLowerCase() === vue.currentUser.PrimaryMediatorGUID.toLowerCase()) {
                        currentMediator = mediator;
                    }
                })
            }

            if (this.currentUser.AdditinalMediatorGUID !== null) {
                this.Form.CaseMediators.forEach(mediator => {
                    if (mediator.MediatorGUID.toLowerCase() === vue.currentUser.AdditinalMediatorGUID.toLowerCase()) {
                        currentMediator = mediator;
                    }
                })
            }

            return currentMediator;
        },
        isInitializationAgreementVisible: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested ||
                this.Form.CaseStatusGUID === eCaseFormStatus.Terminated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.AgreementReached) &&
                this.Form.RespondingPartyUserId && this.Form.ApplicantUserId
        },
        isFinalizationAgreementVisible: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested ||
                this.Form.CaseStatusGUID === eCaseFormStatus.Terminated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.AgreementReached) &&
                this.Form.RespondingPartyUserId && this.Form.ApplicantUserId
        },
        isTaxesVisible: function () {
            return (this.Form.CaseStatusGUID === eCaseFormStatus.Initiated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.ProcedureStarted ||
                this.Form.CaseStatusGUID === eCaseFormStatus.TerminationRequested ||
                this.Form.CaseStatusGUID === eCaseFormStatus.Terminated ||
                this.Form.CaseStatusGUID === eCaseFormStatus.AgreementReached) &&
                this.Form.RespondingPartyUserId && this.Form.ApplicantUserId

        },
        showApplicantCheckBtns: function () {
            return (this.isCurrentUserMediator && !this.applicantIsPerson &&
                (this.Form.ApplicantLegalEntity.EntityCourtRegistration || (this.Form.ApplicantLegalEntity.EntityEIK && this.Form.ApplicantLegalEntity.EntityEIK.length >= 9))) ||
                this.showMediatorApproveBtn;
        },
        showRespondingPartyCheckBtns: function () {
            return (this.isCurrentUserMediator && !this.respondingPartyIsPerson &&
                (this.Form.RespondingPartyLegalEntity.EntityCourtRegistration || (this.Form.RespondingPartyLegalEntity.EntityEIK && this.Form.RespondingPartyLegalEntity.EntityEIK.length >= 9))) ||
                this.showMediatorApproveBtn;
        }
    }
});

function loadMediationFormContent(vue) {
    // check if user has responding party token so we will know if is anonymous or not (token comes from responding party link sent to e-mail)
    let respondingPartyVerificationTokenGUID = window.location.search.split("=").pop();

    if (vue.page === 'CREATE') {

        //first get the current user to determine appropriate buttons and fields autofill information
        //makeServerCall('GET', '/UserManagement/GetCurrentUser', null, (ResultData) => {
        //    vue.currentUser = ResultData;

        // It's a new form
        vue.Form = new MediationForm();
        getNewGuid().then((guid) => vue.Form.GUID = guid.data);

        vue.Form.ApplicantInfo.FirstName = vue.currentUser.FirstName;
        vue.Form.ApplicantInfo.MiddleName = vue.currentUser.MiddleName;
        vue.Form.ApplicantInfo.LastName = vue.currentUser.LastName;
        vue.Form.ApplicantInfo.EGN = vue.currentUser.EGN;
        vue.Form.ApplicantContactInfo.Email = vue.currentUser.Email;
        vue.Form.ApplicantUserId = vue.currentUser.Id;

        vue.loadedData.push(true);
        vue.loadedData.push(true); // Additional true is added in loadedData. Difference comes between Create <-> Edit/Preview. More data is required in Edit/Preview, so count mismatch. Couldn't think better solution

        //}, false);
    }
    else { //It's an edit or preview form

        let formGuid = window.location.pathname.split("/").pop();

        makeServerCall('GET', '/Mediation/Case/GetFormData?id=' + formGuid + "&respondingPartyAccessToken=" + respondingPartyVerificationTokenGUID, null, (formData) => {
            vue.Form = Object.assign(new MediationForm(), formData);

            if (vue.Form.ProcedureInitializationContent === null) {
                vue.Form.isProcedureInitializationAgreementSent = false;
            } else {
                vue.Form.isProcedureInitializationAgreementSent = true;
            }

            if (!vue.Form.ProcedureAgreementContent || vue.Form.ProcedureAgreementContent === null) {
                vue.Form.isProcedureFinalizeAgreementSent = false;
            } else {
                vue.Form.isProcedureFinalizeAgreementSent = true;
            }

            vue.applicantIsPerson = !vue.Form.ApplicantIsLegalEntity;
            vue.respondingPartyIsPerson = !vue.Form.RespondingPartyIsLegalEntity;

            //We reuse this function in EDIT and PREVIEW
            //After we get the current user, can be used to determine which buttons to be shown
            makeServerCall('GET', '/UserManagement/GetCurrentUserInfo?caseGuid=' + vue.Form.GUID + '&primaryMediatorGuid=' + vue.Form.PrimaryMediatorGUID, null, (ResultData) => {
                vue.currentUser = ResultData;
                vue.loadedData.push(true);

                // since we have get form and we have capability of inserting representative person
                // we have to check if we already have or create new model for both Representative Persons

                //if (vue.Form.ApplicantRepresentativePerson === null && vue.isCurrentUserApplicant) {

                //add on change to add mediator
                /*if (vue.Form.ApplicantRepresentativePerson === null) {
                    getNewGuid().then((guid) => {
                        vue.Form.ApplicantRepresentativePerson = new RepresentativePerson();
                        vue.Form.ApplicantRepresentativePerson.AccessToken = guid.data;
                    });
                    vue.inReadonlyModeApplicantRepsresentativePerson = false;
                } else {*/
                if (vue.Form.ApplicantRepresentativePerson !== null) {
                    loadMunicipalities(vue, vue.Form.ApplicantRepresentativePerson.FullAddress.DistrictGUID, vue.RepresentativeApplicantAddress);
                    loadSettlements(vue, vue.Form.ApplicantRepresentativePerson.FullAddress.MunicipalityGUID, vue.RepresentativeApplicantAddress);
                    vue.ApplicantRepresentativePersonIsShown = true;
                    vue.inReadonlyModeApplicantRepsresentativePerson = true;
                    if (vue.Form.ApplicantRepresentativePerson.AccessToken == EmptyGuid) {
                        vue.Form.ApplicantRepresentativePerson.isConfirmed = true;
                    } else {
                        vue.Form.ApplicantRepresentativePerson.isConfirmed = false;
                    }
                }

                //if (vue.Form.RespondingPartyRepresentativePerson === null && vue.isCurrentUserRespondingParty) {

                //add on change to add mediator
                /*if (vue.Form.RespondingPartyRepresentativePerson === null) {
                    getNewGuid().then((guid) => {
                        vue.Form.RespondingPartyRepresentativePerson = new RepresentativePerson();
                        vue.Form.RespondingPartyRepresentativePerson.AccessToken = guid.data;
                    });
                    vue.inReadonlyModeRespondingPartyRepsresentativePerson = false;
                } else {*/
                if (vue.Form.RespondingPartyRepresentativePerson !== null) {
                    loadMunicipalities(vue, vue.Form.RespondingPartyRepresentativePerson.FullAddress.DistrictGUID, vue.RepresentativeRespondingPartyAddress);
                    loadSettlements(vue, vue.Form.RespondingPartyRepresentativePerson.FullAddress.MunicipalityGUID, vue.RepresentativeRespondingPartyAddress);
                    vue.RespondingPartyRepresentativePersonIsShown = true;
                    vue.inReadonlyModeRespondingPartyRepsresentativePerson = true;
                    if (vue.Form.RespondingPartyRepresentativePerson.AccessToken == EmptyGuid) {
                        vue.Form.RespondingPartyRepresentativePerson.isConfirmed = true;
                    } else {
                        vue.Form.RespondingPartyRepresentativePerson.isConfirmed = false;
                    }
                }

                if (vue.Form.CaseMediators[0]) {
                    vue.areFeesAgreed = vue.Form.CaseMediators[0].FeesAgreed;
                } else {
                    vue.areFeesAgreed = false;
                }

            }, false);

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

            // show chosen mediator
            if (vue.Form.PrimaryMediatorInfo !== null) {
                vue.chooseMediator(vue.Form.PrimaryMediatorInfo.MediatorGUID, "Избран медиатор: " + vue.Form.PrimaryMediatorInfo.FirstName + " " + vue.Form.PrimaryMediatorInfo.LastName);
            }

            vue.loadedData.push(true);
            vue.showApplication = true;
        }, false);

        makeServerCall('GET', '/Mediation/Case/GetCaseFormLog/' + formGuid, null, (ResultData) => {
            vue.formLog = ResultData;
        });
    }

    if (vue.page === "CREATE" || vue.page === "EDIT") {
        vue.inReadonlyMode = false;
        vue.inCreateMode = true;
    }
}

function loadMediatorsPrivacyStatement(vue) {
    vue.mediatorApproveMediation.loadingDeclaration = true;
    makeServerCall('GET', '/ContentManagement/Services/GetMediatorsPrivacyStatement', null, (ResultData) => {
        vue.mediatorApproveMediation.mediatorsPrivacyDeclaration = ResultData;
        vue.mediatorApproveMediation.loadingDeclaration = false;
        vue.mediatorApproveMediation.open = true;
    });
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