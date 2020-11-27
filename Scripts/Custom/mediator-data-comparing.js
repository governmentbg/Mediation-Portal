
/// Main comparing function
function CompareMediatorData(vue) {
    var med = vue.ModifiedMediator;
    var form = vue.Form;

    console.log("MED = ");
    console.log(med);

    console.log("form = ");
    console.log(form)
    var result = [];

    if (med !== null) {
        var originalPermanentMunicipalityGUID = med.PermanentAddress.MunicipalityGUID;
        var originalPermanentSettlementGUID = med.PermanentAddress.SettlementGUID;
        var originalPermanentMunicipalities = [];
        var originalPermanentSettlements = [];
        var originalCurrentMunicipalityGUID = med.CurrentAddress.MunicipalityGUID;
        var originalCurrentSettlementGUID = med.CurrentAddress.SettlementGUID;
        var originalCurrentMunicipalities = [];
        var originalCurrentSettlements = [];
        var originalMailingMunicipalityGUID = med.MailingAddress.MunicipalityGUID;
        var originalMailingSettlementGUID = med.MailingAddress.SettlementGUID;
        var originalMailingMunicipalities = [];
        var originalMailingSettlements = [];
    }

    if (form !== null) {
        var newPermanentMunicipalityGUID = form.PermanentAddress.MunicipalityGUID;
        var newPermanentSettlementGuid = form.PermanentAddress.SettlementGUID;
        var newCurrentMunicipalityGUID = form.CurrentAddress.MunicipalityGUID;
        var newCurrentSettlementGUID = form.CurrentAddress.SettlementGUID;
        var newMailingMunicipalityGUID = form.MailingAddress.MunicipalityGUID;
        var newMailingSettlementGUID = form.MailingAddress.SettlementGUID;
    }

    if (med !== null && form !== null) {

        if (originalPermanentMunicipalityGUID !== newPermanentMunicipalityGUID && originalPermanentMunicipalityGUID !== null && newPermanentMunicipalityGUID !== null) {

            localMunicipalitiesHandler(med.PermanentAddress.DistrictGUID).then((res) => originalPermanentMunicipalities = res.data.ResultData);

            if (originalPermanentSettlementGUID !== null && newPermanentSettlementGuid !== null) {
                localSettlementsHandler(originalPermanentMunicipalityGUID).then((res) => originalPermanentSettlements = res.data.ResultData);
            }
        }

        if (originalCurrentMunicipalityGUID !== newCurrentMunicipalityGUID && originalCurrentMunicipalityGUID !== null && newCurrentMunicipalityGUID !== null) {

            localMunicipalitiesHandler(med.CurrentAddress.DistrictGUID).then((res) => originalCurrentMunicipalities = res.data.ResultData);

            if (originalCurrentSettlementGUID !== null && newCurrentSettlementGUID !== null) {
                localSettlementsHandler(originalCurrentMunicipalityGUID).then((res) => originalCurrentSettlements = res.data.ResultData);
            }
        }

        if (originalMailingMunicipalityGUID !== newMailingMunicipalityGUID && originalMailingMunicipalityGUID !== null && newMailingMunicipalityGUID !== null) {

            localMunicipalitiesHandler(med.MailingAddress.DistrictGUID).then((res) => originalMailingMunicipalities = res.data.ResultData);

            if (originalMailingSettlementGUID !== null && newMailingSettlementGUID !== null) {
                localSettlementsHandler(originalMailingMunicipalityGUID).then((res) => originalMailingSettlements = res.data.ResultData);
            }
        }
    }

    if (!med) return;

    //name
    if (med.PersonInfo.FirstName !== form.PersonInfo.FirstName)
        result.push(ChangeMsg("Име", med.PersonInfo.FirstName, form.PersonInfo.FirstName));

    //middle
    if (med.PersonInfo.MiddleName !== form.PersonInfo.MiddleName)
        result.push(ChangeMsg("Презиме", med.PersonInfo.MiddleName, form.PersonInfo.MiddleName));
    //last
    if (med.PersonInfo.LastName !== form.PersonInfo.LastName)
        result.push(ChangeMsg("Фамилия", med.PersonInfo.LastName, form.PersonInfo.LastName));
    //egn

    //citizenship
    if (!isEqArrays(med.Citizenships, form.Citizenships))
        result.push(ChangeMsg("Гражданство(a)", KeysArrayToValues(med.Citizenships, vue.citizenships), KeysArrayToValues(form.Citizenships, vue.citizenships)));

    //landline
    if (med.ContactInfo.LandlinePhone !== form.ContactInfo.LandlinePhone)
        result.push(ChangeMsg("Стац. телефон", med.ContactInfo.LandlinePhone, form.ContactInfo.LandlinePhone));

    //mob phone
    if (med.ContactInfo.MobilePhone !== form.ContactInfo.MobilePhone)
        result.push(ChangeMsg("Моб. телефон", med.ContactInfo.MobilePhone, form.ContactInfo.MobilePhone));

    //mail
    if (med.ContactInfo.Email !== form.ContactInfo.Email)
        result.push(ChangeMsg("Електронна поща", med.ContactInfo.Email, form.ContactInfo.Email));

    //perm address *
    if (med.PermanentAddress.CountryGUID !== form.PermanentAddress.CountryGUID)
        result.push(ChangeMsg("Постоянен адрес: Държава", KeyToValue(med.PermanentAddress.CountryGUID, vue.PermanentAddress.countries), KeyToValue(form.PermanentAddress.CountryGUID, vue.PermanentAddress.countries)));

    if (med.PermanentAddress.DistrictGUID !== form.PermanentAddress.DistrictGUID)
        result.push(ChangeMsg("Постоянен адрес: Област", KeyToValue(med.PermanentAddress.DistrictGUID, vue.PermanentAddress.districts), KeyToValue(form.PermanentAddress.DistrictGUID, vue.PermanentAddress.districts)));

    setTimeout(function () {
        if (med.PermanentAddress.MunicipalityGUID !== form.PermanentAddress.MunicipalityGUID)
            result.push(ChangeMsg("Постоянен адрес: Община", KeyToValue(originalPermanentMunicipalityGUID, originalPermanentMunicipalities), KeyToValue(form.PermanentAddress.MunicipalityGUID, vue.PermanentAddress.municipalities)));

        if (med.PermanentAddress.SettlementGUID !== form.PermanentAddress.SettlementGUID)
            result.push(ChangeMsg("Постоянен адрес: Населеномясто", KeyToValue(originalPermanentSettlementGUID, originalPermanentSettlements), KeyToValue(form.PermanentAddress.SettlementGUID, vue.PermanentAddress.settlements)));

        console.log("result");
        console.log(result)
    }, 1000)

    if (med.PermanentAddress.Address !== form.PermanentAddress.Address)
        result.push(ChangeMsg("Постоянен адрес: Адрес", med.PermanentAddress.Address, form.PermanentAddress.Address));

    //curr address *
    if (med.CurrentAddress.CountryGUID !== form.CurrentAddress.CountryGUID)
        result.push(ChangeMsg("Настоящ адрес: Държава", KeyToValue(med.CurrentAddress.CountryGUID, vue.CurrentAddress.countries), KeyToValue(form.CurrentAddress.CountryGUID, vue.CurrentAddress.countries)));

    if (med.CurrentAddress.DistrictGUID !== form.CurrentAddress.DistrictGUID)
        result.push(ChangeMsg("Настоящ адрес: Област", KeyToValue(med.CurrentAddress.DistrictGUID, vue.CurrentAddress.districts), KeyToValue(form.CurrentAddress.DistrictGUID, vue.CurrentAddress.districts)));

    setTimeout(function () {
        if (med.CurrentAddress.MunicipalityGUID !== form.CurrentAddress.MunicipalityGUID)
            result.push(ChangeMsg("Настоящ адрес: Община", KeyToValue(originalCurrentMunicipalityGUID, originalCurrentMunicipalities), KeyToValue(form.CurrentAddress.MunicipalityGUID, vue.CurrentAddress.municipalities)));

        if (med.CurrentAddress.SettlementGUID !== form.CurrentAddress.SettlementGUID)
            result.push(ChangeMsg("Настоящ адрес: Населеномясто", KeyToValue(originalCurrentSettlementGUID, originalCurrentSettlements), KeyToValue(form.CurrentAddress.SettlementGUID, vue.CurrentAddress.settlements)));

    }, 1000)

    if (med.CurrentAddress.Address !== form.CurrentAddress.Address)
        result.push(ChangeMsg("Настоящ адрес: Адрес", med.CurrentAddress.Address, form.CurrentAddress.Address));

    //mailing address *
    if (med.MailingAddress.CountryGUID !== form.MailingAddress.CountryGUID)
        result.push(ChangeMsg("Адрес кореспонденция: Държава", KeyToValue(med.MailingAddress.CountryGUID, vue.MailingAddress.countries), KeyToValue(form.MailingAddress.CountryGUID, vue.MailingAddress.countries)));

    if (med.MailingAddress.DistrictGUID !== form.MailingAddress.DistrictGUID)
        result.push(ChangeMsg("Адрес кореспонденция: Област", KeyToValue(med.MailingAddress.DistrictGUID, vue.MailingAddress.districts), KeyToValue(form.MailingAddress.DistrictGUID, vue.MailingAddress.districts)));

    setTimeout(function () {
        if (med.MailingAddress.MunicipalityGUID !== form.MailingAddress.MunicipalityGUID)
            result.push(ChangeMsg("Адрес кореспонденция: Община", KeyToValue(originalMailingMunicipalityGUID, originalMailingMunicipalities), KeyToValue(form.MailingAddress.MunicipalityGUID, vue.MailingAddress.municipalities)));

        if (med.MailingAddress.SettlementGUID !== form.MailingAddress.SettlementGUID)
            result.push(ChangeMsg("Адрес кореспонденция: Населеномясто", KeyToValue(originalMailingSettlementGUID, originalMailingSettlements), KeyToValue(form.MailingAddress.SettlementGUID, vue.MailingAddress.settlements)));

    }, 1000)

    if (med.MailingAddress.Address !== form.MailingAddress.Address)
        result.push(ChangeMsg("Адрес кореспонденция: Адрес", med.MailingAddress.Address, form.MailingAddress.Address));


    for (var i = 0; i < med.Educations.length; i++) {
        var hasMedMatch = form.Educations.filter(x =>
            x.EducationDegreeGUID === med.Educations[i].EducationDegreeGUID &&
            x.EducationFieldGUID === med.Educations[i].EducationFieldGUID &&
            x.ProfessionalDirectionGUID === med.Educations[i].ProfessionalDirectionGUID);

        if (hasMedMatch.length === 0) {

            let message =
                KeyToValue(med.Educations[i].EducationDegreeGUID, vue.educationDegrees)
                + "/" +
                KeyToValue(med.Educations[i].EducationFieldGUID, vue.educationFields)
                + "/" +
                KeyToValue(med.Educations[i].ProfessionalDirectionGUID, vue.professionalDirectionsLocal);

            result.push("Добвавено образование: <b>" + message + '<b/>');
        }

    }


    for (var formEducation = 0; formEducation < form.Educations.length; formEducation++) {

        var hasFromMatch = med.Educations.filter(x =>
            x.EducationDegreeGUID === form.Educations[formEducation].EducationDegreeGUID &&
            x.EducationFieldGUID === form.Educations[formEducation].EducationFieldGUID &&
            x.ProfessionalDirectionGUID === form.Educations[formEducation].ProfessionalDirectionGUID);

        if (hasFromMatch.length === 0) {

            let message =
                KeyToValue(form.Educations[formEducation].EducationDegreeGUID, vue.educationDegrees)
                + "/" +
                KeyToValue(form.Educations[formEducation].EducationFieldGUID, vue.educationFields)
                + "/" +
                KeyToValue(form.Educations[formEducation].ProfessionalDirectionGUID, vue.professionalDirectionsLocal);

            result.push("Премахнато образование: <b>" + message + '<b/>');
        }
    }

    //professions
    if (!isEqArrays(med.Professions, form.Professions))
        result.push(ChangeMsg("Професия", KeysArrayToValues(med.Professions, vue.professions), KeysArrayToValues(form.Professions, vue.professions)));


    //foreign language
    if (!isEqArrays(med.ForeignLanguages, form.ForeignLanguages))
        result.push(ChangeMsg("Чужди езици", KeysArrayToValues(med.ForeignLanguages, vue.foreignLanguages), KeysArrayToValues(form.ForeignLanguages, vue.foreignLanguages)));

    //training organization
    if (med.TrainingOrganizationGUID !== form.TrainingOrganizationGUID)
        result.push(ChangeMsg("Обучителна организация", KeyToValue(med.TrainingOrganizationGUID, vue.organizations), KeyToValue(form.TrainingOrganizationGUID, vue.organizations)));

    //org membership
    if (!isEqArrays(med.OrganizationMemberships, form.OrganizationMemberships))
        result.push(ChangeMsg("Членство в организации", med.OrganizationMemberships.join(', '), form.OrganizationMemberships.join(', ')));

    //specializations
    if (!isEqArrays(med.Specializations, form.Specializations))
        result.push(ChangeMsg("Допълнителна специализация в областта на медиацията", KeysArrayToValues(med.Specializations, vue.specializations), KeysArrayToValues(form.Specializations, vue.specializations)));

    //additional qualifications
    if (!isEqArrays(med.AdditionalQualifications, form.AdditionalQualifications))
        result.push(ChangeMsg("Допълнителна квалификация", med.AdditionalQualifications.join(', '), form.AdditionalQualifications.join(', ')));

    //documents*
    if (!isEqArrays(med.AdditionalQualifications, form.AdditionalQualifications))
        result.push(ChangeMsg("Допълнителна квалификация", med.AdditionalQualifications.join(', '), form.AdditionalQualifications.join(', ')));

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
    var el = nomenclature.find(x => x.Key ? x.Key === key : x.GUID === key);
    if (el) {
        if (el.Value) {
            return el.Value
        } else if (el.Name) {
            return el.Name
        } else {
            return '';
        }
    } else {
        return '';
    }
}

function localMunicipalitiesHandler(districtGUID) {
    return axios.get('/MetaData/GetMunicipalities', { params: { districtGUID: districtGUID } });
}

function localSettlementsHandler(municipalityGUID) {
    return axios.get('/MetaData/GetSettlements', { params: { municipalityGUID: municipalityGUID } });
}