let userList = [];

const addUser = (user) => (userList = [...userList, user]);

const getListUser = (room) => userList.filter((item) => item.room === room);

const removeUser = (id) => {
  return (userList = userList.filter((item) => item.id !== id));
};

const findUser = (id) => userList.find((item) => item.id === id);
module.exports = {
  getListUser,
  addUser,
  removeUser,
  findUser,
};
