import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import PropTypes from 'prop-types';
import {Button, Div, Panel, PanelHeader, PanelHeaderButton, Text, Title} from "@vkontakte/vkui";
import phone from "../img/phone3.png";


const Instruction3 = ({id, setActivePanel, skip}) => {

    const continuee = () => {
        setActivePanel('instruction4')
    }

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
                <Title className={'textInstruction'} level="1" weight="heavy" style={{ marginBottom: 8 }}>Меню действий</Title>
                <Text className={'textInstruction2'} weight="regular" style={{ marginBottom: 12 }}>Здесь находятся все ваши возможные действия.</Text>
            </Div>
            <Div>
                <Button stretched={true} size={'l'} className={'buttonContinue'} onClick={continuee}>Удобно!</Button>
            </Div>
        </Panel>
    )
}


export default Instruction3;