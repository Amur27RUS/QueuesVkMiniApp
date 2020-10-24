import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import PropTypes from 'prop-types';
import {Button, Div, Panel, PanelHeader, PanelHeaderButton, Text, Title} from "@vkontakte/vkui";
import phone from "../img/phone4.png";


const Instruction4 = ({id, setActivePanel, skip}) => {

    const continuee = () => {
        setActivePanel('instruction5')
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
                <Title className={'textInstruction'} level="1" weight="heavy" style={{ marginBottom: 8 }}>Режим админа</Title>
                <Text className={'textInstruction2'} weight="regular" style={{ marginBottom: 12 }}>Для администраторов очереди предусмотрен дополнительный функционал.</Text>
            </Div>
            <Div>
                <Button stretched={true} size={'l'} className={'buttonContinue'} onClick={continuee}>Вау</Button>
            </Div>
        </Panel>
    )
}


export default Instruction4;