"use strict";

Vue.component('content-management-menus', {
    data() {
        return {
            filters: {
                statusGUID: EmptyGuid,
                internalNumber: '',
                incomingNumber: '',
                identityNumber: ''
            },
            loadedData: [],
            expanded: [],
            singleExpand: false,
            headers: [
                { width: "3%" },
                { text: 'Наименование', align: 'left', value: 'MenuLabel', width: "15%" },
                { text: 'URL', align: 'left', value: 'URL', width: "15%" },
                { text: 'Статус', value: 'active', width: "10%" },
                { text: '', value: 'id', width: "10%", align: 'center' },
            ],
            errors: [],
            showErrors: false,
            loading: false,
            pagesDropdownItems: [],
            loadingTableData: false,
            expand: false,

            selectedItemsPerPage: 20,
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
                rowsPerPage: 10,
                totalPages: 0,
                totalCount: 0
            },
            menuDialog: {
                open: false,
                isNew: false,
                model: {}
            },
            menuDeleteDialog: {
                openDelete: false,
                id: null
            },
            noms: {
                status: [
                    { text: "Да", value: 1 },
                    { text: "Не", value: 0 }
                ]
            },
            dropdownMainItems: [],
            dropdownSubItems: [],
            dropdownRoles: []
        };
    },
    created: function () {
        let vue = this;
        generateModel(vue);
        //loadMenuDefinitions(vue, true);
        //loadMenuDefinitions(vue, false);
        loadItems(vue);

        // create get menu definitions (rename loadMenus....)
    },
    methods: {
        editMenu(id) {
            // loadMenu(this);
            loadingShow();
            let vue = this;
            this.menuDialog.isNew = false;

            loadMenuDefinitions(vue);

            getMenuDefinition(vue, id, this.openDialog);
        },
        openDialog() {
            loadingHide();
            this.menuDialog.open = true;
        },
        newMenu() {
            let vue = this;

            loadMenuDefinitions(vue);

            generateModel(vue);
            this.menuDialog.isNew = true;
            this.menuDialog.open = true;
        },
        deleteMenu(id) {
            let vue = this;
            var data = {
                id: id
            };

            makeServerCall('POST', '/ContentManagement/Menu/DeleteMenuDefinition', data, (ResultData) => {
                this.menuDialog.openDelete = false;
                loadItems(vue);
                vue.menuDeleteDialog.openDelete = false;
            });
        },
        redirectToApplication(formGuid, formTypeGUID) {
            let url = getUrlByApplicantionType(formGuid, formTypeGUID);

            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.click();
        },
        cancelMenuDefinition() {
            let vue = this;
            generateModel(vue);
            this.menuDialog.open = false;
            this.errors = []; // Clearing errors array
        },
        createMenuDefinition() {
            var newDefinition = this.menuDialog.model;

            if (!this.formValidation()) {
                let vue = this;
                var data = {
                    model: newDefinition
                };

                makeServerCall('POST', '/ContentManagement/Menu/CreateMenuDefinition', data, (ResultData) => {
                    this.menuDialog.open = false;
                    loadItems(vue);
                });
            }

        },
        updateMenuDefinition(id) {
            var updateDefinition = this.menuDialog.model;
            if (!this.formValidation()) {
                let vue = this;
                var data = {
                    model: updateDefinition
                };

                makeServerCall('POST', '/ContentManagement/Menu/UpdateMenuDefinition', data, (ResultData) => {
                    this.menuDialog.open = false;
                    loadItems(vue);
                });
            }

        },
        formValidation() {
            this.errors = []; // Clearing errors array

            if (!this.menuDialog.model.PageType) {
                if (this.menuDialog.model.MenuType) {
                    var menuLabelError = this.menuDialog.model.MenuLabel != null && this.menuDialog.model.MenuLabel != '' ? null : this.errors.push({ message: "Моля задайте име!" });
                    var menuUrlError = this.menuDialog.model.URL != null && this.menuDialog.model.URL != '' ? null : this.errors.push({ message: "Моля задайте URL!" });
                    var rowNumberError = this.menuDialog.model.RowNumber != null && this.menuDialog.model.RowNumber >= 1 && this.menuDialog.model.RowNumber <= 100 ? null : this.errors.push({ message: "Моля задайте номер на позиция между 1 - 100!" });
                    var userError = this.menuDialog.model.AssignedToRoles.length > 0 ? null : this.errors.push({ message: "Моля задайте кои потребители ще разполагат с достъп!" });

                }
                else {
                    var menuLabelError2 = this.menuDialog.model.MenuLabel != null && this.menuDialog.model.MenuLabel != '' ? null : this.errors.push({ message: "Моля задайте име!" });
                    var menuUrlError2 = this.menuDialog.model.URL != null && this.menuDialog.model.URL != '' ? null : this.errors.push({ message: "Моля задайте URL!" });
                    var menuParentError2 = this.menuDialog.model.ParentGUID != null && this.menuDialog.model.ParentGUID != '' ? null : this.errors.push({ message: "Моля задайте главна страница!" });
                    var rowNumberError2 = this.menuDialog.model.RowNumber != null && this.menuDialog.model.RowNumber >= 1 && this.menuDialog.model.RowNumber <= 100 ? null : this.errors.push({ message: "Моля задайте номер на позиция между 1 - 100!" });
                    var userError2 = this.menuDialog.model.AssignedToRoles.length > 0 ? null : this.errors.push({ message: "Моля задайте кои потребители ще разполагат с достъп!" });
                }
            }
            else {
                if (this.menuDialog.model.MenuType) {
                    var menuLabelError3 = this.menuDialog.model.MenuLabel != null && this.menuDialog.model.MenuLabel != '' ? null : this.errors.push({ message: "Моля задайте име!" });
                    var menuPageError3 = this.menuDialog.model.Page != null && this.menuDialog.model.Page != '' ? null : this.errors.push({ message: "Моля задайте страница!" });
                    var rowNumberError3 = this.menuDialog.model.RowNumber != null && this.menuDialog.model.RowNumber >= 1 && this.menuDialog.model.RowNumber <= 100 ? null : this.errors.push({ message: "Моля задайте номер на позиция между 1 - 100!" });
                    var userError3 = this.menuDialog.model.AssignedToRoles.length > 0 ? null : this.errors.push({ message: "Моля задайте кои потребители ще разполагат с достъп!" });
                }
                else {
                    var menuLabelError4 = this.menuDialog.model.MenuLabel != null && this.menuDialog.model.MenuLabel != '' ? null : this.errors.push({ message: "Моля задайте име!" });
                    var menuPageError4 = this.menuDialog.model.Page != null && this.menuDialog.model.Page != '' ? null : this.errors.push({ message: "Моля задайте страница!" });
                    var menuParentError4 = this.menuDialog.model.ParentGUID != null && this.menuDialog.model.ParentGUID != '' ? null : this.errors.push({ message: "Моля задайте главна страница!" });
                    var rowNumberError4 = this.menuDialog.model.RowNumber != null && this.menuDialog.model.RowNumber >= 1 && this.menuDialog.model.RowNumber <= 100 ? null : this.errors.push({ message: "Моля задайте номер на позиция между 1 - 100!" });
                    var userError4 = this.menuDialog.model.AssignedToRoles.length > 0 ? null : this.errors.push({ message: "Моля задайте кои потребители ще разполагат с достъп!" });
                }
            }

            if (this.errors.length > 0) {
                this.showErrors = true;
                return true;
            }
            else {
                return false;
            }
        },
        next(page) {
            this.pagination.page = page;
            loadItems(this);
        },
        setRows(rows) {
            this.selectedItemsPerPage = rows;
            let vue = this;
            loadItems(vue);

        },
        openDelete(id) {
            this.menuDeleteDialog.openDelete = true;
            this.menuDeleteDialog.id = id;
        },
        cancelDelete() {
            this.menuDeleteDialog.openDelete = false;
            this.menuDeleteDialog.id = null;
        }
    },
    computed: {

    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            //if (this.loadedData.length === 1 && !this.loadedData.includes(false)) {
            //    this.loading = false;
            //}
        }
    }
});

