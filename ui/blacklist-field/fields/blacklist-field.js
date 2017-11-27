define(function(require, exports, module) {

    var $ = require("jquery");

    var Alpaca = $.alpaca;

    Alpaca.Fields.BlacklistField = Alpaca.Fields.UpperCaseField.extend(
    /**
     * @lends Alpaca.Fields.BlacklistField.prototype
     */
    {
        blacklistedValues: {},

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "blacklist-field";
        },

        /**
         * @see Alpaca.Fields.UpperCaseField#handleValidate
         */
        handleValidate: function()
        {
            var baseStatus = this.base();
            var valInfo = this.validation;
            var value = this.getValue();
            
            var valInfo = {
                "message": this.getMessage("blacklistedValue"),
                "status": !Alpaca.isEmpty(this.blacklistedValues[value])
            };

            return baseStatus && valInfo["blacklistedValue"]["status"];
        },
        
        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function()
        {
            this.base();
            this.blacklistedValues["ABC123"] = 1;
        },

        afterRenderControl: function(model, callback)
        {
            var self = this;
            self.base(model, function(){
                callback();
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {

            return Alpaca.merge(this.base(), {
                "properties": {
                    "listNodeId": {
                        "title": "List Node Id",
                        "description": "ID of a node with JSON array payload listing black listed values",
                        "type": "string",
                        "default": "",
                        "readonly": true
                    }
                }
            });

        },

        /**
         * @private
         * @see Alpaca.Fields.TextField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "listNodeId": {
                        "type": "text"
                    }
                }
            });
        },

        /**
         * @see Alpaca.Fields.TextField#getTitle
         */
        getTitle: function() {
            return "Black List Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Dissallow blacklisted or in use values";
        }

        /* end_builder_helpers */
    });

    Alpaca.registerMessages({
        "blacklistedValue": "Value is not allowed"
    },{
        "inUseValue": "Value is in use"
    });
    
    Alpaca.registerFieldClass("blacklist", Alpaca.Fields.BlacklistField);

});

