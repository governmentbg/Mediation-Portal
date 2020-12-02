"use strict";

class AttachedDocumentContainer {
    constructor() {
        this.AttachedDocumentTypeGUID;
        this.AttachmentTypeName;
        this.AttachedDocumentGUID;
        this.IsMandatory = false;
        this.HasFile = false;
        this.FileInfo = null;
        this.UserAdded = false; //if the user has added this attachment row with "+ Добави документ"
        this.Key; //random string for easily tracking which container element to which attached document belongs
    }
}

function handleFileUplaod(vue, file, attContainer) {
    loadingShow();
    let formData = new FormData();
    formData.append('file', file);
    //upload the file and get the GUID by which it's inserted in the DB
    axios.post('/AttachedDocument/UploadFile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(function (response) {
            let result = response.data;

            if (result.Type === ResultType.Success) {
                //attDocGUID is already present when the user is changing an already uploaded file 
                var attIndex = vue.Form.Documents.findIndex(x => x.Key === attContainer.Key);
                //if the attachments object is not added in the form
                if (attIndex === -1) {
                    //add the file and fileType Guids to the Form object
                    var doc = new AttachedDocument();
                    doc.GUID = response.data.ResultData;
                    doc.AttachedDocumentTypeGUID = attContainer.AttachedDocumentTypeGUID;
                    doc.AttachmentTypeName = attContainer.AttachmentTypeName;
                    doc.Key = attContainer.Key
                    vue.Form.Documents.push(doc);
                }
                else {
                    //update the file Guid
                    vue.Form.Documents[attIndex].GUID = response.data.ResultData;
                }

                //add the info to the container entry
                var containerIndex = vue.attachedDocumentConteiners.findIndex(x => x.Key === attContainer.Key);
                vue.attachedDocumentConteiners[containerIndex].AttachedDocumentGUID = response.data.ResultData;
                vue.attachedDocumentConteiners[containerIndex].HasFile = true;
                vue.attachedDocumentConteiners[containerIndex].FileInfo = { size: file.size, name: file.name };
            }
            else {
                iziToast.error({
                    layout: 2,
                    title: response.data.Message,
                    message: result.AdditionalMessages ? result.AdditionalMessages.join("<br/>") : ""
                });
                console.warn(response.data.ResultData);
            }
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
        });
}

function handleFileClear(vue, attContainer) {
    //find the attachment element in the Form attachments array using the attachment type guid
    var attIndex = vue.Form.Documents.findIndex(x => x.Key === attContainer.Key);

    if (attIndex !== -1) {
        //remove it from the attachments array
        vue.Form.Documents.splice(attIndex, 1);

    }
    else {
        console.warn("The file has been already removed")
    }

    //remove the info from the container entry
    var containerIndex = vue.attachedDocumentConteiners.findIndex(x => x.Key === attContainer.Key);
    vue.attachedDocumentConteiners[containerIndex].AttachedDocumentGUID = null;
    vue.attachedDocumentConteiners[containerIndex].HasFile = false;
    vue.attachedDocumentConteiners[containerIndex].FileInfo = null;
}

function loadAttachmentsAndTypes(vue, formType) {
    // formType - Controller name RegisterMediator, ModifyMediator, etc.
    makeServerCall('GET', '/FormFiling/' + formType + '/GetRequiredAttachmentTypes', null, (ResultData) => {
        var requiredAttachmentTypes = ResultData;

        /// fill in the container list with the required attachment types
        requiredAttachmentTypes.forEach(function (req) {
            var container = new AttachedDocumentContainer();
            container.AttachedDocumentTypeGUID = req.AttachedDocumentTypeGUID;
            container.AttachedDocumentGUID = null;
            container.IsMandatory = req.Mandatory;
            container.AttachmentTypeName = req.AttachmentTypeName;
            container.HasFile = false;
            container.FileInfo = null;
            container.Key = Math.random().toString(36).substr(2, 9); //put a random key to track between container and Form.Document

            vue.attachedDocumentConteiners.push(container);
        });

        //if it's an edit or preview form, load the already attached files and put them in their proper container
        if (vue.page !== "CREATE") {
            //foreach already attached doc
            vue.Form.Documents.forEach(function (doc) {

                //find the attachment element in the Form attachments array using the attachment type guid, which is not yet occupied (no File)
                var containerIndex = vue.attachedDocumentConteiners.findIndex(x => x.AttachedDocumentTypeGUID === doc.AttachedDocumentTypeGUID && !x.HasFile);

                //if it doesn't exist it means that there is already an attachment the type of which is no longer in the list of required document. 
                //So we have to add it in the container list
                if (containerIndex === -1) {
                    var container = new AttachedDocumentContainer();
                    container.AttachedDocumentTypeGUID = doc.AttachedDocumentTypeGUID;
                    container.AttachedDocumentGUID = doc.GUID;
                    container.IsMandatory = false;
                    container.AttachmentTypeName = doc.AttachmentTypeName;
                    container.UserAdded = true;
                    container.Key = Math.random().toString(36).substr(2, 9); //put a random key to track between container and Form.Document
                    vue.attachedDocumentConteiners.push(container);
                    //get it now again
                    containerIndex = vue.attachedDocumentConteiners.findIndex(x => x.Key === container.Key);
                }

                //link the Keys
                doc.Key = vue.attachedDocumentConteiners[containerIndex].Key;
                vue.attachedDocumentConteiners[containerIndex].HasFile = true;

                //get the info of the attached file
                makeServerCall('GET', '/AttachedDocument/GetAttachedDocumentDetails?attDocumentGUID=' + doc.GUID, null, (ResultData) => {
                    //set the details of the container
                    vue.attachedDocumentConteiners[containerIndex].FileInfo = { size: ResultData.FileSize, name: ResultData.FileName };
                    vue.attachedDocumentConteiners[containerIndex].AttachedDocumentGUID = doc.GUID;
                });
            });
        }

        vue.loadedData.push(true);
    });
}


function handleAddAttachmentContainer(vue) {
    var container = new AttachedDocumentContainer();

    container.AttachedDocumentTypeGUID = null;
    container.AttachmentTypeName = null;
    container.AttachedDocumentGUID = null;
    container.IsMandatory = false;
    container.HasFile = false;
    container.FileInfo = null;
    container.UserAdded = true;
    container.Key = Math.random().toString(36).substr(2, 9); //put a random key to track between container and Form.Document

    vue.attachedDocumentConteiners.push(container);
}
