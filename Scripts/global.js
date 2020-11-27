/// enums and consts
var ResultType = {
    Success: 1,
    Error: 0,
    Exception: -1
};

var eApplicationFormStatus = {
    //Currently signing and payment is not implemented
    Draft: "014cbe0a-64fb-4d89-be04-891d4e3006dd", //Чернова
    Registered: "02e4a6a7-e86d-4e6c-8587-cd0c2b300546", //Регистрирано
    Removed: "eebddb3b-5bd8-4e3e-9376-513b0aaf08c5", //Заличаване
    RemovingApprovedByEmployee: "b587095f-5cb1-467d-99fb-552ac7b68cb1", //Заличаване одобрено от служител
    RemovingApprovedByMinister: "ab0b39d6-3de1-4e8b-a1e6-379dfe2c3f97", //Заличаване одобрено от Министър
    ApprovedByEmployee: "03e290b6-ddb6-4ab1-8100-51bb0b89e16e", //Одобрена от служител
    ForCorrection: "04467602-4070-4808-be68-a3b7adb01aaa", //За корекция
    Corrected: "0598aeae-7191-4989-bfa8-1eeffb97bca1", //Коригирана с ново заявление
    ApprovedByMinister: "06f56ad7-4fb6-4a25-bed7-781872e1348d", //Одобрен от Министър (за изпълнение)
    RejectedByMinister: "07e2a493-ddc6-49f4-bee8-ef000838b9f1", //Отказана от Министър
    Executed: "08f56ad7-4fb6-4a25-bed7-781872e1348d", //Изпълнена
    PendingPayment: "fc4584af-0a3e-4a56-bc1c-9ef4feccd996", //Очаква плащане
    CancelledProcedure: "27F0FC3C-76CA-444E-ACCD-FCD5448DDCCC", //Прекратено производство
};

var eApplicationFormType = {
    "99451B5A-7FA6-4410-8CED-4502806B27F3": '/FormFiling/RegisterMediator/Preview/',                //Заявление за вписване в Единния регистър на медиаторите
    "826ABBE0-173E-4B04-942E-4F5AE2FA1A8B": '/FormFiling/ModifyMediator/Preview/',                  //Заявление за промяна на вписаните обстоятелства за медиатор
    "F885944C-59D2-488E-9FCF-0BF9B5A00343": '/FormFiling/CancelMediator/Preview/',                  //Заявление за отписване на лице от Единния регистър на медиаторите
    "123C520A-E6F5-43BF-9BEC-E617B9E68313": '/FormFiling/RegisterTrainingOrganization/Preview/',    //Заявление за одобряване на организации за обучение на медиатори
    "34FE56BB-8B7A-4D0D-ACFB-DD868E9C0C31": '/FormFiling/ModifyTrainingOrganization/Preview/',      //Заявление за промяна на обстоятелства за организация за обучение на медиатори и одобрените към нея обучители
    "F9CF2D7F-FAC2-493E-BD52-5ED37B581934": '/FormFiling/CancelTrainingOrganization/Preview/'       //Заявление за заявяване на прекратяване на дейността на организация за обучение на медиатори
};

var eApplicationType = {
    RegisterMediator: "99451B5A-7FA6-4410-8CED-4502806B27F3",                 //Заявление за вписване в Единния регистър на медиаторите
    ChangeMediator: "826ABBE0-173E-4B04-942E-4F5AE2FA1A8B",                 //Заявление за промяна на вписаните обстоятелства за медиатор
    CancelMediator: "F885944C-59D2-488E-9FCF-0BF9B5A00343",                 //Заявление за отписване на лице от Единния регистър на медиаторите
    RegisterTrainingOrganization: "123C520A-E6F5-43BF-9BEC-E617B9E68313",                 //Заявление за одобряване на организации за обучение на медиатори
    ChangeTrainingOrganization: "34FE56BB-8B7A-4D0D-ACFB-DD868E9C0C31",                 //Заявление за промяна на обстоятелства за организация за обучение на медиатори и одобрените към нея обучители
    CancelTrainingOrganization: "F9CF2D7F-FAC2-493E-BD52-5ED37B581934"                  //Заявление за заявяване на прекратяване на дейността на организация за обучение на медиатори
};

