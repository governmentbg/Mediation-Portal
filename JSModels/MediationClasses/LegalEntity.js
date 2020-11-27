"use strict";

class LegalEntity {
    constructor() {

        this.EntityName = null;
        this.EntityEIK = null;
        this.EntityCourtRegistration  = null;

        this.EntityAddress = new FullAddress();
        this.EntityContactInfo = new Contact();
    }
}