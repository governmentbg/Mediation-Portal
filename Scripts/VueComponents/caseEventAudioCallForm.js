Vue.component('caseEventAudioCallForm', {
    data: function () {
        return {
            EventForm: new CaseEventFormModel(),
            CaseForm: null,
            User: null,
            roomURL: jitsiURL,
            isMediator: null,
            hasEventIsEnded: null,
            loading: true,
            loadedData: [],
            allowDevices: '',

            caseGuid: getParameter('caseGuid'),
            eventGuid: getParameter('eventGuid'),
            cred: getParameter('cred'),
        };
    },
    created: function () {
        this.roomURL = addParameter("roomName", this.eventGuid, this.roomURL);

        loadCaseEventData(this);
    },
    methods: {
        saveData() {
            makeServerCall("POST", "/MediationCaseEvent/Event/SaveEventNotes", { eventGuid: this.eventGuid, notes: this.EventForm.EventNotes }, ResultData => { })
        },
        getEventData() {
            let vue = this;

            makeServerCall('GET', '/MediationCaseEvent/Event/GetEventData?caseGuid=' + vue.caseGuid + "&eventGuid=" + vue.eventGuid + '&cred=' + vue.cred, null, (eventData) => {
                vue.EventForm = eventData;

                if (vue.EventForm.EndDate !== null) {
                    vue.EventForm.EndDate = moment(vue.EventForm.EndDate).format("DD.MM.YYYYг. HH:mmч.");
                    vue.hasEventIsEnded = true;
                    vue.roomURL = ''
                }
            }, false)
        },
        onEndEvent() {
            let vue = this;
            makeServerCall('GET', '/MediationCaseEvent/Event/EndEvent', { eventGuid: this.eventGuid }, (ResultData) => {
                vue.EventForm.EndDate = ResultData.EndDate;
                vue.$forceUpdate();
                vue.hasEventIsEnded = true;
                setTimeout(function () {
                    window.location.href = "/Mediation/Case/Preview/" + vue.caseGuid
                }, 1000)
            }, true);
        }
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 3 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        },
        isMediator: function () {
            let vue = this;

            if (this.isMediator) {
                setInterval(function () {
                    vue.saveData()
                }, (1000 * 60))
            }
        }
    }
});

function loadCaseEventData(vue) {
    makeServerCall('GET', '/MediationCaseEvent/Event/GetEventData?caseGuid=' + vue.caseGuid + "&eventGuid=" + vue.eventGuid + '&cred=' + vue.cred, null, (eventData) => {
        vue.EventForm = eventData;

        if (vue.EventForm.EndDate !== null) {
            vue.EventForm.EndDate = moment(vue.EventForm.EndDate).format("DD.MM.YYYYг. HH:mmч.");
            vue.hasEventIsEnded = true;
            vue.roomURL = ''
        } else {
            vue.hasEventIsEnded = false;
            if (vue.EventForm.TypeGUID.toLowerCase() === eCaseEventType.Video.toLowerCase()) {
                vue.roomURL = addParameter("onlyAudio", 0, vue.roomURL);
                vue.allowDevices = "microphone; camera";
            } else if (vue.EventForm.TypeGUID.toLowerCase() === eCaseEventType.Audio.toLowerCase()) {
                vue.roomURL = addParameter("onlyAudio", 1, vue.roomURL);
                vue.allowDevices = "microphone;"
            } else {
                vue.roomURL = addParameter("onlyAudio", 0, vue.roomURL);
                vue.allowDevices = "microphone; camera";
            }
        }

        makeServerCall('GET', '/Mediation/Case/GetFormDataForConfirmation?caseGuid=' + vue.caseGuid + "&eventGuid=" + vue.eventGuid + '&cred=' + vue.cred, null, (caseData) => {
            vue.CaseForm = caseData;

            makeServerCall('GET', '/UserManagement/GetCurrentUserForEvent?caseGuid=' + vue.CaseForm.GUID + '&primaryMediatorGuid=' + vue.CaseForm.PrimaryMediatorGUID + '&cred=' + vue.cred, null, (ResultData) => {
                vue.User = ResultData;

                vue.isMediator = vue.CaseForm.PrimaryMediatorGUID === vue.User.PrimaryMediatorGUID;

                vue.roomURL = addParameter("userEmail", vue.User.Email, vue.roomURL);
                vue.roomURL = addParameter("displayName", vue.User.FirstName + " " + vue.User.LastName, vue.roomURL);

                vue.loadedData.push(true);

                if (!vue.isMediator) {
                    setInterval(function () {
                        vue.getEventData();
                    }, 30 * 1000);
                }
            });

            vue.loadedData.push(true);
        })

        vue.loadedData.push(true);
    }, false);
}