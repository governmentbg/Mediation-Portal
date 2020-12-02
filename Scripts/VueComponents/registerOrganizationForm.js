"use strict";

Vue.component('registerTrainingOrganizationForm', {
    data() {
        return {
            // Objects
            Form: new RegisterOrganizationForm(),    //RegisterOrganizationForm
            AllowedActions: [],
            actionMessage: '',
            showLog: false,
            formLog: [], 
            formlogMessage: null,
            inReadonlyMode: true,
            page: window.location.pathname.split("/")[3].toUpperCase(), // CREATE/EDIT/PREVIEW,
            currentUser: {},
            applicantUser: null,
            applicantUserEGN: null,

            employeeRequestModifications: false,
            revisionDialog: {
                open: false,
                loading: true,
                header: 'Заявление преди корекции',
                actionTypeApprove: eApplicationFormActionType.EmployeeApprovalWithModification,
                actionTypeRequestCorrection: eApplicationFormActionType.RequestCorrectingFormWithModification,
                FormRevisionContent: {}
            },

            // FullAddress
            RegistrationAddressData: {
                countries: [],
                districts: [],
                municipalities: [],
                settlements: [],
            },
            MailingAddressData: {
                countries: [],
                districts: [],
                municipalities: [],
                settlements: [],
            },

            // Common
            BG_GUID: BULGARIA_GUID,
            loading: true,
            loadedData: [],
            showApplication: false,
            attachedDocumentConteiners: [], // AttachedDocumentContainer[]
            attachedDocumentTypes: [], //AttachedDocumentType[]
            isCurrentUserLogged: false,
            ApplicationInformation: {},
            Payment: {
                IsPaid: false,
                Description: ''
            },
            Regix: {
                Checked: false,
                Name: "",
                Data: {
                    Name: "",
                    Representatives: [],
                    Owners: []
                }
            },
            noDataText: {
                documentTypes: 'Няма налични типове',
            },
        }
    },
    created: function () {
        let vue = this;
        makeDefaultServerCall("GET", "/UserManagement/GetCurrentUser", null, (response) => {
            makeServerCall('GET', '/FormFiling/RegisterTrainingOrganization/GetApplicationInformation', null, (ApplicationInfo) => {
                vue.loadedData.push(true);
                vue.ApplicationInformation = ApplicationInfo;
            })
            loadCountriesPromise().then(function (data) {
                vue.RegistrationAddressData.countries = data;
                vue.MailingAddressData.countries = data;

                vue.loadedData.push(true);
            });

            loadDistrictsPromise().then((data) => {
                vue.RegistrationAddressData.districts = data;
                vue.MailingAddressData.districts = data;

                vue.loadedData.push(true);
            })

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
            if ((this.isCurrentUserLogged && this.loadedData.length === 9) || (!this.isCurrentUserLogged && this.loadedData.length === 4) && !this.loadedData.includes(false)) {
                this.loading = false;

                // set the Received by Entity to current's user values if the current user is not Employee
                if (this.AllowedActions.CreateRepOrganizationRegistrationForm && this.page === 'CREATE') {
                    this.Form.OrganizationContact = new Contact();
                } else if (this.page === 'CREATE') {
                    this.Form.OrganizationEIK = this.currentUser.EIK;
                    this.Form.OrganizationContact.Email = this.currentUser.Email;
                }

                if (this.page === 'CREATE') {
                    this.Form.OrganizationRepresentatives.unshift(new Person());
                }
            }
        },
        isCurrentUserLogged: function () {
            if (this.isCurrentUserLogged) {
                loadAttachedDocumentTypes(this);
                loadFormContent(this);
                loadAllowedActions(this);
            }
        },
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
            makeServerCall('post', '/FormFiling/RegisterTrainingOrganization/SaveForm', vue.Form, (ResultData) => {
                //get the generated number
                vue.Form.InternalNumber = ResultData.InternalNumber;
                vue.$forceUpdate();
            }, true);
        },
        employeeApproveForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterTrainingOrganization/EmployeeApproveForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        ministerApproveForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterTrainingOrganization/MinisterApproveForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        ministerRejectForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterTrainingOrganization/MinisterRejectForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        requestCorrectingForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterTrainingOrganization/RequestCorrectingForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.actionMessage = "";
            }, true);
        },
        registerForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterTrainingOrganization/PreregisterForm', vue.Form, (ResultData) => {
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
                        link.href = "/FormFiling/PaymentInstructions/RegisterTrainingOrganization/" + vue.Form.GUID;
                        link.click();
                    } else {
                        const link = document.createElement('a');
                        link.href = "/FormFiling/ApplicationForms/AllApplications";
                        link.click();
                    }
                }
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
        onAddAttachmentContainer: function () {
            handleAddAttachmentContainer(this);
        },
        onAttachmentTypeChange: function (newValue, attContainer) {
            ///chnage the type of the Form.Document too (if if exist already)
            var index = this.Form.Documents.findIndex(x => x.Key === attContainer.Key);
            if (index !== -1)
                this.Form.Documents[index].AttachedDocumentTypeGUID = newValue;
        },
        createCorrectingForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterTrainingOrganization/CreateCorrectingForm', { formGuid: vue.Form.GUID }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.Form.CorrectingApplicationGUID = ResultData.CorrectingApplicationGUID;
                //redirect to the new form
                const link = document.createElement('a');
                link.href = "/FormFiling/RegisterTrainingOrganization/Edit/" + ResultData.CorrectingApplicationGUID;
                link.target = "_blank";
                link.click();

            }, true);
        },
        onAddNewRepresentative() {
            let newRepresentative = new Person();
            this.Form.OrganizationRepresentatives.unshift(newRepresentative);
        },
        onRemoveNewRepresentative: function (index) {
            this.Form.OrganizationRepresentatives.splice(index, 1);
        },
        executeForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/RegisterTrainingOrganization/ExecuteForm', { formGuid: vue.Form.GUID }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        print: function (formGuid) {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/RegisterTrainingOrganization/PrintForm/' + formGuid;

            window.open(link.href);
        },
        onCopyMailingAddress() {
            let newValues = {
                CountryGUID: this.Form.RegistrationAddress.CountryGUID,
                DistrictGUID: this.Form.RegistrationAddress.DistrictGUID,
                MunicipalityGUID: this.Form.RegistrationAddress.MunicipalityGUID,
                SettlementGUID: this.Form.RegistrationAddress.SettlementGUID,
                Address: this.Form.RegistrationAddress.Address,
                GUID: this.Form.MailingAddress.GUID
            };


            loadMunicipalities(this, this.Form.RegistrationAddress.DistrictGUID, this.MailingAddressData);
            loadSettlements(this, this.Form.RegistrationAddress.MunicipalityGUID, this.MailingAddressData);

            this.Form.MailingAddress = newValues;
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
            makeServerCall('POST', '/FormFiling/RegisterTrainingOrganization/EmployeeApproveFormWithModifications', { form: vue.Form, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.employeeRequestModifications = false;
                vue.$forceUpdate();
            }, true);
        },
        requestCorrectingFormWithModification() {
            var vue = this;
            makeServerCall('POST', '/FormFiling/RegisterTrainingOrganization/RequestCorrectingFormWithModifications', { form: vue.Form, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.employeeRequestModifications = false;
                vue.$forceUpdate();
            }, true);
        },
        openChosenApplicationForm(formGuid) {
            this.revisionDialog.open = true;
            makeServerCall('GET', '/FormFiling/RegisterTrainingOrganization/GetFormRevision/' + formGuid, null, (ResultData) => {
                this.revisionDialog.FormRevisionContent = ResultData;
                this.revisionDialog.loading = false;
                this.$forceUpdate();
            }, false);
        },
        downloadMinistersOrder() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/RegisterTrainingOrganization/GenerateDocument?docGuid=' + eDocumentTemplate.MinisterOrder_RegisterOrganization + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadDetailedNote() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/RegisterTrainingOrganization/GenerateDocument?docGuid=' + eDocumentTemplate.DetailedNote_RegisterOrganization + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadCertificate() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/RegisterTrainingOrganization/GenerateDocument?docGuid=' + eDocumentTemplate.Certificate_RegisterOrganization + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadApplication() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/RegisterTrainingOrganization/GenerateDocument?docGuid=' + eDocumentTemplate.Application_Organization + '&formGuid=' + this.Form.GUID;
            
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

            makeServerCall('POST', '/FormFiling/RegisterTrainingOrganization/SavePayment', this.Form, ResultData => {
                vue.Form = ResultData;
                loadingHide()
            })
        },
        GetBRRACheck() {
            loadingShow();

            let vue = this;
            this.Regix.Checked = false;
            this.Regix.Name = "Резултат от проверка в Търговски Регистър";

            makeServerCall("POST", "/FormFiling/RegisterTrainingOrganization/GetActualState?Eik=" + this.Form.OrganizationEIK, null, ResultData => {
                vue.Regix.Data.Name = ResultData.CompanyName;
                vue.Regix.Data.Representatives = ResultData.Representatives;
                vue.Regix.Data.Owners = ResultData.Owners;
                vue.Regix.Checked = true;
                loadingHide();
            })
        },
        GetBulstatCheck() {
            loadingShow();

            let vue = this;
            this.Regix.Checked = false;
            this.Regix.Name = "Резултат от проверка в Булстат Регистър"

            var keyToSearch = "";
            if (this.Form.OrganizationEIK && this.Form.OrganizationEIK.length) {
                keyToSearch = this.Form.OrganizationEIK;
            } else if (this.Form.CourtRegistration && this.Form.CourtRegistration.length) {
                keyToSearch = this.Form.CourtRegistration;
            }

            makeServerCall("POST", "/FormFiling/RegisterTrainingOrganization/GetStateOfPlayRequest?Eik=" + keyToSearch, null, ResultData => {
                vue.Regix.Data.Name = ResultData.CompanyName;
                vue.Regix.Data.Representatives = ResultData.Representatives;
                vue.Regix.Data.Owners = ResultData.Owners;
                vue.Regix.Checked = true;
                loadingHide();
            })
        },
        cancelProcedure() {
            let vue = this;
            loadingShow();

            makeServerCall('POST', '/FormFiling/RegisterTrainingOrganization/CancelProcedure', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, ResultData => {
                vue.Form = ResultData;
            })
        }
    },
    computed: {
        showEmployeeeApproveBtn: function () {
            return this.AllowedActions.EmployeeApproveOrganizationRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.Registered &&
                this.employeeRequestModifications === false;
        },
        showMinisterApproveBtn: function () {
            return this.AllowedActions.MinisterApproveOrganizationRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.ApprovedByEmployee;
        },
        showSaveBtn: function () {
            return (this.AllowedActions.CreateOwnOrganizationRegistrationForm || this.AllowedActions.CreateRepOrganizationRegistrationForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft &&
                this.Form.ApplicantUserId === this.currentUser.Id &&
                this.inReadonlyMode === false &&
                this.employeeRequestModifications === false;
        },
        showEditBtn: function () {
            return (this.AllowedActions.CreateOwnOrganizationRegistrationForm || this.AllowedActions.CreateRepOrganizationRegistrationForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft &&
                this.page === "PREVIEW" &&
                this.Form.ApplicantUserId === this.currentUser.Id;
        },
        showRegisterBtn: function () {
            return (this.AllowedActions.CreateOwnOrganizationRegistrationForm || this.AllowedActions.CreateRepOrganizationRegistrationForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft &&
                this.Form.ApplicantUserId === this.currentUser.Id;
        },
        showCorrectingFormBtn: function () {
            return this.Form.FormStatusGUID === eApplicationFormStatus.Corrected;
        },
        showExecuteBtn: function () {
            return this.AllowedActions.EmployeeApproveOrganizationRegistrationForm &&
                this.Form.FormStatusGUID === eApplicationFormStatus.ApprovedByMinister;
        },
        showCreateCorrectingFormBtn: function () {
            return (this.AllowedActions.CreateOwnOrganizationRegistrationForm || this.AllowedActions.CreateRepOrganizationRegistrationForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.ForCorrection &&
                this.Form.ApplicantUserId === this.currentUser.Id;
        },
        showCopyAddressBtn: function () {
            return !isEmptyGUID(this.Form.RegistrationAddress.CountryGUID)
                && !isEmptyGUID(this.Form.RegistrationAddress.DistrictGUID)
                && !isEmptyGUID(this.Form.RegistrationAddress.MunicipalityGUID)
                && !isEmptyGUID(this.Form.RegistrationAddress.SettlementGUID)
                && this.Form.RegistrationAddress.Address.length
        },
        showPrintBtn: function () {
            return this.page === 'PREVIEW' && this.employeeRequestModifications === false && 
                (this.AllowedActions.EmployeeApproveOrganizationRegistrationForm ||
                    this.AllowedActions.EmployeeApproveModifyOrganizationForm ||
                    this.AllowedActions.MinisterApproveModifyOrganizationForm);
        },
        showEmployeeModifyFormBtn: function () {
            return this.AllowedActions.EmployeeApproveOrganizationRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.Registered &&
                this.employeeRequestModifications === false;
        },
        showApprovedByEmployeeWithModificationBtn: function () {
            return this.AllowedActions.EmployeeApproveOrganizationRegistrationForm &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Registered &&
                this.employeeRequestModifications === true;
        },
        showGenerateDocuments: function () {
            return (this.Form.FormStatusGUID != eApplicationFormStatus.Draft) &&
                (this.AllowedActions.EmployeeApproveOrganizationRegistrationForm ||
                    this.AllowedActions.EmployeeApproveModifyOrganizationForm ||
                    this.AllowedActions.MinisterApproveModifyOrganizationForm)
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
                (this.AllowedActions.EmployeeApproveOrganizationRegistrationForm ||
                    this.AllowedActions.EmployeeApproveModifyOrganizationForm ||
                    this.AllowedActions.MinisterApproveModifyOrganizationForm) && this.Payment.IsPaid && !this.Form.IsPaid;
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
                (this.AllowedActions.EmployeeApproveOrganizationRegistrationForm ||
                    this.AllowedActions.EmployeeApproveModifyOrganizationForm ||
                    this.AllowedActions.MinisterApproveModifyOrganizationForm);
        },
        isEmployee: function () {
            return (this.AllowedActions.EmployeeApproveOrganizationRegistrationForm ||
                this.AllowedActions.EmployeeApproveModifyOrganizationForm ||
                this.AllowedActions.MinisterApproveModifyOrganizationForm);
        },
        showCancelProcedureBtn() {
            return this.AllowedActions.EmployeeApproveOrganizationRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.ForCorrection
        }
    }
});

function loadFormContent(vue) {
    if (vue.page === "CREATE") {
        // It's a new form
        vue.Form = new RegisterOrganizationForm();

        getNewGuid().then((guid) => vue.Form.GUID = guid.data);
        getNewGuid().then((guid) => vue.Form.RegistrationAddress.GUID = guid.data);
        getNewGuid().then((guid) => vue.Form.MailingAddress.GUID = guid.data);
        getNewGuid().then((guid) => vue.Form.OrganizationContact.GUID = guid.data);

        // set the Received by Entity to current's user values
        vue.Form.ApplicantUserId = vue.currentUser.Id;

        loadAttachmentsAndTypes(vue, "RegisterTrainingOrganization");

        vue.loadedData.push(true);
        vue.loadedData.push(true);
    } else { //It's an edit or preview form
        var protocolGuid = window.location.pathname.split("/").pop();
        makeServerCall('GET', '/FormFiling/RegisterTrainingOrganization/GetFormData?id=' + protocolGuid, null, (formData) => {
            vue.Form = Object.assign(new RegisterOrganizationForm(), formData);
            vue.Payment.IsPaid = vue.Form.IsPaid;
            vue.Payment.Description = vue.Form.PaymentDescription;

            loadApplicantUserInfo(vue, vue.Form.ApplicantUserId)

            loadMunicipalities(vue, vue.Form.RegistrationAddress.DistrictGUID, vue.RegistrationAddressData);
            loadSettlements(vue, vue.Form.RegistrationAddress.MunicipalityGUID, vue.RegistrationAddressData);

            loadMunicipalities(vue, vue.Form.MailingAddress.DistrictGUID, vue.MailingAddressData);
            loadSettlements(vue, vue.Form.MailingAddress.MunicipalityGUID, vue.MailingAddressData);

            // show application form if user is employee or admin
            /*if (vue.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                vue.AllowedActions.EmployeeApproveModifyMediatorForm ||
                vue.AllowedActions.MinisterApproveModifyMediatorForm) {
                vue.showApplication = true;
            }*/

            // show application if form is NOT in create mode
            vue.showApplication = true;

            vue.loadedData.push(true);
            loadAttachmentsAndTypes(vue, "RegisterTrainingOrganization");
        });

        makeServerCall('GET', '/FormFiling/RegisterTrainingOrganization/GetApplicationFormLog/' + protocolGuid, null, (ResultData) => {
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

function loadApplicantUserInfo(vue, applicantId) {
    makeServerCall('GET', '/UserManagement/GetUserInfo/' + applicantId, null, (ResultData) => {
        vue.applicantUser = `${ResultData.FirstName} ${ResultData.MiddleName ? ResultData.MiddleName : ''} ${ResultData.LastName}`;
        vue.applicantUserEGN = ResultData.EGN;
        vue.loadedData.push(true);
    }, false);
}