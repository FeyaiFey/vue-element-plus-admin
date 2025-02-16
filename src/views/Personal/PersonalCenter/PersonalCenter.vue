<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { ref, unref, onMounted } from 'vue'
import { ElDivider, ElImage, ElTag, ElTabPane, ElTabs, ElButton, ElMessage } from 'element-plus'
import defaultAvatar from '@/assets/imgs/avatar.jpg'
import UploadAvatar from './components/UploadAvatar.vue'
import { Dialog } from '@/components/Dialog'
import EditInfo from './components/EditInfo.vue'
import EditPassword from './components/EditPassword.vue'
import { getUserInfoApi } from '@/api/login'
import { UserType } from '@/api/login/types'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const userInfo = ref<UserType>()

const fetchDetailUserApi = async () => {
  try {
    const res = await getUserInfoApi()
    if (res.code === 200) {
      userInfo.value = res.data
      // 同步更新store中的用户信息
      await userStore.setUserInfo(res.data)
    } else {
      ElMessage.error(res.message || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 更新用户信息
const handleUpdateUserInfo = async (newUserInfo) => {
  // 更新本地数据
  userInfo.value = { ...userInfo.value, ...newUserInfo }
  // 同步更新store中的用户信息
  await userStore.setUserInfo(userInfo.value)
  // 重新获取最新的用户信息
  await fetchDetailUserApi()
}

onMounted(() => {
  fetchDetailUserApi()
})

const activeName = ref('first')

const dialogVisible = ref(false)

const uploadAvatarRef = ref<ComponentRef<typeof UploadAvatar>>()
const avatarLoading = ref(false)
const saveAvatar = async () => {
  try {
    avatarLoading.value = true
    const base64 = unref(uploadAvatarRef)?.getBase64()
    console.log(base64)
    // 这里可以调用修改头像接口
    await fetchDetailUserApi()
    ElMessage.success('修改成功')
    dialogVisible.value = false
  } catch (error) {
    console.error('更新头像失败:', error)
    ElMessage.error('修改失败')
  } finally {
    avatarLoading.value = false
  }
}
</script>

<template>
  <div class="flex w-100% h-100%">
    <ContentWrap title="个人信息" class="w-400px">
      <div class="flex justify-center items-center">
        <div
          class="avatar w-[150px] h-[150px] relative cursor-pointer"
          @click="dialogVisible = true"
        >
          <ElImage
            class="w-[150px] h-[150px] rounded-full"
            :src="`http://localhost:8000/${userInfo?.avatar_url}` || defaultAvatar"
            fit="fill"
          />
        </div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>邮箱：</div>
        <div>{{ userInfo?.email }}</div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>用户名：</div>
        <div>{{ userInfo?.username }}</div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>所属部门：</div>
        <div>
          <template v-if="userInfo?.department_name?.length">
            <ElTag class="ml-2 mb-w"> {{ userInfo?.department_name }} </ElTag>
          </template>
          <template v-else>-</template>
        </div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>角色信息：</div>
        <div>
          <template v-if="userInfo?.roles?.length">
            <ElTag v-for="item in userInfo?.roles || []" :key="item" class="ml-2 mb-w"
              >{{ item }}
            </ElTag>
          </template>
          <template v-else>-</template>
        </div>
      </div>
    </ContentWrap>
    <ContentWrap title="基本资料" class="flex-[3] ml-20px">
      <ElTabs v-model="activeName">
        <ElTabPane label="基本信息" name="first">
          <EditInfo :user-info="userInfo" @update:userInfo="handleUpdateUserInfo" />
        </ElTabPane>
        <ElTabPane label="修改密码" name="second">
          <EditPassword />
        </ElTabPane>
      </ElTabs>
    </ContentWrap>
  </div>

  <Dialog v-model="dialogVisible" title="修改头像" width="800px">
    <UploadAvatar ref="uploadAvatarRef" :url="userInfo?.avatar_url || defaultAvatar" />

    <template #footer>
      <ElButton type="primary" :loading="avatarLoading" @click="saveAvatar"> 保存 </ElButton>
      <ElButton @click="dialogVisible = false">关闭</ElButton>
    </template>
  </Dialog>
</template>

<style lang="less" scoped>
.avatar {
  position: relative;

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    width: 100%;
    height: 100%;
    font-size: 50px;
    color: #fff;
    background-color: rgb(0 0 0 / 40%);
    border-radius: 50%;
    content: '+';
    opacity: 0;
    justify-content: center;
    align-items: center;
  }

  &:hover {
    &::after {
      opacity: 1;
    }
  }
}
</style>
