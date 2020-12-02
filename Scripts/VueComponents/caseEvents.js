
Vue.component('caseEvents', {
    props: {
        isMediator: Boolean
    },
    data() {
        return {
            moment: moment,
            getStatusLabel: getStatusLabel,
            getStatusColor: getStatusColor,
            formGuid: window.location.pathname.split("/").pop(),
            getConfirmationColor: getConfirmationColor,
            moment: moment,
            loading: false,
            loadedData: [],
            expand: false,
            currentEventPreviewGuid: null,
            events: {
                loading: false,
                data: [],
                page: 0,
                selectedItemsPerPage: 10,
                itemsPerPage: [
                    { Key: 5, Value: '5' },
                    { Key: 10, Value: '10' },
                    { Key: 20, Value: '20' },
                    { Key: 50, Value: '50' },
                    { Key: 100000, Value: 'Всички' } //TODO - do better 
                ],
                pagination: {
                    page: 1,
                    currentPage: 1,
                    rowsPerPage: 10,
                    totalPages: 0,
                    totalCount: 0
                },
                tableHeader: [
                    { text: 'Тип събитие', align: 'left', value: 'CaseEventName', width: "10%" },
                    { text: 'Описание', align: 'left', value: 'Description', width: "15%" },
                    { text: 'Статус', value: 'CaseEventStatusName', width: "10%" },
                    { text: 'Вашият Статус', value: 'currentUserParticipatingStatus', width: "5%" },
                    { text: 'Дата', value: 'StartDate', width: "10%" },
                    { text: '', value: null, width: "10%", align: 'right' }
                ]
            },
            eventModal: {
                open: false,
                new: false,
                loading: false,
                step: -1,
                Data: {},
                caseParticipants: [],  // all registered participants for this case etc. (mediators, applicant, responding party)
                caseThirdParticipants: [],  // all invited third party participants for this event
                uploadDocuments: [],    // v-file-input model
                status: '',
                confirmation: '',
                confirmationId: -1,
                participantsStatuses: {
                    confirmed: '',
                    refused: '',
                    awaitingResponse: ''
                }
            },
            documentsTable: {
                header: [
                    { text: 'Файл', align: 'left', value: 'FileName', width: "10%" },
                    { text: 'Добавен на', align: 'left', value: 'date', width: "10%" },
                    { text: 'Добавен от', align: 'left', value: 'uploadedBy', width: "15%" },
                    { text: '', value: '', width: "1%" },
                ],
                selectedItemsPerPage: 10,
                itemsPerPage: [
                    { Key: 5, Value: '5' },
                    { Key: 10, Value: '10' },
                    { Key: 20, Value: '20' },
                    { Key: 50, Value: '50' },
                    { Key: 100000, Value: 'Всички' } //TODO - do better 
                ],
                uploadedFilesInfo: []  // model that keeps full info for already uploaded files
            },
            footer: {
                'items-per-page-text': 'Записи на страница:',
                'items-per-page-all-text': 'Всички'
            },
            currentDate: '',
            EmptyGuid: EmptyGuid 
        };
    },
    created: function () {
        let vue = this;
        loadCaseEvents(vue);

        vue.currentDate = moment(vue.$parent.currentDate);

        //it doesnt need to be loaded on load
        loadCaseParticipants(vue, false);
    },
    methods: {
        newEvent() {
            let vue = this;
            //if (this.$parent.isCurrentUserPrimaryMediator) { // commented because of the new functionality of adding event by sides
            
            vue.eventModal.Data = new CaseEventFormModel();
            getNewGuid().then((guid) => vue.eventModal.Data.GUID = guid.data);
            //} // commented because of the new functionality of adding event by sides
            loadCaseParticipants(vue, true, vue.prepareNewEvenet);
        },
        prepareNewEvenet() {
            this.eventModal.open = true;
            this.eventModal.new = true;
            this.eventModal.step = 1;
        },
        selectAudioEvent() {
            this.eventModal.step = 2;
            this.eventModal.Data.TypeGUID = eCaseEventType.Audio;
        },
        selectVideoEvent() {
            this.eventModal.step = 3;
            this.eventModal.Data.TypeGUID = eCaseEventType.Video;
        },
        selectDocumentEvent() {
            this.eventModal.step = 4;
            this.eventModal.Data.TypeGUID = eCaseEventType.Document;
        },
        newThirdPerson() {
            let vue = this;
            let newThirdPerson = new CaseThirdPerson();
            getNewGuid().then(guid => {
                newThirdPerson.GUID = guid.data;
                getNewGuid().then((guid) => newThirdPerson.AccessToken = guid.data);
                vue.eventModal.Data.CaseThirdPerson.push(newThirdPerson);
            });
        },
        removeAdditionalParticipans(id) {
            this.eventModal.Data.CaseThirdPerson.splice(id, 1);
        },
        saveEvent() {
            let vue = this;
            loadingShow();
            vue.eventModal.loading = true;
            // get case form so we can get all participants user id for fruther exploitation

            if (vue.eventModal.Data.CaseParticipants.indexOf(vue.$parent.currentUser.Id) == -1) {
                vue.eventModal.Data.CaseParticipants.push(vue.$parent.currentUser.Id);
            }
            vue.eventModal.Data.CaseGuid = vue.formGuid; //vue.$parent.Form.GUID;

            makeDefaultServerCall('POST', '/Event/SubmitEvent', { model: vue.eventModal.Data }, (response) => {
                //
                if (response.Type == 1) {
                    if (response.Message !== null) {
                        iziToast.success({
                            message: response.Message + (response.AdditionalMessages ? '\n' + response.AdditionalMessages.join("<br/>") : "")
                        });
                    }
                    vue.eventModal.open = false;
                    loadCaseEvents(vue, 1);
                    vue.eventModal.loading = false;
                    loadingHide();
                } else {
                    iziToast.warning({
                        layout: 2,
                        title: response.Message,
                        message: response.AdditionalMessages ? response.AdditionalMessages.join("<br/>") : ""
                    });
                    vue.eventModal.loading = false;
                    loadingHide();
                }
            });

        },
        previewEvent(id) {
            let vue = this;
            vue.currentEventPreviewGuid = id;
            loadCaseParticipants(vue, false, vue.previewSetData);
        },
        previewSetData() {
            let vue = this;
            let id = vue.currentEventPreviewGuid;
            vue.eventModal.new = false;

            let events = vue.events.data;
            for (var i = 0; i < events.length; i++) {
                if (events[i].GUID === id) {

                    var currentEvent = Object.assign({}, events[i])
                    //set current event modal data
                    vue.eventModal.Data = currentEvent;

                    console.log(vue.eventModal.Data)

                    if (eCaseEventType.Document.toLowerCase() === vue.eventModal.Data.TypeGUID.toLowerCase()) {
                        vue.eventModal.Data.isDocumentEvent = true;
                    } else {
                        vue.eventModal.Data.isDocumentEvent = false;
                    }
                    //save caseParticipandDetails, because we need to get information if the participant is accepted/rejeccted or didn't answer
                    vue.eventModal.Data.CaseEventParticipantsDetails = vue.eventModal.Data.CaseParticipants;
                    //convert current modal participant, so thay can be visible in the locked dropdown
                    vue.eventModal.Data.CaseParticipants = vue.eventModal.Data.CaseEventParticipants;
                    vue.eventModal.caseThirdParticipants = vue.eventModal.Data.CaseEventThirdParticipants.join(', ');

                    vue.eventModal.caseParticipants = vue.eventModal.Data.CaseEventParticipants;
                    vue.eventModal.Data.CaseParticipants = [];
                    vue.eventModal.Data.CaseEventParticipants.forEach(participant => {
                        vue.eventModal.Data.CaseParticipants.push(participant.Key)
                    });

                    //set confirmed participant count
                    let confirmedParticipants = vue.eventModal.Data.ConfirmedParticipants;
                    let totalParticipants = vue.eventModal.Data.TotalParticipants;
                    if (vue.eventModal.Data.CaseParticipants.indexOf(vue.$parent.currentUser.Id) != -1) {
                        if (confirmedParticipants === totalParticipants) { vue.eventModal.confirmationId = 1 } else { vue.eventModal.confirmationId = 0 }
                    } else {
                        if (confirmedParticipants === totalParticipants) { vue.eventModal.confirmationId = 1 } else { vue.eventModal.confirmationId = 0 }
                    }

                    vue.eventModal.confirmation = `${confirmedParticipants}/${totalParticipants}`;

                    // set participants as confirmed, refused and awaiting response
                    let participantConfirmed = [];
                    let participantRefused = [];
                    let participantAwaitingResponse = [];

                    vue.eventModal.Data.CaseEventParticipantsDetails.forEach(participant => {
                        switch (participant.IsParticipating) {
                            case null:
                                participantAwaitingResponse.push(participant.ParticipantName)
                                break;
                            case true:
                                participantConfirmed.push(participant.ParticipantName)
                                break;
                            case false:
                                participantRefused.push(participant.ParticipantName)
                                break;
                        }
                    })

                    vue.eventModal.participantsStatuses.confirmed = participantConfirmed.join(", ");
                    vue.eventModal.participantsStatuses.refused = participantRefused.join(", ");
                    vue.eventModal.participantsStatuses.awaitingResponse = participantAwaitingResponse.join(", ");

                    //set documents array, so they can be visible in the data table
                    vue.documentsTable.uploadedFilesInfo = currentEvent.Documents;
                    vue.documentsTable.uploadedFilesInfo.forEach(x => {
                        x.DateCreated = dateFormater(x.DateCreated);
                    });

                    switch (vue.eventModal.Data.TypeGUID.toUpperCase()) {
                        case eCaseEventType.Audio:
                            vue.eventModal.step = 2;
                            break;
                        case eCaseEventType.Video:
                            vue.eventModal.step = 3;
                            break;
                        case eCaseEventType.Document:
                            vue.eventModal.step = 4;

                            vue.eventModal.Data.hasCurrentUserAlreadyAttachedDocument = false;
                            var currentUserId = vue.$parent.currentUser.Id;
                            for (var d = 0; d < vue.eventModal.Data.Documents.length; d++) {
                                if (vue.eventModal.Data.Documents[d].AttachedByUserId === currentUserId) {
                                    vue.eventModal.Data.hasCurrentUserAlreadyAttachedDocument = true;
                                }
                            }
                            break;
                    }
                    vue.eventModal.open = true;
                }
            }
        },
        removeAdditionalParticipant(id) {
            this.eventModal.Data.CaseThirdPerson.splice(id, 1);
        },
        sendEventFile() {
            let vue = this;
            if (vue.eventModal.uploadDocuments.length > 0) {
                handleUpload(vue, vue.eventModal.uploadDocuments);
            }
            else {
                vue.eventModal.uploadDocuments = [];
            }
        },
        confirmEventParticipation: function () {
            let vue = this;
            vue.eventModal.loading = true;

            makeServerCall('POST', '/Event/ConfirmEventParticipating?eventGuid=' + vue.eventModal.Data.GUID + '&cred=' + vue.$parent.currentUser.Id, null, (ResultData) => {
                loadCaseEvents(vue, 1);
                vue.eventModal.loading = false;
                vue.eventModal.open = false;
            }, false);
        },
        refuseEventParticipation: function () {
            let vue = this;
            vue.eventModal.loading = true;

            makeServerCall('POST', '/Event/RejectEventParticipating?eventGuid=' + vue.eventModal.Data.GUID + '&cred=' + vue.$parent.currentUser.Id, null, (ResultData) => {
                loadCaseEvents(vue, 1);
                vue.eventModal.loading = false;
                vue.eventModal.open = false;
            }, false);
        },
        goToEvent: function (id) {
            let vue = this;
            let urlToGo = '/MediationCaseEvent/Event/';

            let events = vue.events.data;
            for (var i = 0; i < events.length; i++) {
                if (events[i].GUID.toLowerCase() === id.toLowerCase()) {
                    if (events[i].TypeGUID.toLowerCase() === eCaseEventType.Audio.toLowerCase()) {
                        urlToGo += 'AudioCall';
                    } else if (events[i].TypeGUID.toLowerCase() === eCaseEventType.Video.toLowerCase()) {
                        urlToGo += 'VideoCall';
                    } else {
                        urlToGo = '';
                    }

                    if (urlToGo.length) {
                        urlToGo += '?caseGuid=' + events[i].CaseGUID + '&eventGuid=' + events[i].GUID + '&cred=' + this.$parent.currentUser.Id;
                        
                        let link = document.createElement('a');
                        link.target = '_blank';
                        link.href = urlToGo;

                        window.open(link.href);
                    }
                }
            }
        },
        showGoToEventButton(event) {
            let vue = this;
            var eventStartDate = moment(event.StartDate);
            var duration = moment.duration(vue.currentDate.diff(eventStartDate));
            var minutes = duration.asMinutes();

            if (minutes < -30) {
                return false;
            }

            return event.TypeGUID.toLowerCase() !== eCaseEventType.Document.toLowerCase() && event.CaseEventStatusGUID.toLowerCase() === eCaseEventStatuses.Confirmed.toLowerCase()
        }
    },
    computed: {

        /*showNewEventButton: function () {
            return true;
            return this.Form.CaseStatusGUID !== eCaseFormStatus.Terminated
        },*/
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load Data
            if (this.loadedData.length === 6 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        },
        'eventModal.open': {
            handler: function (val) {
                let vue = this;
                if (!val) {
                    vue.eventModal.new = false;
                    vue.eventModal.loading = false;
                    vue.eventModal.step = -1;
                    vue.eventModal.Data = {};
                    vue.eventModal.caseParticipants = [];
                    vue.eventModal.caseThirdParticipants = [];
                    vue.eventModal.uploadDocuments = [];
                    vue.eventModal.status = '';
                    vue.eventModal.confirmation = '';
                    vue.eventModal.confirmationId = -1;
                    vue.eventModal.participantsStatuses = {
                        confirmed: '',
                        refused: '',
                        awaitingResponse: ''
                    }
                }
            },
            deep: true
        }
    }
});

