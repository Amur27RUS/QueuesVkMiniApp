import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import '@vkontakte/vkui/dist/vkui.css';
import {
	Epic,
	Tabbar,
	TabbarItem,
	ModalRoot,
	ModalCard,
	Input,
	FormLayout,
	View,
	Avatar,
	Snackbar,
} from "@vkontakte/vkui";
import ListOutline28 from '@vkontakte/icons/dist/28/list_outline'
import AddSquareOutline28 from '@vkontakte/icons/dist/28/add_square_outline'

import Home from './panels/Home';
import CreateQueue from './panels/CreateQueue'
import AboutQueue from "./panels/AboutQueue";
import ChangeQueue from "./panels/ChangeQueue"
import Settings from "./panels/Settings";
import Icon16Clear from '@vkontakte/icons/dist/16/clear';
import Icon16User from '@vkontakte/icons/dist/16/user';
import Icon16CheckCircle from '@vkontakte/icons/dist/16/check_circle';
import Icon28SettingsOutline from '@vkontakte/icons/dist/28/settings_outline';


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

	joinQueueAvatar: undefined,
	joinQueueName: undefined,
	joinQueueCode: undefined,

	dataCheck: false,
}

const MODAL_CARD_ABOUT = 'say-about';
const MODAL_CARD_CHAT_INVITE = 'chat-invite';
const MODAL_CARD_QUEUE_INVITE = 'queue-join';

