"use strict";

Vue.component('cancelMediatorForm', {
    data: function () {
        return {
            Form: new CancelMediatorFrom(), //CancelMediatorForm
            ModifiedMediator: null, //CancelMediatorForm
            formLog: [],
            formLogAdditionalInfo: {},
            showLog: false,
            formlogMessage: null,
            loading: true,
            loadedData: [],
            showApplication: false,
            page: window.location.pathname.split("/")[3].toUpperCase(), // CREATE/EDIT/PREVIEW,
            inReadonlyMode: true,
            inReadonlyModeEmployee: true,
            readonlyMode: false,
            AllowedActions: [],
            currentUser: {},
            applicantUser: null,
            actionMessage: '',
            selectedMediatorGuid: null, // Stores the mediator guid in case we want to revert it

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
                mediators: 'Няма медиатори свързани с вашият профил',
                documentTypes: 'Няма налични типове',
            },


            revisionDialog: {
                open: false,
                loading: true,
                header: 'Заявление преди корекции',
                actionTypeApprove: eApplicationFormActionType.EmployeeApprovalWithModification,
                actionTypeRequestCorrection: eApplicationFormActionType.RequestCorrectingFormWithModification,
                FormRevisionContent: {}
            },

            panel: [0, 1, 2], // determine which panel to be open
            isCurrentUserLogged: false,
            ApplicationInformation: {},
            BG_GUID: BULGARIA_GUID
        };
    },
    created: function () {
        var vue = this;

        makeDefaultServerCall("GET", "/UserManagement/GetCurrentUser", null, (response) => {
            makeServerCall('GET', '/FormFiling/CancelMediator/GetApplicationInformation', null, (ApplicationInfo) => {
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
            })

            loadCitizenships(vue);
            loadEducationDegrees(vue);
            loadEducationFields(vue);
            loadForeignLanguages(vue);
            loadSpecializations(vue);
            loadOrganizations(vue);
            loadProfessions(vue);

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
            if ((this.isCurrentUserLogged && this.loadedData.length === 16) || (!this.isCurrentUserLogged && this.loadedData.length === 11) && !this.loadedData.includes(false)) {
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
        Form: {
            deep: true,
            handler: function () {
                CompareMediatorData(this);
            }
        }
    },
    computed: {
        showSaveBtn: function () {
            return (this.AllowedActions.CreateOwnModifyMediatorForm || this.AllowedActions.CreateRepModifyMediatorForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft &&
                this.Form.ApplicantUserId === this.currentUser.Id &&
                this.inReadonlyMode === false;
        },
        showEditBtn: function () {
            return (this.AllowedActions.CreateOwnModifyMediatorForm || this.AllowedActions.CreateRepModifyMediatorForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft &&
                this.page === "PREVIEW" &&
                this.Form.ApplicantUserId === this.currentUser.Id;
        },
        showRegisterBtn: function () {
            return (this.AllowedActions.CreateOwnModifyMediatorForm || this.AllowedActions.CreateRepModifyMediatorForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft &&
                this.Form.ApplicantUserId === this.currentUser.Id;
        },
        showEmployeeeApproveBtn: function () {
            return this.AllowedActions.EmployeeApproveModifyMediatorForm && this.Form.FormStatusGUID === eApplicationFormStatus.Registered;
        },
        showCreateCorrectingFormBtn: function () {
            return (this.AllowedActions.CreateOwnModifyMediatorForm || this.AllowedActions.CreateRepModifyMediatorForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.ForCorrection &&
                this.Form.ApplicantUserId === this.currentUser.Id;
        },
        showCorrectingFormBtn: function () {
            return this.Form.FormStatusGUID === eApplicationFormStatus.Corrected;
        },
        showMinisterApproveBtn: function () {
            return this.AllowedActions.MinisterApproveModifyMediatorForm && this.Form.FormStatusGUID === eApplicationFormStatus.ApprovedByEmployee;
        },
        showExecuteBtn: function () {
            return this.AllowedActions.EmployeeApproveModifyMediatorForm && this.Form.FormStatusGUID === eApplicationFormStatus.ApprovedByMinister;
        },
        showMinisterRegistrationNumber: function () {
            return this.formLogAdditionalInfo;
        },
        showPrintBtn: function () {
            return this.page === 'PREVIEW' && this.employeeRequestModifications === false &&
                (this.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                    this.AllowedActions.EmployeeApproveModifyMediatorForm ||
                    this.AllowedActions.MinisterApproveModifyMediatorForm);
        },
        showGenerateDocuments: function () {
            return (this.Form.FormStatusGUID != eApplicationFormStatus.Draft) &&
                (this.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                    this.AllowedActions.EmployeeApproveModifyMediatorForm ||
                    this.AllowedActions.MinisterApproveModifyMediatorForm);
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
        showCancelProcedureBtn() {
            return this.AllowedActions.EmployeeApproveMediatorRegistrationForm && this.Form.FormStatusGUID === eApplicationFormStatus.ForCorrection
        }
    },
    methods: {
        selectModifiedMediator(mediatorGuid) {
            var vue = this;
            handleMediatorChange(vue, mediatorGuid);
        },
        saveForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/CancelMediator/SaveForm', vue.Form, (ResultData) => {
                //get the generated number
                vue.Form.InternalNumber = ResultData.InternalNumber;
                vue.$forceUpdate();
            }, true);
        },
        registerForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/CancelMediator/RegisterForm', vue.Form, (ResultData) => {
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
            makeServerCall('post', '/FormFiling/CancelMediator/EmployeeApproveForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        requestCorrectingForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/CancelMediator/RequestCorrectingForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.actionMessage = "";
            }, true);
        },
        createCorrectingForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/CancelMediator/CreateCorrectingForm', { formGuid: vue.Form.GUID }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.Form.CorrectingApplicationGUID = ResultData.CorrectingApplicationGUID;
                //redirect to the new form
                const link = document.createElement('a');
                link.href = "/FormFiling/CancelMediator/Edit/" + ResultData.CorrectingApplicationGUID;
                link.target = "_blank";
                link.click();

            }, true);
        },
        ministerApproveForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/CancelMediator/MinisterApproveForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        ministerRejectForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/CancelMediator/MinisterRejectForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        executeForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/CancelMediator/ExecuteForm', { formGuid: vue.Form.GUID }, (ResultData) => {
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
        onAddAttachmentContainer: function () {
            handleAddAttachmentContainer(this);
        },
        onAttachmentTypeChange: function (newValue, attContainer) {
            ///chnage the type of the Form.Document too (if if exist already)
            var index = this.Form.Documents.findIndex(x => x.Key === attContainer.Key)
            if (index !== -1)
                this.Form.Documents[index].AttachedDocumentTypeGUID = newValue;
        },
        print: function (formGuid) {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/CancelMediator/PrintForm/' + formGuid;

            window.open(link.href);
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
            makeServerCall('GET', '/FormFiling/CancelMediator/GetFormRevision/' + formGuid, null, (ResultData) => {
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
            link.href = '/FormFiling/CancelMediator/GenerateDocument?docGuid=' + eDocumentTemplate.MinisterOrder_CancelMediator + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadDetailedNote() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/CancelMediator/GenerateDocument?docGuid=' + eDocumentTemplate.DetailedNote_CancelMediator + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadCertificate() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/CancelMediator/GenerateDocument?docGuid=' + eDocumentTemplate.Certificate_RegisterMediator + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadApplication() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/CancelMediator/GenerateDocument?docGuid=' + eDocumentTemplate.Application_Mediator + '&formGuid=' + this.Form.GUID;

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
        cancelProcedure() {
            let vue = this;
            loadingShow();

            makeServerCall('POST', '/FormFiling/CancelMediator/CancelProcedure', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, ResultData => {
                vue.Form = ResultData;
            })
        }
    }
});

function loadFormContent(vue) {
    //first get the current user 
    //makeServerCall("GET", "/UserManagement/GetCurrentUser", null, (currUser) => {
    //    vue.currentUser = currUser;
    //    vue.loadedData.push(true);
        console.log("LQQQQQQQQQQQQQQQQQQ")
        //then load all mediators
        makeServerCall("GET", "/FormFiling/CancelMediator/GetMediatorsForSelection", null, (ResultData) => {
            vue.mediators = ResultData;
            vue.mediators.forEach(m => {
                m.FullInfoString = `${m.FirstName} ${m.MiddleName} ${m.LastName} ${m.EGN} ${m.RegistrationNumber}`
            });

            if (vue.page === "CREATE") {
                // It's a new form
                vue.Form = new CancelMediatorFrom();
                getNewGuid().then((guid) => vue.Form.GUID = guid.data);
                vue.Form.ApplicantUserId = vue.currentUser.Id;

                loadAttachmentsAndTypes(vue, "CancelMediator");

                vue.loadedData.push(true);
                vue.loadedData.push(true);
            }
            else { //It's an edit or preview form
                var formGuid = window.location.pathname.split("/").pop();
                makeServerCall('GET', '/FormFiling/CancelMediator/GetFormData?id=' + formGuid, null, (formData) => {
                    vue.Form = Object.assign(new CancelMediatorFrom(), formData);
                    loadApplicantUserInfo(vue, vue.Form.ApplicantUserId)

                    vue.selectedMediatorGuid = vue.Form.ModifiedMediatorGuid;
                    //load the modified mediator data
                    makeServerCall('GET', '/FormFiling/CancelMediator/GetMediatorData/' + vue.selectedMediatorGuid, null, (mediatorData) => {
                        vue.ModifiedMediator = mediatorData;
                    }, true);

                    makeServerCall('GET', '/FormFiling/CancelMediator/GetMediatorAdditionalInfo?mediatorGuid=' + vue.selectedMediatorGuid, null, (ResultData) => {
                        vue.formLogAdditionalInfo = ResultData;
                        vue.formLogAdditionalInfo.Timestamp = dateFormater(ResultData.Timestamp)
                    }, false);

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

                    loadAttachmentsAndTypes(vue, "CancelMediator");
                });

                makeServerCall('GET', '/FormFiling/CancelMediator/GetApplicationFormLog/' + formGuid, null, (ResultData) => {
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
        });
    //});
}

function handleMediatorChange(vue, mediatorGuid) {
    if (!mediatorGuid) {
        promptActionConfirmation("Отказ от този Медиатора? Това ще заличи въведените данни до момента",
            () => {
                vue.Form.ModifiedMediatorGuid = null;
                vue.ModifiedMediator = null;
            },
            () => { vue.selectedMediatorGuid = vue.Form.ModifiedMediatorGuid; }
        );
    }
    else {
        makeServerCall('GET', '/FormFiling/CancelMediator/GetMediatorData/' + mediatorGuid, null, (ResultData) => {
            if (vue.Form.ModifiedMediatorGuid) {
                //if there is one selected, ask to change it
                promptActionConfirmation("Смяна на Медиатора? Това ще заличи въведените данни до момента",
                    () => { setModifiedMediator(vue, ResultData, mediatorGuid); },
                    () => { vue.selectedMediatorGuid = vue.Form.ModifiedMediatorGuid; }
                );
            }
            else {
                setModifiedMediator(vue, ResultData, mediatorGuid);
            }
        }, true);
    }
}

function setModifiedMediator(vue, content, mediatorGuid) {
    var guid = vue.Form.GUID;
    vue.ModifiedMediator = content;
    vue.Form = copyObject(content);

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

    makeServerCall('GET', '/FormFiling/CancelMediator/GetMediatorAdditionalInfo?mediatorGuid=' + mediatorGuid, null, (ResultData) => {
        vue.formLogAdditionalInfo = ResultData;
        vue.formLogAdditionalInfo.Timestamp = dateFormater(ResultData.Timestamp)
    }, false);

    //restore the proper values after set
    vue.Form.GUID = guid;
    vue.Form.ApplicantUserId = vue.currentUser.Id;
    vue.Form.FormStatusGUID = eApplicationFormStatus.Draft;
    vue.Form.ModifiedMediatorGuid = mediatorGuid;
}

function loadApplicantUserInfo(vue, applicantId) {
    makeServerCall('GET', '/UserManagement/GetUserInfo/' + applicantId, null, (ResultData) => {
        vue.applicantUser = `${ResultData.FirstName} ${ResultData.MiddleName ? ResultData.MiddleName : ''} ${ResultData.LastName}`;
        vue.loadedData.push(true);
    }, false);
}