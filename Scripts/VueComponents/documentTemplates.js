"use strict";

Vue.component('documentTemplates', {
    data: function () {
        return {
            loading: false,
            table: {
                loading: true,
                data: [],
                selectedItemsPerPage: 50,
                tableHeader: [
                    { text: 'Наименование', align: 'left', value: 'CaseEventName' },
                    { text: '', value: null, width: "20%", align: 'right' }
                ]
            },
            dialog: {
                open: false,
                loading: true,
                title: '',
                data: {
                    id: '',
                    document: null
                }
            }
        }
    },
    created: function () {
        let vue = this;
        getDocumentTemplates(vue);
    },
    methods: {
        editTemplate: function (id) {
            this.dialog.open = true;
            this.dialog.id = id;

            this.table.data.forEach(temp => {
                if (temp.GUID.toLowerCase() === id.toLowerCase()) {
                    this.dialog.title = temp.FileName;
                    this.dialog.loading = false;
                }
            })
        },
        doEdit() {
            let vue = this;
            let file = this.dialog.data.document[0];

            if (file instanceof File) {
                loadingShow();
                this.table.loading = true;

                let formData = new FormData();
                formData.append('file', file);
                try {
                    axios.post('/DocumentTemplate/UploadFile?fileGuid=' + this.dialog.id, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                        .then(function (response) {
                            vue.dialog.data.document = null;
                            vue.dialog.data.id = ''
                            vue.dialog.open = false;

                            iziToast.success({
                                message: "Успешно качихте темплейта"
                            });
                        })
                        .catch(function (error) {
                            if (error.response && error.response.status === 403) {
                                //If the response is 'not authorized' => display the content. It's a meaningfull message
                                iziToast.error({
                                    layout: 2,
                                    title: 'Грешка!',
                                    message: error.response.data
                                });
                            }
                            else {
                                iziToast.error({
                                    title: 'Грешка при прикачане!'
                                });
                            }
                            console.error(error);
                        })
                        .finally(() => {
                            loadingHide();
                            this.table.loading = false;
                        });
                } catch (e) {
                    console.log("ERR ");
                    console.log(e)
                }
            } else {
                //prevent falsly triggering of uplaod
                return;
            }
        }
    }
});

function getDocumentTemplates(vue) {
    makeServerCall('GET', '/DocumentTemplate/GetTemplateDocuments', null, (ResultData) => {
        vue.table.data = ResultData;
        vue.table.loading = false;
    });
}