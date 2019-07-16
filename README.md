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

## `.babelrc`

默认情况下，babel的专属配置项在这个`.babelrc`文件里。

`.babelrc`:

```json
{
  "presets": [],
  "plugins": []
}
```

## @babel/preset-env(`babel-preset-es2015`)

这个就是把es6的代码转换成es5的代码：

```json
{
  "presets": [
      "@babel/preset-env"
  ],
  "plugins": []
}
```

## @babel/preset-react(`babel-preset-react`)

```json
{
  "presets": [
      "@babel/preset-env",
      "@babel/preset-react"
  ],
  "plugins": []
}
```

## `babel-preset-stage-x`

> **注意：** babel7移除了stage的区分 https://babeljs.io/blog/2018/07/27/removing-babels-stage-presets

这个是对于标准提案的预设，分为四个阶段：

- `babel-preset-stage-0`
- `babel-preset-stage-1`
- `babel-preset-stage-2`
- `babel-preset-stage-3`

> 没有stage-4，那是因为他就是相对于上面的es5。

`babel-preset-stage-1` 依赖 `babel-preset-stage-2`，后者又依赖 `babel-preset-stage-3`。

# 执行 Babel 生成的代码

## @babel/polyfill(`babel-polyfill`)

这个就是对于某些还不支持的进行垫片，安装之后在对应的地方引入。

```js
npm install --save @babel/polyfill
```

然后在你需要的地方进行引入：

```js
import "@babel/polyfill";
```

## @babel/runtime(`babel-runtime`)

这个得依赖一个插件： [`@babel/plugin-transform-runtime`](https://babeljs.io/docs/en/babel-plugin-transform-runtime)，babel7之前是babel-plugin-transform-runtime。

# 配置 Babel（进阶）

## 手动指定插件

```shell
npm install --save-dev babel-plugin-transform-es2015-classes
```

```diff
  {
+   "plugins": [
+     "transform-es2015-classes"
+   ]
  }
```

更多的请查看babel[插件列表](http://babeljs.io/docs/plugins/)。

## 基于环境自定义 Babel

```json
  {
    "presets": ["es2015"],
    "plugins": [],
+   "env": {
+     "development": {
+       "plugins": [...]
+     },
+     "production": {
+       "plugins": [...]
+     }
    }
  }
```

Babel 将根据当前环境来开启 `env` 下的配置。

当前环境可以使用 `process.env.BABEL_ENV` 来获得。 如果 `BABEL_ENV` 不可用，将会替换成 `NODE_ENV`，并且如果后者也没有设置，那么默认值是`"development"`。.

参考的是这里：https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/user-handbook.md#toc-introduction
