Vue.component('listUsersForm', {
    props: {
        func: Function
    },
    data: function () {
        return {

            //Pagination
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
                rowsPerPage: 10,
                totalPages: 0,
                totalCount: 0
            },
            items: [{ text: 'Име', align: 'left', value: 'FirstName', width: "10%" },
            { text: 'Фамилия', value: 'LastName', width: "10%" },
            { text: 'Имейл', value: 'Email', width: "10%" },
            { text: 'Потребителско име', value: 'UserName', width: "10%" },
            { text: 'Роли', value: 'Roles', width: "10%" },
            { text: '', value: '', width: "10%" }],

            roles: [],
            filters: new UserFilters(),


            //Common
            BG_GUID: BULGARIA_GUID,
            loading: true,
            loadedData: [],
            loadingTableData: false,
            headers: [],
            users: [],
            deleteDialog: {
                open: false,
                id: null
            },
        };
    },
    created: function () {
        let vue = this;
        loadUsers(vue);
        loadUserRoles(vue);
    },
    methods: {
        triggerSearch: function () {
            this.pagination.currentPage = 1;
            loadUsers(this);
        },
        removeSearch: function () {
            this.pagination.currentPage = 1;
            this.filters = new UserFilters();
            loadUsers(this);
        },
        setRows(rows) {
            let vue = this;

            if (rows === 100000) {
                vue.pagination.rowsPerPage = vue.pagination.totalCount;
            }
            else if (rows >= this.pagination.totalCount) {
                vue.pagination.rowsPerPage = vue.pagination.totalCount;
            } else {
                vue.pagination.rowsPerPage = rows;
            }
            this.pagination.page = 1;
            loadUsers(this);
        },
        next: function (page) {
            nextPage(page, this);
        },
        deleteUser(id) {
            this.deleteDialog.open = true;
            this.deleteDialog.id = id;
        },
        confirmDeleteUser() {
            let vue = this;

            makeServerCall('POST', '/Account/DeleteUser/' + this.deleteDialog.id, null, (ResultData) => {
                loadUsers(vue);
                vue.deleteDialog.open = false;
            });
        },
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 2 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    },
    computed: {
        isFilterApplied: function () {
            return this.filters.Name || this.filters.Username || this.filters.Role;
        }
    }
});

function nextPage(page, vue) {
    loadUsers(vue, page);
}

function loadUsers(vue, _page) {
    vue.loadingTableData = true;

    let page = _page || vue.pagination.page;
    let rowsPerPage = vue.pagination.rowsPerPage;
    vue.loadingTableData = true;

    makeServerCall('POST', '/Account/GetUsers', { page: page, perpage: rowsPerPage, filters: vue.filters }, (ResultData) => {
        vue.users = ResultData.Data;

        vue.pagination.totalCount = ResultData.Total;
        vue.pagination.totalPages = Math.ceil(ResultData.Total / vue.pagination.rowsPerPage);
        vue.loadingTableData = false;
        vue.loadedData.push(true);
    });
}

function loadUserRoles(vue) {
    makeServerCall('GET', '/UserManagement/GetUserRoles', null, (ResultData) => {
        //vue.roles = ResultData;
        vue.roles.push({ Value: '', Label: '-- изберете --' })
        for (var i = 0; i < ResultData.length; i++) {
            vue.roles.push({ Value: ResultData[i], Label: ResultData[i] });
        }

        vue.loadedData.push(true);
    });
}