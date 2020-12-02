"use strict";

var reportManagement = new Vue({
    el: "#reportManagement",
    data: function () {
        return {
            editedItem: new Reports(),
            loading: true,
            dialog: false,
            expand: false,
            reports: [],
            filters: [],
            columns: [],
            users: [],
            editedIndex: -1,
            headers: [
                { text: 'Реф. Номер', value: 'ReferenceNumber', align: 'left', sortable: true },
                { text: 'Име на справка', align: 'left', sortable: false },
                { text: 'Име на Процедура', align: 'left', sortable: false },
                { text: 'Име на таблица', align: 'left', sortable: false },
                { text: 'Действия', align: 'left', sortable: false }
            ],
            tableNames: [],
            filterTableColumns: [],
            storedProced: [],
            filterDialog: false,
            editedFilterItem: new ReportFilters(),
            editedFilterIndex: -1,
            columnDialog: false,
            editedColumn: new ReportColumns(),
            editedColumnIndex: -1,
            userDialog: false,
            userNamesList: [],
            userToReport: null
        };
    },
    created: function () {
        let vue = this;
        loadReports(vue);
        loadTableNames(vue);
        loadStoredProcedures(vue);
    },
    methods: {
        openReportDialog(item) {
            if (item != undefined) {
                if (item.ReportTableName == null) item.ReportTableName = "";
                this.editedIndex = this.reports.indexOf(item);
                this.editedItem = JSON.parse(JSON.stringify(item));
                loadReportFilters(this, item);
                loadReportColumns(this, item);
                loadReportUsers(this, item);
            }
            this.dialog = true;
            loadAllUsers(this);
            this.loading = false;
        },
        openFilterDialog(item) {
            this.editedFilterIndex = this.filters.indexOf(item);
            this.editedFilterItem = JSON.parse(JSON.stringify(item));
            this.editedFilterItem.ReportDefinitionId = this.editedItem.ReportDefinitionID;
            this.filterDialog = true;
        },
        openColumnDialog(item) {
            this.editedColumnIndex = this.columns.indexOf(item);
            this.editedColumn = JSON.parse(JSON.stringify(item));
            this.editedColumn.ReportDefinitionId = this.editedItem.ReportDefinitionID;
            this.columnDialog = true;
        },

        addFilter() {
            var item = this.editedFilterItem

            if (this.editedIndex != -1) {
                item.FilterName = item.ParamName
                item.FilterParameterName = item.ParamName
                item.IsHidden = !item.IsHidden;
                item.FilterStatusMessage = "";

                makeServerCall('post', '/Reporting/SubmitFilter', item, (ResultData) => {
                    Object.assign(this.filters[this.editedFilterIndex], item);
                    this.filterDialog = false
                });

            } else if (this.editedIndex == -1) {
                item.FilterName = item.ParamName
                item.FilterParameterName = item.ParamName
                item.IsHidden = !item.IsHidden;
                item.FilterStatusMessage = "";
                item.ReportFilterStatus = 3;
                Object.assign(this.filters[this.editedFilterIndex], item);
                this.filterDialog = false
            }

        },
        removeFilter(item) {
            if (this.editedIndex != -1) {
                const indexToRemove = this.filters.indexOf(item);
                promptActionConfirmation(questionToBeDeleted, () => {
                    axios.post('/Reporting/RemoveFilter', { FilterOrdNumber: item.FilterOrderNumber, RepDefID: item.ReportDefinitionId })
                        .then(response => {
                            item.IsHidden = !item.IsHidden;
                            this.$forceUpdate();
                        })
                        .catch(error => {
                            iziToast.error({
                                title: 'Грешка!'
                            });
                            console.error(error);
                        })
                    .finally(() => {
                        this.loading = false;
                    })
                })

            } else if (this.editedIndex == -1) {
                item.FilterTitleName = "";
                item.TableName = "";
                item.IdColumnName = "";
                item.SpecificSQLStatement = "";
                item.IsHidden = !item.IsHidden;
                item.FilterStatusMessage = "Филтърът не е имплементиран!";
                item.ReportColumnStatus = 2;
            }
        },

        addColumn(item) {
            if (this.editedIndex != -1) {
                makeServerCall('post', '/Reporting/SubmitColumn', item, (ResultData) => {
                    item.IsHidden = !item.IsHidden;
                    item.ColumnStatusMessage = "";
                    Object.assign(this.columns[this.editedColumnIndex], item);
                    this.columnDialog = false
                });
            } else if (this.editedIndex == -1) {
                item.ColumnID = 0;
                item.ColumnOrderNumber = 0;
                item.IsHidden = !item.IsHidden;
                item.ColumnStatusMessage = "";
                item.ReportColumnStatus = 3;
                Object.assign(this.columns[this.editedColumnIndex], item);
                this.columnDialog = false
            }
        },
        removeColumn(item) {
            if (this.editedIndex != -1) {
                const indexToRemove = this.columns.indexOf(item);
                promptActionConfirmation(questionToBeDeleted, () => {
                    axios.post('/Reporting/RemoveColumn', { ColumnID: item.ColumnID })
                        .then(response => {
                            item.IsHidden = !item.IsHidden;
                            this.$forceUpdate();
                        })
                    .catch(error => {
                        iziToast.error({
                            title: 'Грешка!'
                        });
                        console.error(error);
                    })
                   .finally(() => {
                       this.loading = false;
                   });
                })
            } else if (this.editedIndex == -1) {
                item.ColumnName = "";
                item.IsHidden = !item.IsHidden;
                item.ColumnStatusMessage = "Колоната не се показва/използва!";
                item.ReportColumnStatus = 2;

            }

        },

        saveReport() {
            if (this.editedIndex == -1) {
                this.editedItem.ReportFilters = []
                this.editedItem.ReportColumns = []
                this.editedItem.ReportUsers = []
                this.filters.forEach(item => {
                    if (item.ReportFilterStatus == 3)
                        this.editedItem.ReportFilters.push(item);
                });
                this.columns.forEach(item => {
                    if (item.ReportColumnStatus == 3)
                        this.editedItem.ReportColumns.push(item);
                });
                this.editedItem.ReportUsers = this.users
            }

            makeServerCall('post', '/Reporting/SubmitReport', this.editedItem, (ResultData) => {
                if (this.editedIndex != -1) {
                    Object.assign(this.reports[this.editedIndex], this.editedItem);
                } else { this.reports.push(this.editedItem) }
                this.dialog = false;
                this.$forceUpdate();
            });

        },

        deleteReport(item) {
            const indexToRemove = this.reports.indexOf(item);
            promptActionConfirmation(questionToBeDeleted, () => {
                makeServerCall('post', '/Reporting/DeleteReport?reportID=' + item.ReportDefinitionID, null, (ResultData) => {
                    this.reports.splice(indexToRemove, 1); // remove record from table
                });
            });
        },

        closeReportDialog() {
            this.dialog = false;
            setTimeout(() => {
                this.editedItem = new Reports();
                this.editedIndex = -1;
                this.filters = [];
                this.columns = [];
                this.users = [];
                this.userNamesList = [];
            }, 300);
        },
        closeFilterDialog() {
            this.filterDialog = false;
            setTimeout(() => {
                this.editedFilterItem = new ReportFilters();
                this.editedIndex = -1;
            }, 300);
        },

        calcTableColumns(editedFilterItem) {
            getTableColumns(this, editedFilterItem);
        },

        addUserToReport(item) {

            if (this.editedIndex == -1) {

                item.num = this.users.length + 1;
                this.users.push(item);
                ////remove user from dropdown list
                //var index = this.userNamesList.indexOf(item);
                //this.userNamesList.splice(index, 1);
                //close dialog
                this.userDialog = false;
            } else if (this.editedIndex > -1) {
                axios.post('/Reporting/AddUser', { UserId: item.Id, RepDefID: this.editedItem.ReportDefinitionID })
                    .then(response => {
                        item.num = this.users.length + 1;
                        this.users.push(item);
                    })
            .catch(error => {
                iziToast.error({
                    title: 'Грешка!'
                });
                console.error(error);
            })
            .finally(() => {
                this.userDialog = false;
            });
            }
            //remove user from dropdown list
            var index = this.userNamesList.indexOf(item);
            this.userNamesList.splice(index, 1);
            //close dialog
        },

        removeUserFromReport(item) {
            if (this.editedIndex == -1) {
                this.userNamesList.push(item);
                var index = item.num - 1
                this.users.splice(index, 1);
                this.userDialog = false;

            } else if (this.editedIndex > -1) {
                var index = item.num - 1
                //open a prompt 
                promptActionConfirmation(questionToBeDeleted, () => {
                    axios.post('/Reporting/RemoveUser', { UserId: item.Id, RepDefID: this.editedItem.ReportDefinitionID })
                        .then(response => {
                            this.userNamesList.push(item);
                            this.users.splice(index, 1);
                        })
                    .catch(error => {
                        iziToast.error({
                            title: 'Грешка!'
                        });
                        console.error(error);
                    })
           .finally(() => {
               this.userDialog = false;
           });
                })

            }
        }
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Добавяне на Справка' : 'Редакциия на Справка';
        }
    }
});