var eCaseFormStatus = {
    //Currently signing and payment is not implemented
    Draft: "01b65c99-3855-4034-901a-45105dd8ef26", //Чернова
    Registered: "02a59b56-2ff0-4cf3-bb11-19dab3ae530f", //Регистрирано
    ChoosingNewMediator: "03f200af-fef7-436b-a103-593a322da9af", //Избор на нов медиатор
    Initiated: "04515f5b-f961-4791-9fda-8c86cb100acf", //Инициирано
    FurtherClarificationRequested: "05fad5de-5757-4347-95ab-700d99cd55fe", // Допълнителни разяснения
    ProcedureStarted: "06d962b1-38d4-4c82-8cbf-e7a7336d4961", //Започната процедура
    TerminationRequested: "07a3ade3-db11-43f7-b46d-2d99307ec18e", //Поискано прекратяване(Спряна)
    Terminated: "0861725c-a615-4da7-b699-dc2e082b9fec", //Прекратено
    AgreementReached: "09bf7f8c-4f1e-4b0f-9832-905811eb6eb4" //Постигнато споразумение
};

var eCaseActionType = {
    RejectedMediationByMediator: "04FACD84-586A-4E54-A14E-0A0575C643AD", //Отказ от водене на медиация,
    SigningAgreementToOpenProcedure: "1187BB5B-D000-40E0-A314-1D149ED36BC2", //Подписване на споразумение за започване на процедура
    SigningReachedAgreement: "18C7B499-EB1D-4D10-9262-1F0E323864DC", //Подписване на постигнатото споразумение
    AccessToAdditionalMediator: "0908374F-9BB1-4FC3-B3ED-24F65C9052DF", //Даване на достъп на допълнителен Медиатор
    EventCompletion: "149C1A33-F5AD-49E7-BE1C-38C97DF147DC", //Приключване на събитие
    Termination: "16B45EFF-9655-43C9-BDA1-477B0E55DE67", //Прекратяване
    Save: "010B84F6-29DF-49EA-927F-4E5A095EF481", //Запазване
    WrittenComment: "12BA38D5-6B31-4443-B113-64CA944EBAF2", //Оставяне на коментар
    Submission: "025AF1D7-9675-4725-9F9C-6DF7C85081E0", //Подаване
    ImplementationOfAgreement: "17757ED9-0F2B-4413-BDC0-84F6275380D3", //Въвеждане на постигнатото споразумение
    ConsentConductMediation: "03FC510D-ADD6-4966-A7A7-8536888B7A7A", //Съгласие за водене на медиация
    AccessToThirdParty: "08330B92-65BC-4088-88C0-92D49E6DADD2", //Даване на достъп на трето лице
    EventStart: "13B95B18-644F-40C7-9915-A1AE2A54BEA8", //Започване на събитие
    FurtherClarificationRequest: "05B78210-5EDF-4AC9-9BDE-A34E16B7F8D1", //Искане на допълнителни разяснения
    TerminationRequest: "150D1C97-D884-411D-868D-C515C9E3475C", //Искане за прекратяване
    FeesInput: "07A4B1D5-80E8-4718-BCA2-D65B12A759BF", //Въвеждане на такси
    SigningPrivacyStatement: "1002F42E-7FCD-4D49-BF09-D87455C888B1", //Подписване на декларация за конфиденциалност
    SecondPartyRegistration: "06CD04AF-9B9B-43A7-8809-DD8AD25D2151", //Регистрация на втората страна
    ProcedureInitiation: "11977ADE-9D94-4550-B512-FF6CEEBB474B" //Започване на процедура по медиация
}

var eCaseEventType = {
    Video: 'DA7D6C25-196E-4CAE-9E18-32527F04C120', //Видео Разговор
    Audio: '0372D77F-4891-49CF-B9D5-6D15002FC233', //Аудио Разговор
    Document: '6AEC0FBC-423D-4A48-A882-FEA8D0F51953' //Документ
}

