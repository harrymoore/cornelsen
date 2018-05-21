(function($) {

    var OneTeam = undefined;
    if (typeof(require) !== "undefined")
    {
        OneTeam = require("oneteam");
    }

    var picker = Ratchet.Gadgets.AbstractGitanaPicker.extend({

        /**
         * @override
         */
        configureDefault: function()
        {
            // call this first
            this.base();

            // update the config
            var c = {
                "columns": [{
                    "title": "Webcode",
                    "property": "webcode",
                    "sort": true
                }, {
                    "title": "Titel",
                    "property": "title",
                    "sort": true
                }, {
                    "title": "Beschreibung",
                    "property": "description",
                    "sort": false
                }]
            };

            if (typeof(OneTeam) !== "undefined")
            {
                c.icon = true;
            }

            this.config(c);
        },

        prepareModel: function(el, model, callback)
        {
            var self = this;

            this.base(el, model, function() {

                callback();
            });
        },


        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
        {
            var self = this;

            var b = self.branch();

            var o = {
                query: {}
            };

            if (model.query)
            {
                o.query = JSON.parse(JSON.stringify(model.query));
            }

            if (query)
            {
                Ratchet.copyInto(o.query, query);
            }

            if (searchTerm)
            {
                o.search = searchTerm;
            }

            var typeQNames = [];
            if (model.typeQName)
            {
                typeQNames.push(model.typeQName);
            }
            if (model.typeQNames)
            {
                for (var i = 0; i < model.typeQNames.length; i++)
                {
                    if (!typeQNames.contains(model.typeQNames[i]))
                    {
                        typeQNames.push(model.typeQNames[i]);
                    }
                }
            }

            var completionFn = function()
            {
                if (typeQNames.length > 0)
                {
                    o.query._type = {
                        "$in": typeQNames
                    };
                }

                Chain(b).findNodes(o, pagination).then(function() {
                    callback(this);
                });
            };

            // if includeChildTypes, then we go back to the server for every definition QName in typeQNames
            // and load children type QNames.  We include those in our typeQNames.
            if (model.includeChildTypes)
            {
                OneTeam.projectDefinitions(self, function(definitionDescriptors) {

                    var loadedTypeQNames = [];

                    var fns = [];
                    for (var i = 0; i < typeQNames.length; i++)
                    {
                        var definition = null;
                        var descriptor = definitionDescriptors[typeQNames[i]];
                        if (descriptor)
                        {
                            definition = descriptor.definition;
                        }
                        if (definition)
                        {
                            var fn = function (definition, loadedTypeNames) {
                                return function (done) {

                                    definition.listChildDefinitions({
                                        "limit": -1,
                                        "ignoreParent": true
                                    }).each(function () {
                                        loadedTypeNames.push(this.getQName());
                                    }).then(function () {
                                        done();
                                    });

                                };
                            }(definition, loadedTypeQNames);
                            fns.push(fn);
                        }
                    }
                    Ratchet.parallel(fns, function () {

                        for (var i = 0; i < loadedTypeQNames.length; i++)
                        {
                            if (typeQNames.indexOf(loadedTypeQNames[i]) === -1)
                            {
                                typeQNames.push(loadedTypeQNames[i]);
                            }
                        }

                        completionFn();
                    });
                });

                return;
            }

            completionFn();
        },

        iconUri: function(row, model, context)
        {
            var iconUri = null;

            if (typeof(OneTeam) !== "undefined")
            {
                iconUri = OneTeam.iconUriForNode(row, {
                    "size": 24
                });
            }

            return iconUri;
        },

        columnValue: function(row, item)
        {
            var value = this.base(row, item);

            if (item.key == "_type")
            {
                value = row.getTypeQName();
            }

            return value;
        }

    });

    Ratchet.GadgetRegistry.register("webcode-node-picker", picker);

})(jQuery);