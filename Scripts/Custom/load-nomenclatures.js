"use strict";

function loadCitizenships(vue) {
    makeServerCall('GET', '/MetaData/GetCitizenships', null, (ResultData) => {
        vue.citizenships = ResultData;
        vue.loadedData.push(true);
    });
}

function loadEducationDegrees(vue) {
    makeServerCall('GET', '/MetaData/GetEducationDegrees', null, (ResultData) => {
        vue.educationDegrees = ResultData;
        vue.loadedData.push(true);
    });
}

function loadEducationFields(vue) {
    makeServerCall('GET', '/MetaData/GetEducationFields', null, (ResultData) => {
        vue.educationFields = ResultData;
        vue.loadedData.push(true);
    });
}

function loadProfessions(vue) {
    makeServerCall('GET', '/MetaData/GetProfessions', null, (ResultData) => {
        vue.professions = ResultData;
        vue.loadedData.push(true);
    });
}

function loadForeignLanguages(vue) {
    makeServerCall('GET', '/MetaData/GetForeignLanguages', null, (ResultData) => {
        vue.foreignLanguages = ResultData;
        vue.loadedData.push(true);
    });
}

function loadSpecializations(vue) {
    makeServerCall('GET', '/MetaData/GetSpecializations', null, (ResultData) => {
        vue.specializations = ResultData;
        vue.loadedData.push(true);
    });
}

function loadOrganizations(vue) {
    makeServerCall('GET', '/Mediators/GetOrganizations', null, (ResultData) => {
        vue.organizations = ResultData;
        vue.loadedData.push(true);
    });
}

function loadAttachedDocumentTypes(vue) {
    makeServerCall('GET', '/AttachedDocument/GetAttachedDocumentTypes', null, (ResultData) => {
        vue.attachedDocumentTypes = ResultData;
        vue.loadedData.push(true);
    });
}

function loadMediatorStatuses(vue) {
    makeServerCall('GET', '/Mediators/GetMediatorStatuses', null, (ResultData) => {
        vue.mediatorStatuses = ResultData;
        vue.loadedData.push(true);
    });
}

function loadTrainingOrganizationStatuses(vue) {
    makeServerCall('get', '/TrainingOrganizations/GetOrganizationStatuses', null, (ResultData) => {
        vue.trainingOrganizationStatuses = ResultData;
        vue.loadedData.push(true);
    });
}

function loadDisputeSubjects(vue) {
    makeServerCall('GET', '/Mediation/Case/GetDisputeSubjects/', null, (ResultData) => {
        vue.disputeSubjects = ResultData;
        vue.loadedData.push(true);
    }, false);
}