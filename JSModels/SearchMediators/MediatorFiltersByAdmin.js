"use strict"

class MediatorFiltersAdmin {
    constructor() {
        // General information filters
        this.FullName = '';
        this.EGN = '';
        this.DateCreatedFrom = '';
        this.DateCreatedTo = '';
        this.RegistrationNumber = '';

        // Contact filters
        this.MediatorContact = '';
        this.MediatorEmail = '';
        this.MediatorFullAddress = new FullAddress();

        // Education filters
        this.MediatorEducation = new Education();
        this.MediatorForeignLanguages = [];        // Чужди езици
        this.MediatorSpecializations = [];         // Специализации

        // Additional information filters
        this.MediatorStatus = EmptyGuid;
        this.OrganizationMembership = EmptyGuid;

        // internal system filters
        this.HasInternalNumber = '';
    }
}