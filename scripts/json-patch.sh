#!/bin/bash
# BASE_URL=https://api1.cloudcms.com
BASE_URL=https://localhost:59247

# this script requires the "jq" command: https://stedolan.github.io/jq/
# set JQ_COMMAND to the path to the jq binary
JQ_COMMAND=/usr/local/Cellar/jq/1.5_2/bin/jq

# plug in your API keys and application id here
CLIENT_KEY=490bb300-494b-41b3-972d-0f1b03ec68b4
CLIENT_SECRET=MYLgxl4o2Gaeu0JuEGTavG7rWymuWstd7awNSatCdSpCg13VhfVixvfo4ztB3hd+BddEiybd8QuQt9IBlKVUUmeu1/gYfZXYo8AEvLQPUF0=
USERNAME=e77dba37-491d-4b5a-a0ef-ba0edf6fd6b5
PASSWORD=YQ2TfbPo8XUScDUiTs45nL2lwb+V4GtbW14yAul+beYuJG/M9conlij/D1xc7a4jKFCFdjMrZjCJk/g4wMV44rHH5hlUUrJEmxLvUlFM3AE=

REPO_ID=231ad31b06a0cfba43f0
BRANCH_ID=37d7bc92691fcf3458f2
NODE_ID=a3c9d2c6644b23bafcde

# request the access token
ACCESS_TOKEN_REQUEST_RESPONSE=$(curl --insecure -X POST -u "$CLIENT_KEY:$CLIENT_SECRET" --data-urlencode "grant_type=password" --data-urlencode "username=$USERNAME" --data-urlencode "password=$PASSWORD" "$BASE_URL/oauth/token")
ACCESS_TOKEN=$(echo $ACCESS_TOKEN_REQUEST_RESPONSE | $JQ_COMMAND -r '.access_token')

# ping:
JSON_RESPONSE=$(curl -v --insecure -X GET -H "Content-Type: application/json" -H "Authorization: bearer $ACCESS_TOKEN" "$BASE_URL/ping")

# json patch
JSON_RESPONSE=$(curl -v --insecure -X PATCH --data "[{ \"op\": \"replace\", \"path\": \"/title\", \"value\": \"New Title\" }]" -H "Content-Type: application/json" -H "Authorization: bearer $ACCESS_TOKEN" "$BASE_URL/repositories/$REPO_ID/branches/$BRANCH_ID/nodes/$NODE_ID")

# show repositories json
echo $JSON_RESPONSE
echo

