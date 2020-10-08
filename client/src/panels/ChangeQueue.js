import React, {useState, useEffect} from 'react';
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
    Avatar, FormStatus, ScreenSpinner, FormLayoutGroup
} from "@vkontakte/vkui";
import Icon28Attachments from '@vkontakte/icons/dist/28/attachments';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon16CheckCircle from '@vkontakte/icons/dist/16/check_circle';
import Icon16Clear from '@vkontakte/icons/dist/16/clear';
import Icon28CalendarOutline from "@vkontakte/icons/dist/28/calendar_outline";
import Icon28RecentOutline from "@vkontakte/icons/dist/28/recent_outline";


let now = new Date().toLocaleDateString();
let nowTime = now.split('.').reverse().join('-')

let nowIOSTime = now.split('/').reverse().join('-');
let IOSdateError;
let today;
let pickedDate;

const СhangeQueue = ({ id, go, fetchedUser, history, setActivePanel, setPopout, setQueueCODE, snackbar, setSnackbar}) => {
    const [newNameQueue, setNewNameQueue] = useState(global.queue.name);
    const [newDate, setNewDate] = useState(global.queue.dateQueue.slice(0,10));
    const [newTime, setNewTime] = useState(global.queue.timeQueue);
    const [newDescription, setNewDescription] = useState(global.queue.descriptionQueue);
    const [newAvatarName, setNewAvatarName] = useState('');
    const [newPlace, setNewPlace] = useState(global.queue.placeQueue);
    const [newDateStatus, setNewDateStatus] = useState('');
    const [newNameStatus, setNewNameStatus] = useState('');
    const [formStatusHeader, setFormStatusHeader] = useState('');
    const [formStatusDescription, setFormStatusDescription] = useState('');
    const [formStatusVisibility, setFormStatusVisibility] = useState(false);
    const [timeInput, setTimeInput] = useState('turnOff');
    const [dateInput, setDateInput] = useState('turnOff');
    const [dateInputButton, setDateInputButton] = useState('dateAndTimeInputButton');
    const [timeInputButton, setTimeInputButton] = useState('timeInputButton');

    // let pic; //Картинка очереди
    // let picName;
    // let picURL = '';

    useEffect(() => {
        global.queue.counterForCalendar++;
        today = new Date(nowIOSTime);

        let dataCheck = document.getElementById('dateID');
        pickedDate = new Date(dataCheck.value);

        if(dataCheck.validity.rangeUnderflow){
            global.queue.dataCheck = false;
            setNewDateStatus('error');
            if(global.queue.counterForCalendar ===1) {
                setDateInputButton('turnOff');
                setDateInput('dateAndTimeInput');
            }
        }else{
            setFormStatusVisibility(false);
            global.queue.dataCheck = true;
        }


        if(today.getTime() > pickedDate.getTime()){
            IOSdateError = false;
            global.queue.dataCheck = false;
            setNewDateStatus('error');
            if(global.queue.counterForCalendar ===1) {
                setDateInputButton('turnOff');
                setDateInput('dateAndTimeInput');
            }
        }else {
            IOSdateError = true;
            setFormStatusVisibility(false);
            global.queue.dataCheck = true
        }
    });

    const changedQueue = () => {
        global.queue.name = newNameQueue
        global.queue.dateQueue = newDate
        global.queue.timeQueue = newTime
        global.queue.descriptionQueue = newDescription
        global.queue.placeQueue = newPlace
        if(global.queue.picURLNew !== undefined){
            global.queue.avatarQueue = global.queue.picURLNew
        }
    }


    const changeQueueOnServer = () => {
        setPopout(<ScreenSpinner/>);

        try {
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
                    "queueAvatarURL": global.queue.picURLNew,
                    "queueDescription": newDescription,
                    "queueCode": global.queue.codeQueue,
                    "url": window.location.search.replace('?', '')
                })
            }).then(function (response) {
                return response.json();
            })
                .then(async function (data) {
                    await setTimeout(() => setPopout(null), 5000);
                    setTimeout(() => setSnackbar(<Snackbar
                        layout="vertical"
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={blueBackground}><Icon16CheckCircle fill="#fff" width={14}
                                                                                            height={14}/></Avatar>}
                    >
                        Изменения сохранены!
                    </Snackbar>), 3000);
                })
                .catch((e) => {
                    setPopout(null);
                    setSnackbar(<Snackbar
                        layout="vertical"
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
                    >
                        Ошибка соединения! Проверьте интернет!
                    </Snackbar>);

                })
        }
        catch (e){
            console.log('Ошибка при обновлении очереди...');
        }
    };

    const onPhotoUpload = (e) => {
        let type = e.target.files[0].type;
        let tmp = type.split('/');
        type = tmp[tmp.length-1];
        let tst = e.target.files[0].name.split('.' + type);
        if(tst.length !== 2 && type === 'jpeg'){
            type = 'jpg';
            tst = e.target.files[0].name.split('.' + type);
        }

        let tmpArr = e.target.files[0].name.split('.');
        global.queue.pic = e.target.files[0];
        global.queue.picName = newNameQueue.replace(/\s+/g,'-') + '_' + (e.target.files[0].name).replace(/\s+/g,'') + getRandomInt(1000);
        global.queue.picURL = 'https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o/' + global.queue.picName + '?alt=media&token=bc19b8ba-dc95-4bcf-8914-c7b6163d1b3b';
        global.queue.picURLNew = 'https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o/' + global.queue.picName.replace(tmpArr[0], tmpArr[0] + '_200x200') + '?alt=media&token=bc19b8ba-dc95-4bcf-8914-c7b6163d1b3b';

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
            <PanelHeader left={<PanelHeaderButton onClick={() =>
            {
                history.pop()
                setSnackbar(null);
                setActivePanel(history[history.length - 1])
            }} data-to="aboutQueue">
                {<Icon28ChevronBack/>}
            </PanelHeaderButton>}
            > Редактирование </PanelHeader>
            <FormLayout noValidate={true}>
                {formStatusVisibility &&
                <FormStatus header={formStatusHeader} mode="error">
                    {formStatusDescription}
                </FormStatus>
                }
                <Input id={'qName'} top={'Название очереди*'}
                       value={newNameQueue}
                       maxlength = "32"
                       status={newNameStatus}
                       onClick={()=>{
                           setDateInput('turnOff');
                           setTimeInput('turnOff');
                           setTimeInputButton('dateAndTimeInputButton');
                           setDateInputButton('dateAndTimeInputButton')
                       }}
                       onChange={e => {
                           if(e.target.value.trim() === ''){
                               setFormStatusVisibility(true);
                               setFormStatusHeader('Введите название очереди!');
                           }else{
                               setFormStatusVisibility(false);
                           }
                           e.target.value.trim() ? setNewNameStatus('valid') : setNewNameStatus('error')
                           setNewNameQueue(e.target.value.substring(0, 32))
                       }}/>
                <Input id={'qPlace'} top={'Место проведения'} onClick={()=>{
                    setDateInput('turnOff');
                    setTimeInput('turnOff');
                    setTimeInputButton('dateAndTimeInputButton');
                    setDateInputButton('dateAndTimeInputButton')
                }} maxlength = "40" value={newPlace} onChange={e =>setNewPlace(e.target.value.substring(0, 40))}/>

                <FormLayoutGroup top="Дата проведения*">
                    <Button className={dateInputButton} before={<Icon28CalendarOutline/>} stretched={true} size={'xl'} mode={'secondary'} onClick={(qualifiedName, value)=>{
                        document.getElementById('qName').blur();
                        document.getElementById('qDesc').blur();
                        document.getElementById('qPlace').blur();
                        setDateInput('dateInput');
                        setDateInputButton('turnOff');
                        setTimeInput('turnOff');
                        setTimeInputButton('dateAndTimeInputButton');

                    }}>Выбрать дату</Button>
                    <div className={dateInput}>
                <Input top={'Дата проведения*'}
                       className={dateInput}
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
                               global.queue.dataCheck = false;
                               setNewDateStatus('error');
                               setFormStatusVisibility(true);
                               if(formStatusHeader === 'Введите название очереди!') {
                                   setFormStatusHeader('Неверная дата и название!');
                                   setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                               }else{
                                   setFormStatusHeader('Неверная дата!');
                                   setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                               }
                           }else{
                               setFormStatusVisibility(false);
                               setNewDateStatus('valid')
                               global.queue.dataCheck = true;
                           }

                           if(today.getTime() > pickedDate.getTime()){
                               setNewDateStatus('error');
                               IOSdateError = false;
                               setFormStatusVisibility(true);
                               global.queue.dataCheck = false;
                               if(formStatusHeader === 'Введите название очереди!') {
                                   setFormStatusHeader('Неверная дата и название!');
                                   setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                               }else{
                                   setFormStatusHeader('Неверная дата!');
                                   setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                               }
                           }else {
                               IOSdateError = true;
                               setNewDateStatus('valid');
                               setFormStatusVisibility(false);
                               global.queue.dataCheck = true
                           }
                           setNewDate(e.target.value)
                       }}/>
                    </div>
                </FormLayoutGroup>

                <FormLayoutGroup top="Время проведения">
                    <Button className={timeInputButton} before={<Icon28RecentOutline/>} stretched={true} size={'xl'} mode={'secondary'} onClick={(qualifiedName, value)=>{
                        document.getElementById('qName').blur();
                        document.getElementById('qDesc').blur();
                        document.getElementById('qPlace').blur();
                        setTimeInput('timeInput');
                        setTimeInputButton('turnOff');
                        setDateInput('turnOff');
                        setDateInputButton('dateAndTimeInputButton');

                    }}>Выбрать время</Button>
                    <div className={timeInput}>
                <Input top={'Время начала'} className={timeInput} name={'time'} type={'time'} value={newTime} onChange={e => setNewTime(e.target.value)}/>
                    </div>
                </FormLayoutGroup>
                <File top="Аватарка очереди" type={"image/*"} accept=".jp2, .gif, .jfif, .tif, .jpg, .png, .bmp, .raw, .psd, .tiff." before={<Icon28Attachments />} controlSize="xl" mode="secondary"
                      onChange={(e) => {onPhotoUpload(e)}}/>
                <Text className={'uploadedImgName'}>{newAvatarName}</Text>
                <Input id={'qDesc'} top={'Краткое описание очереди'} maxlength = "40" value={newDescription} onClick={()=>{
                    setDateInput('turnOff');
                    setTimeInput('turnOff');
                    setTimeInputButton('dateAndTimeInputButton');
                    setDateInputButton('dateAndTimeInputButton');
                }} onChange={e => setNewDescription(e.target.value.substring(0, 40))}/>
                <Button size="xl" onClick={() => {

                    if(!global.queue.dataCheck || !IOSdateError){
                        setNewDateStatus('error');
                        setFormStatusVisibility(true);
                        if(formStatusHeader === 'Введите название очереди!') {
                            setFormStatusHeader('Неверная дата и название!');
                            setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                            setDateInput('dateAndTimeInput');
                            setDateInputButton('turnOff');
                            window.scrollTo(0,0);
                        }else{
                            setFormStatusHeader('Неверная дата!');
                            setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                            setDateInput('dateAndTimeInput');
                            setDateInputButton('turnOff');
                            window.scrollTo(0,0);
                        }
                    }

                    let dataCheck = document.getElementById('dateID');
                    if(newNameQueue.trim() !== '' && newDate.trim() !== '' && IOSdateError && global.queue.dataCheck && !dataCheck.validity.rangeUnderflow) {
                        changeQueueOnServer();
                        changedQueue();
                        if(global.queue.picURL !== undefined) {
                            try {
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
                                .then(function () {
                                    setSnackbar(<Snackbar
                                        layout="vertical"
                                        onClose={() => setSnackbar(null)}
                                        before={<Avatar size={24} style={blueBackground}><Icon16CheckCircle fill="#fff" width={14}
                                                                                                            height={14}/></Avatar>}
                                    >
                                        Изменения сохранены!
                                    </Snackbar>)
                                    setPopout(null);
                                })
                                .catch((e) => {
                                setPopout(null);
                                setSnackbar(<Snackbar
                                    layout="vertical"
                                    onClose={() => setSnackbar(null)}
                                    before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
                                >
                                    Ошибка соединения! Проверьте интернет!
                                </Snackbar>);
                                console.log(e)
                            })
                        }
                    catch (e){
                            console.log('Ошибка при обновлении очереди...');
                        }
                    }

                    // setSnackbar(<Snackbar
                        //     layout="vertical"
                        //     onClose={() => setSnackbar(null)}
                        //     before={<Avatar size={24} style={blueBackground}><Icon16CheckCircle fill="#fff" width={14} height={14} /></Avatar>}
                        // >
                        //     Изменения сохранены!
                        // </Snackbar>)
                        global.queue.picURLNew = undefined;
                        global.queue.picURL = undefined;
                        global.queue.pic = undefined;
                    }else{
                        if(newDate.trim() === '' && newNameQueue.trim() === ''){
                            setNewNameStatus('error');
                            setNewDateStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите имя и дату!')
                            setDateInputButton('turnOff');
                            setDateInput('dateAndTimeInput');
                            window.scrollTo(0,0);

                        }else if(newNameQueue.trim() === '') {
                            setNewNameStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите имя!')
                            window.scrollTo(0,0);

                        }else if(newDate.trim() === '') {
                            setNewDateStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите дату!')
                            setDateInputButton('turnOff');
                            setDateInput('dateAndTimeInput');
                            window.scrollTo(0,0);
                        }
                    }
                }}>Сохранить</Button>
            </FormLayout>
            {snackbar}
        </Panel>
    );
}

export default СhangeQueue;