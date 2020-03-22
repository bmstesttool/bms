import net from 'net';

class BMSConnector {
  constructor(port, ip, maxConnections) {
    // 需要单例创建
    this.server = net.createServer();
    this.maxConnections = maxConnections;
    this.server.listen(port, ip);
  }

  disconnect() {
    // 关闭连接
    this.serverStatus = false;
  }

  ip = '127.0.0.1';

  port = '8899';

  server = null;

  maxConnections = 1;
}

export default BMSConnector;
