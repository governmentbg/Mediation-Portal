"use strict";

class MediationForm {
    constructor() {
        //main
        this.GUID;

        //common
        this.CaseNumber = null;
        this.CaseStatusGUID = eCaseFormStatus.Draft;
        this.CaseStatusName;
        this.DateCreated = null;
        this.CaseNumber = null;
        this.SubjectDisputeGUID;
        this.PrimaryMediatorGUID;

        //Workflow props
        this.RespondingPartyAccessTokenGUID;
        this.ApplicantSignedAgreement = false;
        this.RespondingPartySignedAgreement = false;
        this.ApplicantUserId;
        this.RespondingPartyUserId;
        this.MediatorFeesNotes = '';
        this.PrivacyDeclarationGUID = EmptyGuid;

        //Helping props
        this.ApplicantIsLegalEntity = false;
        this.RespondingPartyIsLegalEntity = false;
        this.MediatorFeesNotes = '';

        //MEDIATION SIDES
        //Object related with applicant and responding party if they are persons
        this.ApplicantInfo = new Person();
        this.RespondingPartyInfo = new Person();

        this.ApplicantContactInfo = new Contact();
        this.RespondingPartyContactInfo = new Contact();

        this.ApplicantMailingAddress = new FullAddress();
        this.RespondingPartyMailingAddress = new FullAddress();

        this.ApplicantCitizenships = ['6be5944d-1a8f-4797-a576-ece5274381b1']; //Guid list - Bulgarian citizenship by default
        this.RespondingPartyCitizenships = ['6be5944d-1a8f-4797-a576-ece5274381b1']; //Guid list - Bulgarian citizenship by default

        //Object related with applicant and responding party if they are legal entities
        this.ApplicantLegalEntity = new LegalEntity();
        this.RespondingPartyLegalEntity = new LegalEntity();
        //END OF MEDIATION SIDES

        //REPRESENTATIVE PARTY
        this.ApplicantRepresentativePerson = null;//new RepresentativePerson();
        this.RespondingPartyRepresentativePerson = null;//new RepresentativePerson();
    }
}