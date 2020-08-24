import React, {useState} from 'react';
import {Button, PanelHeader, Panel,  FormLayout, Input, File, Text} from "@vkontakte/vkui";
import Icon28Attachments from '@vkontakte/icons/dist/28/attachments';
const MODAL_CARD_CHAT_INVITE = 'chat-invite';


const CreateQueue = ({ id, go, setActiveModal, fetchedUser, setQueueCODE}) => {
    const [nameQueue, setNameQueue] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [description, setDescription] = useState("");
    const [avatarName, setAvatarName] = useState("");
    const [place, setPlace] = useState("");

    // let pic; //Картинка очереди
    // let picName;
    // let picURL = '';

    const createQueueOnServer = () => {
        console.log('Отправлен запрос на создание очереди...');
        console.log('С параметрами:');
        console.log('id : ' + fetchedUser.id);
        console.log('Название очереди: ' + nameQueue);
        console.log('Mesto: ' + place);
        console.log('Дата проведения: ' + date.toString());
        console.log('Время проведения: ' + time);
        console.log('Описание очереди: ' + description);

        fetch('/createQueue', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "userID": fetchedUser.id,
                "queueName": nameQueue,
                "queuePlace": place,
                "queueTime": time,
                "queueDate": date,
                "queueAvatarURL": global.queue.picURL,
                "queueDescription": description,
            })
        }).then(function (response) {
            return response.json();
        })
            .then(function (data) {
                setQueueCODE(data);
            })
    };

    const onPhotoUpload = (e) => {
        global.queue.pic = e.target.files[0];
        global.queue.picName = nameQueue.replace(/\s+/g,'-') + '_' + (e.target.files[0].name).replace(/\s+/g,'') + getRandomInt(1000);
        global.queue.picURL = 'https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o/' + global.queue.picName + '?alt=media&token=bc19b8ba-dc95-4bcf-8914-c7b6163d1b3b';
        setAvatarName(e.target.files[0].name);
        console.log(global.queue.picURL);
        console.log(global.queue.picName);
        console.log(global.queue.pic);
    }

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * Math.floor(max));
    }

    return(
        <Panel id={id} >
            <PanelHeader> Создание очереди </PanelHeader>
            <FormLayout>
                <Input top={'Название очереди*'}
                       value={nameQueue}
                       status={nameQueue.trim() ? 'valid' : 'error'}
                       bottom={nameQueue.trim() ? '' : 'Пожалуйста, введите название!'}
                       onChange={e => setNameQueue(e.target.value)}/>
                <Input top={'Место проведения'} value={place} onChange={e =>setPlace(e.target.value)}/>
                <Input top={'Дата проведения'} name={'date'} type={'date'} value={date}
                       status={date.trim() ? 'valid' : 'error'} bottom={date.trim() ? '' : 'Пожалуйста, выберите дату!'} onChange={e =>setDate(e.target.value)}/>
                <Input top={'Время начала'} name={'time'} type={'time'} value={time} onChange={e => setTime(e.target.value)}/>
                <File top="Аватарка очереди" before={<Icon28Attachments />} controlSize="xl" mode="secondary"
                      onChange={(e) => {onPhotoUpload(e)}}/>
                <Text className={'uploadedImgName'}>{avatarName}</Text>
                <Input top={'Краткое описание очереди'} value={description} onChange={e => setDescription(e.target.value)}/>
                <Button size="xl" onClick={() => {
                    if(nameQueue.trim() !== '' && date.trim() !== '') {
                        createQueueOnServer();

                        fetch('https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o?uploadType=media&name=' + global.queue.picName, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'image/png',
                            },
                            body: global.queue.pic
                        }).then(function (response) {
                            return response.json();
                        })
                            .then(function (data) {
                                console.log('Картинка успешно загружена!!!');
                                setActiveModal(MODAL_CARD_CHAT_INVITE);
                            })
                    }
                }}>Создать</Button>
            </FormLayout>
        </Panel>
    );
}

export default CreateQueue;