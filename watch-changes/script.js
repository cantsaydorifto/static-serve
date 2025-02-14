new WebSocket("ws://localhost:8000").onmessage = (event) => {
  console.log("Received:", event.data);
  if (event.data === "reload") {
    location.reload(); // Refresh the page when a change is detected
  }
};
console.log("apples");
console.log("oranges");
