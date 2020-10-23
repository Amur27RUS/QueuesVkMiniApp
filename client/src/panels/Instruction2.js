import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import PropTypes from 'prop-types';
import {Button, Div, Panel, PanelHeader, PanelHeaderButton, Text, Title} from "@vkontakte/vkui";
import phone from "../img/phone2.png";


const Instruction2 = ({id, beginning, setBeginning, setActivePanel}) => {

    const continuee = () => {
        setActivePanel('instruction3')
    }

    const skip = async () => {
        global.queue.beginning = true
        setActivePanel('home')
        await bridge.send("VKWebAppAllowMessagesFromGroup", {"group_id": 198211683});
        await bridge.send("VKWebAppStorageSet", {"key": "firstInstruction", "value": 'true'});
    }

    return(
        <Panel id={id}>
            <PanelHeader
                separator={false}
                left={<PanelHeaderButton onClick={skip}>
                    Пропустить
                </PanelHeaderButton>}/>
            <Div>
                <img src={phone}/>
            </Div>

            <Div>
                <Title className={'textInstruction'} level="1" weight="heavy" style={{ marginBottom: 8 }}>Создавай очередь</Title>
                <Text className={'textInstruction2'} weight="regular" style={{ marginBottom: 12 }}>Для создания очереди просто зайдите в меню создания и заполните поля.</Text>
            </Div>
            <Div>
                <Button stretched={true} size={'l'} className={'buttonContinue'} onClick={continuee}>Продолжить</Button>
            </Div>
        </Panel>
    )
}


export default Instruction2;