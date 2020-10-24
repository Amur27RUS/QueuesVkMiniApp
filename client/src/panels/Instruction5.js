import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import PropTypes from 'prop-types';
import {Button, Div, Panel, PanelHeader, PanelHeaderButton, Text, Title} from "@vkontakte/vkui";
import phone from "../img/phone5.png";


const Instruction5 = ({id, setActivePanel, skip}) => {

    const continuee = () => {
        setActivePanel('instruction6')
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
                <Title className={'textInstruction'} level="1" weight="heavy" style={{ marginBottom: 8 }}>Приглашения</Title>
                <Text className={'textInstruction2'} weight="regular" style={{ marginBottom: 12 }}>Приглашайте людей помощью ссылки или кода.</Text>
            </Div>
            <Div>
                <Button stretched={true} size={'l'} className={'buttonContinue'} onClick={continuee}>Продолжить</Button>
            </Div>
        </Panel>
    )
}


export default Instruction5;