define(function(require, exports, module) {

    var UI = require("ui");

    var moduleId = module.uri.match(/^.+(_modules[^\/]+)\/.*/)[1];

    // register the theme: "cornelsen-theme"
    UI.registerTheme({
        "key": "cornelsen-theme",
        "title": "Cornelsen Theme",
        "module": moduleId + "/theme"
    });
    // require("./theme.js");

});