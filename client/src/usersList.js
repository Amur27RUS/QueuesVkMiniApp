import React from 'react';
import {
    Alert,
    Avatar,
    Button,
    Cell,
    Div,
    Group,
    Header,
    Input,
    IOS,
    List, PanelHeaderButton,
    Placeholder,
    platform,
    Separator,
    Tabs,
    TabsItem
} from "@vkontakte/vkui";
import unnamed from './img/unnamed.jpg'
import Icon56InboxOutline from '@vkontakte/icons/dist/56/inbox_outline';
import bridge from "@vkontakte/vk-bridge";

let counter = 1; //Счётчик, считающий кол-во включений админ-панели
let counter2= 1; //Счётчик, считающий кол-во включений добавления админов
let ADDcounter = 1; //Счётчик, считающий кол-во нажатий по добаление человека не из VK
const osName = platform();
let menuCounter = 1; //Счётчик открытия меню действий
let styleForButtons = 'ButtonsDiv'; //Стили для кнопки меню действий для IOS/Android
let styleForButtonAddAdmin = 'giveAdmin'; //Стили для кнопки меню действий для IOS/Android

class UsersList extends React.Component {

    constructor(props) {
        super(props);
        if (osName === IOS){
            styleForButtons = 'ButtonDivIOS';
        }
        this.state = {
            users: [],
            draggable: false,
            buttonText: 'Вкл. перемещение/удаление',
            cssAdminButton: 'turnOff',
            cssSkipButton: 'OnlySkipButton',
            CSSButtonDiv: styleForButtons,
            CSSAddNewUserInput: 'turnOff',
            CSSAddNewUserButton: 'turnOff',
            cssAddAdminButton: 'turnOff',
            cssShuffleButton: 'turnOff',
            cssPlusAdminButton: 'turnOff',
            CSSExitQueueButton: 'exitQueueButton',
            CSSEditQueueButton: 'turnOff',
            CSSAddPersonButton: 'turnOff',
            cssButtonGiveAdmin: 'turnOff',
            CSSActionsButton: '',
            nameAdminButton: 'Выдать права админа',
            selectables: false,
            CSSMenuDropout: 'turnOff', //turnOff or CSSMenuDropout
            openMenuButton: 'Открыть меню действий',
            activeTab: 'user',
            isAdmin: undefined,
            isFirst: 'turnOff'
        };
        console.log(global.scheme.scheme)
        if( global.scheme.scheme === 'client_dark' || global.scheme.scheme === 'space_gray') {
            this.setState({
                CSSActionsButton: 'showActionsButtonDark'
            });

        }else{
            this.setState({
                CSSActionsButton: 'showActionsButton'
            });


        }
        menuCounter = 1;
    }

