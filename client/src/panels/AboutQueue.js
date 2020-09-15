import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {
	MiniInfoCell,
	Panel,
	PanelHeader,
	PanelHeaderButton,
	Group,
	Text,
	Div,
	Avatar,
	Button,
	Headline
} from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import './Persik.css';
import Icon20ArticleOutline from '@vkontakte/icons/dist/20/article_outline';
import Icon20RecentOutline from '@vkontakte/icons/dist/20/recent_outline';
import Icon20PlaceOutline from '@vkontakte/icons/dist/20/place_outline';
import Icon20CalendarOutline from '@vkontakte/icons/dist/20/calendar_outline';
import UsersList from '../usersList'
import Icon20Info from '@vkontakte/icons/dist/20/info';



// const osName = platform(); - Определяет ОС устройства

const AboutQueue = ({id,  snackbar, fetchedUser, setSnackbar, go, queues, setActiveModal, setPopout, setActivePanel, setActiveStory, setQueues}) => {

	const [cssEdit, setCssEdit] = useState('turnOff');

	return (
		<Panel id={id}>
			<PanelHeader
				left={<PanelHeaderButton onClick={go} data-to="home">
					{<Icon28ChevronBack/>}
				</PanelHeaderButton>}
			>
				Очередь
			</PanelHeader>

			<div className={'AvatarInQueueDiv'}>
			<Avatar className={'AvatarInQueue'} size={106} src={global.queue.avatarQueue}/>
			</div>

			<Div>
			<Group className={'QueueINFO'}>
				<div>
					<br/>
					<br/>
					<Headline weight="medium" className={"HeaderOfQueue"}>{global.queue.name}</Headline>
				{ global.queue.descriptionQueue !== '' &&
					<MiniInfoCell
						before={<Icon20ArticleOutline/>}
						multiline
					>
						{global.queue.descriptionQueue}
					</MiniInfoCell>
				}
				{ global.queue.placeQueue !== '' &&
					<MiniInfoCell
						before={<Icon20PlaceOutline/>}
					>
						{global.queue.placeQueue}
					</MiniInfoCell>
				}

				{ global.queue.dateQueue !== '' &&
					<MiniInfoCell
						before={<Icon20CalendarOutline/>}
					>
						{global.queue.dateQueue.slice(0, 10).split('-').reverse().join('.')}
					</MiniInfoCell>
				}
				{ global.queue.timeQueue !== '' &&
					<MiniInfoCell
						before={<Icon20RecentOutline/>}
					>
						{global.queue.timeQueue.slice(0, 5)}
					</MiniInfoCell>
				}

				<MiniInfoCell
					before={<Icon20Info/>}
				>
					<Text weight="semibold">Код очереди:  {global.queue.codeQueue}</Text>
				</MiniInfoCell>

					<Button className={cssEdit} onClick={(e) => {
						go(e)
						global.queue.pic = undefined;
						global.queue.picURL = undefined;
					}} data-to="changeQueue" mode={'tertiary'}>Редактировать
						информацию</Button>


				</div>
			</Group>
			</Div>

			<UsersList go={go} snackbar={snackbar} setSnackbar={setSnackbar} setQueues={setQueues} setCssEdit={setCssEdit} setActiveStory={setActiveStory} setActivePanel={setActivePanel} setActiveModal={setActiveModal} setPopout={setPopout} queueCode={global.queue.codeQueue} fetchedUser={fetchedUser}/>

		</Panel>
	)
}

AboutQueue.propTypes = {
	id: PropTypes.string.isRequired,
	go: PropTypes.func.isRequired,
}

export default AboutQueue;
