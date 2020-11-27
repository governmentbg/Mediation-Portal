"use strict"

Vue.component('sections', {
    data: function () {
        return {
            loadingItems: true,
            loadedData: [],

            items: [],
            objectBackups: {},
        }
    },
    created: function () {
        let vue = this;

        loadSections(vue);
    },
    methods: {
        onCreate: function () {
            let newNomenclatureItem = new Section();
            newNomenclatureItem.InEditMode = true;
            getNewGuid().then((guid) => newNomenclatureItem.GUID = guid.data);
            this.items.unshift(newNomenclatureItem);
        },
        onEdit: function (nomenclatureItem) {
            this.objectBackups[nomenclatureItem.GUID] = copyObject(nomenclatureItem);
            nomenclatureItem.InEditMode = true;
            this.$forceUpdate();
        },
        onSave: function (item, index) {
            let vue = this;
            handleSaveSection(vue, item, index);
        },
        onCancelEdit: function (index) {
            const nGuid = this.items[index].GUID;
            this.items[index].InEditMode = false;

            if (this.objectBackups[nGuid] == undefined) {
                this.items.splice(index, 1);
            } else {
                for (let prop in this.objectBackups[nGuid]) {
                    this.items[index][prop] = this.objectBackups[nGuid][prop];
                }
            }

            this.$forceUpdate();
        }
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 1 && !this.loadedData.includes(false)) {
                this.loadingItems = false;
            }
        }
    }
});

function loadSections(vue) {
    makeServerCall('GET', '/Administration/Nomenclature/GetSections', null, (ResultData) => {
        vue.items = ResultData;
        vue.loadedData.push(true);
    });
}

function handleSaveSection(vue, item, index) {
    makeServerCall('POST', '/Administration/Nomenclature/SubmitSection', item, (ResultData) => {
        item.GUID = ResultData.GUID;
        vue.items[index].IsActive = ResultData.IsActive;
        item.InEditMode = false;
        vue.$forceUpdate();
    }, true);
}