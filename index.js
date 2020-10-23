const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 5000;
const path = require("path");
const cors = require('cors');
const fetch = require("node-fetch");

const rateLimit = require("express-rate-limit");
app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 1 * 1000, // 1 seconds
    max: 3, // limit each IP to 3 requests per windowMs
    message: "Too many  created from this IP",
});

// const bot = new VkBot({
//     token: '2eb106ece7d56ca4b33b2cc72e25900000000000000000b314c942ba1311e27242e2e05186ab73bf6385b',
//     confirmation: '7268987f'
// })


// const api = require('node-vk-bot-api/lib/api');
// api('users.get', {
//     user_ids: 1,
//     access_token: '2eb106ece7d56ca4b33b2cc72e25900000000000000000b314c942ba1311e27242e2e05186ab73bf6385b',
// }).then(r => r);

app.use(cors());
app.use(express.static(path.join(__dirname, "client/build")));

if (process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "client/build")));
}

const {Pool} = require('pg');
require("dotenv").config();

const devConfig = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;

const proConfig = process.env.DATABASE_URL;  //heroku database


const pool = new Pool({
    connectionString:
        process.env.NODE_ENV === "production" ? proConfig : devConfig,
    // ssl: {
    //     rejectUnauthorized: false
    // }
    // sslmode: require
});
app.use(bodyParser.json())
app.use( express.json() );       // to support JSON-encoded bodies
app.use(express.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

//todo БОТ====================================================================
    const VkBot = require('node-vk-bot-api');

    const bot = new VkBot('6c7ebd70e77ac095fc2aee45ddb1b06fcadca07a669b8fa1d9c1a789e1bed65d0b6e91772d3e8003534ac');

    console.log('Бот работает!')

    bot.startPolling();



//Запуск - nodemon app.js
// let connection = await client.connect()

async function getUsersInfo(usersArr, url, res){
    let userIdsString = '';
    let userID = parseInt(await checkSign(url), 10);
    if(userID !== 3) {
        if(usersArr.length === 1){
            userIdsString = usersArr[0].userid;
        }else{
            for(let i = 0; i<usersArr.length; i++) {
                if (i !== usersArr.length - 1) {
                    userIdsString += usersArr[i].userid + ', ';
                } else {
                    userIdsString += usersArr[i].userid;

                }
            }
        }

        let result = await fetch('https://api.vk.com/method/users.get?user_ids=' +userIdsString + '&fields=photo_100&access_token=6c7ebd70e77ac095fc2aee45ddb1b06fcadca07a669b8fa1d9c1a789e1bed65d0b6e91772d3e8003534ac&v=5.124' , {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(function (response){
            return response.json();
        });

        await res.send(JSON.stringify(result));
    }else{
        res.status(403).send({errorCode: 'sign rejected :('})
    }
}

async function addNotFromVK(newUser, queueCode, url, res){
    try {
        let userID = parseInt(await checkSign(url), 10);

        if(userID !== 3) {
            const client = await pool.connect();

            const isAdmin = await client.query('SELECT isadmin AS VALUE FROM queuesandusers WHERE qcode = $1 AND userid = $2', [queueCode, userID]);
            if(isAdmin.rows[0].value) {
                const id = await client.query('SELECT id AS VALUE FROM queuesandusers ORDER BY id');
                const place = await client.query('SELECT userplace AS VALUE FROM queuesandusers WHERE qcode =$1 ORDER BY userplace', [queueCode]);

                await client.query('INSERT INTO queuesAndUsers (id, qcode, userid, userplace, isadmin, notvkname, notifications) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [id.rows[id.rows.length - 1].value + 1, queueCode, id.rows[id.rows.length - 1].value + 1, place.rows[place.rows.length - 1].value + 1, false, newUser, false]);

                const result = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                res.send(result.rows);
            }

            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('})
        }
    }catch(e){
        console.log(e);

    }
}

async function addNewAdmins(usersArray, queueCode, url, res){
    try {
        let userID = parseInt(await checkSign(url), 10);

        if(userID !== 3) {
            const client = await pool.connect();

            const isAdmin = await client.query('SELECT isadmin AS VALUE FROM queuesandusers WHERE qcode = $1 AND userid = $2', [queueCode, userID]);
            if(isAdmin.rows[0].value) {

                for (let i = 0; i < usersArray.length; i++) {
                    await client.query('UPDATE queuesandusers SET isAdmin = $1 WHERE userid = $2 AND qcode = $3 AND isAdmin = false', [usersArray[i].isadmin, usersArray[i].userid, queueCode])

                }
                const result = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                res.send(result.rows);
            }
            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('});
        }

    }catch(e){
        res.status(403).send({errorCode: 'error :('});
        console.log(e);
    }
}

async function changeUsersOrder(usersArr, queueCode, url, res){
    try{
        let userID = parseInt(await checkSign(url), 10);

        if(userID !== 3) {
            const client = await pool.connect()
            const isAdmin = await client.query('SELECT isadmin AS VALUE FROM queuesandusers WHERE qcode = $1 AND userid = $2', [queueCode, userID]);

            if(isAdmin.rows[0].value) {
                let user1 = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 AND userplace = 1', [queueCode]);
                let user2 = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 AND userplace = 2', [queueCode]);
                for (let i = 0; i < usersArr.length; i++) {
                    await client.query('UPDATE queuesandusers SET userplace = $1 WHERE userid = $2 AND qcode = $3', [i + 1, usersArr[i].userid, queueCode]);
                }

                const result = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                res.send(result.rows);
                //БОТ:
                if(usersArr[0].userid !== user1.rows[0].value) {
                    const queueName = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [queueCode]);
                    const resultForBot = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                    const canSend1 = await client.query('SELECT notifications AS VALUE FROM queuesandusers WHERE userid = $1', [resultForBot.rows[0].value]);
                    const canSend2 = await client.query('SELECT notifications AS VALUE FROM queuesandusers WHERE userid = $1', [resultForBot.rows[1].value]);
                    if(canSend1.rows[0].value !== false) {
                        bot.sendMessage(resultForBot.rows[0].value, `[${queueName.rows[0].value}] Очередь подошла! Ваша позиция: 1/${resultForBot.rows.length}`).catch((e) => {
                            console.log(e)
                        });
                    }
                    if (canSend2.rows[0].value !== false) {
                        bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`).catch((e) => {
                            console.log(e)
                        });
                    }
                }else if(usersArr[1].userid !== user2.rows[0].value){
                    const queueName = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [queueCode]);
                    const resultForBot = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                    const canSend2 = await client.query('SELECT notifications AS VALUE FROM queuesandusers WHERE userid = $1', [resultForBot.rows[1].value]);

                    if(canSend2.rows[0].value !== false) {
                        bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`).catch((e) => {
                            console.log(e)
                        });
                    }
                }
            }

            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('})
        }
    }catch(e){
        res.status(403).send({errorCode: 'error :('});
        console.log(e);
    }
}

async function joinQueue(queueCode, url, res){
    try{
        let userID = parseInt(await checkSign(url), 10);

        if(userID !== 3) {
            const client = await pool.connect();
            const results = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1;', [queueCode]);
            if (results.rows[0] === undefined) {
                res.send(JSON.stringify('noQueue')); //todo выводить сообщение на фронте о том, что очереди не существует
            } else {
                const userInQueue = await client.query('SELECT * FROM queuesandusers WHERE userid= $1 AND qcode= $2;', [userID, queueCode]);

                if (userInQueue.rows[0] === undefined) {
                    const place = await client.query('SELECT userplace AS VALUE FROM queuesandusers WHERE qcode =$1 ORDER BY userplace;', [queueCode]);
                    const id = await client.query('SELECT id AS VALUE FROM queuesandusers ORDER BY id;');
                    await client.query('INSERT INTO QueuesAndUsers VALUES ($1, $2, $3, $4, $5);', [id.rows[id.rows.length - 1].value + 1, queueCode, userID, place.rows[place.rows.length - 1].value + 1, false])
                    await res.send(JSON.stringify('success'));

                } else {
                    await res.send(JSON.stringify('alreadyThere'));
                }
            }

            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('})
        }
    }catch (e){
        console.log(e);
    }
}

async function getQueues(url, res){
    try{
        let userID = parseInt(await checkSign(url), 10);

        if(userID !== 3) {
            const client = await pool.connect();
            const results = await client.query('SELECT qCode AS VALUE FROM QueuesAndUsers WHERE userID = $1;', [userID]);
            if (results.rows[0] !== undefined) {
                let str = 'SELECT * FROM queues WHERE'

                for (let i = 0; i < results.rows.length; i++) {

                    if (i !== results.rows.length - 1) {
                        str += ' code=\'' + results.rows[i].value + '\' OR';
                    } else {
                        str += ' code=\'' + results.rows[i].value + '\'';
                    }
                }

                const result = await client.query(str);
                await res.send(result.rows);
            } else {
                await res.send(JSON.stringify([]));
            }
            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('});
        }
    }catch (e){
        console.log(e);
    }
}

async function createQueue(queuePlace, queueDescription, queueAvatarURL, queueName, queueTime, queueDate, code, url, res) {
    try {
        let userID = parseInt(await checkSign(url), 10);

        if(userID !== 3) {
            const client = await pool.connect();
            let codesBD = await client.query('SELECT * FROM queues WHERE code = $1', [code]);
            while (codesBD.rows.length !== 0) {
                code = generateCode();
                codesBD = await client.query('SELECT * FROM queues WHERE code = $1', [code]);
            }
            let now = new Date().toLocaleDateString();

            const floodCheck = await client.query('SELECT * FROM queuesandusers WHERE userid = $1 AND createdate = $2', [userID, now])

            if (floodCheck.rows.length >= 5) {
                await res.send(JSON.stringify('LIMIT REACHED'));
            } else {
                if (queueAvatarURL !== undefined) {
                    await client.query('INSERT INTO queues (code, place, description, avatar, name, time, date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                        [code, queuePlace, queueDescription, queueAvatarURL, queueName, queueTime, queueDate]);
                } else {
                    await client.query('INSERT INTO queues (code, place, description, name, time, date) VALUES ($1, $2, $3, $4, $5, $6)',
                        [code, queuePlace, queueDescription, queueName, queueTime, queueDate]);
                }
                const id = await client.query('SELECT id AS VALUE FROM queuesandusers ORDER BY id');
                await client.query('INSERT INTO queuesAndUsers (id, qcode, userid, userplace, isadmin, createdate) VALUES ($1, $2, $3, $4, $5, $6)',
                    [id.rows[id.rows.length - 1].value + 1, code, userID, 1, true, now]);
                await res.send(JSON.stringify(code));
            }
            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('})
        }
    }catch (e){
        console.log(e);
    }
}

async function changeQueue(queuePlace, queueDescription, queueAvatarURL, queueName, queueTime, queueDate, code, url, res) {
    try {
        let userID = parseInt(await checkSign(url), 10);


        if(userID !== 3) {
            const client = await pool.connect();
            const isQueueExist = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [code]);

            if(isQueueExist.rows[0] !== undefined) {
                const isAdmin = await client.query('SELECT isadmin AS VALUE FROM queuesandusers WHERE qcode = $1 AND userid = $2', [code, userID]);

                if (isAdmin.rows[0].value) {
                    if (queueAvatarURL === undefined) {
                        await client.query('UPDATE queues SET place = $1, description = $2, name = $3, time = $4, date = $5 WHERE code = $6;',
                            [queuePlace, queueDescription, queueName, queueTime, queueDate, code]);
                    } else {
                        await client.query('UPDATE queues SET place = $1, description = $2, avatar = $3, name = $4, time = $5, date = $6 WHERE code = $7;',
                            [queuePlace, queueDescription, queueAvatarURL, queueName, queueTime, queueDate, code]);
                    }
                    await res.send(JSON.stringify(code));
                }
                await client.release();
            }else{
                res.send(JSON.stringify('Deleted queue'));
            }
        }else{
            res.status(403).send({errorCode: 'sign rejected :('})
        }
    }catch(e){
        console.log(e);
    }
}

async function deleteUser(queueCode, url, res) {
    try {
        let userID = parseInt(await checkSign(url), 10);

        if(userID !== 3) {
            const client = await pool.connect();
                const allUsers = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                const checkPlace = await client.query('SELECT userplace AS VALUE FROM queuesandusers WHERE userid = $1 AND qcode = $2', [userID, queueCode]);
                await client.query('DELETE FROM queuesandusers WHERE userid = $1 AND qcode = $2', [userID, queueCode]);
                for(let i = checkPlace.rows[0].value; i < allUsers.rows.length; i++){
                    await client.query('UPDATE queuesandusers SET userplace = $1 WHERE qcode = $2 AND userplace = $3', [i, queueCode, i+1]);
                }

                const check = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 AND notvkname IS NULL', [queueCode]);
                if (check.rows[0] === undefined) {
                    await client.query('DELETE FROM queues WHERE code = $1', [queueCode]);
                    await client.query('DELETE FROM queuesandusers WHERE notvkname IS NOT NULL AND qcode = $1', [queueCode]);
                }
                const peopleCheck = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 AND notvkname IS NULL', [queueCode]);
                // todo Доработать условия
                if (checkPlace.rows[0].value === 1 && peopleCheck.rows.length >= 1) {
                    const queueName = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [queueCode]);
                    const resultForBot = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                    const canSend1 = await client.query('SELECT notifications AS VALUE FROM queuesandusers WHERE userid = $1', [resultForBot.rows[0].value]);
                    const canSend2 = await client.query('SELECT notifications AS VALUE FROM queuesandusers WHERE userid = $1', [resultForBot.rows[1].value]);
                    if(canSend1.rows[0].value !== false) {
                        bot.sendMessage(resultForBot.rows[0].value, `[${queueName.rows[0].value}] Очередь подошла! Ваша позиция: 1/${resultForBot.rows.length}`).catch((e) => {
                            console.log(e)
                        });
                    }
                    if(canSend2.rows[0].value !== false) {
                        bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`).catch((e) => {
                            console.log(e)
                        });
                    }
                } else if (checkPlace.rows[0].value === 2) {
                    const queueName = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [queueCode]);
                    const resultForBot = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                    const canSend2 = await client.query('SELECT notifications AS VALUE FROM queuesandusers WHERE userid = $1', [resultForBot.rows[1].value]);
                    if(canSend2 !== false) {
                        bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`).catch((e) => {
                            console.log(e)
                        });
                    }
                }

            await client.release();
            await res.send(JSON.stringify('ok'));
            // return (placeDeletedUser.rows[0].value)
        }else{
            res.status(403).send({errorCode: 'sign rejected :('})
        }
    }catch(e){
        console.log(e);
    }
}

async function deleteUserWithAdmin(deletedPlace, queueCode, url, res) {
    try {
        let userID = parseInt(await checkSign(url), 10);

        if(userID !== 3) {
            const client = await pool.connect();
            const isAdmin = await client.query('SELECT isadmin AS VALUE FROM queuesandusers WHERE qcode = $1 AND userid = $2', [queueCode, userID]);

            if(isAdmin.rows[0].value) {
                const allUsers = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                if (deletedPlace < 0 || deletedPlace > allUsers.rows.length) {
                    res.status(403).send({errorCode: 'bad request'});
                } else {

                    await client.query('DELETE FROM queuesandusers WHERE userid = $1 AND qcode = $2', [allUsers.rows[deletedPlace].value, queueCode]);
                    for (let i = deletedPlace + 1; i < allUsers.rows.length; i++) {
                        await client.query('UPDATE queuesandusers SET userplace = $1 WHERE qcode = $2 AND userplace = $3', [i, queueCode, i + 1]);
                    }
                    const data = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                    await res.send(data.rows);

                    if (deletedPlace === 0) {
                        const queueName = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [queueCode]);
                        const resultForBot = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                        const canSend1 = await client.query('SELECT notifications AS VALUE FROM queuesandusers WHERE userid = $1', [resultForBot.rows[0].value]);
                        const canSend2 = await client.query('SELECT notifications AS VALUE FROM queuesandusers WHERE userid = $1', [resultForBot.rows[1].value]);
                        if(canSend1.rows[0].value !== false) {
                            bot.sendMessage(resultForBot.rows[0].value, `[${queueName.rows[0].value}] Очередь подошла! Ваша позиция: 1/${resultForBot.rows.length}`).catch((e) => {
                                console.log(e)
                            });
                        }
                        if(canSend2.rows[0].value !== false) {
                            bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`).catch((e) => {
                                console.log(e)
                            });
                        }
                    } else if (deletedPlace === 1) {
                        const queueName = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [queueCode]);
                        const resultForBot = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                        const canSend2 = await client.query('SELECT notifications AS VALUE FROM queuesandusers WHERE userid = $1', [resultForBot.rows[1].value]);
                        if(canSend2 !== false) {
                            bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`).catch((e) => {
                                console.log(e)
                            });
                        }
                    }
                }
            }
            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('});
        }
    }catch(e){
        res.status(403).send({errorCode: 'error :('});
        console.log(e);
    }
}

async function getPeople(queueCode, url, res){
    try {
        let userID = parseInt(await checkSign(url), 10);

        if(userID !== 3) {
            const client = await pool.connect();
            const result = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
            res.send(result.rows);
            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('});
        }
    }catch(e){
        console.log(e);
    }
}

async function firstToLast(queueCode, url, res) {
    try{
        let userID = parseInt(await checkSign(url), 10);

        if(userID !== 3) {
            const client = await pool.connect();

            const queueLength = await client.query('SELECT userplace FROM queuesandusers WHERE qcode = $1', [queueCode]);
            await client.query('UPDATE queuesandusers SET userplace = $1 WHERE qcode = $2 AND userplace = 1', [queueLength.rows.length+1, queueCode]);

            for(let i = 2; i < queueLength.rows.length+2; i++){
                await client.query('UPDATE queuesandusers SET userplace = $1 WHERE qcode = $2 AND userplace = $3', [i-1, queueCode, i]);
            }

            const data = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
            await res.send(data.rows);

            const queueName = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [queueCode]);
            const resultForBot = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
            const canSend1 = await client.query('SELECT notifications AS VALUE FROM queuesandusers WHERE userid = $1', [resultForBot.rows[0].value]);
            const canSend2 = await client.query('SELECT notifications AS VALUE FROM queuesandusers WHERE userid = $1', [resultForBot.rows[1].value]);
            if(canSend1.rows[0].value !== false) {
                bot.sendMessage(resultForBot.rows[0].value, `[${queueName.rows[0].value}] Очередь подошла! Ваша позиция: 1/${resultForBot.rows.length}`).catch((e) => {
                    console.log(e)
                });
            }
            if(canSend2.rows[0].value !== false) {
                bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`).catch((e) => {
                    console.log(e)
                });
            }

            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('});
        }
    }catch(e){
        console.log(e);
    }
}

async function getQueueToJoin(queueCode, url, res){
    try{
        let userID = parseInt(await checkSign(url), 10);

        if(userID !== 3) {
            const client = await pool.connect();

            const results = await client.query('SELECT * FROM queues WHERE code = $1', [queueCode]);
            if (results.rows[0] !== undefined) {
                const result = await client.query('SELECT * FROM queuesandusers WHERE qcode = $1 AND userid = $2', [queueCode, userID])
                if (result.rows[0] === undefined) {
                    await res.send(results.rows[0]);
                } else {
                    await res.send(JSON.stringify('alreadyThere'));
                }

            } else {
                await res.send(JSON.stringify('noQueue'));
            }

            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('});
        }
    }catch (e){
        console.log(e);
    }
}

async function skipCommand(queueCode, url, res){
    try{
        let userID = parseInt(await checkSign(url), 10);

        if(userID !== 3) {
            const client = await pool.connect();
            const place = await client.query('SELECT userplace AS VALUE FROM queuesandusers WHERE userid = $1 AND qcode = $2', [userID, queueCode]);
            // console.log(place.rows[0].value);
            const nextUser = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE userplace = $1 AND qcode = $2', [place.rows[0].value+1, queueCode]);
            await client.query('UPDATE queuesandusers SET userplace = $1 WHERE userid = $2 AND qcode = $3', [place.rows[0].value, nextUser.rows[0].value, queueCode])
            await client.query('UPDATE queuesandusers SET userplace = $1 WHERE userid = $2 AND qcode = $3', [place.rows[0].value+1, userID, queueCode])
            await client.release();
            await res.send(JSON.stringify('Done!'));
        }else{
            res.status(403).send({errorCode: 'sign rejected :('});
        }

    }catch (e){
        console.log(e);
    }

}

// Генерация кода
function generateCode() {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return(code)
}

const qs = require('querystring');
const crypto = require('crypto');
async function checkSign(url){
    const urlParams = qs.parse(url);
    const ordered = {};
    Object.keys(urlParams).sort().forEach((key) => {
       if(key.slice(0, 3) === 'vk_'){
           ordered[key] = urlParams[key];
       }
    });
    const stringParams = qs.stringify(ordered);
    const paramsHash = crypto
        .createHmac('sha256', 'BwCbyUaL4oTdKzuNXYIy')
        .update(stringParams)
        .digest()
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=$/, '');
    if(paramsHash === urlParams.sign){
        return urlParams.vk_user_id;
    }else{
        return 3;
    }
}

async function checkCreation(url, res){
    try {
        let userID = parseInt(await checkSign(url), 10);
        if(userID !== 3) {
            const client = await pool.connect();

            let now = new Date().toLocaleDateString();
            const floodCheck = await client.query('SELECT * FROM queuesandusers WHERE userid = $1 AND createdate = $2', [userID, now])

            if (floodCheck.rows.length >= 5) {
                await res.send(JSON.stringify('LIMIT REACHED'));
            }else{
                await res.send(JSON.stringify('ok'));
            }
            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('});
        }

    }catch (e){
        console.log(e);
    }
}

async function notificationsCheck(url, res){

    let userID = parseInt(await checkSign(url), 10);

    if(userID !== 3){
        let result = await fetch('https://api.vk.com/method/messages.isMessagesFromGroupAllowed?user_id='+ userID +'&group_id=198211683&access_token=6c7ebd70e77ac095fc2aee45ddb1b06fcadca07a669b8fa1d9c1a789e1bed65d0b6e91772d3e8003534ac&v=5.124' , {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(function (response){
            return response.json();
        });
        await res.send(result);
    }else{
        res.status(403).send({errorCode: 'sign rejected :('});
    }
}

async function turnNotificationsOn(url, res){
    let userID = parseInt(await checkSign(url), 10);

    if(userID !== 3){
        const client = await pool.connect();

        let queues = await client.query('SELECT qcode AS VALUE FROM queuesandusers WHERE userid = $1', [userID]);
        if(queues.rows !== undefined) {
            client.query('UPDATE queuesandusers SET notifications = true WHERE userid = $1', [userID]);
        }
        await res.send(JSON.stringify('Done!'));
        await client.release();
    }else{
        res.status(403).send({errorCode: 'sign rejected :('});
    }
}

async function turnNotificationsOff(url, res){
    let userID = parseInt(await checkSign(url), 10);

    if(userID !== 3){
        const client = await pool.connect();

        let queues = await client.query('SELECT qcode AS VALUE FROM queuesandusers WHERE userid = $1', [userID]);
        if(queues.rows !== undefined) {
            client.query('UPDATE queuesandusers SET notifications = false WHERE userid = $1', [userID]);
        }
        await res.send(JSON.stringify('Done!'));
        await client.release();
    }else{
        res.status(403).send({errorCode: 'sign rejected :('});
    }
}

async function checkNotificationsInDatabase(url, res){
    let userID = parseInt(await checkSign(url), 10);
    if(userID !== 3){
        const client = await pool.connect();
        let queues = await client.query('SELECT notifications AS VALUE FROM queuesandusers WHERE userid = $1', [userID]);
        if(queues.rows !== undefined){
            if(queues.rows[0].value === true) {
                await res.send(JSON.stringify('On'));
            }else if (queues.rows[0].value === false){
                await res.send(JSON.stringify('Off'));
            }else if(queues.rows[0].value === null){
                await res.send(JSON.stringify('Null'));
            }
        }else{
            await res.send(JSON.stringify('no data'));
        }
        await client.release();
    }else{
        res.status(403).send({errorCode: 'sign rejected :('});
    }
}



/*---------------------------------------------------------------------*/
/*--------------------ЗАПРОСЫ------------------------------------------*/
/*---------------------------------------------------------------------*/

app.post('/addNotFromVK', limiter, (req, res) => {
    const newUser = req.body.newUser;
    const queueCode = req.body.queueCODE;
    const url = req.body.url;

    if(newUser.length > 25 || newUser.trim() === ''){
        res.status(403).send({errorCode: 'error'});
    }else {
        addNotFromVK(newUser, queueCode, url, res);
    }
});

app.post('/checkNotificationsInDatabase', limiter, (req, res) =>{
    const url = req.body.url;

    checkNotificationsInDatabase(url, res);
})

app.post('/turnNotificationsOff', limiter, (req, res) =>{
    const url = req.body.url;

    turnNotificationsOff(url, res);
})

app.post('/turnNotificationsOn',limiter, (req, res) =>{
    const url = req.body.url;

    turnNotificationsOn(url, res);
});

app.post('/getUsersInfo', limiter, (req, res) =>{
    const url = req.body.url;
    const usersArr = req.body.usersArr;

    if(usersArr.length === 0){
        res.status(403).send({errorCode: 'error'});
    }else{
        getUsersInfo(usersArr, url, res);
    }
})

app.post('/notificationsCheck', limiter, (req, res) =>{
    const url = req.body.url;

    notificationsCheck(url, res);
})

app.post('/checkSign', limiter, (req, res) => {
    const url = req.body.url;

    checkSign(url);
});

app.post('/addNewAdmins', limiter, (req, res) => {
    const usersArray = req.body.usersArray;
    const queueCode = req.body.queueCODE;
    const url = req.body.url;

    addNewAdmins(usersArray, queueCode, url, res);
});

app.post('/getQueueToJoin', limiter, (req, res) => {
    const queueCode = req.body.queueCODE;
    const url = req.body.url;

    getQueueToJoin(queueCode, url, res);
});

app.post('/changeUsersOrder', limiter, (req, res) => {
    const usersArray = req.body.usersArray;
    const queueCode = req.body.queueCODE;
    const url = req.body.url;

    changeUsersOrder(usersArray, queueCode, url, res);
});

app.post('/skipPosition', limiter, (req, res) => {
    const url = req.body.url;
    const queueCode = req.body.queueCODE;

    skipCommand(queueCode, url, res);
});

app.post('/getPeople', limiter, (req, res) => {
    const queueCode = req.body.queueCODE;
    const url = req.body.url;

    getPeople(queueCode, url, res);
});

app.post('/joinQueue', limiter, (req, res) => {
    const queueCode = req.body.serverCode;
    const url = req.body.url;

    joinQueue(queueCode, url, res);
});

app.post('/getQueues', limiter, (req, res) => {
    const url = req.body.url;

    getQueues(url, res);
});

app.post('/checkCreation', limiter, (req, res) => {
    const url = req.body.url;

    checkCreation(url, res);
})

app.post('/createQueue',limiter, (req, res) => {
    const queueName = req.body.queueName;
    const queuePlace = req.body.queuePlace;
    const queueTime = req.body.queueTime;
    const queueDate = req.body.queueDate;
    const queueAvatarURL = req.body.queueAvatarURL;
    const queueDescription = req.body.queueDescription;
    const url = req.body.url;
    let date = new Date(queueDate);
    let today = new Date();
    let isTime = true;
    if(queueTime !== '') {
        let timeArr = queueTime.split(':');
        if (timeArr.length !== 2) {
            isTime = false;
        } else {
            if (isNaN(Number(timeArr[0])) || isNaN(Number(timeArr[1]))) {
                isTime = false;
            }
        }
    }

    if(queueName.length > 33 || queueName.trim() === '' || queuePlace.length > 41 || queueDescription.length > 41
        || date.getTime()+86000000 < today.getTime() || isNaN(date.getTime()) || !isTime){
        res.status(403).send({errorCode: 'error'})
    }else {
        let code = generateCode()
        createQueue(queuePlace, queueDescription, queueAvatarURL, queueName, queueTime, queueDate, code, url, res);
    }
});

app.post('/changeQueue',limiter, (req, res) => {
    const queueName = req.body.queueName;
    const queuePlace = req.body.queuePlace;
    const queueTime = req.body.queueTime;
    const queueDate = req.body.queueDate;
    const queueAvatarURL = req.body.queueAvatarURL;
    const queueDescription = req.body.queueDescription;
    const code = req.body.queueCode;
    const url = req.body.url;

    let date = new Date(queueDate);
    let today = new Date();
    let isTime = true;
    if(queueTime !== '') {
        let timeArr = queueTime.split(':');
        if (timeArr.length !== 2) {
            isTime = false;
        } else {
            if (isNaN(Number(timeArr[0])) || isNaN(Number(timeArr[1]))) {
                isTime = false;
            }
        }
    }

    if(queueName.length > 33 || code.length < 6 || queueName.trim() === '' || queuePlace.length > 41 ||
        queueDescription.length > 41 || date.getTime()+86000000 < today.getTime() || isNaN(date.getTime()) || !isTime){
        res.status(403).send({errorCode: 'Do not modify data!'})
    }else {
        changeQueue(queuePlace, queueDescription, queueAvatarURL, queueName, queueTime, queueDate, code, url, res);
    }
});

app.post('/exitQueue',limiter, (req, res) => {
    const queueCode = req.body.queueCODE;
    const url = req.body.url;

    deleteUser(queueCode, url, res);
    // sortLast(placeDeletedUser, userID, queueCode);
});

app.post('/deleteUser',limiter, (req, res) => {
    const deletedPlace = req.body.deletedPlace;
    const queueCode = req.body.queueCODE;
    const url = req.body.url;

    deleteUserWithAdmin(deletedPlace, queueCode, url, res)
});

app.post('/firstToLast',limiter, (req, res) => {
    const queueCode = req.body.queueCODE;
    const url = req.body.url;

    firstToLast(queueCode, url, res);
});

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
});