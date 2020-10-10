import React, {useState, useEffect} from 'react';
import {
    Button,
    PanelHeader,
    Panel,
    FormLayout,
    Input,
    File,
    Text,
    FormStatus,
    ScreenSpinner,
    Avatar, Snackbar, Div, FormLayoutGroup, IOS, platform
} from "@vkontakte/vkui";
import Icon28Attachments from '@vkontakte/icons/dist/28/attachments';
import Icon16Clear from '@vkontakte/icons/dist/16/clear';
import Icon12Cancel from '@vkontakte/icons/dist/12/cancel';
import Icon28CalendarOutline from '@vkontakte/icons/dist/28/calendar_outline';
import Icon28RecentOutline from '@vkontakte/icons/dist/28/recent_outline';

const MODAL_CARD_CHAT_INVITE = 'chat-invite';



let now = new Date().toLocaleDateString();
let nowTime = now.split('.').reverse().join('-');

let nowIOSTime = now.split('/').reverse().join('-');
let IOSdateError = true;
let today;
let pickedDate;
let imgERR = false;
const osName = platform();

const CreateQueue = ({ snackbar, id, go, history, setActiveModal, fetchedUser, setQueueCODE, setPopout, setSnackbar}) => {
    const [nameQueue, setNameQueue] = useState(global.queue.createName);
    const [date, setDate] = useState(global.queue.createDate);
    const [time, setTime] = useState(global.queue.createTime);
    const [description, setDescription] = useState(global.queue.createDescription);
    const [avatarName, setAvatarName] = useState("");
    const [place, setPlace] = useState(global.queue.createPlace);
    const [queueNameStatus, setQueueNameStatus] = useState('');
    const [queueDateStatus, setQueueDateStatus] = useState('');
    const [formStatusHeader, setFormStatusHeader] = useState('');
    const [formStatusDescription, setFormStatusDescription] = useState('');
    const [formStatusVisibility, setFormStatusVisibility] = useState(false);
    const [checkPhoto, setCheckPhoto] = useState(false);
    const [uploadedPhoto, setUploadedPhoto] = useState(undefined);
    const [deleteImgButtonCSS, setDeleteImgButtonCSS] = useState('turnOff');
    const [delDivCSS, setDelDivCSS] = useState('turnOff');
    const [timeInput, setTimeInput] = useState('turnOff');
    const [dateInput, setDateInput] = useState('turnOff');
    const [dateInputButton, setDateInputButton] = useState('dateAndTimeInputButton');
    const [timeInputButton, setTimeInputButton] = useState('timeInputButton');

    useEffect(() => {
        setAvatarName(global.queue.avatarName);
        if(global.queue.avatarName !== undefined){
            setDeleteImgButtonCSS('deleteImgButton');
            setDelDivCSS('divForDel');
        }
    })

    const createQueueOnServer = async () => {
        setPopout(<ScreenSpinner/>);
        console.log('Отправлен запрос на создание очереди...');

        try {
            fetch('/createQueue', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "queueName": nameQueue,
                    "queuePlace": place,
                    "queueTime": time,
                    "queueDate": date,
                    "queueAvatarURL": global.queue.picURLNew,
                    "queueDescription": description,
                    "url": window.location.search.replace('?', '')
                })
            }).then(function (response) {
                return response.json();
            })
                .then(async function (data) {
                    if (data === 'LIMIT REACHED') {
                        setSnackbar(<Snackbar
                            layout="vertical"
                            onClose={() => setSnackbar(null)}
                            before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
                        >
                            Лимит в создании 5 очередей в день исчерпан!
                        </Snackbar>)
                        setPopout(null);

                    } else {
                        setQueueCODE(data);

                        if(global.queue.picURLNew === undefined){
                            setPopout(null);
                            setActiveModal(MODAL_CARD_CHAT_INVITE);
                            if (osName !== IOS) {
                                window.history.pushState({panel: "MODAL_CARD_CHAT_INVITE"}, "MODAL_CARD_CHAT_INVITE"); // Создаём новую запись в истории браузера
                                history.push("MODAL_CARD_CHAT_INVITE");
                            }
                        }else{
                            setTimeout(() => setPopout(null), 3000);
                            setTimeout(() => setActiveModal(MODAL_CARD_CHAT_INVITE), 3000);
                            if (osName !== IOS) {
                                window.history.pushState({panel: "MODAL_CARD_CHAT_INVITE"}, "MODAL_CARD_CHAT_INVITE"); // Создаём новую запись в истории браузера
                                history.push("MODAL_CARD_CHAT_INVITE");
                            }
                        }
                        global.queue.picURL = undefined;
                        global.queue.pic = undefined;
                        global.queue.picURLNew = undefined;

                        // window.history.pushState( {panel: "MODAL_CARD_CHAT_INVITE"}, "MODAL_CARD_CHAT_INVITE" ); // Создаём новую запись в истории браузера
                        // history.push("MODAL_CARD_CHAT_INVITE");
                    }
                }).catch((e) => {
                console.log(e);
                setPopout(null);
                setSnackbar(<Snackbar
                    layout="vertical"
                    onClose={() => setSnackbar(null)}
                    before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
                >
                    Ошибка соединения! Проверьте интернет!
                </Snackbar>);
            })
        } catch (e) {
            setPopout(null);
            setSnackbar(<Snackbar
                layout="vertical"
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
            >
                Ошибка соединения! Проверьте интернет!
            </Snackbar>);
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

        let tmpArr = e.target.files[0].name.split('.' + type);
        global.queue.pic = e.target.files[0];
        global.queue.picName = nameQueue.replace(/\s+/g, '-').replace('?', '')
                .replace('!', '').replace('!', '')
            + '_' + (e.target.files[0].name).replace(/\s+/g, '')
            + getRandomInt(1000);

        global.queue.picURL = 'https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o/' + global.queue.picName + '?alt=media&token=bc19b8ba-dc95-4bcf-8914-c7b6163d1b3b';
        global.queue.picURLNew = 'https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o/' + global.queue.picName.replace(tmpArr[0], tmpArr[0] + '_200x200') + '?alt=media&token=bc19b8ba-dc95-4bcf-8914-c7b6163d1b3b';
        global.queue.avatarName = e.target.files[0].name;
        setAvatarName(e.target.files[0].name);
    }

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * Math.floor(max));
    }

    return (
        <Panel id={id}>
            <PanelHeader> Создание </PanelHeader>
            <FormLayout noValidate={true}>
                {formStatusVisibility &&
                <FormStatus header={formStatusHeader} mode="error">
                    {formStatusDescription}
                </FormStatus>
                }

                <Input id={'qName'} top={'Название очереди*'}
                       value={nameQueue}
                       maxlength="32"
                       status={queueNameStatus}
                       onClick={()=>{
                           setDateInput('turnOff');
                           setTimeInput('turnOff');
                           setTimeInputButton('dateAndTimeInputButton');
                           setDateInputButton('dateAndTimeInputButton')
                       }}
                       onChange={e => {
                           if (e.target.value.trim() === '') {
                               setFormStatusVisibility(true);
                               setFormStatusHeader('Введите название очереди!')
                           } else {
                               setFormStatusVisibility(false);
                               setFormStatusDescription('');
                               setFormStatusHeader('');
                           }
                           global.queue.createName = e.target.value.trim();
                           e.target.value.trim() ? setQueueNameStatus('valid') : setQueueNameStatus('error');
                           setNameQueue(e.target.value.substring(0, 32));
                       }}/>
                <Input id={'qPlace'} top={'Место проведения'} maxlength="40" value={place} onClick={()=>{
                    setDateInput('turnOff');
                    setTimeInput('turnOff');
                    setDateInputButton('dateAndTimeInputButton');
                    setTimeInputButton('dateAndTimeInputButton');
                }} onChange={e => {
                    setPlace(e.target.value.substring(0, 40));
                    global.queue.createPlace = e.target.value;
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
                        <Input id={'dateID'}
                               className={dateInput}
                               min={nowTime}
                               top="Дата проведения*"
                               novalidate
                               name={'date'} type={'date'}
                               value={date}
                               status={queueDateStatus}
                               onChange={e => {
                                   console.log('CHANGE ' + e.target.value)
                                   today = new Date(nowIOSTime);
                                   pickedDate = new Date(e.target.value);
                                   console.log('CHANGE' + pickedDate)
                                   let dataCheck = document.getElementById('dateID');
                                   if (e.target.value === '' || pickedDate === 'Invalid Date') {
                                       setQueueDateStatus('error');
                                       setFormStatusVisibility(true);
                                       setFormStatusHeader('Введите дату!')
                                   }

                                   if (dataCheck.validity.rangeUnderflow) {
                                       setQueueDateStatus('error');
                                       setFormStatusVisibility(true);
                                       global.queue.dataCheck = false;
                                       if (formStatusHeader === 'Введите название очереди!') {
                                           setFormStatusHeader('Неверная дата и название!');
                                           setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                                       } else {
                                           setFormStatusHeader('Неверная дата!');
                                           setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                                       }
                                   } else {
                                       setFormStatusVisibility(false);
                                       setQueueDateStatus('valid');
                                       global.queue.dataCheck = true;
                                   }
                                   if (queueDateStatus === 'error') {
                                       setFormStatusVisibility(true);
                                       setFormStatusHeader('Неверная дата!');
                                       setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                                       global.queue.dataCheck = false;
                                   } else {
                                       global.queue.dataCheck = true;
                                       setFormStatusVisibility(false);
                                   }

                                   if (today.getTime() > pickedDate.getTime()) {
                                       IOSdateError = false;
                                       global.queue.dataCheck = false;
                                       setQueueDateStatus('error');
                                       setFormStatusVisibility(true);
                                       if (formStatusHeader === 'Введите название очереди!') {
                                           setFormStatusHeader('Неверная дата и название!');
                                           setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                                       } else {
                                           setFormStatusHeader('Неверная дата!');
                                           setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                                       }
                                   } else {
                                       global.queue.dataCheck = true;
                                       IOSdateError = true;
                                       setFormStatusVisibility(false);
                                   }
                                   setDate(e.target.value)
                                   global.queue.createDate = e.target.value;
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
                        <Input id={'timeID'} className={timeInput} top="Время начала" name={'time'} type={'time'} value={time} onChange={e => {
                            setTime(e.target.value);
                            global.queue.createTime = e.target.value;
                        }}/>
                    </div>
                </FormLayoutGroup>

                <File top="Аватарка очереди" accept="image/*" before={<Icon28Attachments/>} controlSize="xl"
                      mode="secondary"
                      onChange={(e) => {
                          setDeleteImgButtonCSS('deleteImgButton');
                          setDelDivCSS('divForDel');
                          onPhotoUpload(e);
                      }}/>
                <div className={delDivCSS}>
                    <Text className={'uploadedImgName'}>{avatarName}<Button className={deleteImgButtonCSS}
                                                                            mode={'tertiary'}
                                                                            before={<Icon12Cancel/>}
                                                                            onClick={()=>{
                                                                                setAvatarName('');
                                                                                global.queue.picURLNew = undefined;
                                                                                global.queue.picURL = undefined;
                                                                                setDeleteImgButtonCSS('turnOff');
                                                                                setDelDivCSS('turnOff');
                                                                                global.queue.avatarName = undefined;
                                                                            }}/></Text>

                </div>
                <Input id={'qDesc'} top={'Краткое описание очереди'} maxlength="40" value={description} onClick={()=>{
                    setDateInput('turnOff');
                    setTimeInput('turnOff');
                    setDateInputButton('dateAndTimeInputButton');
                    setTimeInputButton('dateAndTimeInputButton');
                }} onChange={e => {
                    setDescription(e.target.value.substring(0, 40))
                    global.queue.createDescription = e.target.value;
                }}/>
                <Button size="xl" onClick={async () => {

                    setTimeout('', 200);
                    let dataCheck = document.getElementById('dateID');

                    if (!global.queue.dataCheck || !IOSdateError) {
                        // window.scrollBy(0,0);
                        setQueueDateStatus('error');
                        setFormStatusVisibility(true);
                        if (formStatusHeader === 'Введите название очереди!') {
                            setFormStatusHeader('Неверная дата и название!');
                            setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                            setDateInput('dateInput');
                            setDateInputButton('turnOff');
                            window.scrollTo(0,0);
                        } else {
                            setFormStatusHeader('Неверная дата!');
                            setFormStatusDescription('Пожалуйста, проверьте, что дата актуальна.');
                            setDateInput('dateInput');
                            setDateInputButton('turnOff');
                            window.scrollTo(0,0);
                        }
                    }

                    if (nameQueue.trim() !== '' && date.trim() !== '' && IOSdateError && global.queue.dataCheck && !dataCheck.validity.rangeUnderflow) {
                        setPopout(<ScreenSpinner/>);
                        setFormStatusVisibility(false);
                        setCheckPhoto(false);
                        try {
                        await fetch('/checkCreation', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                "url": window.location.search.replace('?', '')
                            })
                        }).then(function (response) {
                            return response.json();
                        })
                            .then(async function (data) {
                                if (data === 'LIMIT REACHED') {
                                    setSnackbar(<Snackbar
                                        layout="vertical"
                                        onClose={() => setSnackbar(null)}
                                        before={<Avatar size={24}><Icon16Clear fill="red" width={14}
                                                                               height={14}/></Avatar>}
                                    >
                                        Лимит в создании 5 очередей в день исчерпан!
                                    </Snackbar>)
                                    setPopout(null);
                                }else {
                                    if (global.queue.picURL !== undefined) {
                                        console.log(global.queue.picURL);
                                        try {
                                            await fetch('https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o?uploadType=media&name=' + global.queue.picName, {
                                                method: 'POST',
                                                headers: {
                                                    'Accept': 'application/json',
                                                    'Content-Type': 'image/png',
                                                },
                                                body: global.queue.pic
                                            }).then(function (response) {
                                                return response.json();
                                            })
                                                .then(async function (data) {
                                                    console.log('Картинка успешно загружена!');
                                                })
                                        } catch (e) {
                                            setPopout(null);
                                        }

                                        async function testImage(URL) {
                                            return new Promise((resolve, reject) => {
                                                let tester = new Image();
                                                tester.src = URL;
                                                tester.onload = () => {
                                                    setCheckPhoto(false);
                                                    resolve(global.queue.picURL);
                                                    return 'ok';
                                                }
                                                tester.onerror = () => {
                                                    setCheckPhoto(true);
                                                    reject();
                                                    setPopout(null);
                                                    setSnackbar(<Snackbar
                                                        layout="vertical"
                                                        onClose={() => setSnackbar(null)}
                                                        before={<Avatar size={24}><Icon16Clear fill="red" width={14}
                                                                                               height={14}/></Avatar>}
                                                    >
                                                        Картинка повреждена! Выберите другую.
                                                    </Snackbar>);
                                                    setCheckPhoto(false);
                                                };
                                            });
                                        }


                                        await testImage(global.queue.picURL);
                                    }
                                    console.log(checkPhoto);
                                    if (!checkPhoto) {
                                        await createQueueOnServer();
                                        global.queue.createPlace = '';
                                        global.queue.createDescription = '';
                                        global.queue.createTime = '';
                                        global.queue.createDate = '';
                                        global.queue.createName = '';
                                        global.queue.avatarName = undefined;
                                        setNameQueue('');
                                        setDate('');
                                        setDescription('');
                                        setTime('');
                                        setAvatarName('');
                                        setPlace('');
                                        setDeleteImgButtonCSS('turnOff');
                                        setDelDivCSS('turnOff');
                                        setQueueDateStatus('');
                                        setQueueNameStatus('');
                                    }
                                    setCheckPhoto(false);
                                }
                            });}
                            catch (e) {
                                setPopout(null);
                                setSnackbar(<Snackbar
                                    layout="vertical"
                                    onClose={() => setSnackbar(null)}
                                    before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
                                >
                                    Ошибка соединения! Проверьте интернет!
                                </Snackbar>);
                            }
                    }else {
                        if (date.trim() === '' && nameQueue.trim() === '') {
                            setQueueNameStatus('error');
                            setQueueDateStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите название и дату!');
                            setPopout(null);
                            setDateInput('dateInput');
                            setDateInputButton('turnOff');
                            window.scrollTo(0,0);

                        } else if ((!IOSdateError || !global.queue.dataCheck) && nameQueue.trim() === '') {
                            setQueueNameStatus('error');
                            setQueueDateStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите название и корректную дату!');
                            setPopout(null);
                            setDateInput('dateInput');
                            setDateInputButton('turnOff');
                            window.scrollTo(0,0);

                        } else if (nameQueue.trim() === '') {
                            setQueueNameStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите название!')
                            setFormStatusDescription('');
                            setPopout(null);
                            window.scrollTo(0,0);

                        } else if (date.trim() === '') {
                            setQueueDateStatus('error');
                            setFormStatusVisibility(true);
                            setFormStatusHeader('Введите дату!')
                            setPopout(null);
                            setDateInput('dateInput');
                            setDateInputButton('turnOff');
                            window.scrollTo(0,0);
                        }
                    }

                }}>Создать</Button>
            </FormLayout>
            {snackbar}
        </Panel>
    );
}

export default CreateQueue;