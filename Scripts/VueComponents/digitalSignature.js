var digitalSignature = Vue.component('digitalsignature', {
    data() {
        return {
            url: null
        };
    },
    created: function () {
        let vue = this;

        // check if url is not the default one if not 
        // then use is as redirect link after log in /register with signature
        if (window.location.pathname !== "/Home/Index") {
            vue.url = getParameter("ReturnUrl");
            if (!vue.url) {
                vue.url = window.location.href;
            }
        }
    },
    methods: {
        clicked: function () {
            let vue = this;
            console.log("window.location.href = " + window.location.href)
            makeServerCall('POST', '/Account/LoginWithSigniture', { signatureText: "", redirectUrl: window.location.href }, (response) => {
                //if (redirectUrl !== null) {
                //    window.location = redirectUrl;
                //}
                console.log(response);
                jQuery("input[name='SAMLRequest']").val(response.SAMLRequest)
                jQuery("input[name='RelayState']").val(response.RelayState)
                jQuery("#submitSignLogin")[0].click();
            });





            /*SCS.sign("signText")
                .then(function (json) {
                    makeServerCall('POST', '/Account/LoginWithSigniture', { signatureText: json.signature, redirectUrl: vue.url }, (response) => {
                        //if (redirectUrl !== null) {
                        //    window.location = redirectUrl;
                        //}
                        console.log(response);
                        jQuery("input[name='SAMLRequest']").val(response.SAMLRequest)
                        jQuery("input[name='RelayState']").val(response.RelayState)
                        //jQuery("#submitSignLogin")[0].click();
                    });
                })
                .then(null, function (err) {
                    document.getElementById('result').innerHTML = 'ERROR:' + "\r\n" + err.message;
                });*/
        }
    }
});