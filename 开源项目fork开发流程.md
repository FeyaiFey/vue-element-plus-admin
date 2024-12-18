# 开源项目fork开发流程

---

### **1. Fork 原始仓库**

在 GitHub 上，点击右上角的 "Fork" 按钮，将该项目复制到你的 GitHub 账户中。这会在你的 GitHub 账户中创建一个独立的副本，例如：`https://github.com/yourusername/vue-element-plus-admin.git`。

---

### **2. 克隆你的 Fork 仓库**

从你 Fork 的仓库地址克隆项目到本地，以便进行修改。

```bash
git clone https://github.com/yourusername/vue-element-plus-admin.git
cd vue-element-plus-admin
```

---

### **3. 添加上游仓库**

将原始仓库添加为上游仓库，以便之后可以同步原始项目的更新。

```bash
git remote add upstream https://github.com/kailong321200875/vue-element-plus-admin.git
```

验证是否成功：

```bash
git remote -v
```

输出示例：

```
origin    https://github.com/yourusername/vue-element-plus-admin.git (fetch)
origin    https://github.com/yourusername/vue-element-plus-admin.git (push)
upstream  https://github.com/kailong321200875/vue-element-plus-admin.git (fetch)
upstream  https://github.com/kailong321200875/vue-element-plus-admin.git (push)
```

---

### **4. 创建你的分支**

根据需要创建一个新的开发分支。

```bash
git checkout -b my-feature-branch
```

你可以在这个分支上自由开发，保持主分支与上游仓库同步。

---

### **5. 同步上游仓库的更新**

当原始项目（上游仓库）有更新时，你可以同步更新并合并到你的分支。

1. **获取上游更新**：

   ```bash
   git fetch upstream
   ```

2. **合并上游的主分支到本地主分支**：

   ```bash
   git checkout main
   git merge upstream/main
   ```

3. **将更新合并到你的开发分支**：

   ```bash
   git checkout my-feature-branch
   git merge main
   ```

4. **推送更新到你的远程仓库**：

   ```bash
   git push origin main
   git push origin my-feature-branch
   ```

---

### **6. 初始化项目（可选）**

如果这个项目需要安装依赖和启动（比如前端项目），参考项目的 `README.md` 文件。对于 Vue 项目，通常步骤如下：

1. 安装依赖：

   ```bash
   npm install
   ```

   或

   ```bash
   yarn install
   ```

2. 启动开发服务器：

   ```bash
   npm run dev
   ```

   或

   ```bash
   yarn dev
   ```

3. 打开浏览器访问开发环境，通常是：

   ```
   http://localhost:3000
   ```

   或

   ```
   http://localhost:8080
   ```

---

### **7. 定期同步上游仓库**

为了保持项目的更新，定期同步上游仓库的最新代码。

1. **获取更新**：

   ```bash
   git fetch upstream
   ```

2. **合并到本地主分支**：

   ```bash
   git checkout main
   git merge upstream/main
   ```

3. **推送到你的远程仓库**：

   ```bash
   git push origin main
   ```

---

### 示例完整命令流程

```bash
# 克隆你的 Fork 仓库
git clone https://github.com/yourusername/vue-element-plus-admin.git
cd vue-element-plus-admin

# 添加上游仓库
git remote add upstream https://github.com/kailong321200875/vue-element-plus-admin.git

# 创建新分支
git checkout -b my-feature-branch

# 安装依赖并启动项目
npm install
npm run dev

# 获取上游更新并合并到主分支
git fetch upstream
git checkout main
git merge upstream/main

# 将主分支的更新合并到你的开发分支
git checkout my-feature-branch
git merge main

# 推送更新到远程仓库
git push origin main
git push origin my-feature-branch
```

通过以上步骤，你可以基于这个开源项目进行开发，并随时同步原始项目的更新，同时保持你自己的分支开发独立性。

### 提交规范

这个错误是由于不符合 Git Commit Message 规范导致的。这个项目使用了 commitlint 来检查提交信息的格式，要求遵循 Conventional Commits 规范。

要解决这个问题，你需要按照以下格式重新提交：

```bash
git commit -m "type: 更新一些静态文件、环境名称和项目名称"
```

其中 `type` 可以是以下类型之一：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式修改
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统或外部依赖项修改
- `ci`: CI配置文件和脚本修改
- `chore`: 其他修改

根据你的提交内容，可以这样写：

```bash
git commit -m "chore: 更新一些静态文件、环境名称和项目名称"
```

这样就能通过 commitlint 的检查了。错误信息中的两个问题：

1. `subject may not be empty`: 提交信息不能为空
2. `type may not be empty`: 必须指定提交类型

## **Pull Request:**

1. Fork code
2. Create your own branch: `git checkout -b feat/xxxx`
3. Submit your changes: `git commit -am 'feat(function): add xxxxx'`
4. Push your branch: `git push origin feat/xxxx`
5. submit `pull request`

### Git Contribution submission specification

