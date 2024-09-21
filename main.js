import express, { json } from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';

import mainRouter from './routers/index.js';

const app = express();
const port = 1111;

app.use(cors())
app.use(json())
app.use(fileUpload({}))

app.use('/', mainRouter)

app.listen(port, () => {
    console.log(`Server was started on ${port}`);
});