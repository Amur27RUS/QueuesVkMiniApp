import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import PropTypes from 'prop-types';
import {Button, Div, Panel, PanelHeader, PanelHeaderButton, Text, Title} from "@vkontakte/vkui";
import phone from "../img/phone6.png";


const Instruction6 = ({id, setActivePanel, setActiveStory, skip, setTabbarCSS}) => {


    return(
        <Panel id={id}>
            <PanelHeader
                separator={false}
                left={<PanelHeaderButton onClick={skip}>
                    Пропустить
                </PanelHeaderButton>}/>
            <Div>
                <img className={'imgForTutor'} src={phone}/>
            </Div>

            <Div>
                <Title className={'textInstruction'} level="1" weight="heavy" style={{ marginBottom: 8 }}>Уведомления от бота</Title>
                <Text className={'textInstruction2'} weight="regular" style={{ marginBottom: 12 }}>Бот будет присылать вам сообщения, когда вы на первом и втором месте в очереди :)</Text>
            </Div>
            <Div>
                <Button stretched={true} size={'l'} className={'buttonContinue'} onClick={skip}>Погнали!</Button>
            </Div>
        </Panel>
    )
}


export default Instruction6;