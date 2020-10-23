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
import Icon12Cancel from "@vkontakte/icons/dist/12/cancel";


let now = new Date().toLocaleDateString('en-GB');
let nowTime = now.split('.').reverse().join('-');

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
    const [deleteImgButtonCSS, setDeleteImgButtonCSS] = useState('turnOff');
    const [delDivCSS, setDelDivCSS] = useState('turnOff');

    // let pic; //Картинка очереди
    // let picName;
    // let picURL = '';

    useEffect(() => {
        if(global.queue.changedName !== undefined){
            setNewNameQueue(global.queue.changedName);
        }
        if(global.queue.changedDesc !== undefined){
            setNewDescription(global.queue.changedDesc);
        }
        if(global.queue.changedDate !== undefined){
            setNewDate(global.queue.changedDate);
        }
        if(global.queue.changedTime !== undefined){
            setNewTime(global.queue.changedTime);
        }
        if(global.queue.changedPlace !== undefined){
            setNewPlace(global.queue.changedPlace);
        }
        if(global.queue.changedAvatarName !== undefined){
            setDeleteImgButtonCSS('deleteImgButton');
            setDelDivCSS('divForDel');
            setNewAvatarName(global.queue.changedAvatarName);
        }

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
        if(global.queue.changedPicURLNew !== undefined){
            global.queue.avatarQueue = global.queue.changedPicURLNew
        }
    }


    const changeQueueOnServer = () => {
        setPopout(<ScreenSpinner/>);
        console.log(global.queue.changedPicURLNew);
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
                    "queueAvatarURL": global.queue.changedPicURLNew,
                    "queueDescription": newDescription,
                    "queueCode": global.queue.codeQueue,
                    "url": window.location.search.replace('?', '')
                })
            }).then(function (response) {
                return response.json();
            })
                .then(async function (data) {
                    if(data !== 'Deleted queue'){

                    let timeOutTime = 0;
                    if(global.queue.changedPicURLNew !== undefined || global.queue.changedPicURLNew !== ''){
                        timeOutTime = 5000;
                    }
                    await setTimeout(() => setPopout(null), timeOutTime);
                    setTimeout(() => setSnackbar(<Snackbar
                        layout="vertical"
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={blueBackground}><Icon16CheckCircle fill="#fff" width={14}
                                                                                            height={14}/></Avatar>}
                    >
                        Изменения сохранены!
                    </Snackbar>), timeOutTime);
                    }else{
                        setPopout(null);
                        setActivePanel('home');
                        history.pop();
                        history.pop();
                        setSnackbar(<Snackbar
                            layout="vertical"
                            onClose={() => setSnackbar(null)}
                            before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
                        >
                            Очередь была удалена!
                        </Snackbar>)
                    }
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
        global.queue.changedPic = e.target.files[0];
        global.queue.changedPicName = newNameQueue.replace(/\s+/g,'-') + '_' + (e.target.files[0].name).replace(/\s+/g,'') + getRandomInt(1000);
        global.queue.changedPicURL = 'https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o/' + global.queue.changedPicName + '?alt=media&token=bc19b8ba-dc95-4bcf-8914-c7b6163d1b3b';
        global.queue.changedPicURLNew = 'https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o/' + global.queue.changedPicName.replace(tmpArr[0], tmpArr[0] + '_200x200') + '?alt=media&token=bc19b8ba-dc95-4bcf-8914-c7b6163d1b3b';

        global.queue.changedAvatarName = e.target.files[0].name;
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
                           global.queue.changedName = e.target.value;
                           if(e.target.value.trim() === ''){
                               setFormStatusVisibility(true);
                               setFormStatusHeader('Введите название очереди!');
                           }else{
                               setFormStatusVisibility(false);
                           }
                           e.target.value.trim() ? setNewNameStatus('valid') : setNewNameStatus('error');
                           setNewNameQueue(e.target.value.substring(0, 32));
                       }}/>
                <Input id={'qPlace'} top={'Место проведения'} onClick={()=>{
                    setDateInput('turnOff');
                    setTimeInput('turnOff');
                    setTimeInputButton('dateAndTimeInputButton');
                    setDateInputButton('dateAndTimeInputButton')
                }} maxlength = "40" value={newPlace} onChange={e =>{
                    setNewPlace(e.target.value.substring(0, 40));
                    global.queue.changedPlace = e.target.value.trim();
                }}/>

                <FormLayoutGroup top="Дата проведения*">
                    <Button className={dateInputButton} before={<Icon28CalendarOutline/>} stretched={true} size={'xl'} mode={'secondary'} onClick={(qualifiedName, value)=>{
                        document.getElementById('qName').blur();
                        document.getElementById('qDesc').blur();
                        document.getElementById('qPlace').blur();
                        setDateInput('dateInput');
                        setDateInputButton('turnOff');

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

                           if (e.target.value === '' || pickedDate.toString() === 'Invalid Date') {
                               setNewDateStatus('error');
                               setFormStatusVisibility(true);
                               setFormStatusHeader('Введите дату!')
                               global.queue.dataCheck = true;
                           }
                           global.queue.changedDate = e.target.value;
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

                    }}>Выбрать время</Button>
                    <div className={timeInput}>
                <Input top={'Время начала'} className={timeInput} name={'time'} type={'time'} value={newTime} onChange={e => {
                    setNewTime(e.target.value);
                    global.queue.changedTime = e.target.value;
                }}/>
                    </div>
                </FormLayoutGroup>
                <File id={'fileInputID'} top="Аватарка очереди" accept="image/*" before={<Icon28Attachments />} controlSize="xl" mode="secondary"
                      onChange={(e) => {
                          setDeleteImgButtonCSS('deleteImgButton');
                          setDelDivCSS('divForDel');
                          onPhotoUpload(e);
                      }}/>
                <div className={delDivCSS}>
                <Text className={'uploadedImgName'}>{newAvatarName}<Button className={deleteImgButtonCSS}
                                                                           mode={'tertiary'}
                                                                           before={<Icon12Cancel/>}
                                                                           onClick={()=>{
                                                                               setNewAvatarName('');
                                                                               global.queue.changedPicURLNew = undefined;
                                                                               global.queue.changedPicURL = undefined;
                                                                               global.queue.changedAvatarName = undefined;
                                                                               setDeleteImgButtonCSS('turnOff');
                                                                               setDelDivCSS('turnOff');
                                                                               global.queue.changedPicName = undefined;
                                                                               document.getElementById('fileInputID').value = "";
                                                                           }}/></Text>

                </div>
                <Input id={'qDesc'} top={'Краткое описание очереди'} maxlength = "40" value={newDescription} onClick={()=>{
                    setDateInput('turnOff');
                    setTimeInput('turnOff');
                    setTimeInputButton('dateAndTimeInputButton');
                    setDateInputButton('dateAndTimeInputButton');
                }} onChange={e => {
                    setNewDescription(e.target.value.substring(0, 40));
                    global.queue.changedDesc = e.target.value.substring(0, 40);
                }}/>
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
                        if(global.queue.changedPicURL !== undefined) {
                            try {
                            fetch('https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o?uploadType=media&name=' + global.queue.changedPicName, {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'image/png',
                                },
                                body: global.queue.changedPic
                            }).then(function (response) {
                                return response.json();
                            })
                                .then(function (data) {
                                    console.log('Картинка успешно загружена!!!');
                                }).catch((e) => {
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
                        global.queue.changedPicURLNew = undefined;
                        global.queue.changedPicURL = undefined;
                        global.queue.changedPic = undefined;

                        global.queue.changedName = undefined;
                        global.queue.changedDesc = undefined;
                        global.queue.changedDate = undefined;
                        global.queue.changedTime = undefined;
                        global.queue.changedPlace = undefined;
                        global.queue.changedAvatarName = undefined;
                        setDeleteImgButtonCSS('turnOff');
                        setDelDivCSS('turnOff');
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