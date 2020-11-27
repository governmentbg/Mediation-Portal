"use strict"

class ModifyOrganizationForm {
    constructor() {
        this.GUID;
        this.FormStatusGUID = eApplicationFormStatus.Draft;
        this.FormStatusName;
        this.InternalNumber;
        this.IncomingNumber;
        this.ApplicantUserId;
        this.CorrectingApplicationGUID;
        this.CorrectiveToApplicationFormGUID;
        this.CorrectiveToApplicationFormInternalNumber;

        this.ModifiedOrganizationGuid = null;

        this.OrganizationName = '';
        this.OrganizationEIK = '';
        this.CourtRegistration = '';

        this.OrganizationRepresentatives = []; //Person

        this.RegistrationAddress = new FullAddress();

        this.MailingAddress = new FullAddress();

        this.OrganizationContact = new Contact();

        this.Documents = [];  //AttachedDocument
    }
}