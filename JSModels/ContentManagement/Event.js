"use strict";

class Event {
    constructor() {
        this.type = -1;
        this.description = '';
        this.startDate = '';
        this.duration = '';
        this.participants = '';
        this.additionalParticipans = [];
        this.notes = '';
        this.eventNotes = '';
        this.eventAcceptedBy = [];
        this.status = 1;
        this.confirmation = 0;
        this.confirmationLabel = '';
        this.documents = []; // already uploade docs
        this.uploadDocuments = []; // to be added to db
    }
}
