function curry(fn){
    return (num1) => {
        return (num2) => {
            return fn(num1, num2)
        }
    }
}

function add(a, b) {
    return a + b
}

var curried = curry(add)
console.log(curried(3)(5))