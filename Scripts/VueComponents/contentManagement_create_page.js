"use strict";

Vue.component('contentManagementCreatePage', {
    components: {
        quillEditor: VueQuillEditor.quillEditor
    },
    data() {
        return {
            Page: null,  //new MenuDefinition()
            files: [],
            filesInfo: [],

            loading: true,
            loadedData: [],
            loadingTableData: false,
            page: window.location.pathname.split('/').pop().toUpperCase(),
            pageGuid: window.location.pathname.split('/').pop().toUpperCase(),

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
            noms: {
                status: [
                    { text: "Да", value: true },
                    { text: "Не", value: false }
                ]
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

        loadPageContent(vue);
    },
    methods: {
        submitPage() {
            let vue = this;
            this.Page.PageHeader = this.Page.MenuLabel;
            makeServerCall('POST', '/ContentManagement/Pages/SubmitPage', { page: this.Page }, (ResultData) => {
                if (vue.page === 'CREATE') {
                    setTimeout(function () {
                        location.href = '/ContentManagement/Pages/Edit/' + ResultData.Id;
                    }, 2000)
                }
            }, true);
        },
        onFileChange(files) {
            if (files && files.length > 0) {
                handleUpload(this, files);
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
            makeServerCall('POST', '/ContentManagement/Pages/DeletePageFile', { pageGuid: this.Page.Id, attachmentGuid: this.deleteDialog.id }, (ResultData) => {
                vue.Page.UploadedFiles = ResultData.UploadedFiles;

                makeServerCall('POST', '/AttachedDocument/GetAttachedDocumentsDetails', vue.Page.UploadedFiles, (result) => {
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
        }
    }
});

Quill.register("modules/htmlEditButton", htmlEditButton);

function loadPageContent(vue) {
    if (vue.page === 'CREATE') {
        vue.Page = new MenuDefinition();

        getNewGuid().then((guid) => {
            vue.loadedData.push(true);

            vue.Page.Id = guid.data;
            vue.Page.URL = '';
            vue.Page.Level = 1;
            vue.Page.ParentGUID = guid.data;
            vue.Page.IsGloballyVisible = true;
            vue.Page.RowNumber = null;
            vue.Page.IsHidden = true;
            vue.Page.IsSystemPage = false;
            vue.Page.Is_Active = true;
        });
    } else { //EDIT
        makeServerCall('GET', '/ContentManagement/Pages/GetPageData/' + vue.pageGuid, null, (ResultData) => {
            vue.Page = Object.assign(new MenuDefinition(), ResultData);
            vue.loadedData.push(true);

            vue.loadingTableData = true;
            makeServerCall('POST', '/AttachedDocument/GetAttachedDocumentsDetails', ResultData.UploadedFiles, (result) => {
                vue.filesInfo = result;
                vue.loadingTableData = false;
            });
        });
    }
}

function handleUpload(vue, files) {
    files.forEach(f => {
        if (f instanceof File) {
            loadingShow();
            vue.loadingTableData = true;
            let formData = new FormData();
            formData.append('file', f);
            axios.post('/AttachedDocument/UploadFile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then(function (response) {
                    vue.Page.UploadedFiles.push(response.data.ResultData);

                    vue.Page.PageHeader = vue.Page.MenuLabel;
                    makeServerCall('POST', '/ContentManagement/Pages/SubmitPage', { page: vue.Page }, (ResultData) => {
                        vue.files = [];
                        makeServerCall('POST', '/AttachedDocument/GetAttachedDocumentsDetails', ResultData.UploadedFiles, (ResultDataAttachments) => {
                            //let fileInf = ResultDataAttachments;
                            //fileInf.FileSize = fileInf.FileSize / 1000 + 'KB';
                            //vue.filesInfo.push(fileInf);
                            vue.filesInfo = ResultDataAttachments;
                        });
                    }, true);
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