我来介绍如何使用 plop 来生成代码：

1. **生成组件**:
```bash
# 在项目根目录执行
pnpm plop component

# 然后会提示输入组件名称
? 请输入组件名称（Please enter the component name） table
```
这将会生成：
- `/src/components/Table/src/Table.vue`
- `/src/components/Table/index.ts`

2. **生成视图**:
```bash
# 在项目根目录执行
pnpm plop view

# 然后会提示输入路径和模块名称
? 请输入路径（Please enter a path） views
? 请输入模块名称（Please enter module name） user
```
这将会生成：
- `/src/views/User.vue`

注意事项：
1. 组件名称建议使用小写，plop 会自动处理首字母大写
2. 视图路径默认是 `views`，可以根据需要修改
3. 生成的文件会自动包含基本的模板代码和项目规范的结构

实际例子：
```bash
# 生成一个 DataTable 组件
pnpm plop component
? 请输入组件名称 dataTable

# 生成一个用户管理页面
pnpm plop view
? 请输入路径 views/system
? 请输入模块名称 userManage
```

这是一个很好的工具，可以帮助你：
- 保持代码结构一致性
- 减少重复的模板代码编写
- 提高开发效率
- 确保遵循项目规范
