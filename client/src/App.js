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
import Icon16Clear from '@vkontakte/icons/dist/16/clear';
import Icon16User from '@vkontakte/icons/dist/16/user';
import Icon16CheckCircle from '@vkontakte/icons/dist/16/check_circle';
import cowboy from "./img/cowboy.jpg";
import ConfigProvider from "@vkontakte/vkui/dist/components/ConfigProvider/ConfigProvider";


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
}

const MODAL_CARD_ABOUT = 'say-about';
const MODAL_CARD_CHAT_INVITE = 'chat-invite';

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
	const [joinQueueResponse, setJoinQueueResponse] = useState('')
	const [scheme, setScheme] = useState('bright_light');
	const [lights, setLights] = useState(['bright_light', 'client_light']);

	//ActiveStory - это View
	//ActivePanel - это Panel

	useEffect(() => {
		console.log('Получение данных о пользователе через VK Bridge')
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				camelCase( data.scheme )
				// const schemeAttribute = document.createAttribute('scheme');
				// console.log(schemeAttribute.value)
				// schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				// document.body.attributes.setNamedItem(schemeAttribute);
			}
		});
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
					"userID": user.id, //user.id
				})
			}).then(function (response) {
				return response.json();

			})
				.then(function (data) {
					console.log('Получен массив очередей: ' + data);
					// console.log("Для пользователя с id: " + user.id);
					queuesSet(data);
				})

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




		async function queuesSet(queuesArray){
			setQueues(queuesArray);
		}
	}, []);

	const camelCase = ( scheme, needChange = true ) => {
		let isLight = lights.includes( scheme );

		if( needChange ) {
			isLight = !isLight;
		}
		setScheme( isLight ? 'bright_light' : 'space_gray');

		bridge.send('VKWebAppSetViewSettings', {
			'status_bar_style': isLight ? 'dark' : 'light',
			'action_bar_color': isLight ? '#ffffff' : '#191919'
		});
	}


	const go = e => {
		setActivePanel(e.currentTarget.dataset.to);
	};

	const onStoryChange = e => {
		setActiveStory(e.currentTarget.dataset.story);
	};

	const sendDataToServer = data => {
		if (data !== undefined && data.trim().length === 6) {
			console.log('Отправлен запрос на вход в очередь...');
			console.log('Код очереди: '+ data);

				fetch('/joinQueue', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						"serverCode": data,
						"userID": fetchedUser.id,
					})
				}).then(async function (response) {
							let res = await response.json();

							console.log(joinQueueResponse);
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
				"userID": data, //user.id
			})
		}).then(function (response) {
			return response.json();

		})
			.then(function (data) {
				console.log('Получен массив очередей: ' + data);
				setQueues(data);
			})
	}

	const blueBackground = {
		backgroundColor: 'var(--accent)'
	};

	const modal = (
		<ModalRoot activeModal={activeModal}>
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
		<ConfigProvider isWebView={true} scheme={scheme}>
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
				{/*	selected={activeStory === 'joinQueue'}*/}
				{/*	data-story="joinQueue"*/}
				{/*	// label="12" - Сколько уведомлений. Может быть потом пригодится*/}
				{/*	text="Войти в очередь"*/}
				{/*><ListAddOutline28/></TabbarItem>*/}
			</Tabbar>
		}>

		<View id={'main'} activePanel={activePanel} popout={popout} modal={modal}>
			<Home id='home' snackbar={snackbar} queues={queues} fetchedUser={fetchedUser} go={go} setActiveModal={setActiveModal} setActiveStory={setActiveStory} setQueues={setQueues}/>
			<AboutQueue id='aboutQueue' snackbar={snackbar} setActiveStory={setActiveStory} fetchedUser={fetchedUser} go={go} queues={queues} setActivePanel={setActivePanel} setActiveModal={setActiveModal} setPopout={setPopout} setQueues={setQueues}/>
			<ChangeQueue id='changeQueue' setSnackbar={setSnackbar} snackbar={snackbar} fetchedUser={fetchedUser} go={go} setActivePanel={setActivePanel} setQueues={setQueues}/>
		</View>

		<View id={'createQueue'} activePanel={'CreateQueue'} popout={popout} modal={modal}>
			<CreateQueue snackbar={snackbar} id={'CreateQueue'} go={go} setActiveModal={setActiveModal} fetchedUser={fetchedUser} setQueueCODE={setQueueCODE}/>
		</View>

		{/*<View id={'joinQueue'} activePanel={'JoinQueue'} popout={popout} modal={modal}>*/}
		{/*	<JoinQueue id={'JoinQueue'}  go={go} setActiveModal={setActiveModal}/>*/}
		{/*</View>*/}
		</Epic>
		</ConfigProvider>
	);
}

export default App;