function loadReports(vue) {
    axios.get('/Reporting/GetAllReportsDef', null)
        .then(response => {
            response.data.forEach(item => {
                vue.reports.push(item);
            });
        })
        .catch(error => {
            iziToast.error({
                title: 'Грешка!'
            });
            console.error(error);
        })
        .finally(() => {
            vue.loading = false;
        });
}

function loadTableNames(vue) {
    axios.get('/Reporting/GetTableNameDropdownValues', null)
        .then(response => {
            response.data.forEach(item => {
                vue.tableNames.push(item);
            });
        })
        .catch(error => {
            iziToast.error({
                title: 'Грешка!'
            });
            console.error(error);
        })
        .finally(() => {
            vue.loading = false;
        });
}

function loadStoredProcedures(vue) {
    axios.get('/Reporting/GetStoredPorecedDropdownValues', null)
        .then(response => {
            response.data.forEach(item => {
                vue.storedProced.push(item);
            });
        })
        .catch(error => {
            iziToast.error({
                title: 'Грешка!'
            });
            console.error(error);
        })
        .finally(() => {
            vue.loading = false;
        });
}

function loadAllUsers(vue) {
    vue.userNamesList = [];
    if (vue.editedIndex != -1) { var param = '/Reporting/GetAllUserNames?reportDefinitionID=' + vue.editedItem.ReportDefinitionID } else { var param = '/Reporting/GetAllUserNames'; }
    axios.get(param, null)
        .then(response => {
            response.data.forEach(item => {
                vue.userNamesList.push(item);
            });
        })
        .catch(error => {
            iziToast.error({
                title: 'Грешка!'
            });
            console.error(error);
        })
        .finally(() => {
            vue.loading = false;
        });

}

