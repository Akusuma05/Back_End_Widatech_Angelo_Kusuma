module.exports = {
    development: {
      client: 'mysql',
      connection: {
        host: '127.0.0.1',
        port: '8889',
        user: 'root',
        password: 'root',
        database: 'widatech'
      },
      migrations: {
        directory: './migrations'
      }
    }
  };
  