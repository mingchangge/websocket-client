<template>
  <div class="login-container">
    <div class="login-box">
      <h2>登录</h2>
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="rules"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-button type="primary" @click="handleLogin">登录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { common } from '@/api/common'

export default {
  name: 'LoginPage',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          try {
            const response = await common.loginApi(this.loginForm)

            // 直接访问响应数据（axios 已自动处理 JSON 解析）
            if (response.code === '000000') {
              // 根据后端实际响应结构调整
              localStorage.setItem('token', response.token)
              this.$message.success('登录成功')
              this.$router.push('/home')
            } else {
              this.$message.error(response.message || '登录失败')
            }
          } catch (error) {
            this.$message.error(error.response?.message || '网络错误，请重试')
            console.error('Login error:', error)
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  .login-box {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 300px;
    .login-title {
      text-align: center;
      margin-bottom: 20px;
    }
  }
}
</style>