var eApplicationFormActionType = {
    Save: "0175c6d5-8464-4fc1-b759-f9ca0cdf2259",                                           // Запазване        
    Register: "02fa5fd7-1f21-4909-8f2f-7a0a28e74d96",                                       // Входиране (Генериране на уникален номер)
    RequestCorrectingForm: "03b69788-1773-4fa4-b316-6628ec1ed0be",                          // Изискване на корекции
    CreateCorrectingForm: "04802c7c-4ca8-4293-8238-fbd50e528daa",                           // Създаване на коригиращо заявление
    EmployeeApproval: "05db02e4-5c75-40b5-8b20-b175cfe24011",                               // Одобрение от служител
    MinisterApproval: "0651932f-2c95-4263-b77e-e5a4e3724ca6",                               // Одобрение от министър     
    MinisterRejection: "07b95cfd-c07a-4fd0-b48d-fb9233fdd990",                              // Отказ от вписване (от министър)
    Execution: "08b3464d-1453-4380-b3ba-dc1f2a73ac7a",                                      // Изпълнение

    EmployeeApprovalWithModification: "265636ef-2ed1-4851-8e94-22a6c9733187",               // Одобрена от служител с промени
    RequestCorrectingFormWithModification: "c285138f-9431-4031-bd27-cfb4fce92995",          // Изискване на корекции с промени от служител
    PendingPayment: "e5573b2d-7f60-4e48-8fa6-0d8c4b7b17df",                                 // Очаква плащане

    SentCertificate: "0B3EAD68-BFBD-4836-B4E4-CC8DF962882C",                                // Изпратено удостоверение
    HandedCertificate: "1D75F3DD-2A2C-4987-84CD-71DFE11A409C",                              // Връчено удостоверение
    CancelledProcedure: "E48689C3-38B7-4A94-8CE0-F7ACE44FAA0E",                             // Прекратено производство
}

var eCaseEventStatuses = {
    Finished: "41CE2736-1DD0-4DF0-A500-0100999C05F1",               // Причключило
    AwaitingFile: "A2364979-02BD-4BE5-9AF5-1AD2EF6D65BB",           // Очакване на файл
    Confirmed: "4EAC3A98-8366-416A-B69D-27FF56D67CF3",              // Потвърдено
    ReceivedFile: "4277B4B7-47C1-4505-9264-6503188FE791",           // Получен файл
    AwaitingConfirmation: "160A0D5C-274A-44FD-B013-76FC932323F4",   // Изчаква потвърждение
    Refused: "E9284149-02FC-4E64-A73A-A60309EBAD36"                 // Отказано
}

var eDocumentTemplate = {
    DetailedNote_RegisterMediator: '43D979F9-2340-4469-A3DA-7DC125E22EB4',           //Докладна записка - вписване медиатор
    DetailedNote_ModifyMediator: '85B91973-19DE-4182-8E58-59EA1A2D3D86',             //Докладна записка - промяна медиатор
    DetailedNote_CancelMediator: '49C5604A-8E8B-4B9F-AA28-BC171A5AE5FB',             //Докладна записка - отписване медиатор
    MinisterOrder_RegisterMediator: '041DEE66-DA16-45B9-BB12-AF71701DB124',          //Заповед Министър - вписване медиатор 
    MinisterOrder_ModifyMediator: '492875C6-E631-46CD-8883-0515496A1B84',            //Заповед Министър - промяна медиатор 
    MinisterOrder_CancelMediator: '1E46B4DF-1B05-449C-879B-EBCF134C6B64',            //Заповед Министър - отписване медиатор 
    Certificate_RegisterMediator: '8AAA6AAF-DCF3-46D4-8ABB-7A96A4E923B8',            //Удостоверение - вписване медиатор
    Application_Mediator: 'E036D748-6608-49ED-8F32-63535153A00F',                    //Заявление - медиатор

    DetailedNote_RegisterOrganization: '3AC13DF4-D475-4E38-9C49-403AB02A84E2',           //Докладна записка - вписване организация
    DetailedNote_ModifyOrganization: '0D0D83D1-BA64-49D4-B761-DAAB2CF04A16',             //Докладна записка - промяна организация
    DetailedNote_CancelOrganization: 'DE4CF505-8DF5-4B38-B074-C0E2D02792E3',             //Докладна записка - отписване организация
    MinisterOrder_RegisterOrganization: 'DC1B8406-9268-4611-85E6-072363A54A54',          //Заповед Министър - вписване организация 
    MinisterOrder_ModifyOrganization: 'BFCCA284-2D12-43EA-831E-B339B006CCAE',            //Заповед Министър - промяна организация 
    MinisterOrder_CancelOrganization: '1EBCD757-A12F-46D6-9BEA-82DC084842A0',            //Заповед Министър - отписване организация 
    Certificate_RegisterOrganization: '8234DB34-DE59-4947-A51F-71B4C813CF88',            //Удостоверение - вписване организация
    Application_Organization: '2BCBDD93-0F72-439C-800E-480E0F6A210C',                    //Заявление - организация
}

