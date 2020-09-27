import "core-js/features/map";
import "core-js/features/set";
import React from "react";
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import App from "./App";

global.scheme = {
    scheme: undefined,
}
// Проверка подписи


// Init VK  Mini App
bridge.send("VKWebAppInit");
bridge.subscribe(({ detail: { type, data }}) => {
    if (type === 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme');
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        if(schemeAttribute.value === 'client_light'){
            bridge.send("VKWebAppSetViewSettings", {"status_bar_style": "light"});
        }else{
            bridge.send("VKWebAppSetViewSettings", {"status_bar_style": "dark"});
        }
        document.body.attributes.setNamedItem(schemeAttribute);
        global.scheme.scheme = schemeAttribute.value;
    }
});
ReactDOM.render(<App />, document.getElementById("root"));