function loadMenuDefinitions(vue) {

    //var data = { submenu: submenu };
    makeServerCall('GET', '/ContentManagement/Menu/GetSubMenuDefinitionsDropdown', null, (ResultData) => {
        vue.dropdownSubItems = ResultData;
        vue.$forceUpdate();
    });

    makeServerCall('GET', '/ContentManagement/Menu/GetMainMenuDefinitionsDropdown', null, (ResultData) => {
        console.log(ResultData);

        vue.dropdownMainItems = ResultData;
        vue.$forceUpdate();
    });

    makeServerCall('GET', '/ContentManagement/Menu/GetRolesDropdown', null, (ResultData) => {

        vue.dropdownRoles = ResultData;
        vue.$forceUpdate();
    });
}

function loadItems(vue) {

    var data = { isGloballyVisible: null, page: vue.pagination.page, pageSize: vue.selectedItemsPerPage };
    makeServerCall('GET', '/ContentManagement/Menu/GetMenuDefinitions', data, (ResultData) => {
        vue.loadedData = ResultData.items;
        vue.pagination.totalPages = ResultData.pages;
        vue.$forceUpdate();
    });
}

function getMenuDefinition(vue, id, cb) {

    var data = { id: id };
    makeServerCall('GET', '/ContentManagement/Menu/GetSingleMenuDefinitions', data, (ResultData) => {
        vue.menuDialog.model = ResultData;
        if (cb) {
            cb();
        }
        vue.$forceUpdate();
    });
}

function generateModel(vue) {
    var createModel = Object.assign(new MenuDefinition());
    createModel.Id = null;
    createModel.MenuLabel = '';
    createModel.ParentGUID = '';
    createModel.URL = '';
    createModel.Page = '';
    createModel.Is_Active = 0;
    createModel.PageType = 1;
    createModel.MenuType = 1;
    createModel.RowNumber = null;
    createModel.AssignedToRoles = [];

    vue.menuDialog.model = createModel;
    vue.$forceUpdate();
}