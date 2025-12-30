// Singleton для хранения экземпляра Socket.io
let ioInstance = null;

module.exports = {
  setIO: (io) => {
    ioInstance = io;
  },
  getIO: () => {
    return ioInstance;
  },
};

