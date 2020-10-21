import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import QueueCell from "../QueueCell";
import Icon56UsersOutline from '@vkontakte/icons/dist/56/users_outline';
import {
	Placeholder,
	List,
	Div,
	Group,
	PanelHeader,
	Panel,
	Button,
	Snackbar,
	Avatar,
	Spinner,
	Separator, IOS, platform, FixedLayout, PromoBanner
} from "@vkontakte/vkui";
import ListAddOutline28 from '@vkontakte/icons/dist/28/list_add_outline'
import Icon16Clear from '@vkontakte/icons/dist/16/clear';
import bridge from "@vkontakte/vk-bridge";

const MODAL_CARD_ABOUT = 'say-about';
const osName = platform();

let homePanelCounter = 0;

const Home = ({ id, cssSpinner, history, setCssSpinner, snackbar, setSnackbar, setJoinQueueAvatar, setJoinQueueName, go, fetchedUser, queues, setActiveStory, setQueues, setActiveModal}) => {

	const [banner, setBanner] = useState(undefined);

	useEffect(() => {
		global.queue.userID = fetchedUser.id;

		if (homePanelCounter !== 0) {
			setCssSpinner('defaultSpinner');
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
			})

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

		bridge.send("VKWebAppGetAds", {}).then(data => {
			console.log('bannerdata');
			console.log(data);
			setBanner(<PromoBanner
					onClose={()=>{this.setState({Banner:false})}}
					bannerData={data}/>)
		}).catch(data => console.log(data));

	}, []);

	const blueBackground = {
		backgroundColor: 'var(--accent)'
	};


		return (
			<Panel id={id}>
				<PanelHeader>Ваши очереди</PanelHeader>

				<Div>
					<Group>
						<List>
							{queues.map(info => {
								return <QueueCell info={info} go={go}/>
							})}
						</List>
					</Group>
				</Div>

				<Spinner className={cssSpinner} size="large" style={{marginTop: 20}}/>

				{queues.length !== 0 &&
				<Div className={'EnterDiv'}>
					<Button className={'joinBTN'} size="l" level="2" before={<ListAddOutline28/>} onClick={() => {
						setActiveModal(MODAL_CARD_ABOUT)
						if (osName !== IOS) {
							window.history.pushState({history: "MODAL_CARD_ABOUT"}, "MODAL_CARD_ABOUT"); // Создаём новую запись в истории браузера
							history.push("MODAL_CARD_ABOUT");
						}
					}}>
						Войти с помощью кода
					</Button>
				</Div>
				}


				{queues.length === 0 && cssSpinner === 'turnOff' &&

				<Div>
					<Separator/>
					<Placeholder
						icon={<Icon56UsersOutline/>}
						action={<Button size="l" mode="tertiary" onClick={() => {
							setActiveModal(MODAL_CARD_ABOUT)
							if (osName !== IOS) {
								window.history.pushState({history: "MODAL_CARD_ABOUT"}, "MODAL_CARD_ABOUT"); // Создаём новую запись в истории браузера
								history.push("MODAL_CARD_ABOUT");
							}
						}}>Войти в очередь с помощью кода</Button>}
						stretched
					>
						Вы не состоите в очередях
					</Placeholder>
				</Div>
				}
				<FixedLayout vertical="bottom">
					{banner}
				</FixedLayout>

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