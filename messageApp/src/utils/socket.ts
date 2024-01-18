import {io} from 'socket.io-client';
import constants from './constants';

const URL = `${constants.ip}`;

const socket = io(URL);

export default socket;
