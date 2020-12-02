Vue.component('searchtrainingorganizations', {
    data() {
        return {
            //Search object
            OrganizationFilters: new OrganizationFilters(),
            AllowedActions: [],

            //Pagination
            pagination: {
                page: 1,
                currentPage: 1,
                rowsPerPage: 10,
                totalPages: 0,
                totalCount: 0
            },
            selectedItemsPerPage: 10,
            itemsPerPage: [
                { Key: 5, Value: '5' },
                { Key: 10, Value: '10' },
                { Key: 20, Value: '20' },
                { Key: 50, Value: '50' },
                { Key: 100000, Value: 'Всички' } //TODO - do better 
            ],

            //Data
            trainingOrganizations: [],
            trainingOrganizationStatuses: [],
            countries: [],
            districts: [],

            //Common
            BG_GUID: BULGARIA_GUID,
            loading: true,
            loadedData: [],
            loadingTableData: true,
            headers: [
                { text: 'Име', align: 'left', value: 'Name'},
                { text: 'ЕИК', value: 'EIK'},
                { text: 'Рег. номер', value: 'RegistrationNumber'},
                { text: 'Статус', value: 'StatusName'},
                { text: 'Дата', value: 'DateCreated'},
                { text: '', value: null, align: 'center'},
            ],
        }
    },
    created: function () {
        let vue = this;

        trainingOrganizationsSearch(vue);
        loadTrainingOrganizationStatuses(vue);
        loadCountries(vue);
        loadDistricts(vue);
        loadAllowedActions(vue);
    },
    methods: {
        triggerSearch: function () {
            this.pagination.currentPage = 1;
            trainingOrganizationsSearch(this);
        },
        formatDate: function (date) {
            var convertedDate = moment(date).format('DD.MM.YYYY');
            if (convertedDate === "Invalid date") {
                return date;
            }
            return convertedDate;
        },
        onClearEffectiveFrom: function () {
            this.OrganizationFilters.EffectiveFrom = '';
        },
        onClearEffectiveTo: function () {
            this.OrganizationFilters.EffectiveTo = '';
        },
        onClearDateCreatedFrom: function () {
            this.OrganizationFilters.DateCreatedFrom = '';
        },
        onClearDateCreatedTo: function () {
            this.OrganizationFilters.DateCreatedTo = '';
        },
        next: function (page) {
            nextPage(page, this);
        },
        setRows(rows) {
            if (rows === 100000) {
                this.pagination.rowsPerPage = this.pagination.totalCount;
            } else if (rows >= this.pagination.totalCount) {
                this.pagination.rowsPerPage = this.pagination.totalCount;
            } else {
                this.pagination.rowsPerPage = rows;
            }

            this.pagination.page = 1;
            trainingOrganizationsSearch(this)
        },
        onCountryChange: function (fullAddressClassName, countryGUID) {
            onCountryChange(fullAddressClassName, countryGUID);
        },
        onDistrictChange: function (fullAddressClassName) {
            onDistrictChange(this, fullAddressClassName);
        }
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 3 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    },
    computed: {
        showRedirectOrganizationButton: function () {
            return !this.AllowedActions.ViewTrainingOrganizationPreviousRevisions
        },
        showRedirectOrganizationButtonAdmin: function () {
            return this.AllowedActions.ViewTrainingOrganizationPreviousRevisions
        }
    }
});


//Search by filters
function trainingOrganizationsSearch(vue, _page) {
    let page = _page || vue.pagination.page;
    let rowsPerPage = vue.pagination.rowsPerPage;
    vue.loadingTableData = true;

    makeServerCall('post', '/TrainingOrganizations/SearchTrainingOrganizations?page=' + page +
        '&perpage=' + rowsPerPage, vue.OrganizationFilters, (ResultData) => {
            setReceivedData(vue, ResultData);
            console.log(ResultData)
        });
}
// End of search

//Pagination logic
function nextPage(page, vue) {
    trainingOrganizationsSearch(vue, page);
}
// End of pagination

//Helpers
function setReceivedData(vue, resultData) {
    vue.trainingOrganizations = resultData.Data;
    vue.trainingOrganizations.map(x => {
        x.EffectiveFrom = dateFormated(x.EffectiveFrom);
        x.EffectiveTo = dateFormated(x.EffectiveTo);
        x.DateCreated = dateFormated(x.DateCreated);
    });

    vue.pagination.totalCount = resultData.Total;
    vue.pagination.totalPages = Math.ceil(resultData.Total / vue.pagination.rowsPerPage);

    vue.loadingTableData = false;
}
// End of helpers