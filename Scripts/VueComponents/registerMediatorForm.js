"use strict";

Vue.component('registerMediatorForm', {
    data: function () {
        return {
            Form: new RegisterMediatorForm(), //RegisterMediatorForm
            formLog: [],
            formlogMessage: null,
            showLog: false,
            loading: true,
            loadedData: [],
            showApplication: false,
            page: window.location.pathname.split("/")[3].toUpperCase(), // CREATE/EDIT/PREVIEW,
            inReadonlyMode: true,
            AllowedActions: [],
            currentUser: {},
            applicantUser: null,
            applicantUserEGN: null,
            actionMessage: '',
            certificateFile: null,

            employeeRequestModifications: false,

            items: [],
            model: null,

            revisionDialog: {
                open: false,
                loading: true,
                header: 'Заявление преди корекции',
                actionTypeApprove: eApplicationFormActionType.EmployeeApprovalWithModification,
                actionTypeRequestCorrection: eApplicationFormActionType.RequestCorrectingFormWithModification,
                FormRevisionContent: {}
            },

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
            attachedDocumentConteiners: [], // AttachedDocumentContainer[]
            attachedDocumentTypes: [], //AttachedDocumentType[] 

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
            Payment: {
                IsPaid: false,
                Description: ''
            },
            panel: [0, 1, 2], // determine which panel to be open,
            isCurrentUserLogged: false,
            ApplicationInformation: {},
            BG_GUID: BULGARIA_GUID
        };
    },
    created: function () {
        var vue = this;

        makeDefaultServerCall("GET", "/UserManagement/GetCurrentUser", null, (response) => {
            makeServerCall('GET', '/FormFiling/RegisterMediator/GetApplicationInformation', null, (ApplicationInfo) => {
                vue.loadedData.push(true);
                vue.ApplicationInformation = ApplicationInfo;
            })
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
            //load Countries, Districts, WasteTypes, Protocol data, Collection center, Mobile Centers
            if ((this.isCurrentUserLogged && this.loadedData.length === 17) || (!this.isCurrentUserLogged && this.loadedData.length === 12) && !this.loadedData.includes(false)) {
                this.loading = false;

                // set the Received by Entity to current's user values if the current user is not Employee
                if (this.AllowedActions.CreateRepMediatorRegistrationForm && this.page === 'CREATE') {
                    this.Form.PersonInfo = new Person();
                    this.Form.ContactInfo = new Contact();
                } else if (this.page === 'CREATE') {
                    //this.Form.PersonInfo.FirstName = this.currentUser.FirstName;
                    //this.Form.PersonInfo.MiddleName = this.currentUser.MiddleName;
                    //this.Form.PersonInfo.LastName = this.currentUser.LastName;
                    this.Form.ContactInfo.Email = this.currentUser.Email;
                    this.Form.PersonInfo.EGN = this.currentUser.EGN;
                }

                if (this.page === 'CREATE') {
                    getNewGuid().then((guid) => {
                        let newEdu = new Education();
                        newEdu.TrackGuid = guid.data;
                        this.Form.Educations.unshift(newEdu);

                        let professionalDirections = guid.data;
                        this.professionalDirectionsGlobal.push({ [professionalDirections]: [] })
                    });
                }
            }
        },
        isCurrentUserLogged: function () {
            if (this.isCurrentUserLogged) {
                loadAttachedDocumentTypes(this);
                loadFormContent(this);
                loadAllowedActions(this);
            }
        }
    },
    computed: {
        example: function () {
            return param => {
                return param + 1;
            };
        },
        showSaveBtn: function () {
            return (this.AllowedActions.CreateOwnMediatorRegistrationForm || this.AllowedActions.CreateRepMediatorRegistrationForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft &&
                this.Form.ApplicantUserId === this.currentUser.Id &&
                this.inReadonlyMode === false &&
                this.employeeRequestModifications === false;
        },
        showEditBtn: function () {
            return (this.AllowedActions.CreateOwnMediatorRegistrationForm || this.AllowedActions.CreateRepMediatorRegistrationForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft &&
                this.page === "PREVIEW" &&
                this.Form.ApplicantUserId === this.currentUser.Id;
        },
        showRegisterBtn: function () {
            return (this.AllowedActions.CreateOwnMediatorRegistrationForm || this.AllowedActions.CreateRepMediatorRegistrationForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft &&
                this.Form.ApplicantUserId === this.currentUser.Id;
        },
        showEmployeeeApproveBtn: function () {
            return this.AllowedActions.EmployeeApproveMediatorRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.Registered &&
                this.employeeRequestModifications === false;
        },
        showCreateCorrectingFormBtn: function () {
            return (this.AllowedActions.CreateOwnMediatorRegistrationForm || this.AllowedActions.CreateRepMediatorRegistrationForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.ForCorrection &&
                this.Form.ApplicantUserId === this.currentUser.Id;
        },
        showCorrectingFormBtn: function () {
            return this.Form.FormStatusGUID === eApplicationFormStatus.Corrected;
        },
        showMinisterApproveBtn: function () {
            return this.AllowedActions.MinisterApproveMediatorRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.ApprovedByEmployee;
        },
        showExecuteBtn: function () {
            return this.AllowedActions.ExecuteMediatorRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.ApprovedByMinister;
        },
        showCopyAddressBtn: function () {
            return !isEmptyGUID(this.Form.PermanentAddress.CountryGUID)
                && !isEmptyGUID(this.Form.PermanentAddress.DistrictGUID)
                && !isEmptyGUID(this.Form.PermanentAddress.MunicipalityGUID)
                && !isEmptyGUID(this.Form.PermanentAddress.SettlementGUID)
                && this.Form.PermanentAddress.Address.length
        },
        showPrintBtn: function () {
            return this.page === 'PREVIEW' && this.employeeRequestModifications === false &&
                (this.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                this.AllowedActions.EmployeeApproveModifyMediatorForm ||
                this.AllowedActions.MinisterApproveModifyMediatorForm);
        },
        showEmployeeModifyFormBtn: function () {
            return this.AllowedActions.EmployeeApproveMediatorRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.Registered &&
                this.employeeRequestModifications === false;
        },
        showApprovedByEmployeeWithModificationBtn: function () {
            return this.AllowedActions.EmployeeApproveMediatorRegistrationForm &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Registered &&
                this.employeeRequestModifications === true;
        },
        showGenerateDocuments: function () {
            return (this.Form.FormStatusGUID != eApplicationFormStatus.Draft) &&
                (this.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                    this.AllowedActions.EmployeeApproveModifyMediatorForm ||
                    this.AllowedActions.MinisterApproveModifyMediatorForm);
        },
        showPaymentInformation: function () {
            return (this.Form.FormStatusGUID != eApplicationFormStatus.Draft) &&
                (this.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                    this.AllowedActions.EmployeeApproveModifyMediatorForm ||
                    this.AllowedActions.MinisterApproveModifyMediatorForm);
        },
        showPaymentSaveBtn: function () {
            return (this.Form.FormStatusGUID.toLowerCase() === eApplicationFormStatus.Registered.toLowerCase() ||
                this.Form.FormStatusGUID.toLowerCase() === eApplicationFormStatus.PendingPayment.toLowerCase()) &&
                (this.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                    this.AllowedActions.EmployeeApproveModifyMediatorForm ||
                    this.AllowedActions.MinisterApproveModifyMediatorForm) && this.Payment.IsPaid && !this.Form.IsPaid;
        },
        readonlyPayments: function () {
            return (this.Form.FormStatusGUID.toLowerCase() !== eApplicationFormStatus.Registered.toLowerCase() &&
                this.Form.FormStatusGUID.toLowerCase() !== eApplicationFormStatus.PendingPayment.toLowerCase()) || this.Form.IsPaid
        },
        pendingPayment: function () {
            return this.Form.FormStatusGUID.toLowerCase() === eApplicationFormStatus.PendingPayment.toLowerCase();
        },
        isEmployeePreview: function () {
            return (this.Form.FormStatusGUID != eApplicationFormStatus.Draft) &&
                (this.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                    this.AllowedActions.EmployeeApproveModifyMediatorForm ||
                    this.AllowedActions.MinisterApproveModifyMediatorForm);
        },
        isEmployee: function () {
            return (this.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                    this.AllowedActions.EmployeeApproveModifyMediatorForm ||
                    this.AllowedActions.MinisterApproveModifyMediatorForm);
        },
        showEmployeeUploadCertificateField: function () {
            return this.AllowedActions.EmployeeApproveMediatorRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.Executed && this.Form.CertificateGUID == EmptyGuid;
        },
        showSendCertificateBtn: function () {
            return this.AllowedActions.EmployeeApproveMediatorRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.Executed && this.Form.CertificateGUID == EmptyGuid && this.certificateFile;
        },
        showCancelProcedureBtn() {
            return this.AllowedActions.EmployeeApproveMediatorRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.ForCorrection
        }
    },
    methods: {
        saveForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterMediator/SaveForm', vue.Form, (ResultData) => {
                //get the generated number
                vue.Form.InternalNumber = ResultData.InternalNumber;
                vue.$forceUpdate();
            }, true);
        },
        registerForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterMediator/PreregisterForm', vue.Form, (ResultData) => {
                if (ResultData.IsPaid) {
                    vue.Form.InternalNumber = ResultData.InternalNumber;
                    vue.Form.IncomingNumber = ResultData.IncomingNumber;
                    vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                    vue.Form.FormStatusName = ResultData.FormStatusName;
                    vue.inReadonlyMode = true;
                    vue.$forceUpdate();
                } else {
                    //redirect to payment instructions
                    if (!vue.isEmployee) {
                        const link = document.createElement('a');
                        link.href = "/FormFiling/PaymentInstructions/RegisterMediator/" + vue.Form.GUID;
                        link.click();
                    } else {
                        const link = document.createElement('a');
                        link.href = "/FormFiling/ApplicationForms/AllApplications";
                        link.click();
                    }
                }
            }, true);
        },
        employeeApproveForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterMediator/EmployeeApproveForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        requestCorrectingForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterMediator/RequestCorrectingForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.actionMessage = "";
            }, true);
        },
        createCorrectingForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterMediator/CreateCorrectingForm', { formGuid: vue.Form.GUID }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.Form.CorrectingApplicationGUID = ResultData.CorrectingApplicationGUID;
                //redirect to the new form
                const link = document.createElement('a');
                link.href = "/FormFiling/RegisterMediator/Edit/" + ResultData.CorrectingApplicationGUID;
                link.target = "_blank";
                link.click();

            }, true);
        },
        ministerApproveForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterMediator/MinisterApproveForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage, certificateGuid: vue.Form.CertificateGUID }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        ministerRejectForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterMediator/MinisterRejectForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        executeForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterMediator/ExecuteForm', { formGuid: vue.Form.GUID }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },

        onFileChange(files, attContainer) {
            if (files) {
                if (files instanceof File)
                    handleFileUplaod(this, files, attContainer);
                else
                    //prevent falsly triggering of uplaod
                    return;
            }
            else {
                handleFileClear(this, attContainer);
            }
        },
        onCertificateUpload(file) {
            if (file) {
                handleCertificateUpload(this, file);
            }
            else {
                this.certificateFile = null;
            }
        },
        onAddNewEducation() {
            // add new education to list
            getNewGuid().then((guid) => {
                let newEducation = new Education();
                newEducation.TrackGuid = guid.data;
                this.Form.Educations.unshift(newEducation);

                let professionalDirections = guid.data;
                this.professionalDirectionsGlobal.push({ [professionalDirections]: [] })
            });
        },
        removeEducation: function (index) {
            let vue = this;
            vue.Form.Educations.splice(index, 1);
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
        onAddAttachmentContainer: function () {
            handleAddAttachmentContainer(this);
        },
        onAttachmentTypeChange: function (newValue, attContainer) {
            ///chnage the type of the Form.Document too (if if exist already)
            var index = this.Form.Documents.findIndex(x => x.Key === attContainer.Key);
            if (index !== -1)
                this.Form.Documents[index].AttachedDocumentTypeGUID = newValue;
        },
        print: function (formGuid) {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/RegisterMediator/PrintForm/' + formGuid;

            window.open(link.href);
        },
        onCopyCurrentAddress() {
            let newValues = {
                CountryGUID: this.Form.PermanentAddress.CountryGUID,
                DistrictGUID: this.Form.PermanentAddress.DistrictGUID,
                MunicipalityGUID: this.Form.PermanentAddress.MunicipalityGUID,
                SettlementGUID: this.Form.PermanentAddress.SettlementGUID,
                Address: this.Form.PermanentAddress.Address
            };


            loadMunicipalities(this, this.Form.PermanentAddress.DistrictGUID, this.CurrentAddress);
            loadSettlements(this, this.Form.PermanentAddress.MunicipalityGUID, this.CurrentAddress);

            this.Form.CurrentAddress = newValues;
        },
        onCopyMailingAddress() {
            let newValues = {
                CountryGUID: this.Form.PermanentAddress.CountryGUID,
                DistrictGUID: this.Form.PermanentAddress.DistrictGUID,
                MunicipalityGUID: this.Form.PermanentAddress.MunicipalityGUID,
                SettlementGUID: this.Form.PermanentAddress.SettlementGUID,
                Address: this.Form.PermanentAddress.Address
            };


            loadMunicipalities(this, this.Form.PermanentAddress.DistrictGUID, this.MailingAddress);
            loadSettlements(this, this.Form.PermanentAddress.MunicipalityGUID, this.MailingAddress);

            this.Form.MailingAddress = newValues;
        },
        loadProfessionalDirections(educationFieldGUID, trackGuid) {
            if (educationFieldGUID) {
                makeServerCall('GET', '/MetaData/GetProfessionalDirectionsFiltered?educationFieldGUID=' + educationFieldGUID, null, (ResultData) => {
                    this.professionalDirectionsGlobal[trackGuid] = ResultData;
                    this.$forceUpdate();
                }, false);
            } else {
                this.professionalDirectionsGlobal[trackGuid] = [];
            }
        },
        openChosenApplicationForm(formGuid) {
            this.revisionDialog.open = true;
            makeServerCall('GET', '/FormFiling/RegisterMediator/GetFormRevision/' + formGuid, null, (ResultData) => {
                this.revisionDialog.FormRevisionContent = ResultData;
                this.revisionDialog.loading = false;
                this.$forceUpdate();
            }, false);
        },
        showLogTab() {
            this.showLog = true;
            this.$forceUpdate();
        },
        showFormTab() {
            this.showLog = false;
            this.$forceUpdate();
        },
        employeeRequestModification() {
            this.employeeRequestModifications = true;
            this.$forceUpdate();
        },
        employeeApproveFormWithModification() {
            var vue = this;
            makeServerCall('POST', '/FormFiling/RegisterMediator/EmployeeApproveFormWithModifications', { form: vue.Form, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.employeeRequestModifications = false;
                vue.$forceUpdate();
            }, true);
        },
        requestCorrectingFormWithModification() {
            var vue = this;
            makeServerCall('POST', '/FormFiling/RegisterMediator/RequestCorrectingFormWithModifications', { form: vue.Form, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.employeeRequestModifications = false;
                vue.$forceUpdate();
            }, true);
        },
        downloadMinistersOrder() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/RegisterMediator/GenerateDocument?docGuid=' + eDocumentTemplate.MinisterOrder_RegisterMediator + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadDetailedNote() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/RegisterMediator/GenerateDocument?docGuid=' + eDocumentTemplate.DetailedNote_RegisterMediator + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadCertificate() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/RegisterMediator/GenerateDocument?docGuid=' + eDocumentTemplate.Certificate_RegisterMediator + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadApplication() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/RegisterMediator/GenerateDocument?docGuid=' + eDocumentTemplate.Application_Mediator + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
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
        savePayment() {
            let vue = this;
            loadingShow()

            this.Form.IsPaid = this.Payment.IsPaid;
            this.Form.PaymentDescription = this.Payment.Description;

            makeServerCall('POST', '/FormFiling/RegisterMediator/SavePayment', this.Form, ResultData => {
                vue.Form = ResultData;
                loadingHide()
            })
        },
        sendCertificate() {
            let vue = this;
            loadingShow();
            if (this.certificateFile) {

                let formData = new FormData();
                formData.append('file', this.certificateFile);
                axios.post('/AttachedDocument/UploadFile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                    .then(function (response) {
                        vue.Form.CertificateGUID = response.data.ResultData

                        makeServerCall('POST', '/FormFiling/RegisterMediator/SendCertificate', { formGuid: vue.Form.GUID, certificateGuid: vue.Form.CertificateGUID }, ResultData => {
                            vue.Form = ResultData;
                            loadingHide();
                        })
                    })
                    .catch(function (error) {
                        if (error.response && error.response.status === 403) {
                            //If the response is 'not authorized' => display the content. It's a meaningfull message
                            iziToast.error({
                                layout: 2,
                                title: 'Грешка!',
                                message: error.response.data
                            });
                        }
                        else {
                            iziToast.error({
                                title: 'Грешка при прикачане!'
                            });
                        }
                        console.error(error);
                    })
                    .finally(() => {
                        loadingHide();
                    });
            }
        },
        cancelProcedure() {
            let vue = this;
            loadingShow();

            makeServerCall('POST', '/FormFiling/RegisterMediator/CancelProcedure', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, ResultData => {
                vue.Form = ResultData;
            })
        }
    }
});

