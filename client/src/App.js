import React, {useEffect, useState} from 'react';
import bridge from '@vkontakte/vk-bridge';
import '@vkontakte/vkui/dist/vkui.css';
import {
	Avatar,
	ConfigProvider,
	Epic,
	FormLayout,
	Input,
	IOS,
	ModalCard,
	ModalRoot,
	platform,
	Snackbar,
	Tabbar,
	TabbarItem,
	Textarea,
	View,
} from "@vkontakte/vkui";
import ListOutline28 from '@vkontakte/icons/dist/28/list_outline'
import AddSquareOutline28 from '@vkontakte/icons/dist/28/add_square_outline'

import Home from './panels/Home';
import CreateQueue from './panels/CreateQueue'
import AboutQueue from "./panels/AboutQueue";
import ChangeQueue from "./panels/ChangeQueue"
import Settings from "./panels/Settings";
import Instruction from "./panels/Instruction";
import Instruction2 from "./panels/Instruction2";
import Instruction3 from "./panels/Instruction3";
import Instruction4 from "./panels/Instruction4";
import Instruction5 from "./panels/Instruction5";
import Instruction6 from "./panels/Instruction6";
import Icon16Clear from '@vkontakte/icons/dist/16/clear';
import Icon16User from '@vkontakte/icons/dist/16/user';
import Icon16CheckCircle from '@vkontakte/icons/dist/16/check_circle';
import Icon28SettingsOutline from '@vkontakte/icons/dist/28/settings_outline';
import cowboy from './img/cowboy.jpg'


global.queue = {
	name: undefined,
	idQueue: undefined,
	avatarQueue: '',
	descriptionQueue: '',
	dateQueue: '',
	timeQueue: '',
	placeQueue: '',
	codeQueue: undefined,

	isFirstPlace: undefined,
	userPlace: undefined,
	iSAdmin: undefined,
	newUser: undefined,
	isUserAdmin: false,
	userID: undefined,

	pic: undefined,
	picName: undefined,
	picURL: undefined,
	picURLNew: undefined,
	avatarName: undefined,

	joinQueueAvatar: undefined,
	joinQueueName: undefined,
	joinQueueCode: undefined,

	createName: '',
	createTime: '',
	createDate: '',
	createDescription: '',
	createPlace: '',
	counterForCalendar: 0,

	changedName: undefined,
	changedDesc: undefined,
	changedDate: undefined,
	changedTime: undefined,
	changedPlace: undefined,
	changedPic: undefined,
	changedPicName: undefined,
	changedPicURL: undefined,
	changedPicURLNew: undefined,
	changedAvatarName: undefined,

	goBackIOS: false,

	dataCheck: false,

	codeForMsg: undefined,
}

const MODAL_CARD_ABOUT = 'say-about';
const MODAL_CARD_CHAT_INVITE = 'chat-invite';
const MODAL_CARD_QUEUE_INVITE = 'queue-join';
const MODAL_CARD_FOR_MESSAGE = 'massage-all';
const osName = platform();

