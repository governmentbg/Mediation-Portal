Vue.component('caseMediators', {
    props: {
        isMediator: Boolean,
    },
    data() {
        return {
            getStatusLabel: getStatusLabel,
            getStatusColor: getStatusColor,
            formGuid: window.location.pathname.split("/").pop(),
            convertArrayToString: convertArrayToString,
            moment: moment,
            loading: false,
            expand: false,
            mediators: {
                loading: false,
                data: [],
                page: 0,
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
                    rowsPerPage: 20,
                    totalPages: 0,
                    totalCount: 0
                },

                tableHeader: [
                    { text: 'Имена', align: 'left', sortable: false, value: 'FirstName', width: "15%" },
                    { text: 'Рег. номер', align: 'left', sortable: false, value: 'registrationNumber', width: "15%" },
                    { text: 'Езици', align: 'left', sortable: false, value: 'languages', width: "15%" },
                    { text: 'Професия', align: 'left', sortable: false, value: 'professions', width: "15%" },
                    { text: 'Квалификации', align: 'left', sortable: false, value: 'AditionalQualificaition', width: "15%" },
                    { text: 'Статус', value: 'status', sortable: false, width: "15%" },
                    { text: 'Главен медиатор', align: 'center', sortable: false, value: 'primaryMediator', width: "5%" },
                    { text: '', value: null, width: "5%", sortable: false, align: 'center' },
                ],
            },
            mediatorsModal: {
                open: false
            }
        }
    },
    mounted: function () {
        let vue = this;
        if (this.formGuid === "Create") {
            this.formGuid = this.$parent.Form.GUID;
        }
        loadCaseMediators(vue);
    },
    methods: {
        mediatorDetails(id) {
            console.log("id = " + id);
        },

        addAdditionalMediator() {
            this.mediatorsModal.open = true;
        },

        chooseMediator(id) {
            this.mediatorsModal.open = false;

            makeServerCall('POST', '/Mediation/Case/SendInvitationToAdditionalMediator', { caseGuid: this.formGuid, newMediatorGuid: id }, (ResultData) => {
                console.log(ResultData)
            }, true);
        },

        filterEvents() {
            loadCaseMediators(this);
        },
        setRows(rows) {
            if (rows === 100000) {
                this.mediators.pagination.rowsPerPage = this.mediators.pagination.totalCount;
            } else if (rows >= this.pagination.totalCount) {
                this.mediators.pagination.rowsPerPage = this.mediators.pagination.totalCount;
            } else {
                this.mediators.pagination.rowsPerPage = rows;
            }

            this.mediators.pagination.page = 1;
            loadCaseMediators(this)
        },
        next: function (page) {
            nextPage(page, this);
        },
    },
    computed: {
        unlockAddAdditionalMediators: function () {
            if (this.$parent && (this.$parent.unlockAddAdditionalMediators === true || this.$parent.unlockAddAdditionalMediators === false)) {
                return this.$parent.unlockAddAdditionalMediators;
            }

            return false;
        }
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


function nextPage(page, vue) {
    loadCaseMediators(vue, page);
}

function getStatusLabel(id) {
    switch (id) {
        case 0:
            return "Изчаква потвърждение";
        case 1:
            return "Приел поканата";
        case 2:
            return "Отказал поканата";
    }
}

function getStatusColor(id) {
    switch (id) {
        case 0:
            return "orange--text darken-4";
        case 1:
            return "green--text darken-4";
        case 2:
            return "red--text accent-4";
    }
}

function convertArrayToString(arr) {
    var result = "";
    arr.forEach((el, idx) => {
        result = el + (idx < (arr.length - 1) ? "<br />" : "");
    });

    return result;
}

function loadCaseMediators(vue) {

    vue.loadingTableData = true;
    makeServerCall('POST', '/Event/GetCaseMediators', { caseGuid: vue.formGuid }, (ResultData) => {
        vue.mediators.data = ResultData;
        vue.loadingTableData = false;
    });
}