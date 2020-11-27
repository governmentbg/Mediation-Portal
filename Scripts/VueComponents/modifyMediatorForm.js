"use strict";

Vue.component('modifyMediatorForm', {
    data: function () {
        return {
            Form: new ModifyMediatorForm(), //ModifyMediatorForm
            ModifiedMediator: null, //ModifyMediatorForm
            CompareMsg: [], //the messages representing the differences between Mediator data and Form content
            formLog: [],
            formLogAdditionalInfo: {},
            showLog: false,
            formlogMessage: null,
            loading: true,
            loadedData: [],
            showApplication: false,
            page: window.location.pathname.split("/")[3].toUpperCase(), // CREATE/EDIT/PREVIEW,
            inReadonlyMode: true,
            AllowedActions: [],
            currentUser: {},
            applicantUser: null,
            actionMessage: '',
            selectedMediatorGuid: null, // Stores the mediator guid in case we want to revert it

            employeeRequestModifications: false,
            removeMediatorForm: false,

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
                mediators: 'Няма медиатори свързани с вашият профил',
                documentTypes: 'Няма налични типове',
                professionalDirections: 'Няма налични професионални направления'
            },
            panel: [0, 1, 2], // determine which panel to be open
            isCurrentUserLogged: false,
            ApplicationInformation: {},
            BG_GUID: BULGARIA_GUID,
        };
    },
    created: function () {
        var vue = this;

        makeDefaultServerCall("GET", "/UserManagement/GetCurrentUser", null, (response) => {
            makeServerCall('GET', '/FormFiling/ModifyMediator/GetApplicationInformation', null, (ApplicationInfo) => {
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
            if ((this.isCurrentUserLogged && this.loadedData.length === 17) || (!this.isCurrentUserLogged && this.loadedData.length === 12) && !this.loadedData.includes(false)) {
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
                this.inReadonlyMode === false &&
                this.employeeRequestModifications === false &&
                this.removeMediatorForm === false;
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
                this.Form.ApplicantUserId === this.currentUser.Id &&
                this.removeMediatorForm === false;
        },
        showEmployeeeApproveBtn: function () {
            return this.AllowedActions.EmployeeApproveModifyMediatorForm &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Registered &&
                this.employeeRequestModifications === false;
        },
        showEmployeeApproveRemoveMediatorBtn: function () {
            return this.AllowedActions.EmployeeApproveModifyMediatorForm &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Removed &&
                this.employeeRequestModifications === false;
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
            return Object.keys(this.formLogAdditionalInfo).length > 0;
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
        },
        showRemoveMediatorBtn() {
            return (this.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                this.AllowedActions.EmployeeApproveModifyMediatorForm ||
                this.AllowedActions.MinisterApproveModifyMediatorForm)
                && this.removeMediatorForm === false &&
                this.inReadonlyMode === false;
        },
        showRemoveMediatorTextField() {
            return this.removeMediatorForm === true && this.Form.FormStatusGUID === eApplicationFormStatus.Draft;
        },
        showSubmitRemoveMediatorFormBtn() {
            return (this.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                this.AllowedActions.EmployeeApproveModifyMediatorForm ||
                this.AllowedActions.MinisterApproveModifyMediatorForm) &&
                this.removeMediatorForm === true &&
                this.Form.FormStatusGUID === eApplicationFormStatus.Draft;
        },
        showMinisterApproveRemovalBtn() {
            //this.actionMessage = null;
            return (this.AllowedActions.EmployeeApproveMediatorRegistrationForm ||
                this.AllowedActions.EmployeeApproveModifyMediatorForm ||
                this.AllowedActions.MinisterApproveModifyMediatorForm) &&
                this.Form.FormStatusGUID === eApplicationFormStatus.RemovingApprovedByEmployee;
        },
        showExecuteRemovingBtn: function () {
            return this.AllowedActions.EmployeeApproveModifyMediatorForm && this.Form.FormStatusGUID === eApplicationFormStatus.RemovingApprovedByMinister;
        },
    },
    methods: {
        selectModifiedMediator(mediatorGuid) {
            var vue = this;
            handleMediatorChange(vue, mediatorGuid);
        },
        saveForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/ModifyMediator/SaveForm', vue.Form, (ResultData) => {
                //get the generated number
                vue.Form.InternalNumber = ResultData.InternalNumber;
                vue.$forceUpdate();
            }, true);
        },
        registerForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/ModifyMediator/RegisterForm', vue.Form, (ResultData) => {
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
            makeServerCall('post', '/FormFiling/ModifyMediator/EmployeeApproveForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        approveRemoveMediatorForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/ModifyMediator/EmployeeApproveRemoveMediatorForm', { formGuid: vue.Form.GUID}, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        requestCorrectingForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/ModifyMediator/RequestCorrectingForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.actionMessage = "";
            }, true);
        },
        createCorrectingForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/ModifyMediator/CreateCorrectingForm', { formGuid: vue.Form.GUID }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.Form.CorrectingApplicationGUID = ResultData.CorrectingApplicationGUID;
                //redirect to the new form
                setTimeout(function () {
                    const link = document.createElement('a');
                    link.href = "/FormFiling/ModifyMediator/Edit/" + ResultData.CorrectingApplicationGUID;
                    link.target = "_blank";
                    link.click();
                }, 500)

            }, true);
        },
        ministerApproveForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/ModifyMediator/MinisterApproveForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        ministerApproveRemovalForm() {
            var vue = this;
            if (!vue.actionMessage || vue.actionMessage.length === 0) {
                iziToast.warning({
                    layout: 2,
                    title: "ВНИМАНИЕ",
                    message: "Моля въведете заповед на министър."
                });
                return;
            }
            makeServerCall('post', '/FormFiling/ModifyMediator/MinisterApproveRemovalForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        ministerRejectForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/ModifyMediator/MinisterRejectForm', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        executeForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/ModifyMediator/ExecuteForm', { formGuid: vue.Form.GUID }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
            }, true);
        },
        executeRemoveForm() {
            var vue = this;
            makeServerCall('post', '/FormFiling/ModifyMediator/ExecuteRemoveForm', { formGuid: vue.Form.GUID }, (ResultData) => {
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
            var index = this.Form.Documents.findIndex(x => x.Key === attContainer.Key)
            if (index !== -1)
                this.Form.Documents[index].AttachedDocumentTypeGUID = newValue;
        },
        print: function (formGuid) {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/ModifyMediator/PrintForm/' + formGuid;

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
            makeServerCall('POST', '/FormFiling/ModifyMediator/EmployeeApproveFormWithModifications', { form: vue.Form, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.employeeRequestModifications = false;
                vue.$forceUpdate();
            }, true);
        },
        requestCorrectingFormWithModification() {
            var vue = this;
            makeServerCall('POST', '/FormFiling/ModifyMediator/RequestCorrectingFormWithModifications', { form: vue.Form, actionMessage: vue.actionMessage }, (ResultData) => {
                vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                vue.Form.FormStatusName = ResultData.FormStatusName;
                vue.employeeRequestModifications = false;
                vue.$forceUpdate();
            }, true);
        },
        openChosenApplicationForm(formGuid) {
            this.revisionDialog.open = true;
            makeServerCall('GET', '/FormFiling/ModifyMediator/GetFormRevision/' + formGuid, null, (ResultData) => {
                this.revisionDialog.FormRevisionContent = ResultData;
                this.revisionDialog.loading = false;
                this.$forceUpdate();
            }, false);
        },
        downloadMinistersOrder() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/ModifyMediator/GenerateDocument?docGuid=' + eDocumentTemplate.MinisterOrder_ModifyMediator + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadDetailedNote() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/ModifyMediator/GenerateDocument?docGuid=' + eDocumentTemplate.DetailedNote_ModifyMediator + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadCertificate() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/ModifyMediator/GenerateDocument?docGuid=' + eDocumentTemplate.Certificate_RegisterMediator + '&formGuid=' + this.Form.GUID;

            window.open(link.href);
        },
        downloadApplication() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/ModifyMediator/GenerateDocument?docGuid=' + eDocumentTemplate.Application_Mediator + '&formGuid=' + this.Form.GUID;

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

            makeServerCall('POST', '/FormFiling/ModifyMediator/CancelProcedure', { formGuid: vue.Form.GUID, actionMessage: vue.actionMessage }, ResultData => {
                vue.Form = ResultData;
            })
        },
        removeMediator() {
            this.removeMediatorForm = true;
        },
        submitRemoveMediatorForm() {
            var vue = this;
            var data = Object.assign({}, vue.Form);
            data.FormStatusGUID = eApplicationFormStatus.Removed;
            if (!vue.actionMessage || vue.actionMessage.length === 0) {
                iziToast.warning({
                    layout: 2,
                    title: "ВНИМАНИЕ",
                    message: "Моля въведете причина за заличаване на медиатор."
                });
                return;
            }

            promptActionConfirmation(
                `Заличаването на медиатор от Регистъра на Медиаторите е НЕОБРАТИМ процес!<br /> 
                 Сигурни ли сте, че искате да регистрирате форма за заличаване на Медиатор?`,
                () => {
                    makeServerCall('POST', '/FormFiling/ModifyMediator/RemoveMediator', { form: data, actionMessage: vue.actionMessage }, (ResultData) => {
                        //get the incoming number 
                        vue.Form.InternalNumber = ResultData.InternalNumber;
                        vue.Form.IncomingNumber = ResultData.IncomingNumber;
                        vue.Form.FormStatusGUID = ResultData.FormStatusGUID;
                        vue.Form.FormStatusName = ResultData.FormStatusName;
                        vue.inReadonlyMode = true;
                        vue.$forceUpdate();
                    }, true);
                },
                () => { });
        }
    }
});

