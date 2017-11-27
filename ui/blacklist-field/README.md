# blacklist-field
Implement a black list custom field

Register as a module in Platform Settings.
module-id: blacklist-field
URL: https://github.com/harrymoore/cornelsen.git
Path: /ui/blacklist-field

black list is sub classed from the "uppercase" field so it automatically makes letters upper case.

example usage in a form field:
        "webcode": {
            "type": "blacklist",
            "disallowEmptySpaces": true,
            "minLength": 6,
            "maxLength": 8,
            "label": "Webcode",
            "placeholder": "webcode",
            "listNodeId": "1e395843ca23c2ac02a2",
            "listNodeProperty": "blacklist",
            "existingIdType": "cornelsen:webcode",
            "existingIdProperty": "webcode",
            "generateOnEmpty": true,
            "helpers": [
                "Should consist of 6-8 uppercase letters and numbers"
            ]
        },
