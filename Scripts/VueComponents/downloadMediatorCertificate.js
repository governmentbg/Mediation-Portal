"use strict";

Vue.component('downloadMediatorCertificate', {
    data: function () {
        return {
            formGUID: getParameter('formGUID'),
            certificateAccessToken: getParameter('certificateAccessToken')
        }
    },
    created: function () {
        var vue = this;
    },
    methods: {
        handleDownload() {
            let link = document.createElement('a');
            link.target = '_blank';
            link.href = '/FormFiling/RegisterMediator/DownloadMediatorCertificate?formGUID=' + this.formGUID + '&certificateAccessToken=' + this.certificateAccessToken;

            window.open(link.href);
        }
    }
})