    async componentDidMount() {
        	console.log('Отправлен запрос на получение списка людей, принадлежащих к очереди...')

            // /*ИМИТАЦИЯ ПОЛУЧЕНИЯ ДАННЫХ*/
            // let usersArr = [
            //     {id: 1, name: 'Павел Сергеевич', avatar: cowboy, isAdmin: true},
            //     {id: 2, name: 'Андрей', avatar: cowboy, isAdmin: true},
            //     {id: 3, name: 'Моннар бэкендер', avatar: cowboy, isAdmin: false},
            //     {id: 4, name: 'Ус', avatar: cowboy, isAdmin: false},
            //     {id: 5, name: 'Человек', isAdmin: false},
            //     {id: 6, name: 'Тута Хамон', avatar: cowboy, isAdmin: false},
            //     {id: 7, name: 'Тамерлан', avatar: cowboy, isAdmin: false},
            //     {id: 8, name: 'Ислам', avatar: cowboy, isAdmin: false},
            //     {id: 9, name: 'Сергей Павлович', avatar: cowboy, isAdmin: false},
            //     {id: 10, name: 'Динозавр Рус', isAdmin: true},
            // ];
            // this.setState({users: usersArr});
            //
            // /*ИМИТАЦИЯ ПОЛУЧЕНИЯ ДАННЫХ*/

            fetch('/getPeople', {
        		method: 'POST',
        		headers: {
        			'Accept': 'application/json',
        			'Content-Type': 'application/json',
        		},
        		body: JSON.stringify({
        			"queueCODE": this.props.queueCode,
        		})
        	}).then(function (response) {
        		return response.json();
        	})
        		.then(async function (data) {
                    let usersArr = await getUsersData(data);
        		    return usersArr;

        		}).then((usersArr) =>{
                this.setState({
                    users: usersArr
                })
                if(global.queue.isUserAdmin) {
                    this.props.setCssEdit('editQueueButton');
                }
            }).bind(this)

        menuCounter = 1;

        async function getUsersData(data){
            console.log('Получение данных о пользователях через VK Bridge')
            let tmpUsersArr = data;
            for(let i = 0; i < tmpUsersArr.length; i++){
                if(tmpUsersArr[i].notvkname === null) {
                    const user = await bridge.send('VKWebAppGetUserInfo', {"user_id": tmpUsersArr[i].userid});
                    if (global.queue.userID === user.id && tmpUsersArr[i].userplace === 1 && tmpUsersArr.length > 1) {
                        global.queue.isFirstPlace = true;
                    } else if (global.queue.userID === user.id && tmpUsersArr[i].userplace !== 1) {
                        global.queue.isFirstPlace = false;
                    }

                    if(global.queue.userID === tmpUsersArr[i].userid && tmpUsersArr[i].isadmin){
                        global.queue.isUserAdmin = true;

                    }else if (global.queue.userID === tmpUsersArr[i].userid && !tmpUsersArr[i].isadmin){
                        global.queue.isUserAdmin = false;
                    }
                    tmpUsersArr[i].name = user.last_name + " " + user.first_name;
                    tmpUsersArr[i].avatar = user.photo_100;
                }else{
                    tmpUsersArr[i].name = tmpUsersArr[i].notvkname;
                }
            }
            console.log('Получен массив людей: ' + tmpUsersArr);
            return tmpUsersArr;
        }

        // //Асинхронный приём
        //     const response = await fetch('/getPeople', {
        //         method: 'POST',
        //         headers: {
        //             'Accept': 'application/json',
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             "queueCODE": this.props.queueCode,
        //         })
        //     });
        //     const json = await response.json();
        //     console.log('Принят асинхронно запрос на изменение людей :' + json);
        //     //json - это уже обработанный ответ
    }

    //Функция для перемешивания очереди
    shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // случайный индекс от 0 до i

            // let t = array[i]; array[i] = array[j]; array[j] = t
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    adminButton = () => {
        if (counter2 % 2 === 0){
            this.setState({
                draggable: false,
                buttonText: 'Вкл. перемещение/удаление',
            });

        }else {
            if (this.state.nameAdminButton === 'Скрыть выдачу прав админа') {counter++}
            this.setState({
                selectables: false,
                nameAdminButton: 'Выдать права админа',
                draggable: true,
                buttonText: 'Откл. перемещение/удаление',
                CSSMenuDropout: 'turnOff',
                openMenuButton: 'Открыть меню действий',
                cssButtonGiveAdmin: 'turnOff',
            });
            menuCounter++;
        }
        counter2++;
    }

    copyToClipboard = (text) => {
        let dummy = document.createElement("textarea");
        // to avoid breaking orgain page when copying more words
        // cant copy when adding below this code
        // dummy.style.display = 'none'
        document.body.appendChild(dummy);
        //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
        dummy.value = text;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
    }

    addAdminButton = () => {
        if (counter % 2 === 0){
            if (osName === IOS){
                styleForButtons = 'ButtonDivIOS';
            }
            else {
                styleForButtons = 'ButtonsDiv';
            }
            this.setState({
                cssPlusAdminButton: 'turnOff',
                nameAdminButton: 'Выдать права админа',
                selectables: false,
                cssButtonGiveAdmin: 'turnOff',
                CSSButtonDiv: styleForButtons,
            });
        }else {
            if (this.state.buttonText === 'Откл. перемещение/удаление') {counter2++}
            if (osName === IOS){
                styleForButtons = 'ButtonDivIOS2';
                styleForButtonAddAdmin = 'giveAdminIOS'
            }
            else {
                styleForButtons = 'ButtonsDiv2';
                styleForButtonAddAdmin = 'giveAdmin'
            }
            this.setState({
                CSSButtonDiv: styleForButtons,
                cssPlusAdminButton: '123',
                nameAdminButton: 'Скрыть выдачу прав админа',
                selectables: true,
                CSSMenuDropout: 'turnOff',
                openMenuButton: 'Открыть меню действий',
                cssButtonGiveAdmin: styleForButtonAddAdmin,
                draggable: false,
                buttonText: 'Вкл. перемещение/удаление',
            });
            menuCounter++;

        }
        counter++;
    }

