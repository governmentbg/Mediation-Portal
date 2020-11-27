"use strict";

Vue.component('editUserPassword', {
    data: function () {
        return {
            Form: null, // Register
            loading: true,
            loadedData: [],
            roles: [],
            dialog: false,
            valid: true,
            validationRules: {
                requiredField: v => !!v || 'Полето е задължително.',
                minlenght: v => (v && v.length >= 6) || 'Паролата трябва да бъде поне 6 символа дълга'
            },
            formGuid: window.location.pathname.split("/").pop(),
            showPassword: false,
            inReadonlyMode: false
        };
    },
    created: function () {
        let vue = this;
        vue.Register = new Register();
        loadUser(vue);
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
            if (this.$refs.form.validate()) {
                //post form here

                makeServerCall('POST', '/Account/EditUserPassword', vue.Form, (ResultData) => {
                    vue.inReadonlyMode = true; // after return set form to readonly if is successful


                    //TODO: Tell user that is registerd succesfuly and will be redirected to Account/LogIn
                    vue.$forceUpdate();

                }, true);
                //this.$router.push('home')
            }
            else {
                this.snackbar = true;
            }
        },
        passwordMatch() {
            let vue = this;
            if (vue.Form.Password !== vue.Form.ConfirmPassword) {
                return "Паролата и потвърждението на паролата не съвпадат";
            }
            return true;
        }


    },
    computed: {

    }
});


function loadUser(vue) {
    makeServerCall('GET', '/Account/GetUser/' + vue.formGuid, null, (ResultData) => {
        vue.Form = ResultData;
        vue.loadedData.push(true);
    });
}
