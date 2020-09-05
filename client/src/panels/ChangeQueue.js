import React, {useState} from 'react';
import {
    Button,
    PanelHeader,
    Panel,
    FormLayout,
    Input,
    File,
    Text,
    PanelHeaderButton,
    Snackbar,
    Avatar, FormStatus
} from "@vkontakte/vkui";
import Icon28Attachments from '@vkontakte/icons/dist/28/attachments';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon16CheckCircle from '@vkontakte/icons/dist/16/check_circle';


let now = new Date().toLocaleDateString();
let nowTime = now.split('.').reverse().join('-')

let nowIOSTime = now.split('/').reverse().join('-');
let IOSdateError;
let today;
let pickedDate;

const СhangeQueue = ({ id, go, fetchedUser, setQueueCODE, snackbar, setSnackbar}) => {
    const [newNameQueue, setNewNameQueue] = useState(global.queue.name);
    const [newDate, setNewDate] = useState(global.queue.dateQueue.slice(0,10));
    const [newTime, setNewTime] = useState(global.queue.timeQueue);
    const [newDescription, setNewDescription] = useState(global.queue.descriptionQueue);
    const [newAvatarName, setNewAvatarName] = useState(global.queue.picName);
    const [newPlace, setNewPlace] = useState(global.queue.placeQueue);
    const [newDateStatus, setNewDateStatus] = useState('');
    const [newNameStatus, setNewNameStatus] = useState('');
    const [formStatusHeader, setFormStatusHeader] = useState('');
    const [formStatusDescription, setFormStatusDescription] = useState('');
    const [formStatusVisibility, setFormStatusVisibility] = useState(false);

    // let pic; //Картинка очереди
    // let picName;
    // let picURL = '';

    const changedQueue = () => {
        global.queue.name = newNameQueue
        global.queue.dateQueue = newDate
        global.queue.timeQueue = newTime
        global.queue.descriptionQueue = newDescription
        global.queue.placeQueue = newPlace
        if(global.queue.picURL !== undefined){
            global.queue.avatarQueue = global.queue.picURL
        }
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
                "url": window.location.search.replace('?', '')
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
    }

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * Math.floor(max));
    }
    const blueBackground = {
        backgroundColor: 'var(--accent)'
    };

    return(
        <Panel id={id} >
            <PanelHeader left={<PanelHeaderButton onClick={go} data-to="aboutQueue">
                {<Icon28ChevronBack/>}
            </PanelHeaderButton>}
            > Редактирование </PanelHeader>
            <FormLayout noValidate={true}>
                {formStatusVisibility &&
                <FormStatus header={formStatusHeader} mode="error">
                    {formStatusDescription}
                </FormStatus>
                }
                <Input top={'Название очереди*'}
                       value={newNameQueue}
                       maxlength = "32"
                       status={newNameStatus}
                       onChange={e => {
                           if(e.target.value.trim() === ''){
                               setFormStatusVisibility(true);
                               setFormStatusHeader('Введите имя очереди!')
                           }else{
                               setFormStatusVisibility(false);
                           }
                           e.target.value.trim() ? setNewNameStatus('valid') : setNewNameStatus('error')
                           setNewNameQueue(e.target.value)
                       }}/>
                <Input top={'Место проведения'} maxlength = "40" value={newPlace} onChange={e =>setNewPlace(e.target.value)}/>
                <Input top={'Дата проведения*'}
                       name={'date'}
                       type={'date'}
                       id = {'dateID'}
                       value={newDate}
                       status={newDateStatus}
                       min = {nowTime}
                       onChange={e =>{
                           today = new Date(nowIOSTime);
                           pickedDate = new Date(e.target.value);
                           let dataCheck = document.getElementById('dateID');
                           if(dataCheck.validity.rangeUnderflow){
                               setNewDateStatus('error');
                               setFormStatusVisibility(true);
                               setFormStatusHeader('Неверная дата!');
                               setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                           }else{
                               setFormStatusVisibility(false);
                               setNewDateStatus('valid')
                           }

                           if(today.getTime() > pickedDate.getTime()){
                               setNewDateStatus('error');
                               IOSdateError = false;

                           }else {
                               IOSdateError = true;
                               if(!formStatusVisibility) {
                                   e.target.value.trim() ? setNewDateStatus('valid') : setNewDateStatus('error');
                               }                           }
                           setNewDate(e.target.value)
                       }}/>
                <Input top={'Время начала'} name={'time'} type={'time'} value={newTime} onChange={e => setNewTime(e.target.value)}/>
                <File top="Аватарка очереди" before={<Icon28Attachments />} controlSize="xl" mode="secondary"
                      onChange={(e) => {onPhotoUpload(e)}}/>
                <Text className={'uploadedImgName'}>{newAvatarName}</Text>
                <Input top={'Краткое описание очереди'} maxlength = "40" value={newDescription} onChange={e => setNewDescription(e.target.value)}/>
                <Button size="xl" onClick={() => {
                    let dataCheck = document.getElementById('dateID');

                    if(newNameQueue.trim() !== '' && newDate.trim() !== '' && !dataCheck.validity.rangeUnderflow) {
                        changeQueueOnServer();
                        changedQueue();
                        if(global.queue.picURL !== undefined) {
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
                        setSnackbar(<Snackbar
                            layout="vertical"
                            onClose={() => setSnackbar(null)}
                            before={<Avatar size={24} style={blueBackground}><Icon16CheckCircle fill="#fff" width={14} height={14} /></Avatar>}
                        >
                            Изменения сохранены!
                        </Snackbar>)
                        global.queue.picURL = undefined;
                        global.queue.pic = undefined;
                    }else{
                        if(newDate.trim() === '' && newNameQueue.trim() === ''){
                            setNewNameStatus('error');
                            setNewDateStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите имя и дату!')

                        }else if(newNameQueue.trim() === '') {
                            setNewNameStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите имя!')

                        }else if(newDate.trim() === '') {
                            setNewDateStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите дату!')
                        }
                    }
                }}>Сохранить</Button>
            </FormLayout>
            {snackbar}
        </Panel>
    );
}

export default СhangeQueue;