"use strict"

class RegisterOrganizationForm {
    constructor() {
        this.GUID;

        this.FormStatusGUID = eApplicationFormStatus.Draft;
        this.FormStatusName;
        this.InternalNumber;
        this.IncomingNumber;
        this.CorrectiveToApplicationFormGUID;
        this.ApplicantUserId;

        this.OrganizationName = '';
        this.OrganizationEIK = '';
        this.CourtRegistration = '';

        this.OrganizationRepresentatives = []; //Person

        this.RegistrationAddress = new FullAddress();

        this.MailingAddress = new FullAddress();

        this.OrganizationContact = new Contact();

        this.Documents = [];  //AttachedDocument

        this.IsPaid = false;
        this.PaymentDescription = '';
    }
}