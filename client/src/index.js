import "core-js/features/map";
import "core-js/features/set";
import React from 'react';
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import App from "./App";

global.scheme = {
    scheme: undefined,
    beginning: undefined,
}


// Init VK  Mini App
bridge.send("VKWebAppInit");
firstInstr();
bridge.subscribe(({ detail: { type, data }}) => {
    if (type === 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme');
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        console.log(schemeAttribute.value);
        if(schemeAttribute.value === 'bright_light'){
            bridge.send("VKWebAppSetViewSettings", {"status_bar_style": "dark"});
        }else{
            bridge.send("VKWebAppSetViewSettings", {"status_bar_style": "light"});
        }
        document.body.attributes.setNamedItem(schemeAttribute);
        global.scheme.scheme = schemeAttribute.value;
    }
});

async function firstInstr() {
    //Проверка, состоит ли человек в очередях
    fetch('/getQueues', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "url": window.location.search.replace('?', '')
        })
    }).then(function (response) {
        return response.json();
    })
        .then(function (data) {
            if (data.length !== 0) {
                global.scheme.beginning = true;
            }
        })

    //Если человека нет в очередях, проверяем, показывали ли мы ему инструкцию
    if (global.scheme.beginning === undefined){
        const instr = await bridge.send("VKWebAppStorageGetKeys", {"count": 1, "offset": 0});
        console.log(instr);
        if (instr.keys[0] === 'firstInstruction') {
            global.scheme.beginning = true;
        } else {
            global.scheme.beginning = false;
        }
    }
}

import("./eruda").then(({ default: eruda }) => {}); //runtime download

ReactDOM.render(<App tutorial={global.scheme.beginning}/>, document.getElementById("root"));