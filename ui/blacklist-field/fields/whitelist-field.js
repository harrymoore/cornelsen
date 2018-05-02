define(function(require, exports, module) {

    var $ = require("jquery");

    var Alpaca = $.alpaca;

    Alpaca.Fields.WhitelistField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.WhitelistField.prototype
     */
    {
        whitelistedValues: {},
        existingValues: {},
        originalValue: null,

        onChange: function()
        {
            var self = this;
            self.base();
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "whitelist-field";
        },

        /**
         * @see Alpaca.Fields.TextField#handleValidate
         */
        handleValidate: function()
        {
            var self = this;
            var baseStatus = this.base();
            var valInfo = this.validation;
            var value = (this.getValue()+"").toLowerCase();

            if (!self.originalValue) {
                self.originalValue = value;
            }

            // var whitelisted = false;
            // if (self.originalValue !== value) {
            //     whitelisted = !Alpaca.isEmpty(this.whitelistedValues[value]);
            // }
            var whitelisted = !Alpaca.isEmpty(this.whitelistedValues[value]);

            valInfo["whitelistedValue"] = {
                "message": whitelisted ? "" : this.getMessage("whitelistedValue"),
                "status": whitelisted
            };

            var exists = false;
            if (self.originalValue !== value) {
                exists = !Alpaca.isEmpty(this.whitelistedValues[value]);
            }

            valInfo["inUseValue"] = {
                "message": !exists ? "" : this.getMessage("inUseValue"),
                "status": !exists
            };

            return baseStatus || valInfo["whitelistedValue"]["status"] || valInfo["inUseValue"]["status"];
        },
        
        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function()
        {
            this.base();
            this.whitelistedValues = {};
        },

        // afterRenderControl: function(model, callback)
        // {
        //     var self = this;
        //     self.base();
        // },

        beforeRenderControl: function(model, callback)
        {
            var self = this;
            var listNodeId = self.options.listNodeId;
            var listNodeProperty = self.options.listNodeProperty || "whitelist";
            var existingIdType = self.options.existingIdType || "cornelsen:webcode";
            var existingIdProperty = self.options.existingIdProperty || "webcode";

            var existingList = function(callback) {
                var query = {
                    _type: existingIdType,
                    _fields: {}
                };

                query[existingIdProperty] = { 
                    $exists: true
                };
                query._fields[existingIdProperty] = 1;

                Alpaca.globalContext.branch.subchain().queryNodes(query).then(function() {
                    var list = this.asArray();
                    // console.log(JSON.stringify(list,null,2));

                    for(var i = 0; i < list.length; i++) {
                        var existingIdPropertyValue = (list[i][existingIdProperty]+"").toLowerCase();
                        if (existingIdPropertyValue) {
                            self.whitelistedValues[existingIdPropertyValue] = list[i]._doc || 1;
                        }
                    }

                    callback();
                });            
            };

            if (!listNodeId) {
                // return callback();
                existingList(callback);
                return;
            }

            Chain(Alpaca.globalContext.branch).queryNodes({
                "_doc": listNodeId
            }).then(function() {
                if (this.size() === 0) {
                    console.log("Could not find whitelist node");
                    // return callback("Could not find whitelist node");
                    return callback();
                }
    
                this.keepOne().then(function() {
                    var whitelistNode = this;
                    var list = whitelistNode[listNodeProperty] || [];
                    for(var i = 0; i < list.length; i++) {
                        var value = (list[i]+"").toLowerCase();
                        self.whitelistedValues[value] = 1;
                    }

                    existingList(callback);
                });
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
                        "description": "ID of a node with JSON array payload listing white listed values",
                        "type": "string",
                        "default": "",
                        "readonly": true
                    },
                    "listNodeProperty": {
                        "title": "whitelist property name",
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
            return "White List Field";
        },

        /**
         * @see Alpaca.Fields.TextField#getDescription
         */
        getDescription: function() {
            return "Dissallow whitelisted or in use values";
        }

        /* end_builder_helpers */
    });
    
    Alpaca.registerMessages({
        "whitelistedValue": "Value is not allowed. Must be in whitelist",
        "inUseValue": "Value is in use"
    });

    Alpaca.registerFieldClass("whitelist", Alpaca.Fields.WhitelistField);

});

