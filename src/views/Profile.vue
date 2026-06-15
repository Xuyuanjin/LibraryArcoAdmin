<template>
  <AppLayout :breadcrumbs="['首页', '个人中心']">
    <a-row :gutter="20">
      <a-col :span="8">
        <a-card class="profile-card" :bordered="false">
          <div class="profile-header">
            <div class="avatar-wrap">
              <a-avatar :size="96" :style="{background: role === 'admin' ? '#CC785C' : '#5B8C5A'}">
                <img v-if="form.avatar" :src="form.avatar" alt="avatar"/>
                <icon-user v-else :size="44"/>
              </a-avatar>
              <a-upload :show-file-list="false" :custom-request="doUploadAvatar" accept="image/*">
                <template #upload-button>
                  <a-button class="avatar-edit" shape="circle" :loading="avatarUploading" size="small">
                    <icon-camera/>
                  </a-button>
                </template>
              </a-upload>
            </div>
            <h2>{{ form.realName || form.userName }}</h2>
            <a-tag :color="role === 'admin' ? 'orangered' : 'green'" size="medium">
              {{ role === "admin" ? "管理员" : "读者" }}
            </a-tag>
          </div>
          <a-divider/>
          <a-descriptions :column="1" bordered size="small" layout="inline-horizontal">
            <a-descriptions-item label="用户ID">{{ form.uid }}</a-descriptions-item>
            <a-descriptions-item label="登录名">{{ form.userName }}</a-descriptions-item>
            <a-descriptions-item label="电话">{{ form.uphone || "—" }}</a-descriptions-item>
            <a-descriptions-item label="地址">{{ form.uaddress || "—" }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>

      <a-col :span="16">
        <a-card title="编辑个人资料" :bordered="false">
          <a-form :model="form" :rules="rules" ref="profileRef" layout="vertical">
            <a-form-item field="userName" label="用户名(登录用)">
              <a-input v-model="form.userName" placeholder="请输入用户名" allow-clear/>
            </a-form-item>
            <a-form-item field="realName" label="真实姓名">
              <a-input v-model="form.realName" placeholder="请输入真实姓名"/>
            </a-form-item>
            <a-form-item field="uphone" label="联系电话">
              <a-input v-model="form.uphone" placeholder="请输入联系电话"/>
            </a-form-item>
            <a-form-item field="uaddress" label="地址">
              <a-input v-model="form.uaddress" placeholder="请输入地址"/>
            </a-form-item>
            <a-button type="primary" :loading="profileSaving" @click="onSaveProfile" class="action-btn">
              保存修改
            </a-button>
          </a-form>
        </a-card>

        <a-card title="修改密码" :bordered="false" style="margin-top: 16px">
          <a-form :model="pwd" :rules="pwdRules" ref="pwdRef" layout="vertical">
            <a-form-item field="oldPassword" label="原密码">
              <a-input-password v-model="pwd.oldPassword" placeholder="请输入原密码"/>
            </a-form-item>
            <a-form-item field="newPassword" label="新密码">
              <a-input-password v-model="pwd.newPassword" placeholder="至少 6 位"/>
            </a-form-item>
            <a-form-item field="confirmPassword" label="确认新密码">
              <a-input-password v-model="pwd.confirmPassword" placeholder="再次输入新密码"/>
            </a-form-item>
            <a-button type="primary" status="warning" :loading="pwdSaving" @click="onChangePassword" class="action-btn">
              修改密码
            </a-button>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </AppLayout>
</template>

<script>
import {defineComponent} from "vue";
import {Message} from "@arco-design/web-vue";
import {IconUser, IconCamera} from "@arco-design/web-vue/es/icon";
import AppLayout from "@/components/AppLayout.vue";
import {getProfile, updateProfile, changePassword} from "@/api/UserRequst";
import {uploadAvatar} from "@/api/UploadRequest";

export default defineComponent({
  name: "profile",
  components: {AppLayout, IconUser, IconCamera},
  data() {
    return {
      form: {uid: "", userName: "", realName: "", uphone: "", uaddress: "", avatar: ""},
      pwd: {oldPassword: "", newPassword: "", confirmPassword: ""},
      profileSaving: false,
      pwdSaving: false,
      avatarUploading: false,
      rules: {
        userName: [
          {required: true, message: "请输入用户名"},
          {minLength: 2, maxLength: 20, message: "用户名长度 2-20"},
        ],
        realName: [{required: true, message: "请输入真实姓名"}],
      },
      pwdRules: {
        oldPassword: [{required: true, message: "请输入原密码"}],
        newPassword: [
          {required: true, message: "请输入新密码"},
          {minLength: 6, message: "密码至少 6 位"},
        ],
        confirmPassword: [
          {required: true, message: "请再次输入新密码"},
          {
            validator: (value, cb) => {
              if (value !== this.pwd.newPassword) cb("两次密码不一致");
              else cb();
            },
          },
        ],
      },
    };
  },
  computed: {
    role() {
      return this.$store.state.role;
    },
  },
  methods: {
    loadProfile() {
      getProfile().then(res => {
        if (res.data.status === true) {
          const d = res.data.data || {};
          this.form = {
            uid: d.uid, userName: d.userName,
            realName: d.realName || "", uphone: d.uphone || "", uaddress: d.uaddress || "",
            avatar: d.avatar || "",
          };
          //同步到 store,顶部头像与用户名立即刷新
          this.$store.dispatch("loginSuccess", {
            token: sessionStorage.getItem("token"),
            uid: d.uid, userName: d.userName, realName: d.realName,
            role: d.role, avatar: d.avatar,
          });
        }
      }).catch(() => Message.error("加载个人资料失败"));
    },
    /** Arco a-upload custom-request:头像上传 → 保存到表单 + 立刻保存到后端 */
    doUploadAvatar(option) {
      const file = option && option.fileItem && option.fileItem.file;
      if (!file) return {abort() {}};
      this.avatarUploading = true;
      uploadAvatar(file)
          .then(url => {
            this.form.avatar = url;
            //自动保存,体验上"换一张就生效"
            return updateProfile(this.form);
          })
          .then(res => {
            if (res && res.data && res.data.status) {
              Message.success("头像已更新");
              //刷新 store 与 sessionStorage 中的 avatar
              this.$store.dispatch("loginSuccess", {
                token: sessionStorage.getItem("token"),
                uid: this.form.uid, userName: this.form.userName,
                realName: this.form.realName, role: this.role, avatar: this.form.avatar,
              });
            }
            option.onSuccess && option.onSuccess();
          })
          .catch(e => {
            Message.error("头像上传失败:" + (e.message || ""));
            option.onError && option.onError(e);
          })
          .finally(() => (this.avatarUploading = false));
      return {abort() {}};
    },
    onSaveProfile() {
      this.$refs.profileRef.validate().then(errors => {
        if (errors) return;
        this.profileSaving = true;
        updateProfile(this.form)
            .then(res => {
              if (res.data.status === true) {
                Message.success(res.data.msg || "更新成功");
                //同步用户名到顶部 AvatarTop
                this.$store.dispatch("loginSuccess", {
                  token: sessionStorage.getItem("token"),
                  uid: this.form.uid, userName: this.form.userName,
                  realName: this.form.realName, role: this.role, avatar: this.form.avatar,
                });
              } else {
                Message.error(res.data.msg || "更新失败");
              }
            })
            .catch(() => Message.error("请求失败"))
            .finally(() => (this.profileSaving = false));
      });
    },
    onChangePassword() {
      this.$refs.pwdRef.validate().then(errors => {
        if (errors) return;
        this.pwdSaving = true;
        changePassword(this.pwd.oldPassword, this.pwd.newPassword)
            .then(res => {
              if (res.data.status === true) {
                Message.success(res.data.msg || "密码修改成功,请重新登录");
                this.pwd = {oldPassword: "", newPassword: "", confirmPassword: ""};
                setTimeout(() => {
                  this.$store.dispatch("logout");
                  this.$router.replace("/");
                }, 1200);
              } else {
                Message.error(res.data.msg || "修改失败");
              }
            })
            .catch(() => Message.error("请求失败"))
            .finally(() => (this.pwdSaving = false));
      });
    },
  },
  mounted() {
    this.loadProfile();
  },
});
</script>

<style scoped>
.profile-card {
  background: #FFFFFF;
  border-radius: 12px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 0 8px;
}

.profile-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1A1A1A;
  margin: 6px 0 4px;
}

.avatar-wrap {
  position: relative;
}

.avatar-edit {
  position: absolute;
  right: -2px;
  bottom: -2px;
  background: #FFFFFF !important;
  border: 1px solid #E8E4DF !important;
  color: #CC785C !important;
}

.action-btn {
  background: #CC785C !important;
  border-color: #CC785C !important;
}
</style>