const jitsiURL = "https://mediation-comm.mjs.bg/conferences/index.htm";
//const epayURL = "https://epayments.abbaty.com:10102"
const epayURL = "https://pay.egov.bg";

function getUrlByApplicantionType(formGuid, formTypeGuid) {
    if (eApplicationFormType.hasOwnProperty(formTypeGuid.toUpperCase())) {
        return eApplicationFormType[formTypeGuid.toUpperCase()] + formGuid;
    }
    return '/Home/Error';
}

///constants for promptActionConfirmation
const questionToBeDeleted = 'Изтриване на запис?';

const EmptyGuid = "00000000-0000-0000-0000-000000000000";

///Get new GUID from server
function getNewGuid() {
    return axios.post('/Base/NewGuid')
        .catch(function (error) {
            console.error("Error while getting new GUID", error);
        });
}


/// loading animation
function loadingShow() {
    $('body').loadingModal({
        animation: 'fadingCircle',
        backgroundColor: 'SteelBlue'
    });
}

function loadingHide() {
    $('body').loadingModal('destroy');
}

/// loading animation for table
function loadingTableShow() {
    $('#result-datatable').loadingModal({
        animation: 'fadingCircle',
        backgroundColor: 'SteelBlue'
    });
}

function loadingTableHide() {
    $('#result-datatable').loadingModal('destroy');
}

/// init izi Modal
$("#modal").iziModal();


///Prompt the user for confirmation. If YES, execute the desired function
function promptActionConfirmation(question, executeYes, executeNo) {
    iziToast.question({
        timeout: 20000,
        close: false,
        overlay: true,
        closeOnEscape: false,
        drag: false,
        transitionIn: 'flipInX',
        transitionOut: 'flipOutX',
        zindex: 1000,
        title: question,
        position: 'center',
        buttons: [
            ['<button><b>Да</b></button>', function (instance, toast) {
                /// execute the desired function
                executeYes();

                instance.hide({ transitionOut: 'flipOutX' }, toast, 'button');
            }, true],
            ['<button>Не</button>', function (instance, toast) {
                /// If No is clicked
                executeNo();
                instance.hide({ transitionOut: 'flipOutX' }, toast, 'button');
            }]
        ]
    });
}

/// MEthod for hard copying objects
function copyObject(src) {
    var clone1 = JSON.parse(JSON.stringify(src));
    //var clone2 = jQuery.extend(true, {}, src); //Different way of cloning

    return clone1;
}

// used to convert all displayed dates in requested format
function dateFormated(date) {
    var convertedDate = moment(date).format('DD.MM.YYYY');
    if (convertedDate === "Invalid date") {
        return date;
    }
    return convertedDate;
}

function dateTimeFormated(date) {  //moment.utc(date).local().format -> replace the current one to show the correct time
    var convertedDate = moment(date).format('DD.MM.YYYY HH:mm');
    if (convertedDate === "Invalid date") {
        return date;
    }
    if (moment(date).format('DD.MM.YYYY HH:mm') === '00:00')
        return moment(date).format('DD.MM.YYYY');
    else
        return moment(date).format('DD.MM.YYYY HH:mm');
}

// used to convert all displayed dates in format moment(date).calendar() -> Днес в 12:13
function dateFormater(date) {
    var convertedDate = moment.utc(date).local().calendar(null, { //moment.utc(date).local().calendar -> replace the current one to show the correct time
        sameDay: '[Днес ]' + 'HH:mm',
        lastDay: '[Вчера ]' + 'HH:mm',
        lastWeek: 'DD.MM.YYYY HH:mm',
        sameElse: 'DD.MM.YYYY HH:mm'
    });
    if (convertedDate === "Invalid date") {
        return date;
    }
    return convertedDate;
}

