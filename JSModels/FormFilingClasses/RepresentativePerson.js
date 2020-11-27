"use strict";

class RepresentativePerson {
    constructor() {
        this.AccessToken = null;
        this.FirstName = null;
        this.MiddleName = null;
        this.LastName = null;
        this.EGN = null;
        this.Email = null;
        this.MobilePhone = null;
        this.FullAddress = new FullAddress(); // this will be either filled from the form or created as new in initiate mediation create form


        //business logic
        this.isRepresenting = false;
        this.isConfirmed = null;
    }
}