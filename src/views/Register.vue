<template>
  <div class="login-page">
    <!-- 左侧装饰区 -->
    <div class="login-left">
      <div class="left-content">
        <div class="brand-icon">
          <icon-book :size="48" style="color: #FAF9F7"/>
        </div>
        <h1 class="brand-title">智能图书资源管理与服务平台</h1>
        <p class="brand-desc">Create your account</p>
      </div>
    </div>

    <!-- 右侧注册表单 -->
    <div class="login-right">
      <div class="login-form-wrapper">
        <div class="form-header">
          <h2>读者注册</h2>
          <p>填写以下信息完成注册，用户ID 由系统自动分配</p>
        </div>

        <a-form :model="form" :rules="rules" ref="formRef" layout="vertical">
          <a-form-item field="userName" label="用户名">
            <a-input v-model="form.userName" placeholder="3-20 个字符，登录用" allow-clear>
              <template #prefix><icon-user/></template>
            </a-input>
          </a-form-item>

          <a-form-item field="passWord" label="密码">
            <a-input-password v-model="form.passWord" placeholder="至少 6 位" allow-clear>
              <template #prefix><icon-lock/></template>
            </a-input-password>
          </a-form-item>

          <a-form-item field="confirmPassword" label="确认密码">
            <a-input-password v-model="form.confirmPassword" placeholder="再次输入密码" allow-clear>
              <template #prefix><icon-lock/></template>
            </a-input-password>
          </a-form-item>

          <a-form-item field="realName" label="真实姓名">
            <a-input v-model="form.realName" placeholder="请输入真实姓名" allow-clear>
              <template #prefix><icon-user-group/></template>
            </a-input>
          </a-form-item>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="uphone" label="电话">
                <a-input v-model="form.uphone" placeholder="联系电话" allow-clear>
                  <template #prefix><icon-phone/></template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="uaddress" label="地址">
                <a-input v-model="form.uaddress" placeholder="居住地址" allow-clear>
                  <template #prefix><icon-location/></template>
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>

          <a-button type="primary" long size="large" @click="onSubmit" :loading="loading" class="login-btn">
            注 册
          </a-button>

          <div style="text-align: center; margin-top: 16px">
            <a-link @click="$router.replace('/')">已有账号？返回登录</a-link>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script>
import {defineComponent} from "vue";
import {Message} from "@arco-design/web-vue";
import {register} from "@/api/UserRequst";
import {IconBook, IconUser, IconLock, IconUserGroup, IconPhone, IconLocation} from "@arco-design/web-vue/es/icon";

export default defineComponent({
  name: "Register",
  components: {IconBook, IconUser, IconLock, IconUserGroup, IconPhone, IconLocation},
  data() {
    return {
      loading: false,
      form: {userName: "", passWord: "", confirmPassword: "", realName: "", uphone: "", uaddress: ""},
      rules: {
        userName: [
          {required: true, message: "请输入用户名"},
          {minLength: 3, maxLength: 20, message: "用户名长度 3-20 字符"},
        ],
        passWord: [
          {required: true, message: "请输入密码"},
          {minLength: 6, message: "密码至少 6 位"},
        ],
        confirmPassword: [
          {required: true, message: "请再次输入密码"},
          {
            validator: (value, cb) => {
              if (value !== this.form.passWord) cb("两次密码不一致");
              else cb();
            },
          },
        ],
        realName: [{required: true, message: "请输入真实姓名"}],
      },
    };
  },
  methods: {
    onSubmit() {
      this.$refs.formRef.validate((errors) => {
        if (errors) return;
        this.loading = true;
        //后端只关心这些字段，不传 confirmPassword/uid
        const payload = {
          userName: this.form.userName,
          passWord: this.form.passWord,
          realName: this.form.realName,
          uphone: this.form.uphone,
          uaddress: this.form.uaddress,
        };
        register(payload)
            .then((res) => {
              if (res.data.status === true) {
                const u = res.data.data || {};
                Message.success(`注册成功！您的用户ID 是 ${u.uid || '已分配'}，请使用「${u.userName || this.form.userName}」登录`);
                this.$router.replace("/");
              } else {
                Message.error(res.data.msg || "注册失败");
              }
            })
            .catch(() => Message.error("网络错误"))
            .finally(() => (this.loading = false));
      });
    },
  },
});
</script>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

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

.left-content {
  position: relative;
  z-index: 2;
  color: #FAF9F7;
  text-align: center;
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
}

.login-right {
  width: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FAF9F7;
  overflow-y: auto;
}

.login-form-wrapper {
  width: 400px;
  padding: 40px 0;
}

.form-header {
  margin-bottom: 28px;
}

.form-header h2 {
  font-size: 30px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.form-header p {
  color: #9B9590;
  font-size: 14px;
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
</style>
