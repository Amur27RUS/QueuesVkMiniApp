import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {PanelHeader, Panel, Div, Group, Header, Cell, Switch, Avatar, Text, Separator, Snackbar} from "@vkontakte/vkui";
import Icon28Notifications from '@vkontakte/icons/dist/28/notifications';
import bridge from "@vkontakte/vk-bridge";
import Icon16Clear from "@vkontakte/icons/dist/16/clear";
import Icon16CheckCircle from "@vkontakte/icons/dist/16/check_circle";

const Settings = ({ id, go, fetchedUser, setSnackbar, snackbar}) => {
    const [Klyuev, setKlyuev] = useState(undefined);
    const [Sobolev, setSobolev] = useState(undefined);
    const [VKgroup, setVKGroup] = useState(undefined);
    const [switchCheck, setSwitchCheck] = useState(undefined);
    const [switchDisabled, setSwitchDisabled] = useState(true)

    const blueBackground = {
        backgroundColor: 'var(--accent)'
    };

    useEffect(  () => {
        bridge.send("VKWebAppCallAPIMethod", {"method": "messages.isMessagesFromGroupAllowed", "request_id": "32test", "params": {"group_id": 198211683, "user_id": fetchedUser.id, "access_token":"", "v":"5.124"}})
            .then(function (data) {
                console.log(data)
                if(data.response.is_allowed === 1){
                    console.log('Сообщения разрешены!')
                    setSwitchCheck(true);
                    setSwitchDisabled(false);
                }else{
                    console.log('Сообщения запрещены!')
                    setSwitchCheck(false);
                    setSwitchDisabled(false);
                }
            }).catch((e) => {
            console.log('Ошибка при проверки подписки на сообщения сообщества!');
            setSnackbar(<Snackbar
                layout="vertical"
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
            >
                Ошибка соединения! Проверьте интернет!
            </Snackbar>);
        });

        async function getAuthorsInfo(){
            const KlyuevA =await bridge.send('VKWebAppGetUserInfo', {"user_id": 199833891});
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
                    <Cell className={'cell'} before={<Icon28Notifications/>} asideContent={ <Switch disabled={switchDisabled} checked={switchCheck} onChange={async ()=>{
                        if(!switchCheck){
                            await bridge.send("VKWebAppAllowMessagesFromGroup", {"group_id": 198211683});
                            setSwitchCheck(true);
                            setSnackbar(<Snackbar
                                layout="vertical"
                                onClose={() => setSnackbar(null)}
                                before={<Avatar size={24} style={blueBackground}><Icon16CheckCircle fill="#fff" width={14} height={14}/></Avatar>}
                            >
                                Вы успешно подключили уведомления от бота!
                            </Snackbar>)
                        }else{
                            let accessToken = null;
                            await bridge.send("VKWebAppGetAuthToken", {"app_id": 7551421, "scope": "messages"})
                                .then(function (response){
                                    accessToken = response.access_token;
                            });
                            // await bridge.send("VKWebAppDenyMessagesFromGroup", {"group_id": 198211683});
                            await bridge.send("VKWebAppCallAPIMethod", {"method": "messages.denyMessagesFromGroup", "request_id": "32test", "params": {"group_id": 198211683, "v":"5.124", "access_token":accessToken}})
                                .then(function (data) {
                                    console.log(data)
                                    if(data.response.response === 1) {
                                        setSnackbar(<Snackbar
                                            layout="vertical"
                                            onClose={() => setSnackbar(null)}
                                            before={<Avatar size={24} style={blueBackground}><Icon16CheckCircle fill="#fff" width={14} height={14}/></Avatar>}
                                        >
                                            Вы отписались от уведомлений бота!
                                        </Snackbar>)
                                    }else{
                                        setSnackbar(<Snackbar
                                            layout="vertical"
                                            onClose={() => setSnackbar(null)}
                                            before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
                                        >
                                            Произошла ошибка при отписке от бота
                                        </Snackbar>);
                                    }

                                }).catch((e) => {
                                console.log('Ошибка при отписки от сообщений сообщества!')
                                    setSnackbar(<Snackbar
                                        layout="vertical"
                                        onClose={() => setSnackbar(null)}
                                        before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
                                    >
                                        Ошибка соединения! Проверьте интернет!
                                    </Snackbar>);
                            });
                            setSwitchCheck(false);
                        }
                    }} />}>
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
            {snackbar}
        </Panel>
    );
}

Settings.propTypes = {
    id: PropTypes.string.isRequired,
    go: PropTypes.func.isRequired,
};

export default Settings;