    closePopout = () => {
        this.props.setPopout(null);
    }

    shuffleAlert = () => {
        this.props.setPopout(
            <Alert
                actionsLayout="vertical"
                actions={[{
                    title: 'Перемешать',
                    autoclose: true,
                    mode: 'destructive',
                    action: () => {
                        let newArr = this.shuffle(this.state.users);
                        this.setState({
                            users: newArr,
                            openMenuButton: 'Открыть меню действий',
                            CSSMenuDropout: 'turnOff',
                        });

                        this.changeUsersPositionOnServer(this.state.users);
                        menuCounter++;
                    }
                }, {
                    title: 'Отмена',
                    autoclose: true,
                    mode: 'cancel'
                }]}
                onClose={this.closePopout}
            >
                <h2>Подтвердите действие</h2>
                <p>Вы уверены, что хотите перемешать очередь?</p>
            </Alert>
        )
    }

    skipAlert = () => {
        this.props.setPopout(
            <Alert
                actionsLayout="vertical"
                actions={[{
                    title: 'Опуститься ниже',
                    autoclose: true,
                    mode: 'destructive',
                    action: () => {
                        let usersArr = this.state.users;
                        for(let i =0; i<usersArr.length; i++){
                            if (usersArr[i].userid === this.props.fetchedUser.id){
                                if (i >= usersArr.length - 2 ) {
                                    this.setState({cssSkipButton: 'turnOff'})
                                }
                                else {
                                    this.setState({cssSkipButton: 'OnlySkipButton'})
                                }
                                let tmp = usersArr[i + 1];
                                usersArr[i + 1] = usersArr[i];
                                usersArr[i] = tmp;
                                this.setState({
                                    users: usersArr
                                })
                                break;
                            }
                        }
                        console.log('Отправлен запрос на обновление списка людей в связи с пропуском позиции...')
                        this.changeUsersPositionOnServer(this.state.users);
                    }
                }, {
                    title: 'Отмена',
                    autoclose: true,
                    mode: 'cancel'
                }]}
                onClose={this.closePopout}
            >
                <h2>Подтвердите действие</h2>
                <p>Вы уверены, что хотите опуститься на одну позицию ниже?</p>
            </Alert>
        )
    }

