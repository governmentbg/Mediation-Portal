"use strict";

Vue.component('loginDialog', {
    data: function () {
        return {
            Form: null,
            loading: true,
            valid: true,
            validationRules: {
                requiredField: v => !!v || 'Полето е задължително.',
                minlenght: v => (v && v.length >= 6) || 'Паролата трябва да бъде поне 6 символа дълга'
            },
            showPassword: false,
            tabs: null,
            loadedData: [],
            dialog: {
                open: false
            }
        };
    },
    created: function () {
        let vue = this;
        vue.Form = new LogIn();

        vue.loadedData.push(true);
        vue.$forceUpdate();
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
        submitForm() {
            let vue = this;

            // validate form and show validation messages if necessary
            if (this.$refs.loginForm.validate()) {
                //post form here

                makeServerCall('POST', '/Account/SimpleLogin', { model: vue.Form }, (ResultData) => {

                    makeDefaultServerCall("GET", "/UserManagement/GetCurrentUser", null, (response) => {
                        if (response.Type = 1) {
                            vue.$parent.currentUser = response.ResultData;
                            vue.$parent.isCurrentUserLogged = true;
                            vue.$parent.showApplication = true;
                            vue.dialog.open = false;
                            $("html, body").animate({ scrollTop: 0 }, "slow");
                        }
                    })

                    vue.$forceUpdate();
                }, true);
            }
            else {
                vue.snackbar = true;
            }
        },
        passwordMatch() {
            let vue = this;
            if (vue.Form.Password !== vue.Form.ConfirmPassword) {
                return "Паролата и потвърждението на паролата не съвпадат";
            }
            return true;
        },
        signatureLogin() {
            var dummyText = "testtestetests";
            SCS.sign(dummyText)
                .then(function (json) {
                    $('#signatureText').val(json.signature);
                    $('#login-with-signature-form').submit();
                })
                .then(null, function (err) {
                    document.getElementById('result').innerHTML = 'ERROR:' + "\r\n" + err.message;
                });
        },
        openDialog() {
            this.dialog.open = true;
        }
    },
    computed: {

    }
});