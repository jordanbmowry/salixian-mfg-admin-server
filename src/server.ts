import * as dotenv from 'dotenv';
import app from './app';
dotenv.config();

const { PORT = 8080 } = process.env;

const listener = () => console.log(`Listening on Port ${PORT}!`);
app.listen(PORT, listener);
