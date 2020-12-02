"use strict";

Vue.component('contentManagementAllInformations', {
    data() {
        return {
            moment: moment,
            table: {
                data: [],
                headers: [
                    { text: 'Наименование', align: 'left', value: 'Title', width: "10%" },
                    { text: 'Секция', align: 'left', value: 'Type', width: "15%" },
                    { text: 'Статус', value: 'Status', width: "10%" },
                    { text: 'Дата на създаване', value: 'Created', width: "10%" },
                    { text: '', value: null, width: "1%", align: 'center' },
                ],
                loading: true,
                filters: new InformationsFilters(),
            },
            loadedData: [],
            loading: false,
        }
    },
    created: function () {
        let vue = this;

        loadInformations(vue);
    },
    methods: {

    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 1 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    },
});

function loadInformations(vue, _page) {
    vue.table.loading = true;

    makeServerCall('POST', '/ContentManagement/Information/GetInformations', null, (ResultData) => {
        vue.table.data = ResultData;

        vue.loadedData.push(true);
        vue.table.loading = false;
    });
}