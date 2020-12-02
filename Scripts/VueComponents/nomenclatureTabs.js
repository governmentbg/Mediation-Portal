"use strict";

Vue.component('nomenclatureTabs', {
    data: function() {
        return {
            tab: null,
            loading: true,
            nomenclatureHeaders: [],
            currentTab: null
        }
    },
    created: function () {
        let vue = this;
        getNomenclatureHeaders(vue);
    },
    methods: {
        countLoadedData: function (isItemLoaded) {
            this.loadedData.push(isItemLoaded);
        }
    }
});

function getNomenclatureHeaders(vue) {
    makeServerCall('GET', '/Administration/Nomenclature/GetNomenclatureHeaders', null, (ResultData) => {
        vue.nomenclatureHeaders = ResultData;

        vue.nomenclatureHeaders.forEach((nom, i) => {
            if (appSettings.nomenclatureTabId !== "0" && appSettings.nomenclatureTabId !== "1" && appSettings.nomenclatureTabId !== "2") {
                if (nom.GUID === appSettings.nomenclatureTabId) {
                    vue.currentTab = i+3;
                    return;
                }
            } else {
                vue.currentTab = Number(window.location.pathname.split('/').pop());
            }
        })

        vue.loading = false;
    }, false)
}