function isGUID(str) {
    let reg = new RegExp('[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}');

    let matches = reg.exec(str);

    return matches ? true : false;
}

function eventNextPage(page, vue) {
    loadCaseEvents(vue, page);
}

function loadCaseEvents(vue, _page) {
    vue.events.loading = true;

    if (isGUID(vue.formGuid)) {
        makeServerCall('POST', '/Event/GetCaseEvents', { caseGuid: vue.formGuid }, (ResultData) => {
            //vue.events.data = ResultData;
            var result = [];
            if (ResultData.length) {
                ResultData.forEach(event => {
                    if (event.EndDate) {
                        event.statusLabel = "Приключило събитие"
                    } else {
                        let participantsCount = event.CaseParticipants.length;
                        let confirmedParticipantsCount = 0;
                        let refusedParticipantsCount = 0;
                        let awaitingAnswerParticipantsCount = 0;
                        event.CaseParticipants.forEach(participant => {
                            switch (participant.IsParticipating) {
                                case null:
                                    participant.status = 0;
                                    participant.statusLabel = "Очакване на отговор";
                                    awaitingAnswerParticipantsCount++;
                                    break;
                                case true:
                                    participant.status = 1;
                                    participant.statusLabel = "Приел";
                                    confirmedParticipantsCount++;
                                    break;
                                case false:
                                    participant.status = 2;
                                    participant.statusLabel = "Отказал";
                                    refusedParticipantsCount++;
                                    break;
                            }

                            //if (event.TypeGUID.toLowerCase() != eCaseEventType.Document.toLowerCase()) {
                                if (vue.$parent.currentUser.Id === participant.UserId) {
                                    switch (participant.IsParticipating) {
                                        case null:
                                            event.currentUserParticipatingStatus = 0
                                            break;
                                        case true:
                                            event.currentUserParticipatingStatus = 1;
                                            break;
                                        case false:
                                            event.currentUserParticipatingStatus = 2;
                                            break;
                                    }
                                }
                            //} else {
                            //    event.currentUserParticipatingStatus = -1;
                            //}
                        })

                        if (participantsCount === confirmedParticipantsCount) {
                            event.status = 3;
                            event.statusLabel = "Потвърдено събитие";
                        } else if (participantsCount < confirmedParticipantsCount) {
                            if (refusedParticipantsCount) {
                                event.status = 2;
                                event.statusLabel = "Отказано събитие";
                            } else if (awaitingAnswerParticipantsCount) {
                                event.status = 1;
                                event.statusLabel = "Изчакване на отговор";
                            }
                        }
                    }

                    result.push(event);
                })
            }

            vue.events.data = result;

            vue.events.loading = false;
            vue.loadedData.push(true);
        });
    } else {
        vue.events.loading = false;
    }
}

