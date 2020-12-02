(function (root, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(['scs'], factory);
    }
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('scs'));
    }
    else {
        factory(root.SCS);
    }
}(this, function (SCS, undefined) {
    "use strict";
    SCS.signFile = function () {
        return SCS.invoke('signer/signFile', {});
    };
    SCS.signXML = function (data) {
        return SCS.invoke('signer/sign', { "signatureType": "xmldsig", "content": SCS.Base64Encode(data) });
    };
    SCS.signEx = function (data, charset, newline) {
        return SCS.invoke('signer/sign', { "signatureType": "signature", "charset": charset, "newline": newline, "content": SCS.Base64Encode(data) });
    };
    SCS.signWin = function (data) {
        return SCS.invoke('signer/sign', { "signatureType": "signature", "charset": "windows-1251", "newline": "crlf", "content": SCS.Base64Encode(data) });
    };
}));


