# 基本使用情况

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

# 插件步骤

基本情况是 **解析** ，**转换** ， **生成代码** 。

当我们说进入一个节点的时候，以术语来说，叫做 **[访问者模式](https://en.wikipedia.org/wiki/Visitor_pattern)** :

```js
const MyVisitor = {
  Identifier: {
    enter() {
      console.log("Entered!");
    },
    exit() {
      console.log("Exited!");
    }
  }
};
```

访问者进入，退出。

## [`babylon`](https://github.com/babel/babylon)

这货就是babel的解析器。主要就是解析成AST。

> 注意，目前已经被更名为 **[babel-parser](https://github.com/babel/babel/tree/master/packages/babel-parser)** 。具体文档及参数信息可以[参考此处](https://babeljs.io/docs/en/next/babel-parser.html)

```shell
npm install --save babylon
```

这样就安装好了，下面来试试看。

```js
import * as babylon from "babylon";

const code = `function square(n) {
  return n * n;
}`;

babylon.parse(code);
// Node {
//   type: "File",
//   start: 0,
//   end: 38,
//   loc: SourceLocation {...},
//   program: Node {...},
//   comments: [],
//   tokens: [...]
// }
```

还可以给他加点选项:

```js
babylon.parse(code, {
  sourceType: "module", // default: "script"
  plugins: ["jsx"] // default: []
});
```

> **注意：** `sourceType` 的默认值是 `"script"` 并且在发现 `import` 或 `export` 时产生错误。 使用 `scourceType: "module"` 来避免这些错误。

## [`babel-traverse`](https://github.com/babel/babel/tree/master/packages/babel-traverse)

这货是维护整棵树状态，负责替换、移除和添加节点。

可以查看[具体文档](https://babeljs.io/docs/en/next/babel-traverse.html)

安装一下：

```shell
npm install --save babel-traverse
```

然后通过和babylon来一起遍历更新节点：

```js
import * as babylon from "babylon";
import traverse from "babel-traverse";

const code = `function square(n) {
  return n * n;
}`;

const ast = babylon.parse(code);

traverse(ast, {
  enter(path) {
    if (
      path.node.type === "Identifier" &&
      path.node.name === "n"
    ) {
      path.node.name = "x";
    }
  }
});
```

## [`babel-types`](https://github.com/babel/babel/tree/master/packages/babel-types)

这个也是，目前也是有babel7版本的了。可以查看对应的文档[@babel/types](https://babeljs.io/docs/en/next/babel-types.html)

这货是用于AST节点的Lodash工具库，它包含了构造、验证以及变换 AST 节点的方法。

按照目前babel-handbook上的方法安装：

```shell
npm install --save babel-types
```

然后来简单的使用：

```js
import traverse from "babel-traverse";
import * as t from "babel-types";

traverse(ast, {
  enter(path) {
    if (t.isIdentifier(path.node, { name: "n" })) {
      path.node.name = "x";
    }
  }
});
```

### Definitions（定义）

Babel Types模块拥有每一个单一类型节点的定义，包括节点包含哪些属性，什么是合法值，如何构建节点、遍历节点，以及节点的别名等信息。

简单的看下：

```js
defineType("BinaryExpression", {
  builder: ["operator", "left", "right"],
  fields: {
    operator: {
      validate: assertValueType("string")
    },
    left: {
      validate: assertNodeType("Expression")
    },
    right: {
      validate: assertNodeType("Expression")
    }
  },
  visitor: ["left", "right"],
  aliases: ["Binary", "Expression"]
});
```

### Builders

可以看到针对于`BinaryExpression`有一个` builder`属性。

```js
builder: ["operator", "left", "right"]
```

由于每个节点都有builder，可以这样使用：

```js
t.binaryExpression("*", t.identifier("a"), t.identifier("b"));
```

> t就是上面的`import * as t from "babel-types";`

就可以创建一个下面这样的AST：

```js
{
  type: "BinaryExpression",
  operator: "*",
  left: {
    type: "Identifier",
    name: "a"
  },
  right: {
    type: "Identifier",
    name: "b"
  }
}
```

转换下，就是这样的一个结果：

`a * b`

### Validators（验证器）

`BinaryExpression` 的定义还包含了节点的字段 `fields` 信息，以及如何验证这些字段。

```js
fields: {
  operator: {
    validate: assertValueType("string")
  },
  left: {
    validate: assertNodeType("Expression")
  },
  right: {
    validate: assertNodeType("Expression")
  }
}
```

可以创建两种验证方法：

```js
t.isBinaryExpression(maybeBinaryExpressionNode);
```

这个保证是一个二进制表达式，当然你也可以传递参数确保节点包含的属性和值：

```js
t.isBinaryExpression(maybeBinaryExpressionNode, { operator: "*" });
```

些方法还有一种断言式的版本，会抛出异常而不是返回 `true` 或 `false`：

```js
t.assertBinaryExpression(maybeBinaryExpressionNode);
t.assertBinaryExpression(maybeBinaryExpressionNode, { operator: "*" });
// Error: Expected type "BinaryExpression" with option { "operator": "*" }
```

## [`babel-generator`](https://github.com/babel/babel/tree/master/packages/babel-generator)

这货就就是babel的代码生成器，他读取AST并转换成代码。babel7的说明在[这里](https://babeljs.io/docs/en/next/babel-generator.html)。

```shell
npm install --save babel-generator
```

简单的使用：

```js
import * as babylon from "babylon";
import generate from "babel-generator";

const code = `function square(n) {
  return n * n;
}`;

const ast = babylon.parse(code);

generate(ast, {}, code);
// {
//   code: "...",
//   map: "..."
// }
```

你还可以为`generate()`传递一些选项：

```js
generate(ast, {
  retainLines: false,
  compact: "auto",
  concise: false,
  quotes: "double",
  // ...
}, code);
```

## [`babel-template`](https://github.com/babel/babel/tree/master/packages/babel-template)

babel7的文档在[这里](https://babeljs.io/docs/en/next/babel-template.html)。

```shell
npm install --save babel-template
```

```
import template from "babel-template";
import generate from "babel-generator";
import * as t from "babel-types";

const buildRequire = template(`
  var IMPORT_NAME = require(SOURCE);
`);

const ast = buildRequire({
  IMPORT_NAME: t.identifier("myModule"),
  SOURCE: t.stringLiteral("my-module")
});

console.log(generate(ast).code);
```

```js
var myModule = require("my-module");
```

# 编写第一个 Babel 插件

先从一个接收了当前babel对象作为参数的[function](https://babeljs.io/docs/en/next/babel-core.html)开始：

```js
export default function(babel) {
  // plugin contents
}
```

你会发现，直接取出`babel.types`会更方便：

```js
export default function({ types: t }) {
  // plugin contents
}
```

接着返回一个对象，其 `visitor` 属性是这个插件的主要访问者。

```js
export default function({ types: t }) {
  return {
    visitor: {
      // visitor contents
    }
  };
};
```

Visitor 中的每个函数接收2个参数：`path` 和 `state`

```js
export default function({ types: t }) {
  return {
    visitor: {
      Identifier(path, state) {},
      ASTNodeTypeHere(path, state) {}
    }
  };
};
```

来搞一个可以使用的插件来展示一下他是怎么运行的。看下面一段源代码：

```js
foo === bar;
```

他的AST是下面这样的：

```js
{
  type: "BinaryExpression",
  operator: "===",
  left: {
    type: "Identifier",
    name: "foo"
  },
  right: {
    type: "Identifier",
    name: "bar"
  }
}
```

我们从添加 `BinaryExpression` 访问者方法开始：

```js
export default function({ types: t }) {
  return {
    visitor: {
      BinaryExpression(path) {
        // ...
      }
    }
  };
}
```

让我们再精确一点的去表示只针对`===`的`BinaryExpression`:

```js
visitor: {
  BinaryExpression(path) {
    if (path.node.operator !== "===") {
      return;
    }

    // ...
  }
}
```

现在我们用新的标识符来替换 `left` 属性：

```js
BinaryExpression(path) {
  if (path.node.operator !== "===") {
    return;
  }

  path.node.left = t.identifier("sebmck");
  // ...
}
```

于是如果我们运行这个插件我们会得到：

```js
sebmck === bar;
```

现在只需要替换 `right` 属性了:

```js
BinaryExpression(path) {
  if (path.node.operator !== "===") {
    return;
  }

  path.node.left = t.identifier("sebmck");
  path.node.right = t.identifier("dork");
}
```

所以最终结果就是：

```js
sebmck === dork;
```

# 转换操作

## 访问

### 获取子节点的Path

为了得到一个AST节点的属性值，我们一般先访问到该节点，然后利用 `path.node.property` 方法即可。

```js
// the BinaryExpression AST node has properties: `left`, `right`, `operator`
BinaryExpression(path) {
  path.node.left;
  path.node.right;
  path.node.operator;
}
```

如果你想访问到该属性内部的`path`，使用path对象的`get`方法，传递该属性的字符串形式作为参数。

```js
BinaryExpression(path) {
  path.get('left');
}
Program(path) {
  path.get('body.0');
}
```

### 检查节点的类型

检查节点类型最好的办法是：

```js
BinaryExpression(path) {
  if (t.isIdentifier(path.node.left)) {
    // ...
  }
}
```

也可以对节点的属性做浅检查：

```js
BinaryExpression(path) {
  if (t.isIdentifier(path.node.left, { name: "n" })) {
    // ...
  }
}
```

功能上等价于：

```js
BinaryExpression(path) {
  if (
    path.node.left != null &&
    path.node.left.type === "Identifier" &&
    path.node.left.name === "n"
  ) {
    // ...
  }
}
```

### 检查路径(Path)类型

```js
BinaryExpression(path) {
  if (path.get('left').isIdentifier({ name: "n" })) {
    // ...
  }
}
```

相当于：

```js
BinaryExpression(path) {
  if (t.isIdentifier(path.node.left, { name: "n" })) {
    // ...
  }
}
```

### 检查标识符(Identifier)是否被引用

```js
Identifier(path) {
  if (path.isReferencedIdentifier()) {
    // ...
  }
}
```

或者：

```js
Identifier(path) {
  if (t.isReferenced(path.node, path.parent)) {
    // ...
  }
}
```

### 找到特定的父路径

有时你需要从一个路径向上遍历语法树，直到满足相应的条件。对于每一个父路径调用`callback`并将其`NodePath`当作参数，当`callback`返回真值时，则将其`NodePath`返回。

```js
path.findParent((path) => path.isObjectExpression());
```

如果也需要遍历当前节点：

```js
path.find((path) => path.isObjectExpression());
```

查找最接近的父函数或程序：

```js
path.getFunctionParent();
```

向上遍历语法树，直到找到在列表中的父节点路径

```js
path.getStatementParent();
```

### 获取同级路径

如果一个路径是在一个 `Function`／`Program`中的列表里面，它就有同级节点。

- 使用`path.inList`来判断路径是否有同级节点
- 使用`path.getSibling(index)`来获得同级路径,
- 使用 `path.key`获取路径所在容器的索引,
- 使用 `path.container`获取路径的容器（包含所有同级节点的数组）
- 使用 `path.listKey`获取容器的key

> 这些API用于[babel-minify](https://github.com/babel/babili)中用于[transform-merge-sibling-variables](https://github.com/babel/babili/blob/master/packages/babel-plugin-transform-merge-sibling-variables/src/index.js)的。

```js
var a = 1; // pathA, path.key = 0
var b = 2; // pathB, path.key = 1
var c = 3; // pathC, path.key = 2
```

```js
export default function({ types: t }) {
  return {
    visitor: {
      VariableDeclaration(path) {
        // if the current path is pathA
        path.inList // true
        path.listKey // "body"
        path.key // 0
        path.getSibling(0) // pathA
        path.getSibling(path.key + 1) // pathB
        path.container // [pathA, pathB, pathC]
      }
    }
  };
}
```

### 停止遍历

```js
BinaryExpression(path) {
  if (path.node.operator !== '**') return;
}
```

如果你在顶层路径中执行子遍历，你可以使用提供的2个API方法:

`path.skip()`跳过遍历当前路径的子路径。`path.stop()`完全停止遍历。

```js
outerPath.traverse({
  Function(innerPath) {
    innerPath.skip(); // if checking the children is irrelevant
  },
  ReferencedIdentifier(innerPath, state) {
    state.iife = true;
    innerPath.stop(); // if you want to save some state and then stop traversal, or deopt
  }
});
```

## 处理

### 替换一个节点

```js
BinaryExpression(path) {
  path.replaceWith(
    t.binaryExpression("**", path.node.left, t.numberLiteral(2))
  );
}
```

```diff
  function square(n) {
-   return n * n;
+   return n ** 2;
  }
```

### 用多节点替换单节点

```js
ReturnStatement(path) {
  path.replaceWithMultiple([
    t.expressionStatement(t.stringLiteral("Is this the real life?")),
    t.expressionStatement(t.stringLiteral("Is this just fantasy?")),
    t.expressionStatement(t.stringLiteral("(Enjoy singing the rest of the song in your head)")),
  ]);
}
```

```diff
  function square(n) {
-   return n * n;
+   "Is this the real life?";
+   "Is this just fantasy?";
+   "(Enjoy singing the rest of the song in your head)";
  }
```

**注意:** 当用多个节点替换表达式时，它们必须是语句(statements)。这是因为Babel在替换节点时广泛使用启发式，这意味着你可以进行一些非常疯狂的转换，否则将非常冗长。

### 用字符串源码替换节点

```js
FunctionDeclaration(path) {
  path.replaceWithSourceString(`function add(a, b) {
    return a + b;
  }`);
}
```

```diff
- function square(n) {
-   return n * n;
+ function add(a, b) {
+   return a + b;
  }
```

**注意：** 除非处理动态源字符串，否则不建议使用此API，否则解析访问者外部的代码会更有效。

### 插入一个兄弟节点

```js
FunctionDeclaration(path) {
  path.insertBefore(t.expressionStatement(t.stringLiteral("Because I'm easy come, easy go.")));
  path.insertAfter(t.expressionStatement(t.stringLiteral("A little high, little low.")));
}
```

```diff
+ "Because I'm easy come, easy go.";
  function square(n) {
    return n * n;
  }
+ "A little high, little low.";
```

注意，这个应该一直是一个语句或一个语句数组。这使用了在“用多节点替换单节点时”提到的相同启发式。

### 插入到容器

如果你想插入一个AST节点属性就像一个数组或像一个`body`。它类似于`insertBefore`/`insertAfter`，只是需要指定`listKey`(通常是`body`)。

```js
ClassMethod(path) {
  path.get('body').unshiftContainer('body', t.expressionStatement(t.stringLiteral('before')));
  path.get('body').pushContainer('body', t.expressionStatement(t.stringLiteral('after')));
}
```

```diff
class A {
  constructor() {
+   "before"
    var a = 'middle';
+   "after"
  }
 }
```

### 移除一个节点

```js
FunctionDeclaration(path) {
  path.remove();
}
```

```diff
- function square(n) {
-   return n * n;
- }
```

### 替换一个父级

只需要为parentPath调用`replaceWith`： `path.parentPath`

```js
BinaryExpression(path) {
  path.parentPath.replaceWith(
    t.expressionStatement(t.stringLiteral("Anyway the wind blows, doesn't really matter to me, to me."))
  );
}
```

```js
function square(n) {
-   return n * n;
+   "Anyway the wind blows, doesn't really matter to me, to me.";
  }
```

### 移除一个父级

```js
BinaryExpression(path) {
  path.parentPath.remove();
}
```

```diff
  function square(n) {
-   return n * n;
  }
```

## 作用域

### 检查本地变量是否被绑定

```js
FunctionDeclaration(path) {
  if (path.scope.hasBinding("n")) {
    // ...
  }
}
```

这将遍历作用域树并检查特定的绑定。

你也可以检查一个作用域是否有 **自己的** 绑定:

```js
FunctionDeclaration(path) {
  if (path.scope.hasOwnBinding("n")) {
    // ...
  }
}
```

### 生成一个UID

```js
FunctionDeclaration(path) {
  path.scope.generateUidIdentifier("uid");
  // Node { type: "Identifier", name: "_uid" }
  path.scope.generateUidIdentifier("uid");
  // Node { type: "Identifier", name: "_uid2" }
}
```

### Pushing 一个变量声明到父级作用域

有时你想push一个`VariableDeclaration`：

```js
FunctionDeclaration(path) {
  const id = path.scope.generateUidIdentifierBasedOnNode(path.node.id);
  path.remove();
  path.scope.parent.push({ id, init: path.node });
}
```

```diff
- function square(n) {
+ var _square = function square(n) {
    return n * n;
- }
+ };
```

### 重命名一个绑定和他的引用

```js
FunctionDeclaration(path) {
  path.scope.rename("n", "x");
}
```

```diff
- function square(n) {
-   return n * n;
+ function square(x) {
+   return x * x;
  }
```

或者，你可以将绑定重命名为生成的唯一标识符:

```js
FunctionDeclaration(path) {
  path.scope.rename("n");
}
```

```diff
- function square(n) {
-   return n * n;
+ function square(_n) {
+   return _n * _n;
  }
```

# Plugin Options

看看插件的选项：

```js
{
  plugins: [
    ["my-plugin", {
      "option1": true,
      "option2": false
    }]
  ]
}
```

然后这个选项被传递到插件的vistor的`state`对象:

```js
export default function({ types: t }) {
  return {
    visitor: {
      FunctionDeclaration(path, state) {
        console.log(state.opts);
        // { option1: true, option2: false }
      }
    }
  }
}
```

## Pre and Post in Plugins

插件可以具有在插件之前或之后运行的函数。它们可以用于设置或清理/分析目的。

```js
export default function({ types: t }) {
  return {
    pre(state) {
      this.cache = new Map();
    },
    visitor: {
      StringLiteral(path) {
        this.cache.set(path.node.value, 1);
      }
    },
    post(state) {
      console.log(this.cache);
    }
  };
}
```

## 在插件中启用语法

```js
export default function({ types: t }) {
  return {
    inherits: require("babel-plugin-syntax-jsx")
  };
}
```

## 抛出一个语法错误

```js
export default function({ types: t }) {
  return {
    visitor: {
      StringLiteral(path) {
        throw path.buildCodeFrameError("Error message here");
      }
    }
  };
}
```

错误看起来像这样:

```JS
file.js: Error message here
   7 |
   8 | let tips = [
>  9 |   "Click on any AST node with a '+' to expand it",
     |   ^
  10 |
  11 |   "Hovering over a node highlights the \
  12 |    corresponding part in the source code",
```

# 构建节点

```js
defineType("MemberExpression", {
  builder: ["object", "property", "computed"],
  visitor: ["object", "property"],
  aliases: ["Expression", "LVal"],
  fields: {
    object: {
      validate: assertNodeType("Expression")
    },
    property: {
      validate(node, key, val) {
        let expectedType = node.computed ? "Expression" : "Identifier";
        assertNodeType(expectedType)(node, key, val);
      }
    },
    computed: {
      default: false
    }
  }
});
```

```js
builder: ["object", "property", "computed"],
```

> 请注意，有时你可以在节点上自定义的属性比`builder`数组包含的属性还要多。这是为了避免builder有太多的参数。在这些情况下，你需要手动设置属性。这方面的一个例子是[`ClassMethod`](https://github.com/babel/babel/blob/bbd14f88c4eea88fa584dd877759dd6b900bf35e/packages/babel-types/src/definitions/es2015.js#L238-L276)。

```js
// Example
// because the builder doesn't contain `async` as a property
var node = t.classMethod(
  "constructor",
  t.identifier("constructor"),
  params,
  body
)
// set it manually after creation
node.async = true;
```

你可以使用`fields`对象查看构建器参数的验证。

```js
fields: {
  object: {
    validate: assertNodeType("Expression")
  },
  property: {
    validate(node, key, val) {
      let expectedType = node.computed ? "Expression" : "Identifier";
      assertNodeType(expectedType)(node, key, val);
    }
  },
  computed: {
    default: false
  }
}
```

# 最佳实践

https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#best-practices

