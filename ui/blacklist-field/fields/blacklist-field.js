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
            var listNodeId = self.options.listNodeId;
            var listNodeProperty = self.options.listNodeProperty || "blacklist";
            var existingIdType = self.options.existingIdType || "cornelsen:webcode";
            var existingIdProperty = self.options.existingIdProperty || "webcode";

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

        afterRenderControl: function (model, callback) {
            var self = this;
            var generateOnEmpty = !!self.options.generateOnEmpty;

            this.base(model, function () {
                if (!generateOnEmpty) {
                    return callback();
                }

                self.on("ready", function (e) {
                    if (Alpaca.isValEmpty(self.getValue()))
                    {
                        self.setValue(self._randomValue());
                    }
                });

                callback();
            });
        },

        _allowedChars1: ["a","e","i","o","u"],
        _allowedChars2: ["b","c","d","f","g","h","j","k","m","n","p","q","r","s","t","v","w","x","y","z"],
        
        _randomValue: function () {
            var value = this._newValue();
            while(!Alpaca.isValEmpty(this.blacklistedValues[value])) {
                value = this._newValue();
            }
            return value;
        },

        _newValue: function () {
            var value = "";
            value += this._allowedChars2[ Math.floor(Math.random() * this._allowedChars2.length)];
            value += this._allowedChars1[ Math.floor(Math.random() * this._allowedChars1.length)];
            value += this._allowedChars2[ Math.floor(Math.random() * this._allowedChars2.length)];
            value += this._allowedChars1[ Math.floor(Math.random() * this._allowedChars1.length)];
            value += this._allowedChars2[ Math.floor(Math.random() * this._allowedChars2.length)];
            value += this._allowedChars1[ Math.floor(Math.random() * this._allowedChars1.length)];
            return value;
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

