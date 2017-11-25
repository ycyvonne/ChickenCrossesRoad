/*********************************
 * Custom stack class
 ***********************************/

class Graphics_Stack {

  constructor() {
    this.stack = [];
  }

  push(element) {
    this.stack.push(element);
  }

  pop() {
    return this.stack.pop();
  }

  peek() {
    return this.stack[this.stack.length - 1];
  }

  at(i) {
    return this.stack[i];
  }

}