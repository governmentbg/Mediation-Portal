Vue.component('professionalDirections', {
    data: function () {
        return {
            loadingItems: true,
            loadedData: [],

            items: [],
            educationFields: [],

            objectBackups: {},
        }
    },
    created: function () {
        let vue = this;

        loadEducationFields(vue);
        loadProfessionalDirections(vue);
    },
    methods: {
        onCreate: function () {
            let newNomenclatureItem = new ProfessionalDirectionModel();
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
            handleSaveProfessionalDirection(vue, item, index);
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
            if (this.loadedData.length === 2 && !this.loadedData.includes(false)) {
                this.loadingItems = false;
            }
        }
    }
});

function loadProfessionalDirections(vue) {
    makeServerCall('GET', '/Administration/Nomenclature/GetProfessionalDirections', null, (ResultData) => {
        vue.items = ResultData;
        vue.loadedData.push(true);
    }, false);
}

function handleSaveProfessionalDirection(vue, item, index) {
    makeServerCall('POST', '/Administration/Nomenclature/SubmitProfessionalDirection', item, (ResultData) => {
        item.GUID = ResultData.GUID;
        vue.items[index].IsActive = ResultData.IsActive;
        item.InEditMode = false;
        vue.$forceUpdate();
    }, true);
}