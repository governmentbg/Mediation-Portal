"use strict";

Vue.component('contentManagementEditService', {
    components: {
        quillEditor: VueQuillEditor.quillEditor
    },
    data() {
        return {
            Service: new Service(),

            serviceGuid: window.location.pathname.split("/").pop(),
            loading: true,
            loadedData: [],

            files: [],
            filesInfo: [],
            loadingTableData: false,

            headers: [
                { text: 'Име на файла', align: 'left', value: 'FileName', width: "10%" },
                { text: 'Размер', align: 'left', value: 'FileSize', width: "15%" },
                { text: 'Качен на', value: 'DateCreated', width: "10%" },
                { text: 'Качен от', value: 'UserName', width: "10%" },
                { text: '', value: null, width: "10%", align: 'center' },
            ],

            editorOption: {
                theme: 'snow',
                modules: {
                    toolbar: {
                        container: [
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote', 'code-block'],
                            [{ 'header': 1 }, { 'header': 2 }],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            [{ 'script': 'sub' }, { 'script': 'super' }],
                            [{ 'indent': '-1' }, { 'indent': '+1' }],
                            [{ 'direction': 'rtl' }],
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            [{ 'font': [] }],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'align': [] }],
                            ['clean'],
                            ['link', 'image', 'video']
                        ]
                    },
                    htmlEditButton: {}
                }
            },
            deleteDialog: {
                open: false,
                id: '',
                loading: false
            },
            moment: moment
        }
    },
    created: function () {
        let vue = this;

        loadServiceDetails(vue);
    },
    methods: {
        submitService: function () {
            let vue = this;

            makeServerCall('POST', '/Services/SubmitService', { model: vue.Service }, (serviceGuid) => {
                window.location.pathname = "/ContentManagement/Services/Edit/" + serviceGuid
            });
        },
        onFileChange(files) {
            if (files.length > 0) {
                handleServiceDocUpload(this, files);
            }
            else {
                this.files = [];
            }
        },
        copyFileLink(fileGUID) {
            let downloadLink = '/AttachedDocument/DownloadFile/' + fileGUID;

            copyStringToClipboard(downloadLink);
        },
        removeFile(fileGUID) {
            this.deleteDialog.open = true;
            this.deleteDialog.id = fileGUID;
        },
        confirmRemoveFile() {
            let vue = this;
            vue.loadingTableData = true;
            vue.deleteDialog.loading = true;
            makeServerCall('POST', '/Services/DeleteServiceFile', { serviceGuid: this.Service.GUID, attachmentGuid: this.deleteDialog.id }, (ResultData) => {
                vue.Service.Files = ResultData.Files;
                makeServerCall('POST', '/AttachedDocument/GetAttachedDocumentsDetails', vue.Service.Files, (result) => {
                    vue.filesInfo = result;
                    vue.loadingTableData = false;
                    vue.deleteDialog.loading = false;
                    vue.deleteDialog.open = false;
                });
            })

            /*
            let index1 = this.filesInfo.map(x => x.GUID).indexOf(fileGUID);
            this.filesInfo.splice(index1, 1);   //array for rendering the files to the user

            let index2 = this.Page.UploadedFiles.indexOf(fileGUID)
            this.Page.UploadedFiles.splice(index2, 1); //array carring info to db (file guid to page)
            */
        }
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 1 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        },
    }
});

var Link = Quill.import('formats/link');

class MyLink extends Link {
    static create(value) {
        let node = super.create(value);
        value = this.sanitize(value);
        node.setAttribute('href', value);
        if (!value.startsWith("https://") || !value.startsWith("http://")) {
            node.removeAttribute('target');
        }
        return node;
    }
}

Quill.register(MyLink);

Quill.register("modules/htmlEditButton", htmlEditButton);

function handleServiceDocUpload(vue, files) {
    files.forEach(f => {
        if (f instanceof File) {
            loadingShow();
            vue.loadingTableData = true;

            let formData = new FormData();
            formData.append('file', f);
            axios.post('/AttachedDocument/UploadFile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then(function (response) {
                    vue.Service.Files.push(response.data.ResultData);

                    makeServerCall('POST', '/ContentManagement/Services/SubmitService', { model: vue.Service }, (ServiceData) => {
                        vue.files = [];
                        //makeServerCall('POST', '/AttachedDocument/GetAttachedDocumentsDetails', ServiceData.Files, (ResultDataAttachments) => {
                        makeServerCall('POST', '/AttachedDocument/GetAttachedDocumentDetails', { attDocumentGUID: response.data.ResultData }, (ResultDataAttachment) => {
                            let fileInf = ResultDataAttachment;
                            fileInf.FileSize = fileInf.FileSize / 1000 + 'KB';
                            vue.filesInfo.push(fileInf);
                            //vue.filesInfo = ResultDataAttachments;
                        });
                    })
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
                    vue.loadingTableData = false;
                });;
        }
        else {
            //prevent falsly triggering of uplaod
            return;
        }
    });
}

function loadServiceDetails(vue) {
    makeServerCall('POST', '/Services/GetServiceDetails', { id: vue.serviceGuid }, (ResultData) => {
        vue.Service = ResultData;
        vue.loadedData.push(true);

        vue.loadingTableData = true;
        makeServerCall('POST', '/AttachedDocument/GetAttachedDocumentsDetails', ResultData.Files, (result) => {
            vue.filesInfo = result;
            vue.loadingTableData = false;
        });
    });
}

function copyStringToClipboard(str) {
    // Create new element
    var el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = str;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = { position: 'absolute', left: '-9999px' };
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
    promptInfo();
}

function promptInfo() {
    iziToast.info({
        timeout: 2000,
        close: false,
        displayMode: 'once',
        closeOnEscape: true,
        transitionIn: 'flipInX',
        transitionOut: 'flipOutX',
        id: 'info',
        zindex: 1000,
        title: 'Линка е копиран',
        position: 'center'
    });
}