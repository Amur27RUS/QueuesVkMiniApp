import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import QueueCell from "../QueueCell";
import Icon56UsersOutline from '@vkontakte/icons/dist/56/users_outline';
import {Placeholder, List, Div, Group, PanelHeader, Panel, Button, Snackbar, Avatar, Spinner} from "@vkontakte/vkui";
import ListAddOutline28 from '@vkontakte/icons/dist/28/list_add_outline'
import Icon16Clear from '@vkontakte/icons/dist/16/clear';

const MODAL_CARD_ABOUT = 'say-about';


let homePanelCounter = 0;

const Home = ({ id, setCssList, cssList, cssSpinner, setCssSpinner, snackbar, setSnackbar, setJoinQueueAvatar, setJoinQueueName, go, fetchedUser, queues, setActiveStory, setQueues, setActiveModal}) => {

	// const [cssSpinner, setCssSpinner] = useState('defaultSpinner');

	useEffect(() => {
		global.queue.userID = fetchedUser.id;
		setCssSpinner('defaultSpinner');
		if (homePanelCounter !== 0) {
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
					setCssList('')
				}).catch((e) => {
				setSnackbar(<Snackbar
					layout="vertical"
					onClose={() => setSnackbar(null)}
					before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
				>
					Ошибка соединения! Проверьте интернет!
				</Snackbar>);
			})

			// if(window.location.hash !== ''){
			// 	global.queue.joinQueueCode = window.location.hash.replace('#', '').toUpperCase();
			// 	if(global.queue.joinQueueCode.length === 6) {
			// 		fetch('/getQueueToJoin', {
			// 			method: 'POST',
			// 			headers: {
			// 				'Accept': 'application/json',
			// 				'Content-Type': 'application/json',
			// 			},
			// 			body: JSON.stringify({
			// 				"userID": global.queue.userID, //user.id
			// 				"queueCODE": global.queue.joinQueueCode,
			// 			})
			// 		}).then(function (response) {
			// 			return response.json();
			//
			// 		})
			// 			.then(function (data) {
			// 				if (data === 'alreadyThere') {
			// 					setSnackbar(<Snackbar
			// 						layout="vertical"
			// 						onClose={() => setSnackbar(null)}
			// 						before={<Avatar size={24} style={blueBackground}><Icon16User fill="#fff" width={14}
			// 																					 height={14}/></Avatar>}
			// 					>
			// 						Вы уже находитесь в этой очереди!
			// 					</Snackbar>);
			// 				} else if (data === 'noQueue') {
			// 					setSnackbar(<Snackbar
			// 						layout="vertical"
			// 						onClose={() => setSnackbar(null)}
			// 						before={<Avatar size={24}><Icon16Clear fill="red" width={14} height={14}/></Avatar>}
			// 					>
			// 						Очереди с введённым кодом приглашения не существует!
			// 					</Snackbar>)
			// 				} else {
			// 					global.queue.name = data.name;
			// 					global.queue.avatar = data.avatar;
			// 					setJoinQueueAvatar(data.avatar);
			// 					setJoinQueueName(data.name);
			// 					setActiveModal(MODAL_CARD_QUEUE_INVITE);
			// 				}
			// 			})
			// 	}
			// }
		}
		homePanelCounter++;
		// /* ИМИТАЦИЯ ПОЛУЧЕННЫХ ДАННЫХ */
		// const queuesArray = [
		// 	{ id: 1, name: 'Сдача лабы по проге', date: '', time: '', place: 'ИТМО', description: 'Приём в каб. 406', code: 'J8D1XI', avatar: 'https://firebasestorage.googleapis.com/v0/b/queuesvkminiapp.appspot.com/o/43H5.gif?alt=media&token=bc19b8ba-dc95-4bcf-8914-c7b6163d1b3b'},
		// 	{ id: 2, name: 'Очередь за шавермой', date:'14.12.2020', time: '15:10', place: 'Ларёк 35', description: 'Лучшая шавуха у Ашота', code: 'F67HN8', aavatar: ''},
		// 	{ id: 3, name: 'На сдачу экзамена по вождению', date: '25.08.2020', time: '16:00', place: 'Улица Горькавого', description: 'С собой иметь маску и перчатки!', code: 'LI96C1', avatar: cowboy},
		// 	{ id: 4, name: 'Сдача лабы по инфе', date: '24.02.2021', time: '12:25', place:'Москва, ВШЭ', description: 'Жесткий препод', code: 'N84J4K', avatar: ''},
		// ];
		//
		// queuesSet(queuesArray);
		//
		// /* ИМИТАЦИЯ ПОЛУЧЕННЫХ ДАННЫХ */

		async function queuesSet(queuesArray){
			setQueues(queuesArray);
		}

	}, []);

	const blueBackground = {
		backgroundColor: 'var(--accent)'
	};


		return (
			<Panel id={id}>
				<PanelHeader>Ваши очереди</PanelHeader>

				<Div className={cssList}>
					<Group>
						<List>
							{queues.map(info => {
								return <QueueCell info={info} go={go}/>
							})}
						</List>

					</Group>
				</Div>

					<Spinner className={cssSpinner} size="large" style={{marginTop: 20}}/>

				<Div className={'EnterDiv'}>
					<Button className={'joinBTN'} size="l" level="2" before={<ListAddOutline28/>} onClick={() => setActiveModal(MODAL_CARD_ABOUT)}>
						Войти с помощью кода
					</Button>
				</Div>


				{queues.length === 0 && cssSpinner === 'turnOff' &&

				<Div>
					<Placeholder
						icon={<Icon56UsersOutline/>}
						action={<Button size="l" mode="tertiary" onClick={() => setActiveModal(MODAL_CARD_ABOUT)}>Войти в очередь с помощью кода</Button>}
						stretched
					>
						Вы не состоите в очередях
					</Placeholder>
				</Div>
				}

				{snackbar}
			</Panel>
		)
}

Home.propTypes = {
	id: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
	fetchedUser: PropTypes.shape({
		photo_200: PropTypes.string,
		first_name: PropTypes.string,
		last_name: PropTypes.string,
		city: PropTypes.shape({
			title: PropTypes.string,
		}),
	}),
};

export default Home;