import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {PanelHeader, Panel, Div, Group, Header, Cell, Switch, Avatar, Text, Separator, Snackbar} from "@vkontakte/vkui";
import Icon28Notifications from '@vkontakte/icons/dist/28/notifications';
import bridge from "@vkontakte/vk-bridge";
import Icon16Clear from "@vkontakte/icons/dist/16/clear";

const Settings = ({ id, go, fetchedUser}) => {
    const [Klyuev, setKlyuev] = useState(undefined);
    const [Sobolev, setSobolev] = useState(undefined);
    const [VKgroup, setVKGroup] = useState(undefined);

    useEffect(  () => {
        fetch('https://api.vk.com/method/isMessagesFromGroupAllowed?group_id=198211683&user_id='+ fetchedUser.id +'&access_token=6c7ebd70e77ac095fc2aee45ddb1b06fcadca07a669b8fa1d9c1a789e1bed65d0b6e91772d3e8003534ac&v=5.124', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },

        }).then(function (response) {
            return response.json();

        })
            .then(function (data) {
                if(data.is_allowed){
                    console.log('Сообщения разрешены!')
                }else{
                    console.log('Сообщения запрещены!')
                }
            }).catch((e) => {
            console.log('Ошибка при проверки подписки на сообщения сообщества!')
            console.log(e);
        })

        async function getAuthorsInfo(){
            const KlyuevA = await bridge.send('VKWebAppGetUserInfo', {"user_id": 199833891});
            const SobolevP = await bridge.send('VKWebAppGetUserInfo', {"user_id": 143336543});
            const VKgroupP = await bridge.send('VKWebAppGetGroupInfo', {"group_id": 198211683});

            await setKlyuev(KlyuevA);
            await setSobolev(SobolevP);
            await setVKGroup(VKgroupP);
        }
        getAuthorsInfo();
    }, []);


    return (
        <Panel id={id}>
            <PanelHeader> Настройки </PanelHeader>
            <Group>
                <Div className={'EnterDiv'}>
                    <Cell className={'cell'} before={<Icon28Notifications/>} asideContent={<Switch />}>
                        Уведомления от бота
                    </Cell>
                </Div>
            </Group>
            <Group header={<Header mode="secondary">Наша группа в VK:</Header>}>
                    <Div>
                        <Cell
                            className={'cell'}
                            before={VKgroup === undefined ? <Avatar className={'avatar'} size={45}/> : <Avatar className={'avatar'} size={45} src={VKgroup.photo_200}/>}
                            onClick={() => window.open("https://vk.com/queuesminiapp")}
                        >
                            <text className={'nameUser'}>{VKgroup === undefined ? '' : VKgroup.name.replace('&#33;', '!')}</text>
                        </Cell>
                    </Div>
            </Group>
            <Group header={<Header mode="secondary">Разработчики:</Header>}>
                <Div>
                        <Cell
                            onClick={() => window.open("http://vk.com/id199833891")}
                            className={'cell'}
                            before={Klyuev === undefined ? <Avatar className={'avatar'} size={45}/> : <Avatar className={'avatar'} size={45} src={Klyuev.photo_200}/>}
                        >
                            <text className={'nameUser'}>{Klyuev === undefined ? '' : Klyuev.last_name + " " + Klyuev.first_name}</text>
                        </Cell>

                        <Cell
                        onClick={() => window.open("http://vk.com/id143336543")}
                        className={'cell'}
                        before={Sobolev === undefined ? <Avatar className={'avatar'} size={45}/> : <Avatar className={'avatar'} size={45} src={Sobolev.photo_200}/>}
                        >
                            <text className={'nameUser'}> {Sobolev === undefined ? '' : Sobolev.last_name + " " + Sobolev.first_name}</text>
                        </Cell>
                </Div>
            </Group>
        </Panel>
    );
}

Settings.propTypes = {
    id: PropTypes.string.isRequired,
    go: PropTypes.func.isRequired,
};

export default Settings;