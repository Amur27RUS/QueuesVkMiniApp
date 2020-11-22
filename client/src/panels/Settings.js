import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {PanelHeader, Panel, Div, Group, Header, Cell, Switch, Avatar, Text, Separator, Snackbar} from "@vkontakte/vkui";
import Icon28Notifications from '@vkontakte/icons/dist/28/notifications';
import bridge from "@vkontakte/vk-bridge";
import Icon16Clear from "@vkontakte/icons/dist/16/clear";
import Icon16CheckCircle from "@vkontakte/icons/dist/16/check_circle";
import Icon24Favorite from '@vkontakte/icons/dist/24/favorite';
import queuesLogo from '../img/QueuesLogoNEW150x150.jpg';
const Settings = ({ id, go, fetchedUser, setSnackbar, snackbar}) => {
    const [VKgroup, setVKGroup] = useState(undefined);
    const [switchCheck, setSwitchCheck] = useState(false);
    const [switchDisabled, setSwitchDisabled] = useState(true)

    const blueBackground = {
        backgroundColor: 'var(--accent)'
    };

    useEffect(  () => {
        getAuthorsInfo();

        fetch('/notificationsCheck', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "url": window.location.search.replace('?', ''),
            })
        })

            .then(function (data) {
                return data.json();
            }).then(function (result){
                if(result.response.is_allowed === 1){

                    fetch('/checkNotificationsInDatabase', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "url": window.location.search.replace('?', ''),
                        })
                    })
                        .then(function (data) {
                            return data.json();
                        }).then(function (finalResult) {
                            console.log(finalResult);
                            if(finalResult === 'On' || finalResult === 'Null' || finalResult === 'no data'){
                                setSwitchCheck(true);
                                setSwitchDisabled(false);
                            }else{
                                setSwitchCheck(false);
                                setSwitchDisabled(false);
                            }
                    });
                }else{
                    setSwitchCheck(false);
                    setSwitchDisabled(false);
                }
            }).catch((e) => {
                console.log(e);
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
            const VKgroupP = await bridge.send('VKWebAppGetGroupInfo', {"group_id": 198211683});

            await setVKGroup(VKgroupP);
            console.log(VKgroup)
        }
    }, []);


    return (
        <Panel id={id}>
            <PanelHeader> Настройки </PanelHeader>
            <Group description="Наш бот будет присылать вам уведомления только тогда, когда вы будете на первом и втором местах в очереди. Попробуйте, это удобно!" header={<Header mode="secondary">Подключите уведомления:</Header>}>
                <Div className={'EnterDivv'}>
                    <Cell className={'cell'} before={<Icon28Notifications/>} asideContent={ <Switch disabled={switchDisabled} checked={switchCheck} onChange={async ()=>{
                        if(!switchCheck){
                            await bridge.send("VKWebAppAllowMessagesFromGroup", {"group_id": 198211683});
                            await fetch('/turnNotificationsOn', {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    "url": window.location.search.replace('?', ''),
                                })
                            }).then(function (data) {
                                return data.json();
                            }).then(function (finalResult) {

                            });
                            setSwitchCheck(true);
                            setSnackbar(<Snackbar
                                layout="vertical"
                                onClose={() => setSnackbar(null)}
                                before={<Avatar size={24} style={blueBackground}><Icon16CheckCircle fill="#fff" width={14} height={14}/></Avatar>}
                            >
                                Вы успешно подключили уведомления от бота!
                            </Snackbar>);
                        }else{
                            await fetch('/turnNotificationsOff', {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    "url": window.location.search.replace('?', ''),
                                })
                            }).then(function (data) {
                                return data.json();
                            }).then(function (finalResult) {
                                setSwitchCheck(false);
                                setSnackbar(<Snackbar
                                    layout="vertical"
                                    onClose={() => setSnackbar(null)}
                                    before={<Avatar size={24} style={blueBackground}><Icon16CheckCircle fill="#fff" width={14} height={14}/></Avatar>}
                                >
                                    Уведомления от бота отключены!
                                </Snackbar>);
                            });

                        }
                    }} />}>
                        Уведомления от бота
                    </Cell>
                </Div>
            </Group>

            {/*<Group description={'После добавления приложения в избранное, его можно будет легче найти среди других приложений'}*/}
            {/*       header={<Header mode="secondary">Добавь приложение в избранное:</Header>}>*/}
            {/*    <Div>*/}
            {/*    <Cell className={'cell'} before={<Icon24Favorite/>} onClick={async ()=>{*/}
            {/*        await bridge.send("VKWebAppAddToFavorites").then(function (data){*/}
            {/*            console.log(data);*/}
            {/*        })*/}

            {/*    }}>Добавить в избранное</Cell>*/}
            {/*    </Div>*/}
            {/*</Group>*/}


            <Group header={<Header mode="secondary">Наша группа в VK:</Header>}>
                <Div>
                    <a className={'linkToGroup'} href={'https://vk.com/queuesminiapp'} target={'_blank'}>
                    <Cell
                        id={'groupCell'}
                        className={'cell'}
                        before={<Avatar className={'avatar'} size={45} src={queuesLogo}/>}
                        description="По всем вопросам"
                        onClick={()=>document.getElementById('groupCell').click()}>
                        <text
                            className={'nameUser'}>{'Очереди!'}</text>
                    </Cell>
                    </a>
                </Div>
            </Group>
            <Div className={'versionDiv'}>
            <Text className={'version'}>Version: 1.2.0</Text>
            </Div>

            {snackbar}
        </Panel>
    );
}

Settings.propTypes = {
    id: PropTypes.string.isRequired,
    go: PropTypes.func.isRequired,
};

export default Settings;