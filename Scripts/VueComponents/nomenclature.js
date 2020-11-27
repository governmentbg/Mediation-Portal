/// <reference path="professionaldirections.js" />
"use strict"

Vue.component('nomenclature', {
    props: {
        guid: String,
        hasCode: Boolean
    },
    data: function () {
        return {
            loadingItems: true,
            nomenclatureItems: [],
            objectBackups: {}
        }
    },
    created: function () {
        let vue = this;

        loadDataForNomenclature(vue, vue.guid);
    },
    methods: {
        onCreateNomenclature: function () {
            let newNomenclatureItem = new Nomenclature();
            newNomenclatureItem.InEditMode = true;
            getNewGuid().then((guid) => newNomenclatureItem.GUID = guid.data);
            this.nomenclatureItems.unshift(newNomenclatureItem);
        },
        onEditNomenclature: function (nomenclatureItem) {
            this.objectBackups[nomenclatureItem.GUID] = copyObject(nomenclatureItem);
            nomenclatureItem.InEditMode = true;
            this.$forceUpdate();
        },
        //onRemoveNomenclature: function (index) {
        //    let vue = this;
        //    handleRemoveNomenclature(vue, index);
        //},
        onCancelEditNomenclature: function (index) {
            const nGuid = this.nomenclatureItems[index].GUID;
            this.nomenclatureItems[index].InEditMode = false;

            if (this.objectBackups[nGuid] == undefined) {
                this.nomenclatureItems.splice(index, 1);
            } else {
                for (let prop in this.objectBackups[nGuid]) {
                    this.nomenclatureItems[index][prop] = this.objectBackups[nGuid][prop];
                }
            }
        },
        onSaveNomenclature: function (nomenclatureItem, index) {
            let vue = this;
            handleSave(vue, nomenclatureItem, index);
        }
    }
});

function loadDataForNomenclature(vue, nomenclatureGUID) {
    makeServerCall('GET', '/Administration/Nomenclature/GetNomenclatureItems?guid=' + nomenclatureGUID, null, (ResultData) => {
        let temp = [];

        ResultData.forEach(function (x) {
            temp.unshift(Object.assign(new Nomenclature(), x));
        })

        vue.nomenclatureItems = temp;
        vue.loadingItems = false;

        vue.$forceUpdate();
    }, false);
}

function handleSave(vue, nomenclatureItem, index) {
    nomenclatureItem.NomenclatureGUID = vue.guid;
    nomenclatureItem.HasCodeColumn = vue.hasCode;

    makeServerCall('POST', '/Administration/Nomenclature/SubmitNomenclature', nomenclatureItem, (ResultData) => {
        var savedNomenclatureItem = ResultData;
        nomenclatureItem.GUID = savedNomenclatureItem.GUID;
        vue.nomenclatureItems[index].IsActive = savedNomenclatureItem.IsActive;
        nomenclatureItem.InEditMode = false;

        vue.$forceUpdate();
    }, true);
}

//function handleRemoveNomenclature(vue, index) {
//    promptActionConfirmation(questionToBeDeleted, () => {

//        let nomenclatureItemToBeRemoved = vue.nomenclatureItems[index];
//        nomenclatureItemToBeRemoved.NomenclatureGUID = vue.guid;

//        if (nomenclatureItemToBeRemoved.GUID !== '') {

//            makeServerCall('POST', '/Administration/Nomenclature/RemoveNomenclature', nomenclatureItemToBeRemoved, (ResultData) => {
//                vue.nomenclatureItems.splice(index, 1);
//            }, true);
//        }
//    })
//}