const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const { createMessage } = require("./utils/createMessage");
const { getListUser, addUser, removeUser, findUser } = require("./utils/users");

// Bad-words
const Filter = require("bad-words");

// Static file
// __dirname là đường dẫn hiện tại, tham số thứ 2 là muốn đi tới đâu
const puclicPathDirectory = path.join(__dirname, "../public");
app.use(express.static(puclicPathDirectory));

// Tạo server để kết nối vs socket.io
const sever = http.createServer(app);

// Truyền vào bên trong nó 1 cái server để nó biết kết nối với server nào
const io = socketio(sever);

io.on("connection", (socket) => {
  // Join Room(Chia phòng chat)
  socket.on("join room client to server", ({ room, username }) => {
    // Gửi cho client vừa kết nối vào
    socket.emit(
      "chat-message server to client",
      createMessage(`Chào mừng bạn đến với Phòng ${room}`)
    );

    // Gửi cho các client còn lại
    socket.broadcast
      .to(room)
      .emit(
        "chat-message server to client",
        createMessage(`${username} vừa tham gia vào Vũ's chat`)
      );

    // Xử lý cho client vào phòng
    socket.join(room);

    // Chat(Đưa vào trong bởi vì join phòng rồi mới thực hiện các chức năng này được)
    socket.on("chat-message client to server", (message, callback) => {
      // server gửi sự kiện lại về cho client
      // io.emit: gửi về cho tất vả client
      // socket.emit : gửi về cho client mà gửi resquest lên

      filter = new Filter({ list: ["cac"] });
      // isProfane: kiểm tra message có hợp lệ hay không
      if (filter.isProfane(message)) {
        return callback("Message some badword");
      }

      // Gửi thông tin user về cho client
      const id = socket.id;
      const user = findUser(id);

      // io.emit("chat-message server to client", createMessage(message));
      io.to(room).emit(
        "chat-message server to client",
        createMessage(message, user.username)
      );
      callback("Bạn đã gửi tin nhắn thành công");
    });

    // Xử lý Share Location(Đưa vào trong bởi vì join phòng rồi mới thực hiện các chức năng này được)
    socket.on(
      "share location from client to server",
      ({ longitude, latitude }) => {
        const linkLocation = `https://www.google.com/maps/?q=${latitude},${longitude}`;
        // io.emit("share location from server to client", linkLocation);
        // Gửi thông tin user về cho client
        const id = socket.id;
        const user = findUser(id);
        io.to(room).emit(
          "share location from server to client",
          createMessage(linkLocation, user.username)
        );
      }
    );

    // Xử lý List User
    const newUser = {
      // Mỗi client kết nối vs server thì nó sẽ đc server đánh dấu cho nó 1 cái id
      id: socket.id,
      username,
      room,
    };
    addUser(newUser);
    io.to(room).emit("send List User from server to client", getListUser(room));

    // ngắt kết nối
    socket.on("disconnect", () => {
      // Chỗ này là khi ngắt kết nối nó tự động đẩy id của nó lên
      // Nên chỗ này ta có thể lấy id bằng cách socket.io
      removeUser(socket.id);
      // Gửi lại list user để các người dùng còn ở trong phòng biết ai đã thoát ra
      io.to(room).emit(
        "send List User from server to client",
        getListUser(room)
      );

      console.log("Client disconnected");
    });
  });
});

const port = process.env.PORT || 7000;

sever.listen(port, () => {
  console.log(`App run on http://localhost:${port}`);
});
