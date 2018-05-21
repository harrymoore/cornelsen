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
                "title": self.options.picker.pickerTitle || "Select a Node",
                "type": "gitana-node-picker",
                "columns": [{
                    "title": "Webcode",
                    "property": "webcode",
                    "sort": true
                }, {
                    "title": "Title",
                    "property": "title",
                    "sort": true
                }, {
                    "title": "Description",
                    "property": "description",
                    "sort": false
                }]
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