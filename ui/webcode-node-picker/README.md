# webcode-node-picker
Implement a custom node picker for selecting webcodes

Register as a module in Platform Settings.
module-id: webcode-node-picker-field
URL: https://github.com/harrymoore/cornelsen.git
Path: /ui/webcode-node-picker

example usage in a form field:
    "fields": {
        "webcode": {
            "type": "webcode-node-picker",
            "label": "Webcode",
            "helpers": [
                "Choose the Webcode for this reference"
            ],
            "picker": {
                "typeQName": "cornelsen:webcode",
                "pickerTitle": "Select a Webcode",
                "displayLabel": "Webcode",
                "displayProperty": "webcode"
            }
        },
 