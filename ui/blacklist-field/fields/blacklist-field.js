    define(function(require, exports, module) {

    var $ = require("jquery");

    var Alpaca = $.alpaca;

    Alpaca.Fields.BlacklistField = Alpaca.Fields.TextField.extend(
    /**
     * @lends Alpaca.Fields.BlacklistField.prototype
     */
    {
        blacklistedValues: {},
        originalValue: null,

        onChange: function()
        {
            var self = this;

            self.base();

            var value = self.getValue();
            if ("" === value) {
                self.setValue(self._randomValue());
            }
        },

        /**
         * @see Alpaca.Fields.TextField#getFieldType
         */
        getFieldType: function() {
            return "blacklist-field";
        },

        validator: function(callback) {
            var self = this;
            var value = (self.getValue()+"").toLowerCase();
            var thisNodeId = self._getThisNodeId();

            if (!self.originalValue) {
                self.originalValue = value;
            }

            var exists = !Alpaca.isEmpty(self.blacklistedValues[value]);

            // query to make sure the value doesn't already exist in another webcode
            let query = {
                _type: self.options.existingIdType || "cornelsen:webcode",
                _fields: {
                    _type: 1,
                    _doc: 1,
                    title: 1
                }
            };
            query[self.options.existingIdProperty || "webcode"] = value;
            query._fields[self.options.existingIdProperty || "webcode"] = 1;
            if (thisNodeId) {
                query._doc = { 
                    $ne: thisNodeId
                };
            }
                
            Alpaca.globalContext.branch.subchain().queryNodes(query).then(function() {
                var list = this.asArray();

                if (list.length) {
                    exists = true;
                }

                let valInfo = {
                    message: !exists ? "" : self.getMessage("blacklistedValue"),
                    status: !exists
                };

                callback(valInfo);
            });
        },
        
        /**
         * @see Alpaca.Fields.TextField#setup
         */
        setup: function()
        {
            this.base();
            this.blacklistedValues = {};
            this.whitelistedValues = {};
            this.options.validator = this.validator;
        },
 
        _getThisNodeId: function()
        {
            if (Alpaca.globalContext.document) {
                return Alpaca.globalContext.document._doc;
            }

            var parts = window.location.hash.split('/');
            var id = parts[4] || "";
            return id;
        },

        beforeRenderControl: function(model, callback)
        {
            var self = this;
            var listNodeId = self.options.listNodeId;
            var listNodeProperty = self.options.listNodeProperty || "blacklist";

            Chain(Alpaca.globalContext.branch).queryNodes({
                "_doc": listNodeId
            }).then(function() {
                if (this.size() === 0) {
                    console.log("Could not find blacklist node");
                    return callback();
                }
    
                this.keepOne().then(function() {
                    var blacklistNode = this;
                    var list = blacklistNode[listNodeProperty] || [];
                    for(var i = 0; i < list.length; i++) {
                        var value = (list[i]+"").toLowerCase();
                        self.blacklistedValues[value] = 1;
                    }

                    return callback();
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
                        self.systemGeneratedId = true;
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