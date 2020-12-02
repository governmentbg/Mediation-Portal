"use strict";

Vue.component('allApplications', {
    data() {
        return {
            allApplications: [],

            filters: {
                statusGUID: EmptyGuid,
                internalNumber: '',
                incomingNumber: '',
                identityNumber: ''
            },

            headers: [
                { text: 'Заявител', align: 'left', value: 'ApplicantNameApplication', width: "18%" },
                { text: 'Регистрирал', align: 'left', value: 'ApplicantName', width: "12%" },
                { text: 'Форма', align: 'left', value: 'FormTypeName', width: "24%" },
                { text: 'Статус', value: 'FormStatusName', width: "12%" },
                { text: 'Дата на създаване', value: 'DateCreated', width: "10%" },
                { text: '', value: null, width: "1%", align: 'center' },
            ],

            statuses: [],

            loading: true,
            loadedData: [],
            loadingTableData: true,
            expand: false,

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

            //footer: {
            //    'items-per-page-text': 'Записи на страница:',
            //    'items-per-page-all-text': 'Всички'
            //}
        }
    },
    created: function () {
        let vue = this;

        loadAllApplications(vue);
        loadStatuses(vue);
    },
    methods: {
        redirectToApplication(formGuid, formTypeGUID) {
            let url = getUrlByApplicantionType(formGuid, formTypeGUID);

            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.click();
        },
        filterApplications() {
            loadAllApplications(this);
        },
        setRows(rows) {
            if (rows === 100000) {
                this.pagination.rowsPerPage = this.pagination.totalCount;
            } else if (rows >= this.pagination.totalCount) {
                this.pagination.rowsPerPage = this.pagination.totalCount;
            } else {
                this.pagination.rowsPerPage = rows;
            }

            this.pagination.page = 1;
            loadAllApplications(this)
        },
        next: function (page) {
            nextPage(page, this);
        },
    },
    computed: {

    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 1 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    }
});

function loadAllApplications(vue, _page) {
    let page = _page || vue.pagination.page;
    let rowsPerPage = vue.pagination.rowsPerPage;
    vue.loadingTableData = true;
    loadingShow();

    makeServerCall('POST', '/FormFiling/ApplicationForms/GetAllApplications?page=' + page + '&perpage=' + rowsPerPage, vue.filters, (ResultData) => {
        vue.allApplications = ResultData.Data;
        vue.allApplications.forEach(x => {
            x.DateLastModified = dateFormater(x.DateLastModified) || 'Няма корекции';
            x.DateRegistered = dateFormater(x.DateRegistered) || 'Не е регистрирано';
            x.DateCreated = dateFormater(x.DateCreated);

            x.FormTypeName = x.FormTypeName.replace('Заявление за ', '');
            let firstLetter = x.FormTypeName.substring(0, 1);
            x.FormTypeName = firstLetter.toUpperCase() + x.FormTypeName.substring(1);
        });

        vue.pagination.totalCount = ResultData.Total;
        vue.pagination.totalPages = Math.ceil(ResultData.Total / vue.pagination.rowsPerPage);
        vue.loadingTableData = false;
        loadingHide();
    }, false);
}

function nextPage(page, vue) {
    loadAllApplications(vue, page);
}

function loadStatuses(vue) {
    makeServerCall('GET', '/FormFiling/ApplicationForms/GetApplicationFormStatuses', null, (ResultData) => {
        vue.statuses = ResultData;
        vue.loadedData.push(true);
    }, false);
}