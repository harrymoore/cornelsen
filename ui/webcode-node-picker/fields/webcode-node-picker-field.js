(function($) {

    var Alpaca = $.alpaca;

    if (!Alpaca.Fields) {
        Alpaca.Fields = {};
    }

    Alpaca.Fields.WebcodeNodePickerField = Alpaca.Fields.AbstractGitanaPickerField.extend(
    /**
     * @lends Alpaca.Fields.WebcodeNodePickerField.prototype
     */
    {
        getFieldType: function()
        {
            return "webcode-node-picker";
        },

        validateItem: function(item, callback)
        {
            var self = this;

            self.loadByRef(item.ref, function(err, o) {
                if (err) {
                    return callback({
                        "message" : self.view.getMessage("invalidBranchId"),
                        "status" : false
                    });
                }

                callback({
                    "status": true
                });
            });
        },

        acquireTitle: function(item, callback)
        {
            var self = this;

            // if item has a webcode field, we use that
            if (item.webcode) {
                return callback(null, item.webcode);
            } else {
                return self.base(item, callback);
            }
        },

        loadByRef: function(ref, callback)
        {
            var self = this;

            var id = ref.substring(ref.lastIndexOf("/") + 1);

            Chain(self.context.branch).trap(function(error) {
                callback(error);
                return false;
            }).readNode(id).then(function() {
                callback(null, this);
            });
        },

        pickerConfiguration: function()
        {
            var self = this;

            return {
                "title": "Select a Webcode",
                "type": "webcode-node-picker"
            };

        },

        getTitle: function() {
            return "Cornelsen Webcode Picker Field";
        },

        getDescription: function() {
            return "Field for picking a Webcode";
        }
    });

    Alpaca.registerMessages({
        "invalidStackID": "A node does not exist with this ID"
    });


    Alpaca.registerFieldClass("webcode-node-picker", Alpaca.Fields.WebcodeNodePickerField);

})(jQuery);