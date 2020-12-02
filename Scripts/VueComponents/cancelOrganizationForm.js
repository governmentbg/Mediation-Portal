﻿Vue.component('cancelOrganizationForm', {
    data: function () {
        return {
            // Objects
            Form: new CancelOrganizationForm(), //CancelOrganizationForm
            CanceledOrganization: null, //CancelOrganizationForm
            AllowedActions: [],
            currentUser: {},
            applicantUser: null,
            trainingOrganizations: [],
            selectedOrganizationGUID: null,
            formLog: [],
            formLogAdditionalInfo: {},
            formlogMessage: null,
            showLog: false,
            actionMessage: '',
            applicantUserEGN: null,

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
            attachedDocumentTypes: [], //AttachedDocumentType[] 
            attachedDocumentConteiners: [], // AttachedDocumentContainer[]

            inReadonlyMode: true,
            inReadonlyModeEmployee: true,
            readonlyMode: false,
            loading: true,
            loadedData: [],
            showApplication: false,
            isCurrentUserLogged: false,
            ApplicationInformation: {},
            Regix: {
                Checked: false,
                Name: "",
                Data: {
                    Name: "",
                    Representatives: [],
                    Owners: []
                }
            },


            revisionDialog: {
                open: false,
                loading: true,
                header: 'Заявление преди корекции',
                actionTypeApprove: eApplicationFormActionType.EmployeeApprovalWithModification,
                actionTypeRequestCorrection: eApplicationFormActionType.RequestCorrectingFormWithModification,
                FormRevisionContent: {}
            },
            BG_GUID: BULGARIA_GUID,
            page: window.location.pathname.split("/")[3].toUpperCase(), // CREATE/EDIT/PREVIEW
        }
    },
    created: function () {
        let vue = this;

        makeDefaultServerCall("GET", "/UserManagement/GetCurrentUser", null, (response) => {
            makeServerCall('GET', '/FormFiling/CancelTrainingOrganization/GetApplicationInformation', null, (ApplicationInfo) => {
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
            if ((this.isCurrentUserLogged && this.loadedData.length === 9) || (!this.isCurrentUserLogged && this.loadedData.length === 4) && !this.loadedData.includes(false)) {
                this.loading = false;
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
        selectCanceledOrganization(organizationGUID) {
            let vue = this;
            handleOrganizationChange(vue, organizationGUID);
        },
        onAddAttachmentContainer: function () {
            handleAddAttachmentContainer(this);
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
        onAttachmentTypeChange: function (newValue, attContainer) {
            ///change the type of the Form.Document too (if if exist already)
            var index = this.Form.Documents.findIndex(x => x.Key === attContainer.Key)
            if (index !== -1)
                this.Form.Documents[index].AttachedDocumentTypeGUID = newValue;
        },
        saveForm() {
            var vue = this;
            makeServerCall('POST', '/FormFiling/CancelTrainingOrganization/SaveForm', vue.Form, (ResultData) => {
                //get the generated number
                vue.Form.InternalNumber = ResultData.InternalNumber;
                vue.$forceUpdate();
            }, true);
        },
        registerForm() {
            var vue = this;
            makeServerCall('POST', '/FormFiling/CancelTrainingOrganization/RegisterForm', vue.Form, (ResultData) => {
                //get the incoming number 
                vue.Form.InternalNumber = ResultData.InternalNumber;
                vue.Form.IncomingNumber = ResultData.IncomingNumber;
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.inReadonlyMode = true;
                vue.$forceUpdate();
            }, true);
        },
        employeeApproveForm() {
            var vue = this;
            makeServerCall('POST', '/FormFiling/CancelTrainingOrganization/EmployeeApproveForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        requestCorrectingForm() {
            var vue = this;
            makeServerCall('POST', '/FormFiling/CancelTrainingOrganization/RequestCorrectingForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.actionMessage = "";
            }, true);
        },
        createCorrectingForm() {
            var vue = this;
            makeServerCall('POST', '/FormFiling/CancelTrainingOrganization/CreateCorrectingForm', { formGuid: vue.Form.GUID }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.Form.CorrectingApplicationGUID = ResultData.CorrectingApplicationGUID;
                //redirect to the new form
                const link = document.createElement('a');
                link.href = "/FormFiling/CancelTrainingOrganization/Edit/" + ResultData.CorrectingApplicationGUID;
                link.target = "_blank";
                link.click();

            }, true);
        },
        ministerApproveForm() {
            var vue = this;
            makeServerCall('POST', '/FormFiling/CancelTrainingOrganization/MinisterApproveForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        ministerRejectForm() {
            var vue = this;
            makeServerCall('POST', '/FormFiling/CancelTrainingOrganization/MinisterRejectForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        executeForm() {
            var vue = this;
            makeServerCall('POST', '/FormFiling/CancelTrainingOrganization/ExecuteForm', { formGuid: vue.Form.GUID }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        print: function (formGuid) {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/CancelTrainingOrganization/PrintForm/' + formGuid;

            window.open(link.href);
        },
        openChosenApplicationForm(formGuid) {
            this.revisionDialog.open = true;
            makeServerCall('GET', '/FormFiling/CancelTrainingOrganization/GetFormRevision/' + formGuid, null, (ResultData) => {
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
        downloadMinistersOrder() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/CancelTrainingOrganization/GenerateDocument?docGuid=' + eDocumentTemplate.MinisterOrder_CancelOrganization + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadDetailedNote() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/CancelTrainingOrganization/GenerateDocument?docGuid=' + eDocumentTemplate.DetailedNote_CancelOrganization + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadCertificate() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/CancelTrainingOrganization/GenerateDocument?docGuid=' + eDocumentTemplate.Certificate_RegisterOrganization + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadApplication() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/CancelTrainingOrganization/GenerateDocument?docGuid=' + eDocumentTemplate.Application_Organization + '&formGuid=' + this.Form.GUID;

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
        GetBRRACheck() {
            loadingShow();

            let vue = this;
            this.Regix.Checked = false;
            this.Regix.Name = "Резултат от проверка в Търговски Регистър";

            makeServerCall("POST", "/FormFiling/CancelTrainingOrganization/GetActualState?Eik=" + this.Form.OrganizationEIK, null, ResultData => {
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

            makeServerCall("POST", "/FormFiling/CancelTrainingOrganization/GetStateOfPlayRequest?Eik=" + keyToSearch, null, ResultData => {
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

            makeServerCall('POST', '/FormFiling/CancelTrainingOrganization/CancelProcedure', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, ResultData => {
                vue.Form = ResultData;
            })
        }
    },
    computed: {
        showSaveBtn: function () {
            return (this.AllowedActions.CreateOwnRemoveOrganizationForm || this.AllowedActions.CreateRepRemoveOrganizationForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft &&
                this.Form.ApplicantUserId === this.currentUser.Id &&
                this.inReadonlyMode === false;
        },
        showEditBtn: function () {
            return (this.AllowedActions.CreateOwnRemoveOrganizationForm || this.AllowedActions.CreateRepRemoveOrganizationForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft &&
                this.page === "PREVIEW" &&
                this.Form.ApplicantUserId === this.currentUser.Id;
        },
        showRegisterBtn: function () {
            return (this.AllowedActions.CreateOwnRemoveOrganizationForm || this.AllowedActions.CreateRepRemoveOrganizationForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft &&
                this.Form.ApplicantUserId === this.currentUser.Id;
        },
        showEmployeeeApproveBtn: function () {
            return this.AllowedActions.EmployeeApproveRemoveOrganizationForm && this.Form.FormStatusGUID === eApplicationFormStatus.Registered;
        },
        showCreateCorrectingFormBtn: function () {
            return (this.AllowedActions.CreateOwnRemoveOrganizationForm || this.AllowedActions.CreateRepRemoveOrganizationForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.ForCorrection &&
                this.Form.ApplicantUserId === this.currentUser.Id;
        },
        showCorrectingFormBtn: function () {
            return this.Form.FormStatusGUID === eApplicationFormStatus.Corrected;
        },
        showMinisterApproveBtn: function () {
            return this.AllowedActions.MinisterApproveRemoveOrganizationForm && this.Form.FormStatusGUID === eApplicationFormStatus.ApprovedByEmployee;
        },
        showExecuteBtn: function () {
            return this.AllowedActions.EmployeeApproveRemoveOrganizationForm && this.Form.FormStatusGUID === eApplicationFormStatus.ApprovedByMinister;
        },
        showMinisterRegistrationNumber: function () {
            return this.formLogAdditionalInfo;
        },
        showPrintBtn: function () {
            return this.page === 'PREVIEW' && this.employeeRequestModifications === false &&
                (this.AllowedActions.EmployeeApproveOrganizationRegistrationForm ||
                    this.AllowedActions.EmployeeApproveModifyOrganizationForm ||
                    this.AllowedActions.MinisterApproveModifyOrganizationForm);
        },
        showGenerateDocuments: function () {
            return (this.Form.FormStatusGUID != eApplicationFormStatus.Draft) &&
                (this.AllowedActions.EmployeeApproveOrganizationRegistrationForm ||
                this.AllowedActions.EmployeeApproveModifyOrganizationForm ||
                this.AllowedActions.MinisterApproveModifyOrganizationForm)
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
            return this.AllowedActions.EmployeeApproveMediatorRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.ForCorrection
        }
    }
});

function loadFormContent(vue) {
    //first get the current user 
    //makeServerCall("GET", "/UserManagement/GetCurrentUser", null, (currUser) => {
    //    vue.currentUser = currUser;
    //    vue.loadedData.push(true);

        // then load all Training Organizations
        makeServerCall('GET', '/FormFiling/CancelTrainingOrganization/GetOrganizationsForSelection', null, (ResultData) => {
            vue.trainingOrganizations = ResultData;
            vue.trainingOrganizations.forEach(m => {
                m.FullInfoString = `${m.Name} ${m.EIK} ${m.RegistrationNumber}`
            });

            if (vue.page === 'CREATE') { // It's a new form
                vue.Form = new CancelOrganizationForm();
                getNewGuid().then((guid) => vue.Form.GUID = guid.data);
                vue.Form.ApplicantUserId = vue.currentUser.Id;
                
                loadAttachmentsAndTypes(vue, "CancelTrainingOrganization");

                vue.loadedData.push(true);
                vue.loadedData.push(true);
            }
            else { //It's an edit or preview form
                let formGuid = window.location.pathname.split('/').pop();
                makeServerCall('GET', '/FormFiling/CancelTrainingOrganization/GetFormData?id=' + formGuid, null, (ResultData) => {
                    vue.Form = Object.assign(new CancelOrganizationForm(), ResultData);
                    loadApplicantUserInfo(vue, vue.Form.ApplicantUserId)

                    vue.selectedOrganizationGuid = vue.Form.CanceledOrganizationGuid
                    //load the cancellation organization data
                    makeServerCall('GET', '/FormFiling/CancelTrainingOrganization/GetOrganizationData/' + vue.selectedOrganizationGuid, null, (ResultData) => {
                        vue.CanceledOrganization = ResultData;
                    }, true);

                    makeServerCall('GET', '/FormFiling/ModifyTrainingOrganization/GetOrganizationAdditionalInfo?organizationGuid=' + vue.selectedOrganizationGuid, null, (ResultData) => {
                        vue.formLogAdditionalInfo = ResultData;
                        vue.formLogAdditionalInfo.Timestamp = dateFormater(ResultData.Timestamp)
                    }, false);

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
                    loadAttachmentsAndTypes(vue, "CancelTrainingOrganization");
                }, false);

                makeServerCall('GET', '/FormFiling/CancelTrainingOrganization/GetApplicationFormLog/' + formGuid, null, (ResultData) => {
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
                if (vue.isEmployee) {
                    vue.inReadonlyModeEmployee = false;
                }
                vue.inReadonlyMode = true;
                vue.readonlyMode = false;
            }
        }, false);
    //});
}

function handleOrganizationChange(vue, organizationGUID) {
    if (!organizationGUID) {
        promptActionConfirmation("Отказ от тази Организация? Това ще заличи въведените данни до момента",
            () => {
                vue.Form.CanceledOrganizationGuid = null;
                vue.CanceledOrganization = null;
            },
            () => {
                vue.selectedOrganizationGUID = vue.Form.CanceledOrganizationGuid;
            });
    } else {
        makeServerCall('GET', '/FormFiling/CancelTrainingOrganization/GetOrganizationData/' + organizationGUID, null, (ResultData) => {
            if (vue.Form.CanceledOrganizationGuid) {
                //if there is one selected, ask to change it
                promptActionConfirmation("Смяна на Организацията? Това ще заличи въведените данни до момента",
                    () => { setCanceledOrganization(vue, ResultData, organizationGUID) },
                    () => { vue.selectedOrganizationGUID = vue.Form.CanceledOrganizationGuid });
            } else {
                setCanceledOrganization(vue, ResultData, organizationGUID);
            }
        }, true);
    }
}

function setCanceledOrganization(vue, ResultData, organizationGUID) {
    let guid = vue.Form.GUID;
    vue.CanceledOrganization = ResultData;
    vue.Form = copyObject(ResultData);

    loadMunicipalities(vue, vue.Form.RegistrationAddress.DistrictGUID, vue.RegistrationAddressData);
    loadSettlements(vue, vue.Form.RegistrationAddress.MunicipalityGUID, vue.RegistrationAddressData);

    loadMunicipalities(vue, vue.Form.MailingAddress.DistrictGUID, vue.MailingAddressData);
    loadSettlements(vue, vue.Form.MailingAddress.MunicipalityGUID, vue.MailingAddressData);

    makeServerCall('GET', '/FormFiling/ModifyTrainingOrganization/GetOrganizationAdditionalInfo?organizationGuid=' + organizationGUID, null, (ResultData) => {
        vue.formLogAdditionalInfo = ResultData;
        vue.formLogAdditionalInfo.Timestamp = dateFormater(ResultData.Timestamp)
    }, false);

    //restore the proper values after set
    vue.Form.GUID = guid;
    vue.Form.ApplicantUserId = vue.currentUser.Id;
    vue.Form.FormStatusGUID = eApplicationFormStatus.Draft;
    vue.Form.CanceledOrganizationGuid = organizationGUID;
}

function loadApplicantUserInfo(vue, applicantId) {
    makeServerCall('GET', '/UserManagement/GetUserInfo/' + applicantId, null, (ResultData) => {
        vue.applicantUser = `${ResultData.FirstName} ${ResultData.MiddleName ? ResultData.MiddleName : ''} ${ResultData.LastName}`;
        vue.applicantUserEGN = ResultData.EGN;
        vue.loadedData.push(true);
    }, false);
}