function handleCertificateUpload(vue, file) {
    if (file instanceof File) {
        loadingShow();

        let formData = new FormData();
        formData.append('file', file);
        axios.post('/AttachedDocument/UploadFile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            .then(function (response) {
                vue.Form.CertificateGUID = response.data.ResultData
            })
            .catch(function (error) {
                if (error.response && error.response.status === 403) {
                    //If the response is 'not authorized' => display the content. It's a meaningfull message
                    iziToast.error({
                        layout: 2,
                        title: 'Грешка!',
                        message: error.response.data
                    });
                }
                else {
                    iziToast.error({
                        title: 'Грешка при прикачане!'
                    });
                }
                console.error(error);
            })
            .finally(() => {
                loadingHide();
            });;
    }
    else {
        //prevent falsly triggering of uplaod
        return;
    }
}

function loadFormContent(vue) {
    if (vue.page === "CREATE") {
        // It's a new form
        vue.Form = new RegisterMediatorForm();

        getNewGuid().then((guid) => vue.Form.GUID = guid.data);

        vue.Form.ApplicantUserId = vue.currentUser.Id;

        loadAttachmentsAndTypes(vue, "RegisterMediator");

        vue.loadedData.push(true);
        vue.loadedData.push(true);
    }
    else { //It's an edit or preview form

        var formGuid = window.location.pathname.split("/").pop();
        makeServerCall('GET', '/FormFiling/RegisterMediator/GetFormData?id=' + formGuid, null, (formData) => {
            vue.Form = Object.assign(new RegisterMediatorForm(), formData);
            vue.Payment.IsPaid = vue.Form.IsPaid;
            vue.Payment.Description = vue.Form.PaymentDescription;

            loadApplicantUserInfo(vue, vue.Form.ApplicantUserId)

            loadMunicipalities(vue, vue.Form.PermanentAddress.DistrictGUID, vue.PermanentAddress);
            loadSettlements(vue, vue.Form.PermanentAddress.MunicipalityGUID, vue.PermanentAddress);

            loadMunicipalities(vue, vue.Form.CurrentAddress.DistrictGUID, vue.CurrentAddress);
            loadSettlements(vue, vue.Form.CurrentAddress.MunicipalityGUID, vue.CurrentAddress);

            loadMunicipalities(vue, vue.Form.MailingAddress.DistrictGUID, vue.MailingAddress);
            loadSettlements(vue, vue.Form.MailingAddress.MunicipalityGUID, vue.MailingAddress);

            vue.Form.Educations.forEach(x => {
                getNewGuid().then((guid) => {
                    x.TrackGuid = guid.data;
                    vue.loadProfessionalDirections(x.EducationFieldGUID, x.TrackGuid);
                });
            });


            // show application form if user is employee or admin
            /*if (vue.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                vue.AllowedActions.EmployeeApproveModifyMediatorForm ||
                vue.AllowedActions.MinisterApproveModifyMediatorForm) {
                vue.showApplication = true;
            }*/

            // show application if form is NOT in create mode
            vue.showApplication = true;

            vue.loadedData.push(true);

            loadAttachmentsAndTypes(vue, "RegisterMediator");
        });

        makeServerCall('GET', '/FormFiling/RegisterMediator/GetApplicationFormLog/' + formGuid, null, (ResultData) => {
            vue.formLog = ResultData;
            vue.formLog.forEach(x => {
                x.Timestamp = dateFormater(x.Timestamp)
            });

            let log = vue.formLog.find(x => x.ActionTypeName === 'Изискване на корекции');
            log ? vue.formlogMessage = log.Message : null;


            vue.$forceUpdate();
        });
    }

    if (vue.page === "CREATE" || vue.page === "EDIT") {
        vue.inReadonlyMode = false;
    }
}

function loadProfessionalDirectionsLocal(vue) {
    makeServerCall('GET', '/MetaData/GetProfessionalDirections', null, (ResultData) => {
        vue.professionalDirectionsLocal = ResultData;
        vue.loadedData.push(true);
    }, false);
}

function loadApplicantUserInfo(vue, applicantId) {
    makeServerCall('GET', '/UserManagement/GetUserInfo/' + applicantId, null, (ResultData) => {
        vue.applicantUser = `${ResultData.FirstName} ${ResultData.MiddleName ? ResultData.MiddleName : ''} ${ResultData.LastName}`;
        vue.applicantUserEGN = ResultData.EGN;
        vue.loadedData.push(true);
    }, false);
}