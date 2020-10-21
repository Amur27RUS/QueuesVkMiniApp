import React from 'react';
import PropTypes from 'prop-types';
import {Button, PanelHeader, Panel, Div, Group, Header} from "@vkontakte/vkui";
const MODAL_CARD_ABOUT = 'say-about';

const JoinQueue = ({ id, go, setActiveModal}) => {
    // const [search, setSearch] = useState(undefined);
    //
    // const onChange = e => {
    //     setSearch(e.target.value);
    // }

        return (
            <Panel id={id}>
                <PanelHeader> Войти в очередь </PanelHeader>
                {/*<Group header={<Header mode="secondary">Найти публичную очередь:</Header>}>*/}
                {/*    <Div>*/}
                {/*        <Search value={search} onChange={onChange} after={null}/>*/}
                {/*    </Div>*/}
                {/*</Group>*/}

                <Group header={<Header mode="secondary">Присоединиться к приватной очереди:</Header>}>
                    <Div className={'EnterDiv'}>
                        <Button size="xl" level="2" onClick={() => setActiveModal(MODAL_CARD_ABOUT)}>
                            Войти с помощью кода
                        </Button>
                        <br/>
                        <Button size="xl" level="2">
                            Войти с помощью QR кода
                        </Button>
                    </Div>
                </Group>
            </Panel>
        );
}

JoinQueue.propTypes = {
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
export default JoinQueue;