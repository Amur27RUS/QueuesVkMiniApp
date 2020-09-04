import "core-js/features/map";
import "core-js/features/set";
import React from "react";
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import App from "./App";

global.scheme = {
    scheme: undefined,
}

// Проверка на подлинность

fetch('/checkSign', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        "url": window.location.search.replace('?', ''),
    })
}).then(function (response) {
    return response.json();

})
    .then(function (data) {
        if(data === 'ok'){
            console.log('чел нормальный');
        }else if(data === 'fail'){
            console.log('Лови хацкера!');
        }
    }).catch((e) => {
    console.log('Упс... Запрос на проверку сертификата не прошёл...')
})


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
