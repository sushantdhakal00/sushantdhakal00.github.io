// Described here:
// @link https://dev.to/5t3ph/helloworld-bat-vanillajs-plain-text-editor-25c7

const main = document.querySelector("main");
const hwArray = `HELLO WORLD !`.split("");
const msgArray = `You may type your own content here. But it wont matter what you type cuz am gonna ignore you!`.split("");
const typeSpeed = 250;
const hwDuration = typeSpeed * hwArray.length;
const msgDuration = typeSpeed * msgArray.length;
const msgDelay = hwDuration + 300;
const newLineDelay = hwDuration + msgDuration + 300;

// Type scripted messages
const type = (msgArray, target) => {
  msgArray.map((l, i) => {
    const letter = document.createTextNode(l);
    const delay = typeSpeed * i;

    setTimeout(() => {
      main.querySelector(target).appendChild(letter);
    }, delay);
  });
};

// Clear cursor animation from previous line
// Only works for new lines, doesn't work if you backspace to previous line
const clearCursor = () => {
  document.querySelector(".cursor.active").classList.remove("active");
};

// Create new line
const newLine = () => {
  const line = document.createElement("DIV");
  line.innerHTML = '<span class="cursor active"></span>';
  main.appendChild(line);
  clearCursor();
};

// Type initial greeting
setTimeout(() => {
  type(hwArray, "span");
}, 1000);

// Type instructions
setTimeout(() => {
  newLine();
  type(msgArray, "div span");
}, msgDelay + 1000);

// Type new line for user content
setTimeout(() => {
  newLine();
}, newLineDelay + 1000);

// If new line, drop "active" class
// from first active cursor to remove animation
main.addEventListener("keydown", (e) => {
  const key = e.keyCode;
  if (key === 13) {
    setTimeout(() => {
      clearCursor();
    }, 10);
  }
});
