const express = require('express');
const fileUpload = require('express-fileupload')
const cors = require('cors')

const app = express();
const port = 1111;

app.use(fileUpload({}))
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    // authorize().then(listFiles).catch(console.error);

    res.send(true);
});

app.post('/createFile', (req, res) => {
    const { token } = req.body
    const { file } = req.files

    // authorize().then((authClient) => createFile(authClient, file['data'])).catch(console.error);

    // console.log(file)

    return res.json(true)
})

app.listen(port, () => {
    console.log(`Сервер запущено на порті ${port}`);
});