"use strict";

class FullAddress {
    constructor() {
        this.CountryGUID = BULGARIA_GUID; //Bulgaria by default
        this.DistrictGUID = EmptyGuid;
        this.MunicipalityGUID = EmptyGuid;
        this.SettlementGUID = EmptyGuid;
        this.CountryName = null;
        this.DistrictName = null;
        this.MunicipalityName = null;
        this.SettlementName = null;
        this.Address = '';
    }
}