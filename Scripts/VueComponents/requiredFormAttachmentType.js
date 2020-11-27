Vue.component('requiredFormAttachmentType', {
    data: function () {
        return {
            loadingItems: true,
            loadedData: [],

            attachedDocumentTypes: [],
            container: [],
        }
    },
    created: function () {
        let vue = this;

        loadContainer(vue);
        loadAttachedDocumentTypes(vue);
    },
    methods: {
        saveChanges: function () {
            makeServerCall('POST', '/Administration/Nomenclature/SaveChanges', this.container, (ResultData) => {
            }, true);
        },
        removeFromMultipleDropdown: function (collection, guidToBeRemoved) {
            const index = collection.indexOf(guidToBeRemoved);
            if (index >= 0) collection.splice(index, 1)
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

function loadContainer(vue) {
    makeServerCall('GET', '/Administration/Nomenclature/GetData', null, (ResultData) => {
        vue.container = ResultData;
        vue.loadedData.push(true);
    }, false)
}

function loadAttachedDocumentTypes(vue) {
    makeServerCall('GET', '/Administration/Nomenclature/GetAttachedDocumentTypes', null, (ResultData) => {
        vue.attachedDocumentTypes = ResultData;
        vue.loadedData.push(true);
    }, false)
}