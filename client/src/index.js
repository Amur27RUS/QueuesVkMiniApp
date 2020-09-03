import "core-js/features/map";
import "core-js/features/set";
import React from "react";
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import App from "./App";

global.scheme = {
    scheme: undefined,
}
const qs = require('querystring');
const crypto = require('crypto');

const urlParams = qs.parse(window.location.search);
const ordered = {};
Object.keys(urlParams).sort().forEach((key) => {
    if (key.slice(0, 3) === 'vk_') {
        ordered[key] = urlParams[key];
    }
});

/*
vk_access_token_settings=notify
&vk_app_id=6736218
&vk_are_notifications_enabled=0
&vk_is_app_user=0
&vk_language=ru
&vk_platform=android
&vk_user_id=494075


vk_app_id=7551421
&vk_are_notifications_enabled=0
&vk_is_app_user=1
&vk_is_favorite=1
&vk_language=ru
&vk_platform=mobile_web
&vk_ref=other
&vk_user_id=199833891
 */

const stringParams = qs.stringify(ordered);
const paramsHash = crypto
    .createHmac('sha256', 'BwCbyUaL4oTdKzuNXYIy')
    .update(stringParams)
    .digest()
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=$/, '');

console.log(stringParams);
console.log('TEST');
console.log(paramsHash === urlParams.sign);
console.log(paramsHash);
console.log(urlParams.sign);


// Init VK  Mini App
bridge.send("VKWebAppInit");
bridge.subscribe(({ detail: { type, data }}) => {
    if (type === 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme');
        console.log(schemeAttribute.value)
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        document.body.attributes.setNamedItem(schemeAttribute);
        global.scheme.scheme = schemeAttribute.value;
    }
});
ReactDOM.render(<App />, document.getElementById("root"));
