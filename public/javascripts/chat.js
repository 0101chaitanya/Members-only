const socket = io.connect(`http://localhost:5000`);
const message = document.getElementById("message");
const handle = document.getElementById("handle");
const send = document.getElementById("send");
const output = document.getElementById("output");
const feedback = document.getElementById("feedback");

send.addEventListener("click", (e) => {
  socket.emit("chat", {
    message: message.value,
    handle: handle.value,
  });
  message.value = "";
  handle.value = "";
});

message.addEventListener("keypress", () => {
  socket.emit("typing", handle.value);
});

socket.on("chat", (data) => {
  feedback.innerHTML = "";
  output.innerHTML += `<p><strong>${data.handle}:</strong>${data.message}</p>`;
});

socket.on("typing", (data) => {
  feedback.innerHTML = `<p><em>${data} is typing a message</em></p>`;
});
