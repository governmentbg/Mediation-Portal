"use strict";

Vue.component('openData', {
    data() {
        return {

        }
    },
    created: function () {
    },
    methods: {
        downloadMediatorsCSV() {
            var url = '/Register/Mediators/ExportMediatorsToCSV';

            const link = document.createElement('a');
            link.href = url;
            link.target = "_blank";
            link.click();
        },
        downloadMediatorsXML() {
            var url = '/Register/Mediators/ExportMediatorsToXml';

            const link = document.createElement('a');
            link.href = url;
            link.target = "_blank";
            link.click();
        },
        downloadMediatorsJSON() {
            var url = '/Register/Mediators/ExportMediatorsToJson';

            const link = document.createElement('a');
            link.href = url;
            link.target = "_blank";
            link.click();
        },
        downloadOrganizationsCSV() {
            var url = '/Register/TrainingOrganizations/ExportTrainingOrganizationsToCSV';

            const link = document.createElement('a');
            link.href = url;
            link.target = "_blank";
            link.click();
        },
        downloadOrganizationsXML() {
            var url = '/Register/TrainingOrganizations/ExportTrainingOrganizationsToXml';

            const link = document.createElement('a');
            link.href = url;
            link.target = "_blank";
            link.click();
        },
        downloadOrganizationsJSON() {
            var url = '/Register/TrainingOrganizations/ExportTrainingOrganizationsToJson';

            const link = document.createElement('a');
            link.href = url;
            link.target = "_blank";
            link.click();
        }
    },
    computed: {

    },
    watch: {
    }
});