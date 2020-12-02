"use strict";

Vue.component('contentManagementAllPages', {
    data() {
        return {
            moment: moment,
            allPages: [],

            headers: [
                { text: 'Наименование', align: 'left', value: 'MenuLabel', width: "10%" },
                { text: 'Ключова дума', align: 'left', value: 'URL', width: "15%" },
                { text: 'Статус', value: 'IsHidden', width: "10%" },
                { text: 'Дата на създаване', value: 'LastModificationUTC', width: "10%" },
                { text: '', value: null, width: "10%", align: 'center' },
            ],

            loadingTableData: true,
            expand: false,
            loading: false,
        }
    },
    created: function () {
        let vue = this;

        loadAllPages(vue);
    },
    methods: {
        redirectToModify(pageGuid) {
            const link = document.createElement('a');
            link.href = "/ContentManagement/Pages/Edit/" + pageGuid;
            link.click();
        }
    }
});

function loadAllPages(vue) {
    makeServerCall('GET', '/ContentManagement/Pages/AllPages', null, (ResultData) => {
        vue.allPages = ResultData;
        vue.allPages.forEach(x => {
            x.LastModificationUTC = moment(x.LastModificationUTC).format("DD.MM.YYYY");
        });

        vue.loadingTableData = false;
    }, true);
}