# engineered-configuration-demo

macOS
node -v  => 14.18.1
## tsconfig.json配置

```json
{
  "compilerOptions": {
    /* Basic Options */
    "baseUrl": ".", // 模块解析根路径，默认为 tsconfig.json 位于的目录
    "rootDir": "src", // 编译解析根路径，默认为 tsconfig.json 位于的目录
    "target": "ESNEXT", // 指定输出 ECMAScript 版本，默认为 es5
    "module": "ESNext", // 指定输出模块规范，默认为 Commonjs
    "lib": ["ESNext", "DOM"], // 编译需要包含的 API，默认为 target 的默认值
    "outDir": "dist", // 编译输出文件夹路径，默认为源文件同级目录
    "sourceMap": true, // 启用 sourceMap，默认为 false
    "declaration": true, // 生成 .d.ts 类型文件，默认为 false
    "declarationDir": "dist/types", // .d.ts 类型文件的输出目录，默认为 outDir 目录
    /* Strict Type-Checking Options */
    "strict": true, // 启用所有严格的类型检查选项，默认为 true
    "esModuleInterop": true, // 通过为导入内容创建命名空间，实现 CommonJS 和 ES 模块之间的互操作性，默认为 true
    "skipLibCheck": true, // 跳过导入第三方 lib 声明文件的类型检查，默认为 true
    "forceConsistentCasingInFileNames": true, // 强制在文件名中使用一致的大小写，默认为 true
    "moduleResolution": "Node", // 指定使用哪种模块解析策略，默认为 Classic
  },
  "include": ["src"] // 指定需要编译文件，默认当前目录下除了 exclude 之外的所有.ts, .d.ts,.tsx 文件
}
```

## package.json配置

```json
{
  "main": "dist/index.js",
  "types": "dist/types/index.d.ts", // 指定编译生成的类型文件，如果 compilerOptions.declarationDir 指定的是 dist，也就是源码和 .d.ts 同级，那么types可以省略
  "type": "module",
  "scripts": {
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "build": "npm run clean && tsc"
  },
  "publishConfig": {
    "access": "public"
  },
}
```

测试：
index.ts:
```js
const testF = (a: number, b:number) => {
  return a - b
}

console.log(testF(1024, 28))
```

执行：npm run build && node dist/index.js

预期结果：在 dist 目录中生成 types/index.d.ts、index.js、index.js.map，并打印 996

## Eslint & Prettier

> 使用 Prettier 解决代码格式问题，使用 linters 解决代码质量问题

> prettier-vscode 和 eslint-vscode 冲突，如何 prettier 和 eslint 集成？

### Eslint

```
npm i eslint -D
npx eslint --init  // 利用 eslint 的命令行工具生成基本配置
```
一路按照提示安装：
```
✔ How would you like to use ESLint? · problems
✔ What type of modules does your project use? · esm
✔ Which framework does your project use? · vue
✔ Does your project use TypeScript? · No / Yes
✔ Where does your code run? · browser
✔ What format do you want your config file to be in? · JavaScript
The config that you've selected requires the following dependencies:

eslint-plugin-vue@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
✔ Would you like to install them now? · No / Yes
✔ Which package manager do you want to use? · npm
```

.eslintrc.cjs文件：
```js
module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    "plugin:@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "parser": "@typescript-eslint/parser",
    "sourceType": "module"
  },
  "plugins": [
    "vue",
    "@typescript-eslint"
  ],
  "rules": {
  }
}
```

为什么生成的配置文件名称是.eslintrc.cjs而不是.eslintrc.js？

因为将项目定义为ESM，`eslit --init`会自动识别 type，并生成兼容的配置文件名称，如果我们改回 .js 结尾，再运行 eslint 将会报错。出现这个问题是eslint内部使用了 `require()` 语法读取配置。这个问题也适用于其他功能的配置，比如后面的 Prettier、Commitlint等，配置文件都不能以 xx.js 结尾，而要改为当前库支持的其他配置文件格式，如：.xxrc、.xxrc.json、.xxrc.yml。

验证配置是否生效：
```js
const testF = (a: number, b:number) => {
  return a - b
}

// console.log(testF(1024, 28))
```

package.json:
```json
"scripts": {
  "dev": "tsc --watch",
  "clean": "rm -rf dist",
  "build": "npm run clean && tsc",
  "lint": "eslint src --ext .js,.ts --cache --fix"
},
```

执行`npm run lint`：
```
/Users/liumengge/Desktop/learn&share/engineered-configuration-demo/src/index.ts
  1:7  warning  'testF' is assigned a value but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (0 errors, 1 warning)
```

校验成功。

因为是 Typescript 项目所以要添加 Standard 规范提供的 TypeScrip 扩展配置

`npm i eslint-config-standard-with-typescript -D`

npm run lint 后提示一样。
未生效。。。

### Prettier

> 把 prettier 集成到 eslint 的校验中

```
npm i prettier -D
echo {}> .prettierrc.json
```

.prettierrc.json: 只需要添加和所选规范冲突的部分
```
{
  "semi": false, // 是否使用分号
  "singleQuote": true, // 使用单引号代替双引号
  "trailingComma": "none" // 多行时尽可能使用逗号结尾
}
```

安装解决冲突需要的2个依赖：

eslint-config-prettier 关闭可能与 prettier 冲突的规则
eslint-plugin-prettier 使用 prettier 代替 eslint 格式化

`npm i eslint-config-prettier eslint-plugin-prettier -D`

.eslintrc.cjs:
```js
module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "parser": "@typescript-eslint/parser",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "vue",
    "@typescript-eslint",
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

验证配置是否成功 ？

`npm run lint`：无报错，保持一致。

### Husky

Husky是干嘛的？

一个项目通常是团队合作，不能保证每个人在提交代码之前执行一遍 lint 校验，所以需要 git hooks 来自动化校验的过程，否则禁止提交

安装：
```
npm i husky -D
npx husky install
```

生成 .husky 目录。在每次执行npm install时自动启用 husky。

package.json中添加：
```json
"scripts": {
  "dev": "tsc --watch",
  "clean": "rm -rf dist",
  "build": "npm run clean && tsc",
  "lint": "eslint src --ext .js,.ts --cache --fix",
  "prepare": "husky install"
}
```

添加一个 lint 钩子：
`npx husky add .husky/pre-commit "npm run lint"`

也可以直接在 .husky/pre-commit 文件中写入如下内容：
```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
```

测试是否生效：

修改 index.ts 文件内容：
```js
const testF = (a: number, b: number): number => {
  return a - b
}

// console.log(testF(1024, 28))
```

执行 commit：
```
git add .
git commit -m 'test husky'
```

有 warning，可以commit的。。。

再试下：
```

```

