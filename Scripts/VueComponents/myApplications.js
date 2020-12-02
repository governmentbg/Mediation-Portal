"use strict";

Vue.component('myApplications', {
    data() {
        return {
            getUrlByApplicantionType: getUrlByApplicantionType,
            eApplicationType: eApplicationType,
            eApplicationFormStatus: eApplicationFormStatus,
            myApplications: [],
            loading: true,
            loadedData: [],
            table: {
                data: [],
                headers: [
                    { text: 'Заявление', align: 'left', value: 'FormTypeName', width: "25%" },
                    { text: 'Вътрешен номер', align: 'left', value: 'InternalNumber', width: "12%" },
                    { text: 'Статус', value: 'FormStatusName', width: "12%" },
                    { text: 'Корекция', value: 'DateLastModified', width: "12%" },
                    { text: 'Регистрирано', value: 'DateRegistered', width: "12%" },
                    { text: 'Създадено', value: 'DateCreated', width: "12%" },
                    { text: '', value: null, width: "1%", align: 'center' },
                ],
                footer: {
                    'items-per-page-text': 'Записи на страница:',
                    'items-per-page-all-text': 'Всички'
                },
                loading: false
            }
        }
    },
    created: function () {
        let vue = this;

        loadMyApplications(vue);
    },
    methods: {
        redirectToApplication(formGuid, formTypeGUID) {
            let url = getUrlByApplicantionType(formGuid, formTypeGUID);

            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.click();
        },
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

function loadMyApplications(vue) {
    makeServerCall('GET', '/FormFiling/ApplicationForms/GetMyApplications', null, (ResultData) => {
        vue.table.data = ResultData;
        vue.table.data.forEach(x => {
            x.DateLastModified = x.DateLastModified ? moment(x.DateLastModified).format("DD.MM.YYYYг. HH:mmч.") : 'Няма корекции';
            x.DateRegistered = x.DateRegistered ? moment(x.DateRegistered).format("DD.MM.YYYYг. HH:mmч.") : 'Не е регистрирано';
            x.DateCreated = moment(x.DateCreated).format("DD.MM.YYYYг. HH:mmч.");
            x.FormTypeName = x.FormTypeName.replace('Заявление за ', '');
            x.PendingPaymentOrganization = x.FormTypeGUID.toLowerCase() === eApplicationType.RegisterTrainingOrganization.toLowerCase() && x.FormStatusGUID.toLowerCase() === eApplicationFormStatus.PendingPayment.toLowerCase();
            x.PendingPaymentMediator = x.FormTypeGUID.toLowerCase() === eApplicationType.RegisterMediator.toLowerCase() && x.FormStatusGUID.toLowerCase() === eApplicationFormStatus.PendingPayment.toLowerCase();

            let firstLetter = x.FormTypeName.substring(0, 1);
            x.FormTypeName = firstLetter.toUpperCase() + x.FormTypeName.substring(1);
        });
        vue.loadedData.push(true);
    }, false);
}