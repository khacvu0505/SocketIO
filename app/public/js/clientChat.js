// yêu cầu server kết nối với client
const socket = io();

document.getElementById("form-messages").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.getElementById("input-messages").value;
  const acknowledgement = (message) => {
    console.log(message);
  };
  socket.emit("chat-message client to server", message, acknowledgement);
});
socket.on("chat-message server to client", (messageText) => {
  console.log(messageText);
  const { message, createAt, username } = messageText;
  // Lấy giá trị trước đó
  const htmlContent = document.getElementById("app__messages").innerHTML;
  // Hiện thị chat lên màn hình
  const innerMessage = `
  <div class="message-item">
  <div class="message__row1">
    <p class="message__name">${username ? username : "admin"}</p>
    <p class="message__date">${createAt}</p>
  </div>
  <div class="message__row2">
    <p class="message__content">
${message}</p>
  </div>
</div>`;
  let contentRender = htmlContent + innerMessage;

  document.getElementById("app__messages").innerHTML = contentRender;
  document.getElementById("input-messages").value = "";
});

// Share Location
document.getElementById("btnShareLocation").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Trình duyệt bạn đang dùng không hỗ trợ tìm vị trí");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const { longitude, latitude } = position.coords;
    socket.emit("share location from client to server", {
      longitude,
      latitude,
    });
  });
});
socket.on(
  "share location from server to client",
  ({ username, message, createAt }) => {
    console.log(message);

    // Lấy giá trị trước đó
    const htmlContent = document.getElementById("app__messages").innerHTML;
    // Hiện thị lên màn hình
    const innerMessage = `
  <div class="message-item">
  <div class="message__row1">
    <p class="message__name">${username ? username : "admin"}</p>
    <p class="message__date">${createAt}</p>
  </div>
  <div class="message__row2">
    <p class="message__content">
    <a href="${message}" target="_blank">Location's ${username}</a>
</p>
  </div>
</div>`;
    let contentRender = htmlContent + innerMessage;

    document.getElementById("app__messages").innerHTML = contentRender;
    document.getElementById("input-messages").value = "";
  }
);

// Xử lý query string
const queryString = location.search;
const { room, username } = Qs.parse(queryString, {
  ignoreQueryPrefix: true,
});
socket.emit("join room client to server", { room, username });
// Hiển thị tên phòng lên màn hình
document.getElementById("app__title").innerHTML = room;

// Xử lý List User
socket.on("send List User from server to client", (listUser) => {
  console.log(listUser);
  let contentHTML = "";
  listUser.map((item) => {
    contentHTML += `<li class="app__item-user">${item.username}</li>
    `;
  });
  document.getElementById("app__list-user--content").innerHTML = contentHTML;
});
