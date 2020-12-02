var searchTrainingOrganizations = Vue.component('adminMediatorsList', {
    props: {
        forMediation: Boolean,
        forAdditionalMediator: Boolean,
        func: Function
    },
    data: function () {
        return {
            //Search object
            MediatorFilters: new MediatorFiltersAdmin(),
            AllowedActions: [],

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

            //Data
            countries: [],
            districts: [],
            educationDegrees: [],
            educationFields: [],
            foreignLanguages: [],
            specializations: [],
            mediatorStatuses: [],
            organizations: [],
            mediators: [],
            incomingNumber: [
                { Key: false, Value: 'Без деловоден номер' },
                { Key: true, Value: 'С деловоден номер' }
            ],


            //Common
            BG_GUID: BULGARIA_GUID,
            loading: true,
            loadedData: [],
            loadingTableData: false,
            headers: []
        };
    },
    created: function () {
        let vue = this;

        // if component is called from mediation form we won't search all mediators
        if (!vue.$props.forMediation) {
            mediatorsSearch(vue);
        }

        loadCountries(vue);
        loadDistricts(vue);
        loadEducationDegrees(vue);
        loadEducationFields(vue);
        loadForeignLanguages(vue);
        loadSpecializations(vue);
        loadMediatorStatuses(vue);
        loadOrganizations(vue);
        loadAllowedActions(vue);
    },
    methods: {
        triggerSearch: function () {
            this.pagination.currentPage = 1;
            mediatorsSearch(this);
        },
        onCountryChange: function (fullAddressClassName, countryGUID) {
            onCountryChange(fullAddressClassName, countryGUID);
        },
        onDistrictChange: function (fullAddressClassName) {
            onDistrictChange(this, fullAddressClassName);
        },
        removeFromForeignLanguagesMultipleDropdown(item) {
            const index = this.MediatorFilters.MediatorForeignLanguages.indexOf(item);
            if (index >= 0) this.MediatorFilters.MediatorForeignLanguages.splice(index, 1);
        },
        removeFromSpecializationsMultipleDropdown(item) {
            const index = this.MediatorFilters.MediatorSpecializations.indexOf(item);
            if (index >= 0) this.MediatorFilters.MediatorSpecializations.splice(index, 1);
        },
        onClearDateCreatedFrom: function () {
            this.MediatorFilters.DateCreatedFrom = '';
        },
        onClearDateCreatedTo: function () {
            this.MediatorFilters.DateCreatedTo = '';
        },
        formatDate: function (date) {
            var convertedDate = moment(date).format('DD.MM.YYYY');
            if (convertedDate === "Invalid date") {
                return date;
            }
            return convertedDate;
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
            mediatorsSearch(this);
        },
        next: function (page) {
            mediatorsSearch(this);

        },
        getHeaders() {
            let vue = this;
            var headers = [
                { text: 'Име', align: 'left', value: 'Name', width: "15%" },
                { text: 'Рег. номер', value: 'RegistrationNumber', width: "10%" },
                { text: 'Статус', value: 'StatusName', width: "10%" },
                { text: 'Дата', value: 'DateCreated', width: "10%" },
                { text: 'Деловоден номер', value: 'IncomingNumber', width: "10%" },
                { text: '', value: null, align: 'right', width: "1%" }
            ]
            if (vue.$props.forMediation) {
                headers.push({ text: '', value: null, align: 'right', width: "1%" });
            }

            if (vue.$props.forAdditionalMediator) {
                headers = [
                    { text: 'Име', align: 'left', value: 'Name', width: "15%" },
                    { text: 'Рег. номер', value: 'RegistrationNumber', width: "10%" },
                    { text: 'Езици', value: 'ForeignLanguages', width: "20%" },
                    { text: 'Професии', value: 'Professions', width: "20%" },
                    { text: '', value: null, align: 'right', width: "20%" },
                ]
            }

            return headers;
        },
        chooseMediator(mediatorGUID) {
            let vue = this;
            const chosenMediator = vue.mediators.find(x => x.MediatorGUID === mediatorGUID);
            const chosenMediatorMessage = "Избран медиатор: " + chosenMediator.FirstName + " " + chosenMediator.LastName;

            vue.func(mediatorGUID, chosenMediatorMessage);

            // after sending mediator guid empty mediator list
            // vue.mediators = [];
            // vue.pagination.totalPages = 0;
            if (this.forMediation) {
                window.scrollTo({ top: 500, behavior: 'smooth' });
            }
        }
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 8 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    },
    computed: {
        showRedirectMediatorButton: function () {
            return !this.AllowedActions.ViewMediatorPreviousRevisions
        },
        showRedirectMediatorButtonAdmin: function () {
            return this.AllowedActions.ViewMediatorPreviousRevisions
        }
    }
});


//Search by filters
function mediatorsSearch(vue, _page) {
    loadingShow()
    vue.loadingTableData = true;

    let page = _page || vue.pagination.page;
    let rowsPerPage = vue.pagination.rowsPerPage;
    vue.loadingTableData = true;

    makeServerCall('POST', '/Administration/MediatorsForAdmins/SearchMediators', { page: page, perpage: rowsPerPage, filters: vue.MediatorFilters }, (ResultData) => {
        setReceivedData(vue, ResultData);
        loadingHide();
    });
}
// End of search

// Pagination logic
function nextPage(page, vue) {
    mediatorsSearch(vue, page);
}
// End of pagination

//Helpers
function setReceivedData(vue, resultData) {
    vue.mediators = resultData.Data;
    vue.mediators.map(x => {
        x.DateCreated = dateFormated(x.DateCreated);
        x.FullName = x.FirstName + ' ' + x.MiddleName + ' ' + x.LastName;
    });

    vue.pagination.totalCount = resultData.Total;
    vue.pagination.totalPages = Math.ceil(resultData.Total / vue.pagination.rowsPerPage);
    vue.loadingTableData = false;
}
// End of helpers


function loadOrganizations(vue) {
    makeServerCall('GET', '/Administration/MediatorsForAdmins/GetOrganizations', null, (ResultData) => {
        vue.organizations = ResultData;
        vue.loadedData.push(true);
    });
}

function loadEducationFields(vue) {
    makeServerCall('GET', '/MetaData/GetEducationFields', null, (ResultData) => {
        vue.educationFields = ResultData;
        vue.loadedData.push(true);
    });
}

function loadEducationDegrees(vue) {
    makeServerCall('GET', '/MetaData/GetEducationDegrees', null, (ResultData) => {
        vue.educationDegrees = ResultData;
        vue.loadedData.push(true);
    });
}


function loadForeignLanguages(vue) {
    makeServerCall('GET', '/MetaData/GetForeignLanguages', null, (ResultData) => {
        vue.foreignLanguages = ResultData;
        vue.loadedData.push(true);
    });
}


function loadMediatorStatuses(vue) {
    makeServerCall('GET', '/Administration/MediatorsForAdmins/GetMediatorStatuses', null, (ResultData) => {
        vue.mediatorStatuses = ResultData;
        vue.loadedData.push(true);
    });
}


function loadSpecializations(vue) {
    makeServerCall('GET', '/MetaData/GetSpecializations', null, (ResultData) => {
        vue.specializations = ResultData;
        vue.loadedData.push(true);
    });
}