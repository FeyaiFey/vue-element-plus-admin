import { SUCCESS_CODE } from '@/constants'

const timeout = 1000

const List: {
  email: string
  password: string
  nickname: string
  department: string
  avatarUrl: string
  permissions: string | string[]
}[] = [
  {
    email: 'admin@admin.com',
    password: 'admin',
    nickname: 'admin',
    department: '生产部',
    avatarUrl: '',
    permissions: ['*.*.*']
  },
  {
    email: 'test@test.com',
    password: 'test',
    nickname: 'test',
    department: '财务部',
    avatarUrl: '',
    permissions: ['example:dialog:create', 'example:dialog:delete']
  }
]

export default [
  // 列表接口
  {
    url: '/mock/user/list',
    method: 'get',
    response: ({ query }) => {
      const { email, pageIndex, pageSize } = query

      const mockList = List.filter((item) => {
        if (email && item.email.indexOf(email) < 0) return false
        return true
      })
      const pageList = mockList.filter(
        (_, index) => index < pageSize * pageIndex && index >= pageSize * (pageIndex - 1)
      )

      return {
        code: SUCCESS_CODE,
        data: {
          total: mockList.length,
          list: pageList
        }
      }
    }
  },
  // 登录接口
  {
    url: '/mock/user/login',
    method: 'post',
    timeout,
    response: ({ body }) => {
      const data = body
      let hasUser = false
      for (const user of List) {
        if (user.email === data.email && user.password === data.password) {
          hasUser = true
          return {
            code: SUCCESS_CODE,
            data: { userinfo: user, token: '1234567890' }
          }
        }
      }
      if (!hasUser) {
        return {
          code: 500,
          message: '账号或密码错误'
        }
      }
    }
  },
  // 退出接口
  {
    url: '/mock/user/loginOut',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: null
      }
    }
  },
  // 获取部门列表
  {
    url: '/mock/user/departments',
    method: 'get',
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: [
          { label: '研发部', value: 1 },
          { label: '市场部', value: 2 },
          { label: '销售部', value: 3 }
        ]
      }
    }
  },
  // 注册接口
  {
    url: '/mock/user/register',
    method: 'post',
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: ['注册成功']
      }
    }
  }
]