    exitAlert = () => {
        this.props.setPopout(
            <Alert
                actionsLayout="vertical"
                actions={[{
                    title: 'Покинуть очередь',
                    autoclose: true,
                    mode: 'destructive',
                    action: () => {
                        this.setState({
                            openMenuButton: 'Открыть меню действий',
                            CSSMenuDropout: 'turnOff',
                        });
                        menuCounter++;
                        console.log('Отправлен запрос на выход из очереди...');
                        fetch('/exitQueue', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                "userID": this.props.fetchedUser.id,
                                "queueCODE": this.props.queueCode
                            })
                        }).then(function (response) {
                            return response.json();
                        })
                            .then(function (data) {
                                console.log('Ответ получен! : ' + data);
                            })
                        this.props.setActivePanel('home');
                    }
                }, {
                    title: 'Отмена',
                    autoclose: true,
                    mode: 'cancel'
                }]}
                onClose={this.closePopout}
            >
                <h2>Подтвердите действие</h2>
                <p>Вы уверены, что хотите покинуть очередь? Если вы снова зайдёте в очередь, то окажитесь в конце списка.</p>
            </Alert>
        )
    }

    firstToLast = () => {
        this.props.setPopout(
            <Alert
                actionsLayout="vertical"
                actions={[{
                    title: 'В конец очереди',
                    autoclose: true,
                    mode: 'destructive',
                    action: () => {
        fetch('/firstToLast', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "queueCODE": this.props.queueCode,
            })
        }).then(function (response) {
            return response.json();
        })
            .then(async function (data) {
                let tmpUsersArr = data;
                for(let i = 0; i < tmpUsersArr.length; i++){
                    if(tmpUsersArr[i].notvkname === null) {
                        const user = await bridge.send('VKWebAppGetUserInfo', {"user_id": tmpUsersArr[i].userid});
                        if (global.queue.userID === user.id && tmpUsersArr[i].userplace === 1 && tmpUsersArr.length > 1) {
                            global.queue.isFirstPlace = true;
                        }
                        else if (global.queue.userID === user.id && tmpUsersArr[i].userplace !== 1) {
                            global.queue.isFirstPlace = false;
                        }
                        console.log(user);
                        tmpUsersArr[i].name = user.last_name + " " + user.first_name;
                        tmpUsersArr[i].avatar = user.photo_100;
                    }else{
                        tmpUsersArr[i].name = tmpUsersArr[i].notvkname;
                    }
                }
                console.log('Получен массив людей: ' + tmpUsersArr);
                return tmpUsersArr;

            }).then((usersArr) =>{
            this.setState({
                users: usersArr
            })
        })
    }} , {
                    title: 'Отмена',
                    autoclose: true,
                    mode: 'cancel'
                }]}
                onClose={this.closePopout}
            >
                <h2>Подтвердите действие</h2>
                <p>Вы уверены, что хотите спуститься в конец очереди?</p>
            </Alert>
        )
    }


    changeUsersPositionOnServer = (usersArray) => {
        console.log('Отправлен запрос на изменение порядка людей в очереди...');
        console.log('Новый массив: ' + usersArray);
        fetch('/changeUsersOrder', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "usersArray": usersArray,
                "queueCODE": this.props.queueCode,
            })
        }).then(function (response) {
            return response.json();
        })
            .then(async function (data) {
                let tmpUsersArr = data;
                for(let i = 0; i < tmpUsersArr.length; i++){
                    if(tmpUsersArr[i].notvkname === null) {
                        const user = await bridge.send('VKWebAppGetUserInfo', {"user_id": tmpUsersArr[i].userid});
                        if (global.queue.userID === user.id && tmpUsersArr[i].userplace === 1 && tmpUsersArr.length > 1) {
                            global.queue.isFirstPlace = true;
                        }
                        else if (global.queue.userID === user.id && tmpUsersArr[i].userplace !== 1) {
                            global.queue.isFirstPlace = false;
                        }
                        console.log(user);
                        tmpUsersArr[i].name = user.last_name + " " + user.first_name;
                        tmpUsersArr[i].avatar = user.photo_100;
                    }else{
                        tmpUsersArr[i].name = tmpUsersArr[i].notvkname;
                    }
                }
                console.log('Получен массив людей: ' + tmpUsersArr);
                return tmpUsersArr;

            }).then((usersArr) =>{
            this.setState({
                users: usersArr
            })
        })
    }

    openMenu = () => {
        let usersArr = this.state.users;
        for(let i =0; i<usersArr.length; i++){
            if (usersArr[i].userid === this.props.fetchedUser.id){
                if (i >= usersArr.length - 1 ) {
                    this.setState({cssSkipButton: 'turnOff'})
                }
                else {
                    this.setState({cssSkipButton: 'OnlySkipButton'})
                }}}
        if(this.state.activeTab === 'admin'){
            this.setState({cssSkipButton: 'turnOff'});
        }
        if (menuCounter % 2 !== 0){
            if(global.scheme.scheme === 'client_dark' || global.scheme.scheme === 'space_gray') {
                this.setState({
                    openMenuButton: 'Закрыть меню действий',
                    CSSMenuDropout: 'CSSMenuDropoutDark',
                })

            }else{
                this.setState({
                    openMenuButton: 'Закрыть меню действий',
                    CSSMenuDropout: 'CSSMenuDropout',
                })



            }
        }else{
            this.setState({
                openMenuButton: 'Открыть меню действий',
                CSSMenuDropout: 'turnOff',
            })
        }
        menuCounter++;
    }

    reqAdminUsers = () => {
        if (osName === IOS){
            styleForButtons = 'ButtonDivIOS';
        }
        else {
            styleForButtons = 'ButtonsDiv';
        }
        this.setState({
            cssButtonGiveAdmin: 'turnOff',
            selectables: false,
            nameAdminButton: 'Выдать права админа',
            CSSButtonDiv: styleForButtons,
        })
        this.state.users.map(info => {
                let a = document.getElementById(info.name)
                if (a.checked) {
                    info.isadmin = true;
                }
        });
        counter++

        console.log('Отправлен запрос на выдачу админок...');
        fetch('/addNewAdmins', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "usersArray": this.state.users,
                "queueCODE": this.props.queueCode,
            })
        }).then(function (response) {
            return response.json();
        })
            .then(async function (data) {
                let tmpUsersArr = data;
                for(let i = 0; i < tmpUsersArr.length; i++){
                    if(tmpUsersArr[i].notvkname === null) {
                        const user = await bridge.send('VKWebAppGetUserInfo', {"user_id": tmpUsersArr[i].userid});
                        if (global.queue.userID === user.id && tmpUsersArr[i].userplace === 1 && tmpUsersArr.length > 1) {
                            global.queue.isFirstPlace = true;
                        }
                        else if (global.queue.userID === user.id && tmpUsersArr[i].userplace !== 1) {
                            global.queue.isFirstPlace = false;
                        }
                        console.log(user);
                        tmpUsersArr[i].name = user.last_name + " " + user.first_name;
                        tmpUsersArr[i].avatar = user.photo_100;
                    }else{
                        tmpUsersArr[i].name = tmpUsersArr[i].notvkname;
                    }
                }
                console.log('Получен массив людей: ' + tmpUsersArr);
                return tmpUsersArr;

            }).then((usersArr) =>{
            this.setState({
                users: usersArr
            })
        })
    }

    AddPersonNotFromVK = () => {
        if(ADDcounter % 2 === 0){
            this.setState({
                CSSAddNewUserInput: 'turnOff',
                CSSAddNewUserButton: 'turnOff',
            });
        }else {
            this.setState({
                CSSAddNewUserInput: 'CSSAddNewUserInput',
                CSSAddNewUserButton: 'CSSAddNewUserButton',
                CSSMenuDropout: 'turnOff',
                openMenuButton: 'Открыть меню действий'
            });
            menuCounter++;
        }
        ADDcounter++;
    }

    fetchNotFromVKUser = (newUser) => {
        console.log('Отправлен запрос на добавление человека не из ВК...')
        fetch('/addNotFromVK', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "newUser": newUser,
                "queueCODE": this.props.queueCode,
            })
        }).then(function (response) {
            return response.json();
        })
            .then(async function (data) {
                let tmpUsersArr = data;
                for(let i = 0; i < tmpUsersArr.length; i++){
                    if(tmpUsersArr[i].notvkname === null) {
                        const user = await bridge.send('VKWebAppGetUserInfo', {"user_id": tmpUsersArr[i].userid});
                        if (global.queue.userID === user.id && tmpUsersArr[i].userplace === 1 && tmpUsersArr.length > 1) {
                            global.queue.isFirstPlace = true;
                        }
                        else if (global.queue.userID === user.id && tmpUsersArr[i].userplace !== 1) {
                            global.queue.isFirstPlace = false;
                        }
                        console.log(user);
                        tmpUsersArr[i].name = user.last_name + " " + user.first_name;
                        tmpUsersArr[i].avatar = user.photo_100;
                    }else{
                        tmpUsersArr[i].name = tmpUsersArr[i].notvkname;
                    }
                }
                console.log('Получен массив людей: ' + tmpUsersArr);
                return tmpUsersArr;

            }).then((usersArr) =>{
            this.setState({
                users: usersArr
            })
        })
    }

    deleteUser = (deletedUserPlace) => {
        fetch('/deleteUser', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "deletedPlace": deletedUserPlace,
                "queueCODE": this.props.queueCode,
            })
        }).then(function (response) {
            return response.json();
        })
            .then(async function (data) {
                let tmpUsersArr = data;
                for(let i = 0; i < tmpUsersArr.length; i++){
                    if(tmpUsersArr[i].notvkname === null) {
                        const user = await bridge.send('VKWebAppGetUserInfo', {"user_id": tmpUsersArr[i].userid});
                        if (global.queue.userID === user.id && tmpUsersArr[i].userplace === 1 && tmpUsersArr.length > 1) {
                            global.queue.isFirstPlace = true;
                        }
                        else if (global.queue.userID === user.id && tmpUsersArr[i].userplace !== 1) {
                            global.queue.isFirstPlace = false;
                        }
                        console.log(user);
                        tmpUsersArr[i].name = user.last_name + " " + user.first_name;
                        tmpUsersArr[i].avatar = user.photo_100;
                    }else{
                        tmpUsersArr[i].name = tmpUsersArr[i].notvkname;
                    }
                }
                console.log('Получен массив людей: ' + tmpUsersArr);
                return tmpUsersArr;

            }).then((usersArr) => {
            this.setState({
                users: usersArr
            })})
    }

    render() {
        return (
            <div>
            <br/>
                <Div className={this.state.CSSButtonDiv}>
                <div className={'showActionsButton'}>

                    <Button size={'xl'} onClick={this.openMenu}>{this.state.openMenuButton}</Button>

                <div className={this.state.CSSMenuDropout}>
                    {global.queue.isUserAdmin === true &&
                        <div>
                        <Tabs>
                            <TabsItem onClick={() => {
                                this.setState({
                                    activeTab: 'user',
                                    cssSkipButton: 'OnlySkipButton',
                                    cssAdminButton: 'turnOff',
                                    cssAddAdminButton: 'turnOff',
                                    cssShuffleButton: 'turnOff',
                                    CSSEditQueueButton: 'turnOff',
                                    CSSExitQueueButton: 'CSSExitQueueButton',
                                    CSSAddNewUserInput: 'turnOff',
                                    CSSAddNewUserButton: 'turnOff',
                                    CSSAddPersonButton: 'turnOff'
                                });
                                let usersArr = this.state.users;
                                for (let i = 0; i < usersArr.length; i++) {
                                    if (usersArr[i].userid === this.props.fetchedUser.id) {
                                        if (i >= usersArr.length - 1) {
                                            this.setState({cssSkipButton: 'turnOff'})
                                        } else {
                                            this.setState({cssSkipButton: 'OnlySkipButton'})
                                        }
                                    }
                                }
                            }} selected={this.state.activeTab === 'user'}>Основные</TabsItem>

                            <TabsItem onClick={() => {
                                this.setState({
                                    activeTab: 'admin',
                                    cssSkipButton: 'turnOff',
                                    cssAdminButton: 'OnlySkipButton',
                                    cssAddAdminButton: 'OnlySkipButton',
                                    cssShuffleButton: 'OnlySkipButton',
                                    CSSEditQueueButton: '123',
                                    CSSExitQueueButton: 'turnOff',
                                    CSSAddPersonButton: 'AddPersonButton'
                                })
                            }} selected={this.state.activeTab === 'admin'}>Админ-панель</TabsItem>
                        </Tabs>
                        <Separator/>
                        </div>
                    }

                    <Div>
                    <Button className={this.state.cssSkipButton} size={'xl'} onClick={() => this.skipAlert()} mode={'secondary'} stretched={true}>Опуститься на позицию ниже</Button>
                    <Button className={this.state.cssAdminButton} size={'xl'} onClick={this.adminButton} mode={'secondary'} stretched={true}>{this.state.buttonText}</Button>
                    <Button className={this.state.cssAddAdminButton} size={'xl'} onClick={this.addAdminButton} mode={'secondary'} stretched={true}>{this.state.nameAdminButton}</Button>
                    <Button className={this.state.cssShuffleButton} size={'xl'} onClick={() => {this.shuffleAlert()}} mode={'secondary'} stretched={true}>Перемешать очередь</Button>
                    <Button className={this.state.CSSExitQueueButton} size={'xl'} onClick={() => this.exitAlert()} mode={'secondary'} stretched={true}>Покинуть очередь</Button>
                    <Button className={this.state.CSSAddPersonButton} size={'xl'} onClick={() => this.AddPersonNotFromVK()} mode="secondary" stretched={true}>Добавить человека не из VK</Button>
                    </Div>

                </div>

                </div>
                </Div>

                <Group header={
                <Header className={'headerUsers'}>Участники</Header> }>
                    {global.queue.isFirstPlace &&
                    <Div>
                        <Button className={'buttonForFirst'} onClick={() => this.firstToLast()} mode={'secondary'}>Спуститься
                                на последнее место</Button>
                    </Div>
                    }
                <Div>
                    <div className={'AddNewUserDiv'}>
                    <Input id={'inputNotVKPerson'} maxlength = "25" type="text" top={'Введите имя человека:'} className={this.state.CSSAddNewUserInput} onChange={e => global.queue.newUser = e.target.value}/>
                    <Button mode={'outline'} className={this.state.CSSAddNewUserButton} onClick={() => {
                        if(global.queue.newUser !== undefined && global.queue.newUser.trim() !== '') {
                            const newUser = {name: global.queue.newUser};
                            const newUsers = [...this.state.users, newUser];
                            this.setState({
                                users: newUsers,
                                CSSAddNewUserInput: 'turnOff',
                                CSSAddNewUserButton: 'turnOff',
                            });
                            ADDcounter++;

                            this.fetchNotFromVKUser(global.queue.newUser);
                            document.getElementById('inputNotVKPerson').value = '';
                        }
                    }}>Добавить</Button>
                    </div>

                    <Button className={this.state.cssButtonGiveAdmin} onClick={this.reqAdminUsers} size={'xl'}>Выдать выбранным пользователям права админа</Button>

                    <List>
                    {this.state.users.map(info => {
                        return <Cell id={info.name} key={info.name} description={info.isadmin ? 'Admin' : ''}
                                     // onClick={() => window.open("http://vk.com/id"+info.id)}
                                     selectable={info.avatar && !(info.isadmin) ? this.state.selectables : false}
                                     className={info.userid === this.props.fetchedUser.id ? 'SELFcell' : 'cell'}
                                     draggable={this.state.draggable}
                                     removable={!(info.userid === this.props.fetchedUser.id) ? this.state.draggable : false}
                                     before={ info.avatar ? <Avatar className={'avatar'} size={45} src={info.avatar}>
                                          <Group className={'idAvatar'}>{this.state.users.indexOf(info) + 1}</Group></Avatar>
                                          : <Avatar className={'avatar'} size={45}>
                                          <Group className={'idAvatar'}>{this.state.users.indexOf(info) + 1}</Group></Avatar>}
                                     onDragFinish={({ from, to }) => {
                            const draggingList = [...this.state.users];
                            draggingList.splice(from, 1);
                            draggingList.splice(to, 0, this.state.users[from]);
                            this.setState({users: draggingList });
                            if(this.state.openMenuButton === 'Закрыть меню действий'){
                                this.setState({
                                    CSSMenuDropout: 'turnOff',
                                    openMenuButton: 'Открыть меню действий',
                                })
                                menuCounter++;
                            }

                            console.log('Отправлен запрос на обновление списка из-за перемещения...')
                            this.changeUsersPositionOnServer(this.state.users);

                        }} onRemove={() => {
                            this.deleteUser(this.state.users.indexOf(info))
                            this.setState({
                                users: [...this.state.users.slice(0, this.state.users.indexOf(info)), ...this.state.users.slice(this.state.users.indexOf(info) +1)]
                            });
                            if(this.state.openMenuButton === 'Закрыть меню действий'){
                                this.setState({
                                    CSSMenuDropout: 'turnOff',
                                    openMenuButton: 'Открыть меню действий',
                                })
                                menuCounter++;
                            }
                            console.log('Отправлен запрос на обновление списка из-за удаления...')
                            // this.changeUsersPositionOnServer(this.state.users);
                        }}><text className={'nameUser'}>{info.name}</text></Cell>
                    })}
                </List>
                </Div>
            </Group>
                <Placeholder
                    icon={<Icon56InboxOutline/>}
                    actions={<Button size="l" mode="tertiary" onClick={() =>this.copyToClipboard(this.props.queueCode)}>Скопировать код: <br/> {this.props.queueCode}</Button>}
                >
                    Вам одиноко? Пригласите людей!<br/>
                    <Button size="l" mode="tertiary"
                            onClick={() => bridge.send("VKWebAppShare", {"link": `https://vk.com/app7551421_199833891#${this.props.queueCode}`})}>
                        Пригласить друзей из VK</Button>
                    <br/>или
                    <br/><Button size="l" mode="tertiary" onClick={() =>this.copyToClipboard(this.props.queueCode)}>Скопировать код: {this.props.queueCode}</Button>

                </Placeholder>

            </div>
        )
    }
}

export default UsersList