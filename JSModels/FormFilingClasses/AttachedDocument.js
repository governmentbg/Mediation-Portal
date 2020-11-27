"use strict";

class AttachedDocument {
    constructor() {
        this.GUID;
        this.AttachedDocumentTypeGUID = null;
        this.AttachmentTypeName;
        this.Key; //Guid for easily tracking which container element to which attached document belongs
    }
}