define(function(require, exports, module) {

    require("css!./webcode-list.css");

    var Ratchet = require("ratchet/web");
    var DocList = require("ratchet/dynamic/doclist");
    var OneTeam = require("oneteam");
    var bundle = Ratchet.Messages.using();

    return Ratchet.GadgetRegistry.register("webcode-list", DocList.extend({

        configureDefault: function()
        {
            this.base();

            this.config({
                "observables": {
                    "query": "webcode-list_query",
                    "sort": "webcode-list_sort",
                    "sortDirection": "webcode-list_sortDirection",
                    "searchTerm": "webcode-list_searchTerm",
                    "selectedItems": "webcode-list_selectedItems"
                }
            });
        },

        setup: function()
        {
            this.get("/projects/{projectId}/webcode-list", this.index);
        },

        entityTypes: function()
        {
            return {
                "plural": "Webcodes",
                "singular": "Webcode"
            };
        },

        doclistDefaultConfig: function()
        {
            var config = this.base();
            config.columns = [];

            return config;
        },

        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
        {
            var self = this;
            var user = self.observable("user").get();

            query = {};

            if (OneTeam.isEmptyOrNonExistent(query) && searchTerm)
            {
                query = OneTeam.searchQuery(searchTerm, ["webcode"]);
            }
            query._type = "cornelsen:webcode";

            // pagination.sort = {
            //     "webcode": 1
            // };

            OneTeam.projectBranch(self, function () {

                var rows = [];

                this.queryNodes(query, pagination).then(function () {
                    callback(this);
                });
            });
        },

        _linkUri: function(row, model, context)
        {
            var self = this;
            var project = self.observable("project").get();

            return "/#/projects/" + project._doc + "/documents/" + row._doc + "/properties";
        },

        iconClass: function(row)
        {
            return "form-icon-32";
        },

        customizeActionContext: function(actionContext, model, button)
        {
               if (!actionContext.model) { actionContext.model = {}; }
               actionContext.model.typeQName = "cornelsen:webcode";
               actionContext.model.formKey = "master";
        },

        columnValue: function(row, item, model, context)
        {
            var self = this;
            var projectId = self.observable("project").get().getId();
            var clientid = row.clientid;

            var value = this.base(row, item);

            if (item.key === "webcode") {

                var linkUri = this._linkUri(row, model, context);

                value =  "<h2 class='list-row-info title'>";
                value += "<a href='" + linkUri + "'>";
                value += OneTeam.filterXss(row.webcode || "") + " (" + OneTeam.filterXss(row.title || "") + ")";
                value += "</a>";
                value += "</h2>";

                if (row.__system()) {
                    var systemMetadata = row.__system();

                    var date;
                    date = new Date(systemMetadata.modified_on.ms);
                    value += "<p class='list-row-info modified'>Modified " + bundle.relativeDate(date);
                    value += " by " + OneTeam.filterXss(systemMetadata.modified_by) + "</p>";

                    date = new Date(systemMetadata.created_on.ms);
                    value += "<p class='list-row-info created'>Created " + bundle.relativeDate(date);
                    value += " by " + OneTeam.filterXss(systemMetadata.created_by) + "</p>";
                }
            } else if (item.key === "description") {
                value = OneTeam.filterXss(row.title || "");
            }

            return value;
        }

    }));

});