const App = (tutorial) =>{

	const [activePanel, setActivePanel] = useState('home');
	const [history, setHistory] = useState(['home']) // Заносим начальную панель в массив историй.
	const [history2, setHistory2] = useState(['home']) // Заносим начальную панель в массив историй.
	const [fetchedUser, setUser] = useState({id: 6}); //{id: 3} - это для теста
	const [popout, setPopout] = useState(null);
	const [activeStory, setActiveStory] = useState('main');
	const [activeModal, setActiveModal] = useState(null);
	const [codeInput, setCodeInput] = useState(undefined);
	const [queues, setQueues] = useState([]);
	const [queueCODE, setQueueCODE] = useState('');
	const [snackbar, setSnackbar] = useState(null);
	const [copyButtonTitle, setCopyButtonTitle] = useState('Скопировать код');
	const [joinQueueResponse, setJoinQueueResponse] = useState('');
	const [joinQueueName, setJoinQueueName] = useState('');
	const [joinQueueAvatar, setJoinQueueAvatar] = useState('');
	const [cssSpinner, setCssSpinner] = useState('defaultSpinner');
	const [joinInputStatus, setJoinInputStatus] = useState('');
	const [joinInputStatusText, setJoinInputStatusText] = useState('');
	const [CSSForCreateQueue, setCSSForCreateQueue] = useState('createQueuePanel');
	const [time, setTime] = useState(false);
	const [tabbarCSS, setTabbarCSS] = useState('createQueuePanel')
	const [showTutor, setShowTutor] = useState(undefined);
	const [messageToAll, setMessageToAll] = useState('');

	//ActiveStory - это View
	//ActivePanel - это Panel
	useEffect(() => {
		window.addEventListener('popstate', () => setTimeout(() => goBack(), 1));
	},[global.scheme.goBack])

	useEffect(() => {
		if(!global.scheme.beginning && global.scheme.beginning !== undefined) {
			setTabbarCSS('turnOff');
			setActiveStory('instructionsView');
			setActivePanel('instruction');
		}

		console.log('Получение данных о пользователе через VK Bridge');

		let meta = document.createElement('meta');
		meta.name = "referrer";
		meta.content = "no-referrer";
		document.getElementsByTagName('head')[0].appendChild(meta);

		async function fetchData() {

			// const user = await bridge.send('VKWebAppGetUserInfo');
			// setUser(user);
			global.queue.userID = 199833891;
			setPopout(null);


			console.log('Отправлен запрос на получение очередей...')
			fetch('/getQueues', {
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
				.then(function (data) {
					queuesSet(data);
					setCssSpinner('turnOff');
				}).catch((e) => {
				setSnackbar(<Snackbar
					layout="vertical"
					onClose={() => setSnackbar(null)}
					before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
				>
					Ошибка соединения! Проверьте интернет!
				</Snackbar>);

				setCssSpinner('turnOff');

			})

			if(window.location.hash !== ''){
				global.queue.joinQueueCode = window.location.hash.replace('#', '').toUpperCase();
				if(global.queue.joinQueueCode.length === 6) {
					fetch('/getQueueToJoin', {
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							"queueCODE": global.queue.joinQueueCode,
							"url": window.location.search.replace('?', '')
						})
					}).then(function (response) {
						return response.json();

					})
						.then(function (data) {
							if (data === 'alreadyThere') {
								setSnackbar(<Snackbar
									layout="vertical"
									onClose={() => setSnackbar(null)}
									before={<Avatar size={24} style={blueBackground}><Icon16User fill="#fff" width={14}
																								 height={14}/></Avatar>}
								>
									Вы уже находитесь в этой очереди!
								</Snackbar>);
							} else if (data === 'noQueue') {
								setSnackbar(<Snackbar
									layout="vertical"
									onClose={() => setSnackbar(null)}
									before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
								>
									Очереди с введённым кодом приглашения не существует!
								</Snackbar>)
							} else {
								global.queue.name = data.name;
								global.queue.avatar = data.avatar;
								setJoinQueueAvatar(data.avatar);
								setJoinQueueName(data.name);
								setActiveModal(MODAL_CARD_QUEUE_INVITE);
								if (osName !== IOS) {
									window.history.pushState({history: "MODAL_CARD_QUEUE_INVITE"}, "MODAL_CARD_QUEUE_INVITE"); // Создаём новую запись в истории браузера
									history.push("MODAL_CARD_QUEUE_INVITE"); // Добавляем панель в историю
								}
								console.log('Запустился инвайт и добавилось ' + history)
							}
						})
				}
				// window.location.hash = '';
				await bridge.send("VKWebAppSetLocation", {"location": ""});
			}

			/* ИМИТАЦИЯ ПОЛУЧЕННЫХ ДАННЫХ */
			const queuesArray = [
				{ id: 1, name: 'Сдача лабы по проге', date: '', time: '', place: 'ИТМО', description: 'Приём в каб. 406', code: 'J8D1XI', avatar: cowboy},
				{ id: 2, name: 'Очередь за шавермой', date:'14.12.2020', time: '15:10', place: 'Ларёк 35', description: 'Лучшая шавуха у Ашота', code: 'F67HN8', aavatar: ''},
				{ id: 3, name: 'На сдачу экзамена по вождению', date: '25.08.2020', time: '16:00', place: 'Улица Горькавого', description: 'С собой иметь маску и перчатки!', code: 'LI96C1', avatar: ''},
				{ id: 4, name: 'Сдача лабы по инфе', date: '24.02.2021', time: '12:25', place:'Москва, ВШЭ', description: 'Жесткий препод', code: 'N84J4K', avatar: ''},
			];

			queuesSet(queuesArray);
		}

		fetchData();

		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
				global.scheme.scheme = schemeAttribute.value;
			}else if(type === 'VKWebAppViewRestore'){
				if(window.location.hash !== ''){
					global.queue.joinQueueCode = window.location.hash.replace('#', '').toUpperCase();
					if(global.queue.joinQueueCode.length === 6) {
						fetch('/getQueueToJoin', {
							method: 'POST',
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								"queueCODE": global.queue.joinQueueCode,
								"url": window.location.search.replace('?', '')
							})
						}).then(function (response) {
							return response.json();

						})
							.then(function (data) {
								if (data === 'alreadyThere') {
									setSnackbar(<Snackbar
										layout="vertical"
										onClose={() => setSnackbar(null)}
										before={<Avatar size={24} style={blueBackground}><Icon16User fill="#fff" width={14}
																									 height={14}/></Avatar>}
									>
										Вы уже находитесь в этой очереди!
									</Snackbar>);
								} else if (data === 'noQueue') {
									setSnackbar(<Snackbar
										layout="vertical"
										onClose={() => setSnackbar(null)}
										before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
									>
										Очереди с введённым кодом приглашения не существует!
									</Snackbar>)
								} else {
									global.queue.name = data.name;
									global.queue.avatar = data.avatar;
									setJoinQueueAvatar(data.avatar);
									setJoinQueueName(data.name);
									setActiveModal(MODAL_CARD_QUEUE_INVITE);
									if (osName !== IOS) {
										window.history.pushState({history: "MODAL_CARD_QUEUE_INVITE"}, "MODAL_CARD_QUEUE_INVITE"); // Создаём новую запись в истории браузера
										history.push("MODAL_CARD_QUEUE_INVITE"); // Добавляем панель в историю
									}
								}
							}).catch((e) => {
							setSnackbar(<Snackbar
								layout="vertical"
								onClose={() => setSnackbar(null)}
								before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
							>
								Ошибка соединения! Проверьте интернет!
							</Snackbar>);
						})
					}

				}
				setSnackbar(null);
				bridge.send("VKWebAppSetLocation", {"location": ""});
			}

		});

		async function queuesSet(queuesArray){
			setQueues(queuesArray);
		}
	}, [global.scheme.beginning]);

	const goBack = async () => {
		if (!time) {
			setSnackbar(null);
			setActiveModal(null);
			setPopout(null);
			if (history.length === 1) {  // Если в массиве одно значение:
				await bridge.send("VKWebAppClose", {"status": "success"}); // Отправляем bridge на закрытие сервиса.
			} else {
				if (history.length > 1) { // Если в массиве больше одного значения:
					history.pop() // удаляем последний элемент в массиве.
					await setTimeout(() => setActivePanel(history[history.length - 1]), 400); // Изменяем массив с иторией и меняем активную панель
					window.scrollTo(0,0);
					await setTime(true);
					await setTimeout(() => {setTime(false)}, 800);
				}
			}
		}
	}

	const changePanel = e => {
		setActivePanel(e.currentTarget.dataset.to);
		setSnackbar(null); //При переходе
		window.history.pushState( {history: e.currentTarget.dataset.to}, e.currentTarget.dataset.to ); // Создаём новую запись в истории  браузера
		history.push(e.currentTarget.dataset.to); // Добавляем панель в историю

		global.queue.counterForCalendar = 0;
		global.queue.isFirstPlace = undefined;
		global.queue.changedName = undefined;
		global.queue.changedDesc = undefined;
		global.queue.changedDate = undefined;
		global.queue.changedTime = undefined;
		global.queue.changedPlace = undefined;
		global.queue.changedPic = undefined;
		global.queue.changedPicName = undefined;
		global.queue.changedPicURL = undefined;
		global.queue.changedPioURLNew = undefined;
		global.queue.changedAvatarName = undefined;

			window.scrollTo(0,0);
	};

	const onStoryChange = e => {
		window.scrollTo(0,0);
		setSnackbar(null);
		setActiveStory(e.currentTarget.dataset.story);
	};

	const sendDataToServer = data => {
		if (data !== undefined && data.trim().length === 6) {
			setJoinInputStatus('');
			setJoinInputStatusText('');
			console.log('Отправлен запрос на вход в очередь...');

				fetch('/joinQueue', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						"serverCode": data,
						"url": window.location.search.replace('?', '')
					})
				}).then(async function (response) {
							let res = await response.json();
							if (osName !== IOS){
								history.pop() // удаляем последний элемент в массиве.
								// setActivePanel( history[history.length - 1] ) // Изменяем массив с иторией и меняем активную панель.
							}
							if (res === 'noQueue') {
								setActiveModal(null);
								setCodeInput(undefined);
								setSnackbar(<Snackbar
									layout="vertical"
									onClose={() => setSnackbar(null)}
									before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
								>
									Очереди с введённым кодом не существует!
								</Snackbar>)
							} else if (res === 'alreadyThere') {
								setActiveModal(null);
								setCodeInput(undefined);
								setSnackbar(<Snackbar
									layout="vertical"
									onClose={() => setSnackbar(null)}
									before={<Avatar size={24} style={blueBackground}><Icon16User fill="#fff" width={14} height={14}/></Avatar>}
								>
									Вы уже находитесь в этой очереди!
								</Snackbar>)
							} else if (res === 'success') {
								setActiveModal(null);
								setCodeInput(undefined);
								setSnackbar(<Snackbar
									layout="vertical"
									onClose={() => setSnackbar(null)}
									before={<Avatar size={24} style={blueBackground}><Icon16CheckCircle fill="#fff" width={14} height={14}/></Avatar>}
								>
									Вы успешно присоединились к очереди!
								</Snackbar>)
							}
				}).then(async function (res) {
					fetch('/getQueues', {
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
						.then(function (data) {
							setQueues(data);
						})
				}).catch((e) => {
					setSnackbar(<Snackbar
						layout="vertical"
						onClose={() => setSnackbar(null)}
						before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
					>
						Ошибка соединения! Проверьте интернет!
					</Snackbar>);
				})

			}else{
			setJoinInputStatus('error');
			setJoinInputStatusText('Должно быть 6 символов!')
		}
	}


	const blueBackground = {
		backgroundColor: 'var(--accent)'
	};

	const modal = (
		<ModalRoot activeModal={activeModal}>
			<ModalCard
				id={MODAL_CARD_FOR_MESSAGE}
				onClose={() => {
					setActiveModal(null)
					setMessageToAll('')
					if (osName !== IOS) {
						history.pop() // удаляем последний элемент в массиве.
					}
					setJoinInputStatus('');
					setJoinInputStatusText('');
				}}
				header="Введите текст сообщения"
				actions={[
					{
						title: 'Отправить',
						mode: 'primary',
						action: () => {
							if (messageToAll !== '') {
								fetch('/sendMessageToAll', {
									method: 'POST',
									headers: {
										'Accept': 'application/json',
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({
										"queueCODE": global.queue.codeForMsg,
										"message": messageToAll,
										"url": window.location.search.replace('?', '')
									})
								})
								setActiveModal(null);
								setMessageToAll('')
								setJoinInputStatus('');
								setJoinInputStatusText('');

								setSnackbar(<Snackbar
									layout="vertical"
									onClose={() => setSnackbar(null)}
									before={<Avatar size={24} style={blueBackground}><Icon16CheckCircle fill="#fff" width={14} height={14}/></Avatar>}
								>
									Отправлено!
								</Snackbar>);
							} else {
								setJoinInputStatusText('Введите что-нибудь!');
								setJoinInputStatus('error');
							}
						}
					}
				]}
				actionsLayout="vertical"
			>
				<FormLayout>
				<Textarea bottom={joinInputStatusText} status={joinInputStatus} placeholder="Текст сообщения..." value={messageToAll} onChange={(e) =>{
					setMessageToAll(e.target.value)
					if(e.target.value.length === 0){
						setJoinInputStatusText('Введите что-нибудь!');
						setJoinInputStatus('error');
					}else{
						setJoinInputStatusText('');
						setJoinInputStatus('');
					}
				}}/>
			</FormLayout>

			</ModalCard>
			<ModalCard
				id={MODAL_CARD_QUEUE_INVITE}
				onClose={() => {
					setActiveModal(null)
					if (osName !== IOS) {
						history.pop() // удаляем последний элемент в массиве.
					}
					// history.pop() // удаляем последний элемент в массиве.
					// setActivePanel( history[history.length - 1] ) // Изменяем массив с иторией и меняем активную панель.
				}}
				icon={<Avatar src={joinQueueAvatar} size={72} />}
				header={joinQueueName}
				caption="Приглашение в очередь"
				actions={[{
					title: 'Присоединиться',
					mode: 'primary',
					action: () => {
						// if (osName !== IOS) {
						// 	history.pop() // удаляем последний элемент в массиве.
						// }
						sendDataToServer(global.queue.joinQueueCode);
						setActiveModal(null);
					}
				}]}
				actionsLayout="vertical"
			>
			</ModalCard>


			<ModalCard
				className={'numberInputModal'}
				id={MODAL_CARD_ABOUT}
				onClose={() => {
					setActiveModal(null)
					setJoinInputStatus('');
					setJoinInputStatusText('');
					if (osName !== IOS) {
						history.pop() // удаляем последний элемент в массиве.
						setActivePanel(history[history.length - 1]) // Изменяем массив с иторией и меняем активную панель.
					}
					setCodeInput(undefined)
				}}
				header="Введите код очереди"
				actions={[
					{
						title: 'Присоединиться',
						mode: 'primary',
						action: () => {
							if(codeInput !== undefined) {
								sendDataToServer(codeInput.toUpperCase());
							}else{
								setJoinInputStatus('error');
								setJoinInputStatusText('Введите код')
							}
						}
					}
				]}
			>
				<FormLayout className={'inputJoin'}>
						<Input id='input' bottom={joinInputStatusText} status={joinInputStatus} className={'inputJoin'} autoFocus={false} type={'text'}
							   minlength={6} maxlength={6} value={codeInput} onChange={(e) =>{

							   	setCodeInput(e.target.value.substring(0, 6))
								if(e.target.value.length === 6){
									setJoinInputStatusText('');
									setJoinInputStatus('valid');
									// history.pop() // удаляем последний элемент в массиве.
									// setActivePanel( history[history.length - 1] ) // Изменяем массив с иторией и меняем активную панель.
								}else{
									setJoinInputStatusText('Должно быть 6 символов!');
									setJoinInputStatus('error');
								}
						}}/>
				</FormLayout>
			</ModalCard>

			<ModalCard
				id={MODAL_CARD_CHAT_INVITE}
				onClose={() => {
					setActiveModal(null)
					setCopyButtonTitle('Скопировать код')
					if (osName !== IOS) {
						history.pop() // удаляем последний элемент в массиве.
					}
					// history.pop() // удаляем последний элемент в массиве.
					// setActivePanel( history[history.length - 1] ) // Изменяем массив с иторией и меняем активную панель.
				}}
				icon={<span role="img" aria-label="Готово!" className={'emoji'}>&#128588;</span>}
				header="Очередь создана!"
				caption="Перейдите на страницу с очередями, чтобы увидеть её!"
				actions={[{
					title: 'На страницу с очередями',
					mode: 'primary',
					action: () => {
						// history.pop() // удаляем последний элемент в массиве.
						// setActivePanel( history[history.length - 1] ) // Изменяем массив с иторией и меняем активную панель.
						// window.history.pushState( {panel: "home"}, "home" ); // Создаём новую запись в истории браузера
						// history.push("home"); // Добавляем панель в историю
						if (osName !== IOS) {
							history.pop() // удаляем последний элемент в массиве.
						}
						setPopout(null);
						setActiveModal(null);
						setActiveStory('main');
						setActivePanel('home');
						setCopyButtonTitle('Скопировать код');
					}}, {
					title: 'Пригласить друзей',
					mode: 'secondary',
					action: () => {
						bridge.send("VKWebAppShare", {"link": `https://vk.com/app7551421_199833891#${queueCODE}`});
					}
				}, {
					title: copyButtonTitle,
					mode: 'secondary',
					action: async () => {
						// copyToClipboard(queueCODE);
						await bridge.send("VKWebAppCopyText", {"text": queueCODE});
						setCopyButtonTitle('Скопировано!')
					}
					}]}
				actionsLayout="vertical"
			>
			</ModalCard>
		</ModalRoot>
	);
	const allowNotifications = async () => {
		await bridge.send("VKWebAppAllowMessagesFromGroup", {"group_id": 198211683});
	}

	const skip = async () => {
		global.queue.beginning = true
		setTabbarCSS('createQueuePanel');
		setActiveStory('main');
		setActivePanel('home')
		await bridge.send("VKWebAppStorageSet", {"key": "firstInstruction", "value": "true"});
	}

	return (
		<ConfigProvider>
		<Epic activeStory={activeStory} tabbar={
			<Tabbar className={tabbarCSS}>
				<TabbarItem
					onClick={onStoryChange}
					selected={activeStory === 'main'}
					data-story="main"
					data-to='home'
					text="Очереди"
				><ListOutline28/></TabbarItem>
				<TabbarItem
					onClick={onStoryChange}
					selected={activeStory === 'createQueue'}
					data-story="createQueue"
					data-to="createQueuePanel"
					text="Создать очередь"
				><AddSquareOutline28/></TabbarItem>
				<TabbarItem
					onClick={onStoryChange}
					selected={activeStory === 'settings'}
					data-story="settings"
					// label="12" - Сколько уведомлений. Может быть потом пригодится
					text="Настройки"
				><Icon28SettingsOutline/></TabbarItem>

			</Tabbar>
		}>

			<View id={'main'} activePanel={activePanel} popout={popout} modal={modal} history={history}>
				<Home id='home' cssSpinner={cssSpinner} history={history} setCssSpinner={setCssSpinner} snackbar={snackbar} setSnackbar={setSnackbar} setJoinQueueAvatar={setJoinQueueAvatar} setJoinQueueName={setJoinQueueName} queues={queues} fetchedUser={fetchedUser} go={changePanel} setActiveModal={setActiveModal} setActiveStory={setActiveStory} setQueues={setQueues}/>
				<AboutQueue id='aboutQueue' snackbar={snackbar} history={history} setHistory={setHistory} setSnackbar={setSnackbar} setActiveStory={setActiveStory} fetchedUser={fetchedUser} go={changePanel} queues={queues} setActivePanel={setActivePanel} setActiveModal={setActiveModal} setPopout={setPopout} setQueues={setQueues}/>
				<ChangeQueue id='changeQueue' setPopout={setPopout} history={history} setSnackbar={setSnackbar} snackbar={snackbar} fetchedUser={fetchedUser} go={changePanel} setActivePanel={setActivePanel} setQueues={setQueues}/>
			</View>

			<View id={'instructionsView'} activePanel={activePanel}>
				<Instruction id={'instruction'} setActivePanel={setActivePanel} skip={skip} setTabbarCSS={setTabbarCSS}/>
				<Instruction2 id={'instruction2'} setActivePanel={setActivePanel} skip={skip}/>
				<Instruction3 id={'instruction3'} setActivePanel={setActivePanel} skip={skip}/>
				<Instruction4 id={'instruction4'} setActivePanel={setActivePanel} skip={skip}/>
				<Instruction5 id={'instruction5'} setActivePanel={setActivePanel} skip={skip}/>
				<Instruction6 id={'instruction6'} setActivePanel={setActivePanel} setActiveStory={setActiveStory} skip={skip} allowNotifications={allowNotifications}/>
			</View>

			<View id={'createQueue'} activePanel={'CreateQueue'} popout={popout} modal={modal} history={history}>
				<CreateQueue id={'CreateQueue'} setCSSForCreateQueue={setCSSForCreateQueue} history={history} setSnackbar={setSnackbar} setPopout={setPopout} snackbar={snackbar} go={changePanel} setActiveModal={setActiveModal} fetchedUser={fetchedUser} setQueueCODE={setQueueCODE}/>
			</View>

			<View id={'settings'} activePanel={'Settings'} popout={popout} modal={modal}>
				<Settings id={'Settings'} go={changePanel} fetchedUser={fetchedUser} setSnackbar={setSnackbar} snackbar={snackbar}/>
			</View>
		</Epic>
		</ConfigProvider>
	);
}

export default App;
