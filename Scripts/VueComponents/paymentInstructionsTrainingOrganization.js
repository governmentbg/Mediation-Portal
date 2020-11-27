"use strict";

Vue.component('paymentInstructionsTrainingOrganization', {
    data: function () {
        return {
            Data: null,
            loading: true,
            loadedData: [],
            paymentData: {

            },
            paymentOrderDialog: {
                open: false,
            },
            paymentOrderHTML: "",
            epayURL: epayURL,
            moment: moment
        };
    },
    created: function () {
        this.loadApplication()
    },
    watch: {
        loadedData: function () {
            // if some of loaded filters is not loaded we wont load data
            if (this.loadedData.length === 1 && !this.loadedData.includes(false)) {
                this.loading = false;
            }
        }
    },
    methods: {
        loadApplication() {
            let vue = this;
            makeServerCall('GET', '/FormFiling/RegisterTrainingOrganization/GetApplicationForPaymentInstructionsForm?id=' + window.location.pathname.split("/").pop(), null, (ResultData) => {
                vue.Data = ResultData;

                vue.loadedData.push(true);
            });
        },
        showPaymentOrder() {
            let vue = this;
            makeDefaultServerCall("POST", this.epayURL + "/ais/paymentOrder", { clientId: this.Data.Payment.order.clientId, hmac: this.Data.Payment.order.hmac, data: this.Data.Payment.order.data }, response => {
                console.log(response);
            })
        },
        loadIframe() {
            this.paymentOrderDialog.open = true;
        },
        submit() {
            this.paymentOrderDialog.open = true;
            setTimeout(function () {
                jQuery(".v-dialog.v-dialog--active").css("max-height", "100%").css("overflow-x", "hidden");
            }, 0)
        }
    },
    computed: {

    }
});