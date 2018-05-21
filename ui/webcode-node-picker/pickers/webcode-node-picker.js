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

            query = {
                _type: model.typeQName || "cornelsen:webcode"
            };

            if (searchTerm)
            {
                query.webcode = { 
                    "$regex": searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
                    "$options": "i"
                };
            }

            pagination.sort = {
                webcode: 1
            };

            Chain(b).queryNodes(query, pagination).then(function() {
                return callback(this);
            });
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