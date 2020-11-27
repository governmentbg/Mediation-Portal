"use strict";

Vue.component('contentManagementCreateInformation', {
    components: {
        quillEditor: VueQuillEditor.quillEditor
    },
    data() {
        return {
            Info: new Information(),
            files: [],
            filesInfo: [],

            loading: true,
            table: {
                data: [],
                loading: false,
                headers: [
                    { text: 'Име на файла', align: 'left', value: 'FileName', width: "10%" },
                    { text: 'Размер', align: 'left', value: 'FileSize', width: "15%" },
                    { text: 'Качен на', value: 'DateCreated', width: "10%" },
                    { text: 'Качен от', value: 'UserName', width: "10%" },
                    { text: '', value: null, width: "10%", align: 'center' },
                ],
            },
            loadedData: [],

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
                ],
                sections: []
            },
        }
    },
    created: function () {
        let vue = this;

        loadInfoContent(vue);
        loadSections(vue);
    },
    methods: {
        submitInfo() {
            makeServerCall('POST', '/ContentManagement/Information/SubmitInformation', { info: this.Info }, (ResultData) => {
                this.Info.DateCreated = ResultData.DateCreated;
                this.Author = ResultData.Author;
            }, true);
        },
        onFileChange(files) {
            if (files.length > 0) {
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
            let index1 = this.filesInfo.map(x => x.GUID).indexOf(fileGUID);
            this.filesInfo.splice(index1, 1);   //array for rendering the files to the user

            let index2 = this.Info.Files.indexOf(fileGUID)
            this.Info.Files.splice(index2, 1); //array carring info to db (file guid to info)
        }
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 2 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    }
});

Quill.register("modules/htmlEditButton", htmlEditButton);

function loadInfoContent(vue) {
    vue.Info = new Information();

    getNewGuid().then((guid) => {
        vue.Info.GUID = guid.data;
        vue.loadedData.push(true);
    });
}

function loadSections(vue){
    makeServerCall('GET', '/ContentManagement/Information/GetSections', null, function (ResultData) {
        vue.noms.sections = ResultData;
        vue.loadedData.push(true);
    })
}

function handleUpload(vue, files) {
    files.forEach(f => {
        if (f instanceof File) {
            loadingShow();
            vue.table.loading = true;

            let formData = new FormData();
            formData.append('file', f);
            axios.post('/AttachedDocument/UploadFile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then(function (response) {
                    vue.Info.Files.push(response.data.ResultData);

                    makeServerCall('POST', '/AttachedDocument/GetAttachedDocumentDetails', { attDocumentGUID: response.data.ResultData }, (ResultData) => {
                        let fileInf = ResultData;
                        fileInf.FileSize = fileInf.FileSize / 1000 + 'KB';
                        vue.filesInfo.push(fileInf);
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
                    vue.table.loading = false;
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