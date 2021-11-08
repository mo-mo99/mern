const express = require('express')
const config = require('config')
const mongose = require('mongoose')
const app = express()

app.use('/api/auth', require('./routes/auth.routes'))

const PORT = config.get('port') || 5000

async function start(){
    try{
        await mongose.connect(config.get('mongoseUri'), {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        })
        app.listen(PORT, console.log(`server is running on ${PORT}`))
    }catch(e){
        console.log('server error', e.message)
        process.exit(1)
    }
}
start()

