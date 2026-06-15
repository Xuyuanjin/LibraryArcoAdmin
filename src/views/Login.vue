<template>
  <div class="login-page">
    <!-- 左侧装饰区 -->
    <div class="login-left">
      <div class="left-content">
        <div class="brand-icon">
          <icon-book :size="48" style="color: #FAF9F7"/>
        </div>
        <h1 class="brand-title">智能图书资源管理与服务平台</h1>
        <p class="brand-desc">Intelligent Library Resource Service Platform</p>
        <div class="features">
          <div class="feature-item">
            <icon-search :size="20"/>
            <span>智能图书检索</span>
          </div>
          <div class="feature-item">
            <icon-safe :size="20"/>
            <span>安全借阅管理</span>
          </div>
          <div class="feature-item">
            <icon-bar-chart :size="20"/>
            <span>数据可视化分析</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-right">
      <div class="login-form-wrapper">
        <div class="form-header">
          <h2>欢迎回来</h2>
          <p>请登录您的账号</p>
        </div>

        <a-form :model="loginForm" :rules="rules" ref="formRef" layout="vertical">
          <a-form-item field="userName" label="用户名" :rules="[{required:true, message:'请输入用户名'}]">
            <a-input v-model="loginForm.userName" placeholder="请输入用户名" size="large" allow-clear
                      @press-enter="onLogin">
              <template #prefix><icon-user/></template>
            </a-input>
          </a-form-item>

          <a-form-item field="passWord" label="密码" :rules="[{required:true, message:'请输入密码'}]">
            <a-input-password v-model="loginForm.passWord" placeholder="请输入密码" size="large" allow-clear
                              @press-enter="onLogin">
              <template #prefix><icon-lock/></template>
            </a-input-password>
          </a-form-item>

          <div class="form-options">
            <a-checkbox v-model="loginForm.remember">记住我</a-checkbox>
            <a-link @click="$router.push('/register')">注册账号</a-link>
          </div>

          <a-button type="primary" long size="large" :loading="loading" class="login-btn" @click="onLogin">
            登 录
          </a-button>
        </a-form>

        <div class="demo-hints" v-if="demos.length">
          <a-divider>演示账号</a-divider>
          <a-space wrap>
            <a-tag
                v-for="d in demos"
                :key="d.uid"
                size="large"
                :style="tagStyle(d.role)"
                class="demo-tag"
                @click="useDemo(d)"
            >
              {{ d.userName }} / {{ DEMO_PASSWORD }} {{ roleName(d.role) }}
            </a-tag>
          </a-space>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {defineComponent} from "vue";
import {login, loadDemoAccounts} from "@/api/UserRequst";
import {Message} from "@arco-design/web-vue";
import {IconUser, IconLock, IconBook, IconSearch, IconSafe, IconBarChart} from "@arco-design/web-vue/es/icon";

//演示账号统一密码:数据库种子数据约定 123456,密码不通过接口下发
const DEMO_PASSWORD = "123456";

export default defineComponent({
  name: "Login",
  components: {IconUser, IconLock, IconBook, IconSearch, IconSafe, IconBarChart},
  data() {
    return {
      loading: false,
      DEMO_PASSWORD,
      demos: [],
      loginForm: {userName: "", passWord: "", remember: false},
      rules: {
        userName: [{required: true, message: "请输入用户名"}],
        passWord: [{required: true, message: "请输入密码"}],
      },
    };
  },
  methods: {
    roleName(role) {
      return role === "admin" ? "管理员" : "读者";
    },
    tagStyle(role) {
      if (role === "admin") {
        return {background: "#F5F0EB", color: "#CC785C", borderColor: "#E8A88C"};
      }
      return {background: "#F0F5EE", color: "#5B8C5A", borderColor: "#8CB58B"};
    },
    /** 点击演示账号 → 自动填表 */
    useDemo(d) {
      this.loginForm.userName = d.userName;
      this.loginForm.passWord = DEMO_PASSWORD;
    },
    loadDemos() {
      loadDemoAccounts().then(res => {
        if (res.data.status === true) {
          this.demos = res.data.data || [];
        }
      }).catch(() => {/* 取不到也不影响登录 */});
    },
    onLogin() {
      this.$refs.formRef.validate((errors) => {
        if (errors) return;
        this.loading = true;
        login(this.loginForm)
            .then((res) => {
              if (res.data.status === true) {
                this.$store.dispatch("loginSuccess", res.data.data);
                Message.success({content: "登录成功!", showIcon: true});
                const role = res.data.data.role;
                this.$router.replace(role === "admin" ? "/home" : "/bookstore");
              } else {
                Message.error({content: res.data.msg || "账号密码错误", showIcon: false});
              }
            })
            .catch(() => Message.error({content: "网络错误", showIcon: false}))
            .finally(() => (this.loading = false));
      });
    },
  },
  mounted() {
    this.loadDemos();
  },
});
</script>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 左侧 - 深色背景 */
.login-left {
  flex: 1;
  background: linear-gradient(160deg, #1A1A1A 0%, #2D2420 50%, #3D2E28 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(204, 120, 92, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.login-left::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(212, 165, 116, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.left-content {
  position: relative;
  z-index: 2;
  color: #FAF9F7;
  text-align: center;
  padding: 40px;
}

.brand-icon {
  width: 88px;
  height: 88px;
  background: rgba(204, 120, 92, 0.2);
  border: 2px solid rgba(204, 120, 92, 0.3);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  backdrop-filter: blur(10px);
}

.brand-title {
  max-width: 520px;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.28;
  letter-spacing: 0;
}

.brand-desc {
  font-size: 16px;
  opacity: 0.6;
  margin-bottom: 56px;
  letter-spacing: 0;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: flex-start;
  margin-left: 60px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 15px;
  opacity: 0.8;
}

/* 右侧 - 奶油色背景 */
.login-right {
  width: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FAF9F7;
}

.login-form-wrapper {
  width: 380px;
}

.form-header {
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 30px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.form-header p {
  color: #9B9590;
  font-size: 15px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.login-btn {
  height: 48px;
  font-size: 16px;
  border-radius: 10px;
  background: #CC785C !important;
  border-color: #CC785C !important;
}

.login-btn:hover {
  background: #B56A50 !important;
  border-color: #B56A50 !important;
}

.demo-hints {
  margin-top: 36px;
  text-align: center;
}

.demo-tag {
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.demo-tag:hover {
  transform: translateY(-1px);
  opacity: 0.85;
}
</style>
