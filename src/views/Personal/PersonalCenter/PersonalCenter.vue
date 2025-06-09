<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { ref, unref, onMounted } from 'vue'
import { getCurrentUserApi, uploadUserAvatarApi } from '@/api/user'
import type { UserInfo } from '@/api/user/types'
import { ElDivider, ElImage, ElTag, ElTabPane, ElTabs, ElButton, ElMessage } from 'element-plus'
import defaultAvatar from '@/assets/imgs/avatar.jpg'
import UploadAvatar from './components/UploadAvatar.vue'
import { Dialog } from '@/components/Dialog'
import EditInfo from './components/EditInfo.vue'
import EditPassword from './components/EditPassword.vue'

const userInfo = ref<UserInfo>()

const fetchCurrentUserApi = async () => {
  const res = await getCurrentUserApi()
  userInfo.value = res.data
}

const activeName = ref('first')

const dialogVisible = ref(false)

const uploadAvatarRef = ref<ComponentRef<typeof UploadAvatar>>()
const avatarLoading = ref(false)
const saveAvatar = async () => {
  try {
    avatarLoading.value = true
    const base64 = unref(uploadAvatarRef)?.getBase64()
    if (!base64) {
      ElMessage.error('获取图片数据失败')
      return
    }

    // 调用上传头像 API
    const res = await uploadUserAvatarApi({ avatar: base64 })
    if (res.code === 0) {
      ElMessage.success('头像修改成功')
      // 重新获取用户信息
      await fetchCurrentUserApi()
      dialogVisible.value = false
    } else {
      ElMessage.error('头像修改失败')
    }
  } catch (error) {
    console.error('更新头像失败:', error)
    ElMessage.error('头像修改失败')
  } finally {
    avatarLoading.value = false
  }
}

onMounted(() => {
  fetchCurrentUserApi()
})
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
            :src="userInfo?.AvatarUrl || defaultAvatar"
            fit="fill"
          />
        </div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>账号：</div>
        <div>{{ userInfo?.Email }}</div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>昵称：</div>
        <div>{{ userInfo?.UserName }}</div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>部门：</div>
        <div>{{ userInfo?.DepartmentName ?? '-' }}</div>
      </div>
      <ElDivider />
      <div class="flex justify-between items-center">
        <div>所属角色：</div>
        <div>
          <ElTag class="ml-2 mb-w">{{ userInfo?.RoleName }}</ElTag>
        </div>
      </div>
      <ElDivider />
    </ContentWrap>
    <ContentWrap title="基本资料" class="flex-[3] ml-20px">
      <ElTabs v-model="activeName">
        <ElTabPane label="基本信息" name="first">
          <EditInfo :user-info="userInfo" />
        </ElTabPane>
        <ElTabPane label="修改密码" name="second">
          <EditPassword />
        </ElTabPane>
      </ElTabs>
    </ContentWrap>
  </div>

  <Dialog v-model="dialogVisible" title="修改头像" width="800px">
    <UploadAvatar ref="uploadAvatarRef" :url="userInfo?.AvatarUrl || defaultAvatar" />

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
