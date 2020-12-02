"use strict";

class MediatorForm {
    constructor() {
        //common
        this.GUID;

        this.PersonInfo = new Person();

        this.PermanentAddress = new FullAddress();
        this.CurrentAddress = new FullAddress();
        this.MailingAddress = new FullAddress();

        this.ContactInfo = new Contact();
        this.TrainingOrganizationGUID = null;
        this.Citizenships = []; //Guid list
        this.Educations = [];  //List
        this.Professions = [];  //List
        this.ForeignLanguages = []; //Guid list
        this.Specializations = []; //Guid list
        this.OrganizationMemberships = []; //string list
        this.AdditionalQualifications = []; //string list
    }
}