///Make requests to server, expecting OperationalResult<T> response. 
///If response is success it executes the onSuccessCode using the ResultData as parameter
function makeServerCall(verb, url, payload, onSuccessCode, loadingAnimation) {
    if (loadingAnimation) loadingShow();

    axios({
        headers: {
            'X-Requested-With': 'XMLHttpRequest' // mark as an ajax request. Works in cooperation with AjaxAuthorize filter attribute
        },
        method: verb,
        url: url,
        data: payload, //for POST 
        params: verb.toUpperCase() === "GET" ? payload : undefined,//for GET
    })
        .then(function (response) {
            let result = response.data;

            if (result.Type === ResultType.Success) {

                /// execute the desired code
                onSuccessCode(result.ResultData);

                if (result.Message !== null) {
                    iziToast.success({
                        message: result.Message + (result.AdditionalMessages ? '\n' + result.AdditionalMessages.join("<br/>") : "")
                    });
                }
            }
            else {
                iziToast.warning({
                    layout: 2,
                    title: result ? result.Message : "Грешка",
                    message: result.AdditionalMessages ? result.AdditionalMessages.join("<br/>") : ""
                });
            }
            loadingHide();
        })
        .catch(function (error) {
            if (error.response && error.response.status === 403) {
                //If the response is 'not authorized' => display the content. It's a meaningfull message
                iziToast.error({
                    layout: 2,
                    title: 'Грешка!',
                    message: error ? error.response.data : "Възникна грешка!"
                });
            }
            else {
                iziToast.error({
                    title: 'Грешка!'
                });
            }
            console.error(error);
            loadingHide();
        })
        .finally(() => {
            loadingHide();
        });
}

// make server call without notifications

function makeDefaultServerCall(verb, url, payload, onSuccessCode, loadingAnimation) {
    if (loadingAnimation) loadingShow();

    axios({
        headers: {
            'X-Requested-With': 'XMLHttpRequest' // mark as an ajax request. Works in cooperation with AjaxAuthorize filter attribute
        },
        method: verb,
        url: url,
        data: payload, //for POST 
        params: verb.toUpperCase() === "GET" ? payload : undefined,//for GET
    })
        .then(function (response) {
            let result = response.data;

            onSuccessCode(result);
        })
        .catch(function (error) {
            console.error(error);
        })
        .finally(() => {
            if (loadingAnimation) loadingHide();
        });
}

//Get the allowed actions for the current user. When called from a vue component (the parameter) it fills them in the AllowedActions prop
function loadAllowedActions(vue) {
    makeServerCall("GET", "/UserManagement/GetAllowedActions", null, (ResultData) => {
        vue.AllowedActions = ResultData;
        vue.loadedData.push(true);
    });
}

//#region Full address dropdowns logic
/*
 * When vue component is created functions loadCountries and loadDistrict are called, as many times as we need. 
 * 
 * They take as parameters 'vue'(main vue component and REQUIRED) and 'objSet'(object that holds arrays - NOT REQUIRED). 
 * Depends on how many times we need to load different sets of countries, districts, municipalities and settlements.
 * 
 * Then on any change of the selected value in dropdowns the functions 'onCountryChange', 'onDistrictChange' and 'onMunicipalityChange' take care of the logic. 
 * The additional parameter 'fullAddressClass' is the object that holds selected guids from dropdowns and tracks any change
 * 
 * Full functional example - registerOrganizationForm.js and _RegisterFormInformation.cshtml.
 */
const BULGARIA_GUID = '9e215f1e-7812-4123-ac40-4ec0335b1739';

function onCountryChange(fullAddressClass, countryGUID) {
    if (countryGUID !== BULGARIA_GUID) {
        // if it's not Bulgaria => clear all sub fields
        fullAddressClass.DistrictGUID = null;
        fullAddressClass.MunicipalityGUID = null;
        fullAddressClass.SettlementGUID = null;
    }
}

function onDistrictChange(vue, fullAddressClass, objSet) {
    loadMunicipalities(vue, fullAddressClass.DistrictGUID, objSet);
    fullAddressClass.MunicipalityGUID = null;
    fullAddressClass.SettlementGUID = null;
}

