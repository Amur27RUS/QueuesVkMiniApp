import React, {useState} from 'react';
import {Button, PanelHeader, Panel, FormLayout, Input, File, Text, PanelHeaderButton} from "@vkontakte/vkui";
import Icon28Attachments from '@vkontakte/icons/dist/28/attachments';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';



const СhangeQueue = ({ id, go, fetchedUser, setQueueCODE}) => {
    const [newNameQueue, setNewNameQueue] = useState(global.queue.name);
    const [newDate, setNewDate] = useState(global.queue.dateQueue);
    const [newTime, setNewTime] = useState(global.queue.timeQueue);
    const [newDescription, setNewDescription] = useState(global.queue.descriptionQueue);
    const [newAvatarName, setNewAvatarName] = useState(global.queue.picName);
    const [newPlace, setNewPlace] = useState(global.queue.placeQueue);

    // let pic; //Картинка очереди
    // let picName;
    // let picURL = '';

    const changedQueue = () => {
        global.queue.name = newNameQueue
        global.queue.dateQueue = newDate
        global.queue.timeQueue = newTime
        global.queue.descriptionQueue = newDescription
        global.queue.placeQueue = newPlace
        global.queue.avatarQueue = global.queue.picURL
    }

    const changeQueueOnServer = () => {

        fetch('/changeQueue', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "queueName": newNameQueue,
                "queuePlace": newPlace,
                "queueTime": newTime,
                "queueDate": newDate,
                "queueAvatarURL": global.queue.picURL,
                "queueDescription": newDescription,
                "queueCode": global.queue.codeQueue,
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
        global.queue.picName = newNameQueue.replace(/\s+/g,'-') + '_' + (e.target.files[0].name).replace(/\s+/g,'') + getRandomInt(1000);
        global.queue.picURL = 'https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o/' + global.queue.picName + '?alt=media&token=bc19b8ba-dc95-4bcf-8914-c7b6163d1b3b';
        setNewAvatarName(e.target.files[0].name);
        console.log(global.queue.picURL);
        console.log(global.queue.picName);
        console.log(global.queue.pic);
    }

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * Math.floor(max));
    }

    return(
        <Panel id={id} >
            <PanelHeader left={<PanelHeaderButton onClick={go} data-to="aboutQueue">
                {<Icon28ChevronBack/>}
            </PanelHeaderButton>}
            > Редактирование очереди </PanelHeader>
            <FormLayout>

                <Input top={'Название очереди*'}
                       value={newNameQueue}
                       status={newNameQueue.trim() ? 'valid' : 'error'}
                       bottom={newNameQueue.trim() ? '' : 'Пожалуйста, введите название!'}
                       onChange={e => setNewNameQueue(e.target.value)}/>
                <Input top={'Место проведения'} value={newPlace} onChange={e =>setNewPlace(e.target.value)}/>
                <Input top={'Дата проведения'} name={'date'} type={'date'} value={newDate}
                       status={newDate.trim() ? 'valid' : 'error'} bottom={newDate.trim() ? '' : 'Пожалуйста, выберите дату!'} onChange={e =>setNewDate(e.target.value)}/>
                <Input top={'Время начала'} name={'time'} type={'time'} value={newTime} onChange={e => setNewTime(e.target.value)}/>
                <File top="Аватарка очереди" before={<Icon28Attachments />} controlSize="xl" mode="secondary"
                      onChange={(e) => {onPhotoUpload(e)}}/>
                <Text className={'uploadedImgName'}>{newAvatarName}</Text>
                <Input top={'Краткое описание очереди'} value={newDescription} onChange={e => setNewDescription(e.target.value)}/>
                <Button size="xl" onClick={() => {
                    if(newNameQueue.trim() !== '' && newDate.trim() !== '') {
                        changeQueueOnServer();
                        changedQueue();
                        if(global.queue.pic !== undefined) {
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
                                })
                        }
                    }
                }}>Сохранить</Button>
            </FormLayout>
        </Panel>
    );
}

export default СhangeQueue;