## @babel/cli

- 全局cli的方式

```shell
babel src/index.js -o out/compield.js
```

- npm script 方式

```shell
npm i -D @babel/core @babel/cli
```

在`package.json`的`scripts`里加上：

```diff
+   "scripts": {
+     "build": "babel src -d lib"
+   },
```

最后就可以在终端运行了：

```shell
npm run build
```

## @babel/register

这个是可以为node使用babel编译。

比如我直接`node ./src/index.js`是直接运行代码，不会进行编译。

如果按照下面的方式，就可以通过`babel`来注册编译：

```shell
npm i -D @babel/register
```

然后在`register.js`文件里`require('@babel/register')`,在下面在`require('./src/index.js')`,这样就可以为`index.js`进行使用babel了，也就是下面这么个意思：

```js
// register.js
require("@babel/register")
require("./src/index.js");
```
再`node register.js`来运行。

## @babel/node

这个是babel和node的整合产品，用来代替node来运行一些需要编译的东西。

## @babel/core

如果你需要以编程的方式来使用 Babel，可以使用 babel-core 这个包。

# 配置babel

你或许已经注意到了，目前为止通过运行 Babel 自己我们并没能“翻译”代码，而仅仅是把代码从一处拷贝到了另一处。

这是因为我们还没告诉 Babel 要做什么。

> 由于 Babel 是一个通用编译器，因此默认情况下它反而什么都不做。你必须明确地告诉 Babel 应该要做什么。

所以要配合插件(`plugins`)和预设(`presets`)来告诉babel去干啥。

