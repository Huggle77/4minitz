let _ = require('underscore');

module.exports = function (ldapSettings, userData) {
    let searchDn = ldapSettings.searchDn || 'cn';

    // userData.mail may be a string with one mail address or an array.
    // Nevertheless we are only interested in the first mail address here - if there should be more...
    let tmpEMail = userData.mail;
    if (Array.isArray(userData.mail)) {
        tmpEMail = userData.mail[0];
    }
    let tmpEMailArray = [{
        address: tmpEMail,
        verified: true,
        fromLDAP: true
    }];

    let username = userData[searchDn] || '';

    let user = {
        createdAt: new Date(),
        isInactive: false,
        emails: tmpEMailArray,
        username: username.toLowerCase(),
        profile: _.pick(userData, _.without(ldapSettings.whiteListedFields, 'mail'))
    };
    // copy over the LDAP user's long name from "cn" field to the meteor accounts long name field
    if (user.profile.cn) {
        user.profile.name = user.profile.cn;
        delete user.profile.cn;
    }
    if (userData.isInactive) {
        user.isInactive = true;
    }
    return user;
};
