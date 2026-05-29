import tls from 'tls';

const host = 'ac-l9n4jhl-shard-00-00.ya77tbv.mongodb.net';
const port = 27017;

console.log(`Intentando conectar por TLS seguro con Node.js a ${host}:${port}...`);

const options = {
  host: host,
  port: port,
  rejectUnauthorized: true, // Esto validará los certificados
  servername: host // SNI es requerido por MongoDB Atlas
};

const socket = tls.connect(port, host, options, () => {
  console.log('¡CONEXIÓN TLS/SSL EXITOSA!');
  console.log('Protocolo:', socket.getProtocol());
  console.log('Autorizado:', socket.authorized ? 'SÍ' : 'NO');
  if (!socket.authorized) {
    console.log('Error de Autorización:', socket.authorizationError);
  }
  socket.destroy();
});

socket.on('error', (err) => {
  console.error('ERROR DE CONEXIÓN TLS/SSL EN NODE.JS:', err.message);
  console.error(err);
  socket.destroy();
});
