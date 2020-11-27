Vue.config.devtools = true;


Vue.component('reportsComponent', {
    data: function () {
        return {
            reportDefinitionId: window.location.pathname.split("/").pop(),
            dropdown: null,
            isExportDisabled: true,
            addInfoDialog: false,
            reportDescription: '',
            reportFilterDescriptions: [],
            reportColumnDescriptions: [],
            tableDataIsLoaded: false,
            selectedValues: [],
            reportHeaders: [],
            reportRows: [],
            search: '',
            pagination: {
                rowsPerPage: 10
            }
        };
    },
    created: function () {
        let vue = this;
        loadReportAdditionalInformation(vue);
    },
    methods: {
        collectData: function (value, filterParameterName) {
            this.isSearchDisabled = false;
            this.isExportDisabled = true;

            let selection = this.selectedValues.find(e => e.FilterParameterName === filterParameterName);
            if (selection) {
                if (!value) {
                    let index = this.selectedValues.indexOf(selection);
                    this.selectedValues.splice(index, 1);
                    return;
                }
                this.selectedValues.find(e => e.FilterParameterName === filterParameterName).FilterValue = value;
            } else {
                this.selectedValues.push({ FilterParameterName: filterParameterName, FilterValue: value });
            }
        },
        onSubmitFilters: function () {
            let vue = this;
            handleSubmitFilters(vue);
        },

        exportToExcel: function () {
            let filters = "[]";
            if (this.selectedValues.length > 0) {
                filters = JSON.stringify(this.selectedValues);
            }

            var url = '/Reports/Reporting/ExportReportToExcel?ReportDefinitionID=' + this.reportDefinitionId + '&FiltersData=' + filters;

            const link = document.createElement('a');
            link.href = url;
            link.target = "_blank";
            link.click();
        }
    },
    watch: {

    }
});

function handleSubmitFilters(vue) {
    loadingShow();

    let selectedFilters = vue.selectedValues.lenght === 0 ? null : vue.selectedValues;
    let data = {
        params:
        {
            ReportDefinitionID: vue.reportDefinitionId,
            FiltersData: JSON.stringify(selectedFilters)
        }
    };

    axios.get('/Reporting/Filter', data)
        .then(function (response) {
            let result = response.data;
            if (response.status === 200) {
                vue.reportHeaders = result.ReportHeaders;
                vue.reportRows = result.ReportRows;

                vue.tableDataIsLoaded = true;
                vue.isExportDisabled = false;

                iziToast.success({
                    message: "Успешно заредени данни!"
                });

                vue.$forceUpdate();
            }
            else {
                iziToast.warning({
                    layout: 2,
                    title: "Warning",
                    message: "Грешка при зареждане на данните!"
                });
            }
        })
        .catch(function (error) {
            iziToast.warning({
                layout: 2,
                title: "Error",
                message: "Error while loading the data!"
            });
            console.log(error)
        })
        .finally(() => {
            loadingHide();
        });
}


function loadReportAdditionalInformation(vue) {
    axios.get('/Reports/Reporting/GetAddInformationForReport?reportID=' + vue.reportDefinitionId)
        .then(response => {
            vue.reportDescription = response.data.ReportDescription;
            response.data.ReportFilters.forEach(item => {
                item.index = response.data.ReportFilters.indexOf(item) + 1;
                vue.reportFilterDescriptions.push(item);
            });
            response.data.ReportColumns.forEach(item => {
                item.index = response.data.ReportColumns.indexOf(item) + 1;
                vue.reportColumnDescriptions.push(item);
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