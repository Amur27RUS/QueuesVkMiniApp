const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 5000;
const path = require("path");
const cors = require('cors');

const rateLimit = require("express-rate-limit");
app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 1 * 1000, // 1 seconds
    max: 3, // limit each IP to 3 requests per windowMs
    message: "Too many  created from this IP",
});

//  apply to all requests
// app.use(limiter);

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

    // const bot = new VkBot('6c7ebd70e77ac095fc2aee45ddb1b06fcadca07a669b8fa1d9c1a789e1bed65d0b6e91772d3e8003534ac');

    // bot.on((ctx) => {
    //     ctx.reply('Привет! К сожалению, меня не научили понимать ваш язык! Зато я могу отправлять тебе уведомления, когда твоя очередь будет подходить :)');
    // });
    // console.log('Бот работает!')
    //
    // bot.startPolling();


//Запуск - nodemon app.js
// let connection = await client.connect()

async function addNotFromVK(newUser, queueCode, url, res){
    try {
        let userID = parseInt(await checkSign(url), 10);

        if(userID.toString() !== 'signERROR') {
            const client = await pool.connect();

            const isAdmin = await client.query('SELECT isadmin AS VALUE FROM queuesandusers WHERE qcode = $1 AND userid = $2', [queueCode, userID]);
            if(isAdmin.rows[0].value) {
                const id = await client.query('SELECT id AS VALUE FROM queuesandusers ORDER BY id');
                const place = await client.query('SELECT userplace AS VALUE FROM queuesandusers WHERE qcode =$1 ORDER BY userplace', [queueCode]);

                await client.query('INSERT INTO queuesAndUsers (id, qcode, userid, userplace, isadmin, notvkname) VALUES ($1, $2, $3, $4, $5, $6)',
                    [id.rows[id.rows.length - 1].value + 1, queueCode, id.rows[id.rows.length - 1].value + 1, place.rows[place.rows.length - 1].value + 1, false, newUser]);

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

        if(userID.toString() !== 'signERROR') {
            const client = await pool.connect();

            const isAdmin = await client.query('SELECT isadmin AS VALUE FROM queuesandusers WHERE qcode = $1 AND userid = $2', [queueCode, userID]);
            if(isAdmin.rows[0].value) {

                for (let i = 0; i < usersArray.length; i++) {
                    await client.query('UPDATE queuesandusers SET isAdmin = $1 WHERE userid = $2 AND qcode = $3', [usersArray[i].isadmin, usersArray[i].userid, queueCode])
                }
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

async function changeUsersOrder(usersArr, queueCode, url, res){
    try{
        let userID = parseInt(await checkSign(url), 10);

        if(userID.toString() !== 'signERROR') {
            const client = await pool.connect()
            const isAdmin = await client.query('SELECT isadmin AS VALUE FROM queuesandusers WHERE qcode = $1 AND userid = $2', [queueCode, userID]);

            if(isAdmin.rows[0].value) {
                for (let i = 0; i < usersArr.length; i++) {
                    await client.query('UPDATE queuesandusers SET userplace = $1 WHERE userid = $2 AND qcode = $3', [i + 1, usersArr[i].userid, queueCode]);
                }

                const result = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                res.send(result.rows);
                //БОТ:
                const queueName = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [queueCode]);
                const resultForBot = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                // bot.sendMessage(resultForBot.rows[0].value, `[${queueName.rows[0].value}] Очередь подошла! Ваша позиция: 1/${resultForBot.rows.length}`);
                // bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`);
            }

            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('})
        }
    }catch(e){
        // console.log(e);
    }
}

async function joinQueue(queueCode, url, res){
    try{
        let userID = parseInt(await checkSign(url), 10);

        if(userID.toString() !== 'signERROR') {
            const client = await pool.connect();
            const results = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1;', [queueCode]);
            if (results.rows[0] === undefined) {
                res.send(JSON.stringify('noQueue')); //todo выводить сообщение на фронте о том, что очереди не существует
                await client.release();
            } else {
                const userInQueue = await client.query('SELECT * FROM queuesandusers WHERE userid= $1 AND qcode= $2;', [userID, queueCode]);

                if (userInQueue.rows[0] === undefined) {
                    const place = await client.query('SELECT userplace AS VALUE FROM queuesandusers WHERE qcode =$1 ORDER BY userplace;', [queueCode]);
                    const id = await client.query('SELECT id AS VALUE FROM queuesandusers ORDER BY id;');
                    await client.query('INSERT INTO QueuesAndUsers VALUES ($1, $2, $3, $4, $5);', [id.rows[id.rows.length - 1].value + 1, queueCode, userID, place.rows[place.rows.length - 1].value + 1, false])
                    await res.send(JSON.stringify('success'));
                    await client.release();

                } else {
                    await res.send(JSON.stringify('alreadyThere'));
                    await client.release();
                }
            }
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

        if(userID.toString() !== 'signERROR') {
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

        if(userID.toString() !== 'signERROR') {
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
        // console.log(e);
    }
}

async function changeQueue(queuePlace, queueDescription, queueAvatarURL, queueName, queueTime, queueDate, code, url, res) {
    try {
        let userID = parseInt(await checkSign(url), 10);


        if(userID.toString() !== 'signERROR') {
            const client = await pool.connect();
            const isAdmin = await client.query('SELECT isadmin AS VALUE FROM queuesandusers WHERE qcode = $1 AND userid = $2', [code, userID]);

            if(isAdmin.rows[0].value) {
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
            res.status(403).send({errorCode: 'sign rejected :('})
        }
    }catch(e){
        // console.log(e);
    }
}

async function deleteUser(queueCode, url, res) {
    try {
        let userID = parseInt(await checkSign(url), 10);

        if(userID.toString() !== 'signERROR') {
            const client = await pool.connect();
                const checkPlace = await client.query('SELECT userplace AS VALUE FROM queuesandusers WHERE userid = $1 AND qcode = $2', [userID, queueCode]);
                await client.query('DELETE FROM queuesandusers WHERE userid = $1 AND qcode = $2', [userID, queueCode]);
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
                    // bot.sendMessage(resultForBot.rows[0].value, `[${queueName.rows[0].value}] Очередь подошла! Ваша позиция: 1/${resultForBot.rows.length}`);
                    // bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`);
                } else if (checkPlace.rows[0].value === 2) {
                    const queueName = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [queueCode]);
                    const resultForBot = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                    // bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`);
                }

            await client.release();
            await res.send(JSON.stringify('ok'));
            // return (placeDeletedUser.rows[0].value)
        }
    }catch(e){
        // console.log(e);
    }
}

async function deleteUserWithAdmin(deletedPlace, queueCode, url, res) {
    try {
        let userID = parseInt(await checkSign(url), 10);

        if(userID.toString() !== 'signERROR') {
            const client = await pool.connect();
            const isAdmin = await client.query('SELECT isadmin AS VALUE FROM queuesandusers WHERE qcode = $1 AND userid = $2', [queueCode, userID]);

            if(isAdmin.rows[0].value) {
                const deletedUser = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode])
                await client.query('DELETE FROM queuesandusers WHERE userid = $1 AND qcode = $2', [deletedUser.rows[deletedPlace].value, queueCode]);
                const data = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                await res.send(data.rows);

                if (deletedPlace === 0) {
                    const queueName = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [queueCode]);
                    const resultForBot = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                    // bot.sendMessage(resultForBot.rows[0].value, `[${queueName.rows[0].value}] Очередь подошла! Ваша позиция: 1/${resultForBot.rows.length}`);
                    // bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`);
                } else if (deletedPlace === 1) {
                    const queueName = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [queueCode]);
                    const resultForBot = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
                    // bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`);
                }
            }
            await client.release();
        }else{
            res.status(403).send({errorCode: 'sign rejected :('});
        }
    }catch(e){
        // console.log(e);
    }
}

async function getPeople(queueCode, url, res){
    try {
        let userID = parseInt(await checkSign(url), 10);

        if(userID.toString() !== 'signERROR') {
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

        if(userID.toString() !== 'signERROR') {
            const client = await pool.connect();
            const lenghtQueue = await client.query('SELECT userplace FROM queuesandusers WHERE qcode = $1', [queueCode])
            await client.query('UPDATE queuesandusers SET userplace = $1 WHERE qcode = $2 AND userplace = 1', [lenghtQueue.rows.length, queueCode])
            const data = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
            await res.send(data.rows);

            const queueName = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1', [queueCode]);
            const resultForBot = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
            // bot.sendMessage(resultForBot.rows[0].value, `[${queueName.rows[0].value}] Очередь подошла! Ваша позиция: 1/${resultForBot.rows.length}`);
            // bot.sendMessage(resultForBot.rows[1].value, `[${queueName.rows[0].value}] Приготовьтесь! Ваша позиция: 2/${resultForBot.rows.length}`);

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

        if(userID.toString() !== 'signERROR') {
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

        if(userID.toString() !== 'signERROR') {
            const client = await pool.connect();
            const place = await client.query('SELECT userplace AS VALUE FROM queuesandusers WHERE userid = $1 AND qcode = $2', [userID, queueCode]);
            await client.query('UPDATE queuesandusers SET userplace = $1 WHERE userplace = $2 AND qcode = $3', [place.rows[0].value, place.rows[0].value++, queueCode])
            await client.query('UPDATE queuesandusers SET userplace = $1 WHERE userid = $2 AND qcode = $3', [place.rows[0].value++, userID, queueCode])
            await client.release();
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
        return 'signERROR'
    }
}

async function checkCreation(url, res){
    try {
        let userID = parseInt(await checkSign(url), 10);
        if(userID.toString() !== 'signERROR') {
            const client = await pool.connect();

            let now = new Date().toLocaleDateString();
            const floodCheck = await client.query('SELECT * FROM queuesandusers WHERE userid = $1 AND createdate = $2', [userID, now])

            if (floodCheck.rows.length >= 5) {
                await res.send(JSON.stringify('LIMIT REACHED'));
            }else{
                await res.send(JSON.stringify('ok'));
            }
        }

    }catch (e){
        console.log(e);
    }
}



/*---------------------------------------------------------------------*/
/*--------------------ЗАПРОСЫ------------------------------------------*/
/*---------------------------------------------------------------------*/

app.post('/addNotFromVK', limiter, (req, res) => {
    const newUser = req.body.newUser;
    const queueCode = req.body.queueCODE;
    const url = req.body.url;

    addNotFromVK(newUser, queueCode, url, res);
});

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

    if(queueName.length > 33 || queueName.trim() === '' || queuePlace.length > 41 || queueDescription.length > 41){
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
    const code = req.body.queueCode
    const url = req.body.url;

    if(queueName.length > 33 || queueName.trim() === '' || queuePlace.length > 41 || queueDescription.length > 41){
        res.status(403).send({errorCode: 'max length reached'})
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