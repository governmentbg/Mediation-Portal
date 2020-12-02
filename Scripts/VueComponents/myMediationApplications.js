"use strict";

Vue.component('myMediationApplications', {
    data: function () {
        return {
            applications: [],
            headers: [
                { text: 'Номер', align: 'left', value: 'CaseNumber' },
                { text: 'Дата на създаване', value: 'DateCreated' },
                { text: 'Статус', value: 'CaseStatusName' },
                { text: 'СТРАНА 2', value: 'RespondingPartyUserName' },
                { text: 'Предмет на спора', value: 'SubjectDispute' },
                { text: '', value: null },
            ],
            search: '',

            loading: true,
            loadedData: [],
            loadingTableData: true
        }
    },
    created: function () {
        let vue = this;

        loadMyMediationApplication(vue);
        vue.loadedData.push(true)
    },
    methods: {

    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 1 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        },
    }
});

function loadMyMediationApplication(vue) {
    makeServerCall('GET', '/Mediation/Case/GetMyApplication', null, (ResultData) => {
        vue.applications = ResultData;
        vue.applications.forEach(x => x.DateCreated = dateFormater(x.DateCreated))
        vue.loadingTableData = false;
    });
}