function loadFormContent(vue) {
    // load all mediatorsz
    makeServerCall("GET", "/FormFiling/ModifyMediator/GetMediatorsForSelection", null, (ResultData) => {
        vue.mediators = ResultData;
        vue.mediators.forEach(m => {
            m.FullInfoString = `${m.FirstName} ${m.MiddleName} ${m.LastName} ${m.EGN} ${m.RegistrationNumber}`
        });

        if (vue.page === 'CREATE') {
            // It's a new form
            vue.Form = new ModifyMediatorForm();
            getNewGuid().then((guid) => vue.Form.GUID = guid.data);
            vue.Form.ApplicantUserId = vue.currentUser.Id;

            loadAttachmentsAndTypes(vue, "ModifyMediator");

            vue.loadedData.push(true);
            vue.loadedData.push(true);
        }
        else { //It's an edit or preview form
            var formGuid = window.location.pathname.split("/").pop();
            makeServerCall('GET', '/FormFiling/ModifyMediator/GetFormData?id=' + formGuid, null, (formData) => {
                vue.Form = Object.assign(new ModifyMediatorForm(), formData);
                loadApplicantUserInfo(vue, vue.Form.ApplicantUserId)

                vue.selectedMediatorGuid = vue.Form.ModifiedMediatorGuid;
                //load the modified mediator data
                makeServerCall('GET', '/FormFiling/ModifyMediator/GetMediatorData/' + vue.selectedMediatorGuid, null, (mediatorData) => {
                    vue.ModifiedMediator = mediatorData;
                    CompareMediatorData(vue);
                }, true);

                makeServerCall('GET', '/FormFiling/ModifyMediator/GetMediatorAdditionalInfo?mediatorGuid=' + vue.selectedMediatorGuid, null, (ResultData) => {
                    if (ResultData) {
                        vue.formLogAdditionalInfo = ResultData;
                        vue.formLogAdditionalInfo.Timestamp = dateFormater(ResultData.Timestamp)
                    }
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

                loadAttachmentsAndTypes(vue, "ModifyMediator");
            });

            makeServerCall('GET', '/FormFiling/ModifyMediator/GetApplicationFormLog/' + formGuid, null, (ResultData) => {
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
    });
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
        makeServerCall('GET', '/FormFiling/ModifyMediator/GetMediatorData/' + mediatorGuid, null, (ResultData) => {
            if (vue.Form.ModifiedMediatorGuid) {
                //if there is one selected, ask to change it
                promptActionConfirmation("Смяна на Медиатора? Това ще заличи въведените данни до момента",
                    () => {
                        vue.formLogAdditionalInfo = {};
                        setModifiedMediator(vue, ResultData, mediatorGuid);
                    },
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

    makeServerCall('GET', '/FormFiling/ModifyMediator/GetMediatorAdditionalInfo?mediatorGuid=' + mediatorGuid, null, (ResultData) => {
        if (ResultData) {
            vue.formLogAdditionalInfo = ResultData;
            vue.formLogAdditionalInfo.Timestamp = dateFormater(ResultData.Timestamp)
        }
    }, false);

    //restore the proper values after set
    vue.Form.GUID = guid;
    vue.Form.ApplicantUserId = vue.currentUser.Id;
    vue.Form.FormStatusGUID = eApplicationFormStatus.Draft;
    vue.Form.ModifiedMediatorGuid = mediatorGuid;
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
        vue.loadedData.push(true);
    }, false);
}