function onMunicipalityChange(vue, fullAddressClass, objSet) {
    loadSettlements(vue, fullAddressClass.MunicipalityGUID, objSet);
    fullAddressClass.SettlementGUID = null;
}

//Loading methods for full address
function loadCountries(vue, objSet) {
    // load countries dropdown options
    axios.get('/MetaData/GetCountries')
        .then(function (response) {
            if (objSet) {
                objSet.countries = response.data.ResultData;
            } else {
                vue.countries = response.data.ResultData;
            }
            vue.loadedData.push(true);
        })
        .catch(function (error) {
            console.error("Error while loading Countries", error);
        });
}

//Loading methods for full address
function loadCountriesPromise() {
    // load countries dropdown options as promise
    var request = axios.get('/MetaData/GetCountries');

    return request
        .then(function (response) {
            return response.data.ResultData;
        })
        .catch(function (error) {
            return error;
        });
}

function loadDistricts(vue, objSet) {
    // load countries dropdown options
    axios.get('/MetaData/GetDistricts')
        .then(function (response) {
            if (objSet) {
                objSet.districts = response.data.ResultData;
            } else {
                vue.districts = response.data.ResultData;
            }
            vue.loadedData.push(true);
        })
        .catch(function (error) {
            console.error("Error while loading Countries", error);
        });
}

function loadDistrictsPromise() {
    // load countries dropdown options as promise
    var request = axios.get('/MetaData/GetDistricts');

    return request
        .then(function (response) {
            return response.data.ResultData;
        })
        .catch(function (error) {
            return error;
        });
}

function loadMunicipalities(vue, districtGUID, objSet) {
    // load settlements dropdown options
    if (districtGUID !== undefined) {
        axios.get('/MetaData/GetMunicipalities', {
            params: {
                districtGUID: districtGUID
            }
        })
            .then(function (response) {
                if (objSet) {
                    objSet.municipalities = response.data.ResultData;
                } else {
                    vue.municipalities = response.data.ResultData;
                }
            })
            .catch(function (error) {
                console.error("Error while loading Municipalities", error);
            });
    }
    else {
        if (objSet) {
            objSet.municipalities = [];
            objSet.settlements = [];
        } else {
            vue.municipalities = [];
            vue.settlements = [];
        }
    }
}

function loadSettlements(vue, municipalityGUID, objSet) {
    // load settlements dropdown options
    if (municipalityGUID !== undefined) {
        axios.get('/MetaData/GetSettlements', {
            params: {
                municipalityGUID: municipalityGUID
            }
        })
            .then(function (response) {
                if (objSet) {
                    objSet.settlements = response.data.ResultData;
                } else {
                    vue.settlements = response.data.ResultData;
                }
            })
            .catch(function (error) {
                console.error("Error while loading Settlements", error);
            });
    }
    else {
        if (objSet) {
            objSet.settlements = [];
        } else {
            vue.settlements = [];
        }
    }
}

//#endregion Full address dropdowns logic

/* utility functions */


function mergeAddress(arr) {
    var tArr = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] && arr[i].length) {
            var pre = '';
            switch (i) {
                case 1:
                    pre = 'област ';
                    break;
                case 2:
                    pre = 'община ';
                    break;
            }
            tArr.push(pre + arr[i]);
        }
    }
    return tArr.join('; ');
}

function getURLLastSegment() {
    return window.location.pathname.split("/").pop();
}

function getParameter(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function addParameter(paramName, paramValue, url) {
    if (url.indexOf(paramName + "=") >= 0) {
        var prefix = url.substring(0, url.indexOf(paramName + "="));
        var suffix = url.substring(url.indexOf(paramName + "="));
        suffix = suffix.substring(suffix.indexOf("=") + 1);
        suffix = (suffix.indexOf("&") >= 0) ? suffix.substring(suffix.indexOf("&")) : "";
        url = prefix + paramName + "=" + paramValue + suffix;
    }
    else {
        if (url.indexOf("?") < 0)
            url += "?" + paramName + "=" + paramValue;
        else
            url += "&" + paramName + "=" + paramValue;
    }
    return encodeURI(url);
}

function isEmptyGUID(value) {
    return value == null
        || value == undefined
        || value == 'undefined'
        || value.length == 0
        || value == '00000000-0000-0000-0000-000000000000'
}