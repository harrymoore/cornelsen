define(function(require) {

    var UI = require("ui");

    // register the theme: "cornelsen-theme"
    UI.registerTheme({
        "key": "cornelsen-theme",
        "title": "Cornelsen Theme",
        "module": "_modules/cornelsen-theme/theme"
    });

});