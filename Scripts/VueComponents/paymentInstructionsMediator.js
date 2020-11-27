"use strict";

Vue.component('paymentInstructionsMediator', {
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
            makeServerCall('GET', '/FormFiling/RegisterMediator/GetApplicationForPaymentInstructionsForm?id=' + window.location.pathname.split("/").pop(), null, (ResultData) => {
                vue.Data = ResultData;

                vue.loadedData.push(true);
            });
        },
        showPaymentOrder() {
            this.paymentOrderDialog.open = true;
            setTimeout(function () {
                jQuery(".v-dialog.v-dialog--active").css("max-height", "100%").css("overflow-x", "hidden");
            }, 0)
        }
    },
    computed: {

    }
});