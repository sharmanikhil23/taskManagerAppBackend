const sum = (first, second, callback) =>
  setTimeout(() => {
    callback(first + second);
  }, 2000);

const multiply = (first = 1, second = 1) => first * second;

module.exports = { sum, multiply };
