import net from 'net';

const host = 'ac-l9n4jhl-shard-00-00.ya77tbv.mongodb.net';
const port = 27017;

console.log(`Intentando conectar por TCP directo con Node.js a ${host}:${port}...`);

const socket = new net.Socket();

socket.setTimeout(5000);

socket.connect(port, host, () => {
  console.log('¡CONEXIÓN TCP EXITOSA DESDE NODE.JS!');
  socket.destroy();
});

socket.on('error', (err) => {
  console.error('ERROR DE CONEXIÓN TCP EN NODE.JS:', err.message);
  console.error(err);
  socket.destroy();
});

socket.on('timeout', () => {
  console.error('TIMEOUT: La conexión tardó más de 5 segundos.');
  socket.destroy();
});