const App = () =>{

	const [activePanel, setActivePanel] = useState('home');
	const [fetchedUser, setUser] = useState({id: 6}); //{id: 3} - это для теста
	const [popout, setPopout] = useState(null);
	const [activeStory, setActiveStory] = useState('main');
	const [activeModal, setActiveModal] = useState(null);
	const [codeInput, setCodeInput] = useState(undefined);
	const [queues, setQueues] = useState([]);
	const [queueCODE, setQueueCODE] = useState('');
	const [snackbar, setSnackbar] = useState(null);
	const [copyButtonTitle, setCopyButtonTitle] = useState('Скопировать приглашение');
	const [joinQueueResponse, setJoinQueueResponse] = useState('');
	const [joinQueueName, setJoinQueueName] = useState('');
	const [joinQueueAvatar, setJoinQueueAvatar] = useState('');


	//ActiveStory - это View
	//ActivePanel - это Panel

	useEffect(() => {
		console.log('Получение данных о пользователе через VK Bridge');

		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');
			setUser(user);
			global.queue.userID = user.id;
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
				}).catch((e) => {
				setSnackbar(<Snackbar
					layout="vertical"
					onClose={() => setSnackbar(null)}
					before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
				>
					Ошибка соединения! Проверьте интернет!
				</Snackbar>);
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
							}
						})
				}
				window.location.hash = '';
			}

			// /* ИМИТАЦИЯ ПОЛУЧЕННЫХ ДАННЫХ */
			// const queuesArray = [
			// 	{ id: 1, name: 'Сдача лабы по проге', date: '', time: '', place: 'ИТМО', description: 'Приём в каб. 406', code: 'J8D1XI', avatar: 'https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o/43H5.gif?alt=media&token=bc19b8ba-dc95-4bcf-8914-c7b6163d1b3b'},
			// 	{ id: 2, name: 'Очередь за шавермой', date:'14.12.2020', time: '15:10', place: 'Ларёк 35', description: 'Лучшая шавуха у Ашота', code: 'F67HN8', aavatar: ''},
			// 	{ id: 3, name: 'На сдачу экзамена по вождению', date: '25.08.2020', time: '16:00', place: 'Улица Горькавого', description: 'С собой иметь маску и перчатки!', code: 'LI96C1', avatar: cowboy},
			// 	{ id: 4, name: 'Сдача лабы по инфе', date: '24.02.2021', time: '12:25', place:'Москва, ВШЭ', description: 'Жесткий препод', code: 'N84J4K', avatar: ''},
			// ];
			//
			// queuesSet(queuesArray);
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
			}

		});



		async function queuesSet(queuesArray){
			setQueues(queuesArray);
		}
	}, []);


	const go = e => {
		setActivePanel(e.currentTarget.dataset.to);
		setSnackbar(null); //При переходе
	};

	const onStoryChange = e => {
		setActiveStory(e.currentTarget.dataset.story);
	};

	const sendDataToServer = data => {
		if (data !== undefined && data.trim().length === 6) {
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

			}
	}

	const updateQueues = data => {
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
				setQueues(data);
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

	const blueBackground = {
		backgroundColor: 'var(--accent)'
	};

	const modal = (
		<ModalRoot activeModal={activeModal}>
			<ModalCard
				id={MODAL_CARD_QUEUE_INVITE}
				onClose={() => setActiveModal(null)}
				icon={<Avatar src={joinQueueAvatar} size={72} />}
				header={joinQueueName}
				caption="Приглашение в очередь"
				actions={[{
					title: 'Присоединиться',
					mode: 'primary',
					action: () => {
						sendDataToServer(global.queue.joinQueueCode);
						setActiveModal(null);
					}
				}]}
				actionsLayout="vertical"
			>
				{/*<UsersStack*/}
				{/*	photos={[*/}
				{/*		getAvatarUrl('user_mm'),*/}
				{/*		getAvatarUrl('user_ilyagrshn'),*/}
				{/*		getAvatarUrl('user_lihachyov'),*/}
				{/*		getAvatarUrl('user_wayshev'),*/}
				{/*		getAvatarUrl('user_arthurstam'),*/}
				{/*		getAvatarUrl('user_xyz'),*/}
				{/*	]}*/}
				{/*	size="m"*/}
				{/*	count={3}*/}
				{/*	layout="vertical"*/}
				{/*>Алексей, Илья, Михаил<br />и ещё 3 человека</UsersStack>*/}
			</ModalCard>

			<ModalCard
				className={'numberInputModal'}
				id={MODAL_CARD_ABOUT}
				onClose={() =>
					setActiveModal(null)}
				header="Введите код очереди"
				actions={[
					{
						title: 'Присоединиться',
						mode: 'primary',
						action: () => {
							sendDataToServer(codeInput.toUpperCase());
						}
					}
				]}
			>
				<FormLayout className={'inputJoin'}>
						<Input id='input' className={'inputJoin'} autoFocus={false} type={'text'} minlength={6} maxlength={6} onChange={(e) => setCodeInput(e.target.value)}/>
				</FormLayout>
			</ModalCard>

			<ModalCard
				id={MODAL_CARD_CHAT_INVITE}
				onClose={() => {
					setActiveModal(null)
					setCopyButtonTitle('Скопировать приглашение')
				}}
				icon={<span role="img" aria-label="Готово!" className={'emoji'}>&#128588;</span>}
				header="Очередь создана!"
				caption="Перейдите на страницу с очередями, чтобы увидеть её!"
				actions={[{
					title: 'На страницу с очередями',
					mode: 'primary',
					action: () => {
						setActiveModal(null);
						setActiveStory('main');
						setActivePanel('home');
						setCopyButtonTitle('Скопировать приглашение')
					}}, {
					title: 'Пригласить друзей',
					mode: 'secondary',
					action: () => {
						bridge.send("VKWebAppShare", {"link": `https://vk.com/app7551421_199833891#${queueCODE}`});
					}
				}, {
					title: copyButtonTitle,
					mode: 'secondary',
					action: () => {
						copyToClipboard(queueCODE);
						setCopyButtonTitle('Скопировано!')
					}
					}]}
				actionsLayout="vertical"
			>
			</ModalCard>

		</ModalRoot>
	);

	function copyToClipboard(text) {
		let dummy = document.createElement("textarea");
		document.body.appendChild(dummy);
		dummy.value = text;
		dummy.select();
		document.execCommand("copy");
		document.body.removeChild(dummy);
	}

	return (
		<Epic activeStory={activeStory} tabbar={
			<Tabbar>
				<TabbarItem
					onClick={onStoryChange}
					selected={activeStory === 'main'}
					data-story="main"
					text="Очереди"
				><ListOutline28/></TabbarItem>
				<TabbarItem
					onClick={onStoryChange}
					selected={activeStory === 'createQueue'}
					data-story="createQueue"
					text="Создать очередь"
				><AddSquareOutline28/></TabbarItem>
				{/*<TabbarItem*/}
				{/*	onClick={onStoryChange}*/}
				{/*	selected={activeStory === 'settings'}*/}
				{/*	data-story="settings"*/}
				{/*	// label="12" - Сколько уведомлений. Может быть потом пригодится*/}
				{/*	text="Настройки"*/}
				{/*><Icon28SettingsOutline/></TabbarItem>*/}
			</Tabbar>
		}>

		<View id={'main'} activePanel={activePanel} popout={popout} modal={modal}>
			<Home id='home' snackbar={snackbar} setSnackbar={setSnackbar} setJoinQueueAvatar={setJoinQueueAvatar} setJoinQueueName={setJoinQueueName} queues={queues} fetchedUser={fetchedUser} go={go} setActiveModal={setActiveModal} setActiveStory={setActiveStory} setQueues={setQueues}/>
			<AboutQueue id='aboutQueue' snackbar={snackbar} setSnackbar={setSnackbar} setActiveStory={setActiveStory} fetchedUser={fetchedUser} go={go} queues={queues} setActivePanel={setActivePanel} setActiveModal={setActiveModal} setPopout={setPopout} setQueues={setQueues}/>
			<ChangeQueue id='changeQueue' setPopout={setPopout} setSnackbar={setSnackbar} snackbar={snackbar} fetchedUser={fetchedUser} go={go} setActivePanel={setActivePanel} setQueues={setQueues}/>
		</View>

		<View id={'createQueue'} activePanel={'CreateQueue'} popout={popout} modal={modal}>
			<CreateQueue setSnackbar={setSnackbar} setPopout={setPopout} snackbar={snackbar} id={'CreateQueue'} go={go} setActiveModal={setActiveModal} fetchedUser={fetchedUser} setQueueCODE={setQueueCODE}/>
		</View>

		{/*<View id={'settings'} activePanel={'Settings'} popout={popout} modal={modal}>*/}
		{/*	<Settings id={'Settings'} go={go}/>*/}
		{/*</View>*/}
		</Epic>
	);
}

export default App;







