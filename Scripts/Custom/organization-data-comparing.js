/// Main comparing function
function CompareOrganizationData(vue) {
    let org = vue.ModifiedOrganization;
    let form = vue.Form;
    let result = [];
    let attachedAdditionalDocs = vue.attachedDocumentConteiners;

    if (!org) return;

    //name
    if (org.OrganizationName !== form.OrganizationName)
        result.push(ChangeMsg("Име", org.OrganizationName, form.OrganizationName))

    //landline
    if (org.OrganizationContact.LandlinePhone !== form.OrganizationContact.LandlinePhone)
        result.push(ChangeMsg("Стац. телефон", org.OrganizationContact.LandlinePhone, form.OrganizationContact.LandlinePhone));

    //mob phone
    if (org.OrganizationContact.MobilePhone !== form.OrganizationContact.MobilePhone)
        result.push(ChangeMsg("Моб. телефон", org.OrganizationContact.MobilePhone, form.OrganizationContact.MobilePhone));

    //mail
    if (org.OrganizationContact.Email !== form.OrganizationContact.Email)
        result.push(ChangeMsg("Електронна поща", org.OrganizationContact.Email, form.OrganizationContact.Email));

    //fax
    if (org.OrganizationContact.Fax !== form.OrganizationContact.Fax)
        result.push(ChangeMsg("Факс", org.OrganizationContact.Fax, form.OrganizationContact.Fax));

    //reg address *
    if (org.RegistrationAddress.CountryGUID !== form.RegistrationAddress.CountryGUID)
        result.push(ChangeMsg("Адрес по регистрация: Държава", KeyToValue(org.RegistrationAddress.CountryGUID, vue.RegistrationAddressData.countries), KeyToValue(form.RegistrationAddress.CountryGUID, vue.RegistrationAddressData.countries)));

    if (org.RegistrationAddress.DistrictGUID !== form.RegistrationAddress.DistrictGUID)
        result.push(ChangeMsg("Адрес по регистрация: Област", KeyToValue(org.RegistrationAddress.DistrictGUID, vue.RegistrationAddressData.districts), KeyToValue(form.RegistrationAddress.DistrictGUID, vue.RegistrationAddressData.districts)));

    if (org.RegistrationAddress.MunicipalityGUID !== form.RegistrationAddress.MunicipalityGUID)
        result.push(ChangeMsg("Адрес по регистрация: Община", KeyToValue(org.RegistrationAddress.MunicipalityGUID, vue.RegistrationAddressData.municipalities), KeyToValue(form.RegistrationAddress.MunicipalityGUID, vue.RegistrationAddressData.municipalities)));

    if (org.RegistrationAddress.SettlementGUID !== form.RegistrationAddress.SettlementGUID)
        result.push(ChangeMsg("Адрес по регистрация: Населеномясто", KeyToValue(org.RegistrationAddress.SettlementGUID, vue.RegistrationAddressData.settlements), KeyToValue(form.RegistrationAddress.SettlementGUID, vue.RegistrationAddressData.settlements)));

    if (org.RegistrationAddress.Address !== form.RegistrationAddress.Address)
        result.push(ChangeMsg("Адрес по регистрация: Адрес", org.RegistrationAddress.Address, form.RegistrationAddress.Address));

    //mailing address *
    if (org.MailingAddress.CountryGUID !== form.MailingAddress.CountryGUID)
        result.push(ChangeMsg("Адрес на осъществяване на дейността: Държава", KeyToValue(org.MailingAddress.CountryGUID, vue.MailingAddressData.countries), KeyToValue(form.MailingAddress.CountryGUID, vue.MailingAddresssData.countries)));

    if (org.MailingAddress.DistrictGUID !== form.MailingAddress.DistrictGUID)
        result.push(ChangeMsg("Адрес на осъществяване на дейността: Област", KeyToValue(org.MailingAddress.DistrictGUID, vue.MailingAddressData.districts), KeyToValue(form.MailingAddress.DistrictGUID, vue.MailingAddressData.districts)));

    if (org.MailingAddress.MunicipalityGUID !== form.MailingAddress.MunicipalityGUID)
        result.push(ChangeMsg("Адрес на осъществяване на дейността: Община", KeyToValue(org.MailingAddress.MunicipalityGUID, vue.MailingAddressData.municipalities), KeyToValue(form.MailingAddress.MunicipalityGUID, vue.MailingAddressData.municipalities)));

    if (org.MailingAddress.SettlementGUID !== form.MailingAddress.SettlementGUID)
        result.push(ChangeMsg("Адрес на осъществяване на дейността: Населеномясто", KeyToValue(org.MailingAddress.SettlementGUID, vue.MailingAddressData.settlements), KeyToValue(form.MailingAddress.SettlementGUID, vue.MailingAddressData.settlements)));

    if (org.MailingAddress.Address !== form.MailingAddress.Address)
        result.push(ChangeMsg("Адрес на осъществяване на дейността: Адрес", org.MailingAddress.Address, form.MailingAddress.Address));

    ///Representative
    if (!isEqArrays(org.OrganizationRepresentatives, form.OrganizationRepresentatives))
        result.push(ChangeMsg("Представители", org.OrganizationRepresentatives.map(x => `${x.FirstName} ${x.MiddleName} ${x.LastName}`).join(', '),
            form.OrganizationRepresentatives.map(x => `${x.FirstName} ${x.MiddleName} ${x.LastName}`).join(', ')));

    ///Documents
    if (!isEqArrays(org.Documents, form.Documents))
        result.push(ChangeMsg("Документи", org.Documents.map(x => x.AttachmentTypeName).join(', '), form.Documents.map(x => x.AttachmentTypeName).join(', ')));

    vue.CompareMsg = result;
}

/// Assemble comparison result message line
function ChangeMsg(prop, before, now) {
    //console.log(before, now)
    if (!before || before === '') before = 'N/A';
    if (!now || now === '') now = 'N/A';

    var msg;
    msg = prop + ": <b>" + before + "</b> → <b>" + now + "</b>";
    return msg;
}

/// Is element in array (used by isEqArrays)
function inArray(array, el) {
    for (var i = array.length; i--;) {
        if (array[i] === el) return true;
    }
    return false;
}

/// Are two arrays with the same content
function isEqArrays(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (var i = arr1.length; i--;) {
        if (!inArray(arr2, arr1[i])) {
            return false;
        }
    }
    return true;
}

/// Generate comma separated string of values from Guid Array
function KeysArrayToValues(keyArray, nomenclature) {
    var stringArray = [];
    keyArray.forEach((key) => {
        var el = nomenclature.find(x => x.Key === key);
        stringArray.push(el.Value)
    });
    return stringArray.join(', ');
}

/// get the value from a nomenclature by key
function KeyToValue(key, nomenclature) {
    var el = nomenclature.find(x => x.Key === key);
    return el ? el.Value : '';
}