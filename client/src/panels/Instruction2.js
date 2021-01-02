import React from 'react';
import {Button, Div, Panel, PanelHeader, PanelHeaderButton, Text, Title} from "@vkontakte/vkui";
import phone from "../img/phone2.png";


const Instruction2 = ({id, setActivePanel, skip}) => {

    const continuee = () => {
        setActivePanel('instruction3')
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
                <Title className={'textInstruction'} level="1" weight="heavy" style={{ marginBottom: 8 }}>Создавай очередь</Title>
                <Text className={'textInstruction2'} weight="regular" style={{ marginBottom: 12 }}>Для создания очереди просто зайдите в меню создания и заполните поля.</Text>
            </Div>
            <Div>
                <Button stretched={true} size={'l'} className={'buttonContinue'} onClick={continuee}>Окей</Button>
            </Div>
        </Panel>
    )
}


export default Instruction2;