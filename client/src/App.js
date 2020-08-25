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
} from "@vkontakte/vkui";
import ListAddOutline28 from '@vkontakte/icons/dist/28/list_add_outline'
import ListOutline28 from '@vkontakte/icons/dist/28/list_outline'
import AddSquareOutline28 from '@vkontakte/icons/dist/28/add_square_outline'

import Home from './panels/Home';
import JoinQueue from './panels/JoinQueue';
import CreateQueue from './panels/CreateQueue'
import AboutQueue from "./panels/AboutQueue";
import cowboy from "./img/cowboy.jpg";

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

	//ActiveStory - это View
	//ActivePanel - это Panel

	useEffect(() => {
		console.log('Получение данных о пользователе через VK Bridge')
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
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
				}).then(function (response) {
					return response.json();
				})
					.then(function (data) {
						console.log('Ответ на запрос на вход в очередь');
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
							sendDataToServer(codeInput);
							setActiveModal(null);
							setCodeInput(undefined);
							updateQueues(fetchedUser.id);
						}
					}
				]}
			>
				<FormLayout className={'inputJoin'}>
						<Input id='input' className={'inputJoin'} autoFocus={false} type={'text'} minlength={6} maxlength={6} onChange={(e) => setCodeInput(e.target.value)}/>
				</FormLayout>
				{/*<div className={'inputCodeDiv'}>*/}
				{/*	<ReactCodeInput id={'codeINPUT'} type='text' fields={6} onChange={e => setCodeInput(e)} autoFocus={false} {...props}/>*/}
				{/*</div>*/}
			</ModalCard>

			<ModalCard
				id={MODAL_CARD_CHAT_INVITE}
				onClose={() => setActiveModal(null)}
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
					}}, {
					title: 'Скопировать приглашение',
					mode: 'secondary',
					action: () => {
						const code = document.getElementById('copyInput');
						code.select();
						document.execCommand('copy');
					}
				}]}
				actionsLayout="vertical"
			>
				<FormLayout className={'inputJoin'}>
					<Input id='copyInput' top={'Код вашей очереди:'} className={'copyText'} readOnly={true} autoFocus={false} type={'text'} value={queueCODE}/>
				</FormLayout>
			</ModalCard>

		</ModalRoot>
	);

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
				{/*	selected={activeStory === 'joinQueue'}*/}
				{/*	data-story="joinQueue"*/}
				{/*	// label="12" - Сколько уведомлений. Может быть потом пригодится*/}
				{/*	text="Войти в очередь"*/}
				{/*><ListAddOutline28/></TabbarItem>*/}
			</Tabbar>
		}>

		<View id={'main'} activePanel={activePanel} popout={popout} modal={modal}>
			<Home id='home' queues={queues} fetchedUser={fetchedUser} go={go} setActiveModal={setActiveModal} setActiveStory={setActiveStory} setQueues={setQueues} setActiveModal={setActiveModal}/>
			<AboutQueue id='aboutQueue' setActiveStory={setActiveStory} fetchedUser={fetchedUser} go={go} queues={queues} setActivePanel={setActivePanel} setActiveModal={setActiveModal} setPopout={setPopout} setQueues={setQueues}/>
		</View>

		<View id={'createQueue'} activePanel={'CreateQueue'} popout={popout} modal={modal}>
			<CreateQueue id={'CreateQueue'} go={go} setActiveModal={setActiveModal} fetchedUser={fetchedUser} setQueueCODE={setQueueCODE}/>
		</View>

		{/*<View id={'joinQueue'} activePanel={'JoinQueue'} popout={popout} modal={modal}>*/}
		{/*	<JoinQueue id={'JoinQueue'}  go={go} setActiveModal={setActiveModal}/>*/}
		{/*</View>*/}
		</Epic>
	);
}

export default App;







