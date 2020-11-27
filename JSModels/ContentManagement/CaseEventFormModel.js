"use strict";

class CaseEventFormModel {
    constructor() {

        // for mailing participants
        this.CaseGuid = null;

        // model properties for saving event
        this.GUID = null;
        this.TypeGUID = null;
        this.StartDate = null;
        this.EndDate = null;
        this.Description = null;
        this.Notes = null;
        this.Duration = null;
        this.EventNotes = null;
        this.CaseThirdPerson = [];
        this.CaseParticipants = [];
        this.Documents = []; // this shoud have array of documents bytes which will be attached to event
    }
}
