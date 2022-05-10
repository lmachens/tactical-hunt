import "./components/Title.js";

const title = document.createElement("app-title");

document.body.append(title);

const evtSource = new EventSource("/subscribe");
evtSource.onmessage = function (message) {
  console.log("RELOAD", message);
  // location.reload();
};
evtSource.onerror = function (error) {
  console.log("error", error);
};
