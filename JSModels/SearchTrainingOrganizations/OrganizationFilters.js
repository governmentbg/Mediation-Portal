"use strict"

class OrganizationFilters {
    constructor() {
        //General information
        this.Name = '';
        this.EIK = '';
        this.Status = EmptyGuid;
        this.RegistrationNumber = '';
        this.DateCreatedFrom = '';
        this.DateCreatedTo = '';

        //Contacts
        this.OrganizationContacts = '';
        this.Email = '';
        this.OrgFullAddress = new FullAddress();
    }
}