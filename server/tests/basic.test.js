import { createServer } from '../src/server.js';


const server = createServer();
server.listen(0, async () => {
const port = server.address().port;
console.log(port);
})