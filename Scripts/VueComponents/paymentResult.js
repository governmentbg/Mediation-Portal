"use strict";

Vue.component('paymentResult', {
    moment: moment,
    data: function () {
        return {
            //Objects
            PaymentResponse: {
                Message: "",
                Result: "",
                DateCreated: "",
                ApplicantInfo: {}
            },
            applicationGuid: getParameter("applicationGuid"),
            formType: getParameter("formType"),
            applicationURL: "",

            //Common
            loading: true,
            loadedData: [],

            moment: moment
        };
    },
    created: function () {
        let vue = this;

        if (vue.formType == "Mediator") {
            vue.applicationURL = "/FormFiling/RegisterMediator/Preview/" + vue.applicationGuid;
            vue.ePayInfoURL = "/FormFiling/PaymentInstructions/RegisterMediator/" + vue.applicationGuid;
            makeServerCall("GET", "/FormFiling/RegisterMediator/GetPaymentInformation?applicationGuid=" + this.applicationGuid, null, ResultData => {
                vue.PaymentResponse = ResultData;
                vue.loadedData.push(true);
            })
        } else if (vue.formType == "TrainingOrganization") {
            vue.applicationURL = "/FormFiling/RegisterTrainingOrganization/Preview/" + vue.applicationGuid;
            vue.ePayInfoURL = "/FormFiling/PaymentInstructions/RegisterTrainingOrganization/" + vue.applicationGuid;
            makeServerCall("GET", "/FormFiling/RegisterTrainingOrganization/GetPaymentInformation?applicationGuid=" + this.applicationGuid, null, ResultData => {
                vue.PaymentResponse = ResultData;
                vue.loadedData.push(true);
            })
        }
    },
    methods: {
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 1 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    },
    computed: {
    }
});