const express = require('express')
const app = express()
const Pool = require('pg').Pool
const port = 3000
const Promise = require('Promise')



const pool = new Pool({
    host: 'localhost',
    database: 'leeftcode',
    port: 5432,
})
const  getWords = (request, response) => {
    pool.query('SELECT * FROM test.testTable', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

addWord = (word) => {
    var p = new Promise(function (resolve,reject) {
        pool.query('INSERT INTO test.testTable (word) VALUES ($1) RETURNING *', [word], (error, results) => {
            if (error) {
                reject(error)
                return
            }

            resolve (results.rows[0])

    })
    })
    return p;
}

updateWord = (word) => {
    var p = new Promise(function (resolve,reject) {
        pool.query('UPDATE test.testTable SET ts = NOW(), cnt = cnt + 1 WHERE word=$1 RETURNING *', [word], (error, results) => {
            if (error) {
                reject(error)
                return
            }

            resolve(results.rows[0])

        })
    })
    return p;
}

getWord = (word) => {
    var p = new Promise(function (resolve,reject) {
        pool.query('SELECT * FROM  test.testTable where word = $1', [word], (error, results) => {
            if (error) {
                reject(error)
                return
            }

            resolve(results.rows[0])

        })
    })
    return p;
}
const incrementWord = (word) => {

    var p = new Promise(function (resolve,reject) {

        if (!word) {
            reject ('invalid word')
            return
        }

        pool.query('SELECT * from test.testTable WHERE word=$1', [word], (error, results) => {
            if (error) {
                reject(error)
                return
            }
            if ((!results.rows) || (results.rows.length == 0)) {
                addWord(word).then( function success(row) {
                    resolve(row)
                },
                function error(e) {
                    reject(e)
                })
            } else {
                updateWord(word).then( function success(row) {
                        resolve(row)
                    },
                    function error(e) {
                        reject(e)
                    })
            }
        })

    });

    return p;
}
app.get('/', (request, response) => {

    getWords(request,response)

})

app.get('/word/:word', (request, response) => {
    getWord(request.params.word).then( function success(data) {

        if (!data) {
            response.status(400).json('not found')
        } else {
            response.status(200).json(data)
        }

    },
    function fail(error) {
         response.status(400).json(error)
    })

})

app.post('/word/:word', (request, response) => {
    incrementWord(request.params.word).then( function success(data) {

            if (!data) {
                response.status(400).json('not found')
            } else {
                response.status(200).json(data)
            }

        },
        function fail(error) {
            response.status(400).json(error)
        })

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