function loadReportFilters(vue) {
    if (vue.editedItem == undefined) { vue = vue.reportManagement }
    vue.filters = [];
    axios.get('/Reporting/GetReportFilters?reportID=' + vue.editedItem.ReportDefinitionID + '&storedProcedureName=' + vue.editedItem.StoredProcedureName)
        .then(response => {
            response.data.forEach(item => {
                item.index = response.data.indexOf(item) + 1
                vue.filters.push(item);
            });
        })
        .catch(error => {
            iziToast.error({
                title: 'Грешка!'
            });
            console.error(error);
        })
        .finally(() => {
            vue.loading = false;
        });
}

function loadReportColumns(vue) {
    if (vue.editedItem == undefined) { vue = vue.reportManagement }
    vue.columns = [];
    axios.get('/Reporting/GetReportColumns?reportID=' + vue.editedItem.ReportDefinitionID + '&storedProcedureName=' + vue.editedItem.StoredProcedureName)
        .then(response => {
            response.data.forEach(item => {
                item.index = response.data.indexOf(item) + 1
                vue.columns.push(item);
            });
        })
                .catch(error => {
                    iziToast.error({
                        title: 'Грешка!'
                    });
                    console.error(error);
                })
                .finally(() => {
                    vue.loading = false;
                });
}

function loadReportUsers(vue) {
    if (vue.editedItem == undefined) { vue = vue.reportManagement }
    axios.get('/Reporting/GetReportUsers?reportID=' + vue.editedItem.ReportDefinitionID)
        .then(response => {
            response.data.forEach(item => {
                item.num = response.data.indexOf(item) + 1;
                vue.users.push(item);
            });
        })
        .catch(error => {
            iziToast.error({
                title: 'Грешка!'
            });
            console.error(error);
        })
        .finally(() => {
            vue.loading = false;
        });
}
function getTableColumns(vue, editedFilterItem) {

    if (editedFilterItem.TableName != '') {
        vue.filterTableColumns = [];
        axios.get('/Reporting/GetTableColumnsList', {
            params: {
                tableName: editedFilterItem.TableName,
            }
        })
            .then(function (response) {
                response.data.forEach(item => {
                    vue.filterTableColumns.push(item);
                    vue.$forceUpdate();
                });
            })
    }
}

function valdiateStoredProcedure(storedProcedureName) {
    if (storedProcedureName === "") {
        iziToast.warning({
            layout: 2,
            title: "Внимание",
            message: "Моля изберете име на процедура!"
        });
    }
    else {
        makeServerCall('post', '/Reporting/ValidateStoredProcedure?storedProcedureName=' + storedProcedureName, (ResultData) => {

            console.log(ResultData)



        });
    }
}