- `feat` New features
- `fix` Fix bugs
- `docs` document
- `style` Format and style (changes that do not affect code operation)
- `refactor` Refactor
- `perf` Optimize related, such as improving performance and experience
- `test` Add test
- `build` Compilation related modifications, changes to project construction or dependencies
- `ci` Continuous integration modification
- `chore` Changes in the construction process or auxiliary tools
- `revert` Rollback to previous version
- `workflow` Workflow improvement
- `mod` Uncertain modification classification
- `wip` Under development
- `types` type

对开源项目进行自定义开发的具体步骤涉及从项目获取到实际开发、测试和发布的一系列环节。以下是详细步骤：

---

### **1. 准备工作**

#### （1）确定项目目标

- 了解开源项目的功能和特点，明确你的需求（是扩展功能、修复问题，还是定制化开发）。
- 仔细阅读项目的文档，如 `README.md`、贡献指南（`CONTRIBUTING.md`）、代码注释等。

#### （2）工具和环境

- 确保你的开发环境满足项目的运行要求，例如编程语言版本、依赖工具。
- 安装 Git 和其他需要的软件（如 Docker、Node.js、Python 等）。

#### （3）Fork 项目到你的 GitHub 仓库

- 在项目的 GitHub 页面点击 `Fork` 按钮，将其复制到你的 GitHub 帐号下。

---

### **2. 克隆和设置本地开发环境**

#### （1）克隆 Fork 的仓库到本地

使用 Git 命令将 Fork 的仓库克隆到本地：

```bash
git clone https://github.com/你的用户名/项目名.git
cd 项目名
```

#### （2）添加上游仓库（原项目仓库）

为你的仓库配置原项目（上游）的地址，以便后续同步更新：

```bash
git remote add upstream https://github.com/原项目用户名/项目名.git
git remote -v
```

#### （3）安装依赖

根据项目的文档安装依赖，例如：

- 使用 `npm` 或 `yarn`：
  ```bash
  npm install
  ```
- 使用 `pip`（Python）：
  ```bash
  pip install -r requirements.txt
  ```

#### （4）运行项目以验证环境配置

根据文档启动项目，确保环境设置正确。例如：

```bash
npm run serve       # 前端项目
python main.py      # Python 项目
```

---

### **3. 创建分支进行开发**

#### （1）创建独立分支

从主分支（如 `main` 或 `master`）创建一个新分支进行开发：

```bash
git checkout -b feature-my-customization
```

#### （2）开始开发

在代码中实现你的自定义功能，例如：

- 添加新模块或功能。
- 修改样式或前端界面。
- 更改现有功能的逻辑。

---

### **4. 测试和调试**

#### （1）本地测试

确保你的更改在本地通过所有测试，或运行自定义测试：

```bash
npm test          # JavaScript 项目
pytest            # Python 项目
```

#### （2）运行项目验证

启动项目并测试新功能是否按预期工作。

#### （3）代码质量检查

使用项目要求的代码格式工具检查代码质量，例如：

```bash
npm run lint
black .           # Python 格式化工具
```

---

### **5. 合并更新和解决冲突**

#### （1）同步原项目的最新代码

定期从上游仓库同步最新代码，避免你的开发与主代码库产生较大偏差：

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

#### （2）将主分支的更新合并到开发分支

```bash
git checkout feature-my-customization
git merge main
```

如果产生冲突，根据 Git 提示手动解决冲突，然后提交解决后的代码：

```bash
git add .
git commit -m "解决冲突"
```

---

### **6. 提交和推送更改**

#### （1）提交代码

将你的更改提交到本地仓库：

```bash
git add .
git commit -m "实现了新功能 X"
```

#### （2）推送到远程分支

将更改推送到你的 GitHub 仓库：

```bash
git push origin feature-my-customization
```

---

### **7. 提交 Pull Request（PR）**

如果你希望将你的更改合并到原项目（上游仓库）中，可以提交 Pull Request：

1. 在 GitHub 上进入你的 Fork 仓库。
2. 选择你创建的分支，点击 `New Pull Request`。
3. 填写 PR 的标题和描述，清晰地说明你的更改内容和意义。
4. 提交 PR。

---

### **8. 处理反馈**

- 原项目的维护者可能会对你的 PR 提出反馈意见。
- 根据反馈修改代码，然后将更改推送到 PR 关联的分支：
  ```bash
  git add .
  git commit -m "根据反馈修改代码"
  git push origin feature-my-customization
  ```

---

### **9. 发布和维护**

#### （1）发布自定义版本

如果不需要提交到原项目，可以在你的仓库中发布一个自定义版本供使用：

- 打 Tag 并推送：
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```

#### （2）持续同步原项目

定期从上游仓库同步代码，保持你的代码与原项目的一致性。

---

### **10. 总结工作流程**

1. Fork 和克隆项目。
2. 创建分支进行自定义开发。
3. 本地测试和调试。
4. 合并原项目更新，解决冲突。
5. 提交代码到远程仓库。
6. （可选）提交 Pull Request 或发布自定义版本。

通过以上步骤，你可以顺利对开源项目进行自定义开发，同时与原项目保持良好的同步关系。
