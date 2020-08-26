const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 5000;
const path = require("path");
const cors = require('cors');
const { Botact } = require('botact');
const bot = new Botact({
    token: '2eb106ece7d56ca4b33b2cc72e25900000000000000000b314c942ba1311e27242e2e05186ab73bf6385b',
    confirmation: 'e90cd682'
})

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

app.use( express.json() );       // to support JSON-encoded bodies
app.use(express.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

//БОТ
try {

    bot.on(({ reply }) => {
        reply('Привет! К сожалению, меня не научили понимать человеческий язык :( Но я могу отправлять тебе сообщения, когда твоя очередь подойдёт! <3')
    })


app.post('/bot', bot.listen);

}catch (e){
    console.log(e);
}

//БОТ

//Запуск - nodemon app.js
// let connection = await client.connect()

async function addNotFromVK(newUser, queueCode, res){
    try {
        const client = await pool.connect();
        const id = await client.query('SELECT id AS VALUE FROM queuesandusers ORDER BY id');
        const place = await client.query('SELECT userplace AS VALUE FROM queuesandusers WHERE qcode =$1 ORDER BY userplace', [queueCode]);

        await client.query('INSERT INTO queuesAndUsers (id, qcode, userid, userplace, isadmin, notvkname) VALUES ($1, $2, $3, $4, $5, $6)',
            [id.rows[id.rows.length - 1].value + 1, queueCode, id.rows[id.rows.length - 1].value + 1, place.rows[place.rows.length - 1].value + 1, false, newUser]);

        const result = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
        res.send(result.rows);

        await client.release();
    }catch(e){
        console.log(e);
    }
}

async function addNewAdmins(usersArray, queueCode, res){
    try {
        const client = await pool.connect();
        for (let i = 0; i < usersArray.length; i++) {
            await client.query('UPDATE queuesandusers SET isAdmin = $1 WHERE userid = $2 AND qcode = $3', [usersArray[i].isadmin, usersArray[i].userid, queueCode])
        }
        const result = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
        res.send(result.rows);
        await client.release();
    }catch(e){
        console.log(e);
    }

}

async function changeUsersOrder(usersArr, queueCode, res){
    try{
        const client = await pool.connect();
        for(let i = 0; i< usersArr.length; i++){
            await client.query('UPDATE queuesandusers SET userplace = $1 WHERE userid = $2 AND qcode = $3', [i+1, usersArr[i].userid, queueCode]);
        }

        const result = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
        res.send(result.rows);
        await client.release();
    }catch(e){
        console.log(e);
    }
}

async function joinQueue(userID, queueCode,res){
    try{
        const client = await pool.connect();
        const results = await client.query('SELECT name AS VALUE FROM queues WHERE code = $1;', [queueCode]);
        if (results.rows[0] === undefined){
            console.log('Очереди не существует!')
            res.send(JSON.stringify('noQueue')); //todo выводить сообщение на фронте о том, что очереди не существует
            await client.release();
        }else{
            console.log('Подключаю вас к очереди...');
            const userInQueue = await client.query('SELECT * FROM queuesandusers WHERE userid= $1 AND qcode= $2;', [userID, queueCode]);

            if(userInQueue.rows[0] === undefined){
                const place = await client.query('SELECT userplace AS VALUE FROM queuesandusers WHERE qcode =$1 ORDER BY userplace;', [queueCode]);
                const id = await client.query('SELECT id AS VALUE FROM queuesandusers ORDER BY id;');
                console.log(queueCode)
                await client.query('INSERT INTO QueuesAndUsers VALUES ($1, $2, $3, $4, $5);', [id.rows[id.rows.length-1].value+1 ,queueCode, userID, place.rows[place.rows.length-1].value + 1, false])
                console.log('Успешно подключены к очереди!')
                await res.send(JSON.stringify('success'));
                await client.release();

            }else{
                console.log('Вы уже состоите в этой очереди!')
                await res.send(JSON.stringify('alreadyThere'));
                await client.release();
            }
        }
    }catch (e){
        console.log(e);
    }
}

async function getQueues(userID, res){
    try{
        const client = await pool.connect();
        const results = await client.query('SELECT qCode AS VALUE FROM QueuesAndUsers WHERE userID = $1;', [userID]);
        if(results.rows[0] !== undefined) {
            let str = 'SELECT * FROM queues WHERE'

            for (let i = 0; i < results.rows.length; i++) {

                if(i !== results.rows.length - 1){
                    str += ' code=\'' + results.rows[i].value +'\' OR';
                }else{
                    str += ' code=\'' + results.rows[i].value +'\'';
                }
            }

            const result = await client.query(str);
            console.log(`[/getQueues] Отправляю список очередей для id: ${userID}`);
            await res.send(result.rows);
        }else{
            await res.send(JSON.stringify([]));
        }
        await client.release();
    }catch (e){
        console.log(e);
    }
}

async function createQueue(userID, queuePlace, queueDescription, queueAvatarURL, queueName, queueTime, queueDate, code, res) {
    const client = await pool.connect();
    let codesBD = await client.query('SELECT * FROM queues WHERE code = $1', [code]);
    while (codesBD.rows.length !== 0) {
        code = generateCode();
        codesBD = await client.query('SELECT * FROM queues WHERE code = $1', [code]);
    }
    await client.query('INSERT INTO queues (code, place, description, avatar, name, time, date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [code, queuePlace, queueDescription, queueAvatarURL, queueName, queueTime, queueDate] );
    const id = await client.query('SELECT id AS VALUE FROM queuesandusers ORDER BY id');
    await client.query('INSERT INTO queuesAndUsers (id, qcode, userid, userplace, isadmin) VALUES ($1, $2, $3, $4, $5)', [id.rows[id.rows.length-1].value+1, code, userID, 1, true]);
    res.send(JSON.stringify(code));
    await client.release();
}

async function deleteUser(userID, queueCode) {
    try {
        const client = await pool.connect();
        // const placeDeletedUser = await client.query('SELECT userplace AS VALUE FROM queuesandusers WHERE userid = $1 AND qcode = $2', [userID, queueCode]);
        await client.query('DELETE FROM queuesandusers WHERE userid = $1 AND qcode = $2', [userID, queueCode]);
        const check = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 AND notvkname IS NULL', [queueCode]);
        if (check.rows[0] === undefined) {
            await client.query('DELETE FROM queues WHERE code = $1', [queueCode]);
            await client.query('DELETE FROM queuesandusers WHERE notvkname IS NOT NULL AND qcode = $1', [queueCode]);
        }
        await client.release();
        // return (placeDeletedUser.rows[0].value)
    }catch(e){
        console.log(e);
    }
}

async function deleteUserWithAdmin(deletedPlace, queueCode, res) {
    try {
        const client = await pool.connect();
        const deletedUser = await client.query('SELECT userid AS VALUE FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode])
        console.log('DELETED PLACE2')
        console.log(deletedUser.rows[deletedPlace].value);
        console.log('END2')
        await client.query('DELETE FROM queuesandusers WHERE userid = $1 AND qcode = $2', [deletedUser.rows[deletedPlace].value, queueCode]);
        const data = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
        await res.send(data.rows);
        await client.release();
    }catch(e){
        console.log(e);
    }
}

async function getPeople(queueCode, res){
    try {
        const client = await pool.connect();
        console.log(`[/getPeople] Отправляю список людей для очереди ${queueCode}`);
        const result = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
        res.send(result.rows);
        await client.release();
    }catch(e){
        console.log(e);
    }
}

async function firstToLast(queueCode, res) {
    try{
        const client = await pool.connect();
        const lenghtQueue = await client.query('SELECT userplace FROM queuesandusers WHERE qcode = $1', [queueCode])
        await client.query('UPDATE queuesandusers SET userplace = $1 WHERE qcode = $2 AND userplace = 1', [lenghtQueue.rows.length ,queueCode])
        const data = await client.query('SELECT userid, userplace, isadmin, notvkname FROM queuesandusers WHERE qcode = $1 ORDER BY userplace', [queueCode]);
        await res.send(data.rows);
        await client.release();
    }catch(e){
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



/*---------------------------------------------------------------------*/
/*--------------------ЗАПРОСЫ------------------------------------------*/
/*---------------------------------------------------------------------*/

app.post('/addNotFromVK', (req, res) => {
    const newUser = req.body.newUser;
    const queueCode = req.body.queueCODE;


    addNotFromVK(newUser, queueCode, res);
})

app.post('/addNewAdmins', (req, res) => {
    const usersArray = req.body.usersArray;
    const queueCode = req.body.queueCODE;

    addNewAdmins(usersArray, queueCode, res);
})

app.post('/changeUsersOrder', (req, res) => {
    const usersArray = req.body.usersArray;
    const queueCode = req.body.queueCODE;

    changeUsersOrder(usersArray, queueCode, res);
})

app.post('/getPeople', (req, res) => {
    const queueCode = req.body.queueCODE;
    getPeople(queueCode, res);
})

app.post('/joinQueue', (req, res) => {
    const userID = req.body.userID;
    const queueCode = req.body.serverCode;
    joinQueue(userID, queueCode, res);
})

app.post('/getQueues', (req, res) => {
    const userID = req.body.userID;
    getQueues(userID, res);
})

app.post('/createQueue', (req, res) => {
    const userID = req.body.userID;
    const queueName = req.body.queueName;
    const queuePlace = req.body.queuePlace;
    const queueTime = req.body.queueTime;
    const queueDate = req.body.queueDate;
    const queueAvatarURL = req.body.queueAvatarURL;
    const queueDescription = req.body.queueDescription;
    let code = generateCode()

    createQueue(userID, queuePlace, queueDescription, queueAvatarURL, queueName, queueTime, queueDate, code, res)

})

app.post('/exitQueue', (req, res) => {
    const userID = req.body.userID;
    const queueCode = req.body.queueCODE;
    deleteUser(userID, queueCode);
    // sortLast(placeDeletedUser, userID, queueCode);
})

app.post('/deleteUser', (req, res) => {
    const deletedPlace = req.body.deletedPlace;
    const queueCode = req.body.queueCODE;
    deleteUserWithAdmin(deletedPlace, queueCode, res)
})

app.post('/firstToLast', (req, res) => {
    const queueCode = req.body.queueCODE;
    firstToLast(queueCode, res);
})

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`)
})
