"use strict";

Vue.component('myMediations', {
    data: function () {
        return {
            mediationsInProcess: {
                data: [],
                headers: [
                    { text: 'Номер', align: 'left', value: 'CaseNumber' },
                    { text: 'Дата на създаване', value: 'DateCreated' },
                    { text: 'Статус', value: 'CaseStatusName' },
                    { text: 'Предмет на спора', value: 'SubjectDispute' },
                    { text: 'СТРАНА 2', value: 'RespondingPartyUserName' },
                    { text: 'Медиатор', value: 'MediatorName' },
                    { text: '', value: null },
                ],
                search: '',
                loadingTableData: true
            },
            mediationsAsDrafts: {
                data: [],
                headers: [
                    { text: 'Номер', align: 'left', value: 'CaseNumber' },
                    { text: 'Дата на създаване', value: 'DateCreated' },
                    { text: 'Статус', value: 'CaseStatusName' },
                    { text: 'Предмет на спора', value: 'SubjectDispute' },
                    { text: 'СТРАНА 2', value: 'RespondingPartyUserName' },
                    { text: 'Медиатор', value: 'MediatorName' },
                    { text: '', value: null },
                ],
                search: '',
                loadingTableData: true
            },
            mediationsFinished: {
                data: [],
                headers: [
                    { text: 'Номер', align: 'left', value: 'CaseNumber' },
                    { text: 'Дата на създаване', value: 'DateCreated' },
                    { text: 'Статус', value: 'CaseStatusName' },
                    { text: 'Предмет на спора', value: 'SubjectDispute' },
                    { text: 'СТРАНА 2', value: 'RespondingPartyUserName' },
                    { text: 'Медиатор', value: 'MediatorName' },
                    { text: '', value: null },
                ],
                search: '',
                loadingTableData: true
            },
            loading: true,
            loadedData: [],
            currentUser: {
                isMediator : true
            }
        }
    },
    created: function () {
        this.getUserDetails();
    },
    methods: {
        getUserDetails() {
            let vue = this;

            makeDefaultServerCall('GET', '/UserManagement/CurrentUserIsMediator', null, response => {
                if (response.Type) {
                    var Result = response.ResultData;
                    vue.currentUser = Result;

                    loadMyMediations(vue);
                    loadMyDraftsMediations(vue);
                    loadMyFinishedMediations(vue);
                    vue.loadedData.push(true)
                } else {
                    makeDefaultServerCall('GET', '/UserManagement/CurrentUserIsMediator', null, response => {
                        if (response.Type) {
                            var Result = response.ResultData;
                            vue.currentUser = Result;

                            loadMyMediations(vue);
                            loadMyDraftsMediations(vue);
                            loadMyFinishedMediations(vue);
                            vue.loadedData.push(true)
                        }
                    })
                }
            })
        }
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 4 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        },
    }
});

function loadMyMediations(vue) {
    makeServerCall('GET', '/Mediation/Case/GetMyMediations?type=InProgress', null, (ResultData) => {
        vue.mediationsInProcess.data = ResultData;
        vue.mediationsInProcess.data.forEach(x => x.DateCreated = dateFormater(x.DateCreated))
        vue.mediationsInProcess.loadingTableData = false;
        vue.loadedData.push(true)
    });
}

function loadMyDraftsMediations(vue) {
    let url = '/Mediation/Case/GetMyMediations?type=Drafts'

    if (vue.currentUser.MediatorGUID) {
        url = '/Mediation/Case/GetMyMediations?type=PendingReply'
    }

    makeServerCall('GET', url, null, (ResultData) => {
        vue.mediationsAsDrafts.data = ResultData;
        vue.mediationsAsDrafts.data.forEach(x => x.DateCreated = dateFormater(x.DateCreated))
        vue.mediationsAsDrafts.loadingTableData = false;
        vue.loadedData.push(true)
    });
}

function loadMyFinishedMediations(vue) {
    makeServerCall('GET', '/Mediation/Case/GetMyMediations?type=Finished', null, (ResultData) => {
        vue.mediationsFinished.data = ResultData;
        vue.mediationsFinished.data.forEach(x => x.DateCreated = dateFormater(x.DateCreated))
        vue.mediationsFinished.loadingTableData = false;
        vue.loadedData.push(true)
    });
}