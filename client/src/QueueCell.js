import React from 'react';
import PropTypes from 'prop-types';
import { RichCell, Avatar } from "@vkontakte/vkui";
import bridge from "@vkontakte/vk-bridge";

function QueueCell({ info, go}) {


    return(
        <RichCell
            className={'QueueCellStyle'}
            before={<Avatar size={48} src={info.avatar} />}
            text = {info.description}
            caption = {info.date.slice(0, 10).split('-').reverse().join('.')}
            // after="+ 1 500 ₽"
            onClick={ (e) => {
                go(e);
                global.queue.name = info.name;
                global.queue.idQueue = info.id;
                global.queue.avatarQueue = info.avatar;
                global.queue.descriptionQueue = info.description;
                global.queue.dateQueue = info.date;
                global.queue.timeQueue = info.time;
                global.queue.placeQueue = info.place;
                global.queue.codeQueue = info.code;

            }}
            data-to={'aboutQueue'}
        >
            {info.name}
        </RichCell>
    )
}

QueueCell.propTypes = {
    info: PropTypes.object,
}

export default QueueCell;