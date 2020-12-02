"use strict";

Vue.component('information', {
    data() {
        return {
            Title: '',
            HTMLContent: '',
            SectionName: '',
            DateCreated: '',
            SectionUrl: '',
            InfoUrl: '',
            loading: true,
            moment: moment
        }
    },
    created: function () {
        this.SectionUrl = window.location.pathname.split("/")[2];
        this.InfoUrl = window.location.pathname.split("/").pop();
        this.loadInformation();
    },
    methods: {
        loadInformation() {
            let vue = this;
            this.loading = true;
            

            makeServerCall('GET', '/PublicInformation/getInformationContent?section=' + this.SectionUrl + '&info=' + this.InfoUrl, null, (ResultData) => {
                vue.Title = ResultData.Title;
                vue.HTMLContent = ResultData.HTMLContent;
                vue.DateCreated = ResultData.DateCreated;
                vue.SectionName = ResultData.SectionName;
                this.loading = false;
            }, false);
        }
    },
    computed: {

    }
});