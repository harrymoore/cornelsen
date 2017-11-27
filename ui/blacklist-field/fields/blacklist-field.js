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
            var exists = !Alpaca.isEmpty(this.blacklistedValues[value]);

            valInfo["blacklistedValue"] = {
                "message": !exists ? "" : this.getMessage("blacklistedValue"),
                "status": !exists
            };

            return baseStatus && valInfo["blacklistedValue"]["status"];
        },
        
        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function()
        {
            this.base();
            this.blacklistedValues = {};
        },

        beforeRenderControl: function(model, callback)
        {
            var self = this;
            var listNodeId = this.options.listNodeId;
            var listNodeProperty = this.options.listNodeProperty || "blacklist";
            var existingIdType = this.options.existingIdType || "cornelsen:webcode";
            var existingIdProperty = this.options.existingIdProperty || "webcode";
            // var generateOnEmpty = !!this.options.generateOnEmpty;

            if (!listNodeId) {
                return callback();
            }

            Chain(Alpaca.globalContext.branch).queryNodes({
                "_doc": listNodeId
            }).then(function() {
                if (this.size() === 0) {
                    console.log("Could not find blacklist node");
                    // return callback("Could not find blacklist node");
                    return callback();
                }
    
                this.keepOne().then(function() {
                    var blacklistNode = this;
                    var list = blacklistNode[listNodeProperty] || [];
                    for(var i = 0; i < list.length; i++) {
                        self.blacklistedValues[list[i]] = 1;
                    }

                    var query = {
                        _type: existingIdType,
                        _fields: {}
                    };

                    query._fields[existingIdProperty] = 1;

                    Alpaca.globalContext.branch.subchain().queryNodes(query).then(function() {
                        var list = this.asArray();
                        console.log(JSON.stringify(list,null,2));

                        for(var i = 0; i < list.length; i++) {
                            self.blacklistedValues[list[i][existingIdProperty]] = list[i]._doc || 1;
                        }

                        callback();
                    });
                });
            });
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
                    },
                    "listNodeProperty": {
                        "title": "blacklist property name",
                        "description": "Name of the array propery on listNodeId",
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
                    },
                    "listNodeProperty": {
                        "type": "text"
                    },
                    "generateOnEmpty": {
                        "type": "boolean"
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
        "blacklistedValue": "Value is not allowed or already in use",
        "inUseValue": "Value is in use"
    });

    Alpaca.registerFieldClass("blacklist", Alpaca.Fields.BlacklistField);

});

