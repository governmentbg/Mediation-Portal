"use strict";

Vue.component('informationsList', {
    data() {
        return {
            Data: [],
            SectionName: '',
            loading: true,
            loadedData: [],
            SectionUrl: '',
            pagination: {
                page: 1,
                currentPage: 1,
                rowsPerPage: 10,
                totalPages: 0,
                totalCount: 0
            },
            moment: moment
        }
    },
    created: function () {
        this.SectionUrl = window.location.pathname.split("/")[2]
        this.loadSectionInformations();
    },
    methods: {
        next: function (page) {
            this.pagination.page = page;
            this.loadInformations(vue, page);
        },
        loadSectionInformations() {
            let vue = this;
            this.loading = true;

            console.log("this.section = " + this.section)

            makeServerCall('POST', '/PublicInformation/getInfosBySection?section=' + this.SectionUrl + '&page=' + this.pagination.page, null, (ResultData) => {
                vue.Data = ResultData.Data;
                vue.SectionName = ResultData.SectionName;
                vue.pagination.totalCount = ResultData.Total;
                vue.pagination.totalPages = Math.ceil(ResultData.Total / vue.pagination.rowsPerPage);
                this.loading = false;
            }, false);
        }
    },
    computed: {

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