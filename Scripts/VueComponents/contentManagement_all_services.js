"use strict";

Vue.component('contentManagementAllServices', {
    data() {
        return {
            allServices: [],

            headers: [
                { text: 'Наименование', align: 'left', value: 'ApplicantName', width: "90%" },
                { text: '', value: null, width: "10%", align: 'center' },
            ],

            footer: {
                'items-per-page-text': 'Записи на страница:',
                'items-per-page-all-text': 'Всички'
            },

            loadingTableData: true
        }
    },
    created: function () {
        let vue = this;
        loadContentManagementService(vue);
    },
    methods: {
        editService(guid) {
            console.log("guid - " + guid)
            this.dialog = true;
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
    }
});

function loadContentManagementService(vue) {
    makeServerCall('POST', '/Services/GetServices', null, (ResultData) => {
        vue.allServices = ResultData;
        vue.loadingTableData = false;
    });
}