function loadCaseParticipants(vue, isNew, cb) {
    vue.events.loading = true;

    if (isGUID(vue.formGuid)) {
        if (vue.$parent.isCurrentUserMediator || !isNew) {
            makeServerCall('POST', '/Event/GetCaseParticipants', { caseGuid: vue.formGuid }, (ResultData) => {
                vue.eventModal.caseParticipants = ResultData;


                if (cb) {
                    cb();
                }

                vue.loadedData.push(true);
                vue.events.loading = false;
            });
        } else {
            vue.eventModal.caseParticipants = [];
            vue.eventModal.Data.CaseParticipants = [];
            
            vue.$parent.$refs.caseMediators.mediators.data.forEach(med => {
                //if (med.MediatorGUID === vue.$parent.Form.PrimaryMediatorGUID) {

                    vue.eventModal.caseParticipants.push({ Key: med.MediatorUserId, Value: med.FirstName + " " + med.LastName });

                    //mark all mediators as selected
                    //vue.eventModal.Data.CaseParticipants.push(med.MediatorUserId)

                //}
            })
            if (cb) {
                cb();
            }
            vue.events.loading = false;
        }
    } else {
        vue.events.loading = false;
    }
}

function handleUpload(vue, files) {
    files.forEach(f => {
        if (f instanceof File) {
            loadingShow();
            vue.documentsTable.loading = true;
            let formData = new FormData();
            formData.append('file', f);
            axios.post('/AttachedDocument/UploadFile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then(function (response) {

                    makeServerCall('POST', '/AttachedDocument/GetAttachedDocumentDetails', { attDocumentGUID: response.data.ResultData }, (ResultData) => {
                        let fileInf = ResultData;
                        fileInf.DateCreated = dateFormater(fileInf.DateCreated);
                        vue.documentsTable.uploadedFilesInfo.push(fileInf);
                    });

                    makeServerCall('POST', '/MediationCaseEvent/Event/UploadEventFile', { eventGuid: vue.currentEventPreviewGuid, fileGuid: response.data.ResultData }, (res) => {
                        console.log(res);
                        vue.eventModal.uploadDocuments = [];
                    });
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
                    vue.documentsTable.loading = false;
                });;
        }
        else {
            //prevent falsly triggering of uplaod
            return;
        }
    });
}

function getStatusLabel(id) {
    switch (id) {
        case 0:
            return "Изчаква потвърждение";
        case 1:
            return "Потвърдено";
        case 2:
            return "Приключило";
        case 3:
            return "Получен файл";
        case 4:
            return "Очакване на файл";
    }
}

function getStatusColor(id) {
    switch (id) {
        case 0:
            return "orange--text darken-4";
        case 1:
            return "green--text darken-4";
        case 2:
            return "red--text accent-4";
        case 3:
            return "green--text darken-4";
    }
}

function getConfirmationColor(id) {
    switch (id) {
        case 0:
            return "orange--text darken-4";
        case 1:
            return "green--text darken-4";
    }
}