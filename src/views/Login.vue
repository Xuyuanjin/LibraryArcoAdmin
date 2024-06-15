<template>
  <div class="login-container">
    <h1>Login Arco Admin</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="loginForm.username" placeholder="admin" />
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="loginForm.password" />
      </div>
      <div class="form-group checkbox-group">
        <input type="checkbox" id="remember" v-model="loginForm.remember" />
        <label for="remember">记住我</label>
      </div>
      <button type="submit" class="login-btn" >登录</button>
      <a href="#" class="forgot-password">忘记密码?</a>
    </form>
  </div>
</template>

<script>
export default {
  name:"login",
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '',
        remember: false,
      },
    };
  },
  methods: {
    handleLogin() {
      // 在这里添加登录逻辑
      this.$router.replace("/users");
      console.log('登录信息', this.loginForm);
    },
  },
};
</script>

<style>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background-color: #f9f9f9;
}

.login-container h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

.form-group input[type="text"],
.form-group input[type="password"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group input[type="checkbox"] {
  margin-right: 5px;
}

.login-btn {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.login-btn:hover {
  background-color: #0056b3;
}

.forgot-password {
  display: block;
  text-align: center;
  margin-top: 20px;
  color: #007bff;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}
</style>

