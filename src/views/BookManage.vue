<template>
  <div class="bigbox">
    <a-layout class="layout-demo">
      <!--侧边栏-->
      <a-layout-sider hide-trigger collapsible :collapsed="collapsed">
        <div class="logo"/>
        <!--封装左侧菜单组件-->
        <LeftMuen></LeftMuen>

      </a-layout-sider>

      <a-layout>
        <!--头部-->
        <a-layout-header style="padding-left: 20px;">
          <!--折叠菜单按钮-->
          <a-button shape="round" @click="onCollapse">
            <IconCaretRight v-if="collapsed"/>
            <IconCaretLeft v-else/>
          </a-button>
          <!--头像-->
          <a-space size="large">
            <a-dropdown trigger="hover">
              <a-avatar :size="40" style="position: absolute; right: 60px; top: 10px;">Arco</a-avatar>
              <template #content>
                <a-doption>修改头像</a-doption>
                <a-doption>修改信息</a-doption>
                <a-doption>退出登录</a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </a-layout-header>

        <a-layout style="padding: 0 24px;">
          <!--面包屑-->
          <a-breadcrumb :style="{ margin: '16px 0' }">
            <a-breadcrumb-item>用户管理</a-breadcrumb-item>
          </a-breadcrumb>
          <!--搜索与功能-->
          <div style="margin-bottom: 20px; display: flex; justify-content: start">
            <div>
              <a-input
                  v-model="input"
                  :style="{ width: '320px' }"
                  style="background-color: #e6ecdf"
                  placeholder="请输入用户ID"
                  allow-clear
              />
              <a-button @click="getByUid" type="primary" status="success" style="margin-left: 3px;">搜索</a-button>
            </div>
            <div style="margin-left: 20px">
              <a-button type="primary" status="warning" @click="showAddUserModal">新增用户</a-button>
              <a-button type="primary" style="margin-left: 10px;" @click="getAllUsers">查询全部用户信息</a-button>
            </div>
          </div>
          <!--内容-->
          <a-layout-content>
            <a-table :columns="columns" :data="Listdata" :pagination="pagination">
              <template #optional="{ record }">
                <a-button @click="showEditUserModal(record)" status="warning">编辑</a-button>
                <a-button status="danger" style="margin-left: 10px;" @click="getDeleteUser(record.uid)">删除</a-button>
              </template>
            </a-table>
          </a-layout-content>
          <!--底部-->
          <a-layout-footer>
            Copyright © 2024 至上松一
          </a-layout-footer>
        </a-layout>
      </a-layout>
    </a-layout>

    <!-- 新增用户弹框 -->
    <a-modal v-model:visible="addUserModalVisible" title="新增用户" @cancel="handleCancelAddUser"
             @ok="handleSubmitAddUser">
      <a-form :model="addUserForm" :rules="rules" ref="addUserFormRef">
        <a-form-item field="uid" label="用户ID">
          <a-input v-model="addUserForm.uid" allow-clear/>
        </a-form-item>
        <a-form-item field="userName" label="用户名">
          <a-input v-model="addUserForm.userName" allow-clear/>
        </a-form-item>
        <a-form-item field="realName" label="真实名">
          <a-input v-model="addUserForm.realName" allow-clear/>
        </a-form-item>
        <a-form-item field="passWord" label="密码">
          <a-input-password
              v-model="addUserForm.passWord"
              v-model:visibility="visibility"
              :defaultVisibility="false"
              allow-clear
          />
        </a-form-item>
        <a-form-item field="uaddress" label="地址">
          <a-input v-model="addUserForm.uaddress" allow-clear/>
        </a-form-item>
        <a-form-item field="uphone" label="电话">
          <a-input v-model="addUserForm.uphone" allow-clear/>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑用户弹框 -->
    <a-modal v-model:visible="editUserModalVisible" title="编辑用户" @cancel="handleCancelEditUser"
             @ok="handleSubmitEditUser">
      <a-form :model="editUserForm" :rules="rules" ref="editUserFormRef">
        <a-form-item field="uid" label="用户ID">
          <a-input v-model="editUserForm.uid" allow-clear disabled/>
        </a-form-item>
        <a-form-item field="userName" label="用户名">
          <a-input v-model="editUserForm.userName" allow-clear/>
        </a-form-item>
        <a-form-item field="realName" label="真实名">
          <a-input v-model="editUserForm.realName" allow-clear/>
        </a-form-item>
        <a-form-item field="passWord" label="密码">
          <a-input-password
              v-model="editUserForm.passWord"
              v-model:visibility="visibility"
              :defaultVisibility="false"
              allow-clear
          />
        </a-form-item>
        <a-form-item field="uaddress" label="地址">
          <a-input v-model="editUserForm.uaddress" allow-clear/>
        </a-form-item>
        <a-form-item field="uphone" label="电话">
          <a-input v-model="editUserForm.uphone" allow-clear/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import axios from "axios";
import {bUrl} from "@/api/BaseUrl"; // 引入基础url函数
import {Load} from "@/api/UserRequst";// 引入请求函数
import {defineComponent, ref} from 'vue';
import {Message} from '@arco-design/web-vue';
import {IconCaretRight, IconCaretLeft, IconHome, IconCalendar} from '@arco-design/web-vue/es/icon';
import LeftMuen from "@/components/LeftMuen.vue";

export default defineComponent({
  name: "users",
  // 注册组件
  components: {
    LeftMuen,
    IconCaretRight,
    IconCaretLeft,
    IconHome,
    IconCalendar,
  },
  // 数据
  data() {
    return {
      Listdata: [],
      input: "",
      addUserModalVisible: false,
      editUserModalVisible: false,
      addUserForm: {
        uid: '',
        userName: '',
        realName: '',
        passWord: '',
        uaddress: '',
        uphone: ''
      },
      editUserForm: {
        uid: '',
        userName: '',
        realName: '',
        passWord: '',
        uaddress: '',
        uphone: ''
      },
      visibility: true,
      rules: {
        uid: [
          {required: true, message: '请输入用户ID', trigger: 'blur'},
          {pattern: /^[0-9]+$/, message: '用户ID必须为数字', trigger: 'blur'}
        ],
        userName: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur'}
        ],
        realName: [
          {required: true, message: '请输入真实名', trigger: 'blur'},
          {min: 2, max: 20, message: '真实名长度为2-20个字符', trigger: 'blur'}
        ],
        passWord: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur'}
        ],
        uaddress: [
          {required: true, message: '请输入地址', trigger: 'blur'},
          {min: 5, max: 50, message: '地址长度为5-50个字符', trigger: 'blur'}
        ],
        uphone: [
          {required: true, message: '请输入电话', trigger: 'blur'},
          {pattern: /^[0-9]+$/, message: '电话必须为数字', trigger: 'blur'}
        ]
      },
      columns: [
        {
          title: 'ID',
          dataIndex: 'uid'
        },
        {
          title: '用户名',
          dataIndex: 'userName'
        },
        {
          title: '真实名',
          dataIndex: 'realName'
        },
        {
          title: '地址',
          dataIndex: 'uaddress'
        },
        {
          title: '电话',
          dataIndex: 'uphone'
        },
        {
          title: '操作',
          slotName: 'optional'
        }
      ],
      pagination: {
        showTotal: true,
        showJumper: true,
        sizeCanChange: true,
        pageSize: 8,
        pageSizeChange: (pageSize) => {
          this.pagination.pageSize = pageSize;
          this.getLoad();
        },
        currentChange: (current) => {
          this.pagination.currentPage = current;
          this.getLoad();
        }
      },
      collapsed: false
    };
  },
  methods: {
    tousers() {
      this.$router.replace("/users")
    },
    // 处理菜单点击
    onClickMenuItem(key, keyPath) {
      console.log(key, keyPath);
    },
    // 切换侧边栏折叠状态
    onCollapse() {
      this.collapsed = !this.collapsed;
    },
    // 加载用户信息
    getLoad() {
      Load().then(res => {
        this.Listdata = res.data.data;
      }).catch(err => {
        console.log("响应失败");
      });
    },
    // 根据uid查询用户信息
    getByUid() {
      axios(bUrl() + "/user/" + this.input).then(res => {
        this.Listdata = res.data.data;
      }).catch(err => {
        alert("请规范输入数字ID");
      });
    },
    // 查询全部用户信息
    getAllUsers() {
      this.getLoad();
    },
    // 删除用户
    getDeleteUser(uid) {
      axios.delete(bUrl() + "/user/" + uid).then(res => {
        this.getLoad(); // 重新加载用户列表
        Message.success({content: '用户删除成功', showIcon: true});
      }).catch(err => {
        console.log("删除失败");
      });
    },
    // 显示新增用户弹框
    showAddUserModal() {
      this.resetForm('add');
      this.addUserModalVisible = true;
    },
    // 关闭新增用户弹框
    handleCancelAddUser() {
      this.addUserModalVisible = false;
    },
    // 提交新增用户信息
    handleSubmitAddUser() {
      this.$refs.addUserFormRef.validate().then(() => {
        this.addUser();
      }).catch(() => {
        Message.error({content: '请检查输入内容', showIcon: true});
      });
    },
    // 新增用户
    addUser() {
      axios.post(bUrl() + "/user", this.addUserForm).then(res => {
        this.getLoad(); // 重新加载用户列表
        Message.success({content: '用户新增成功', showIcon: true});
        this.handleCancelAddUser(); // 关闭弹框
      }).catch(err => {
        Message.error({content: '用户新增失败', showIcon: false});
      });
    },
    // 显示编辑用户弹框
    showEditUserModal(record) {
      this.editUserForm = {...record}; // 填充表单
      this.editUserModalVisible = true;
    },
    // 关闭编辑用户弹框
    handleCancelEditUser() {
      this.editUserModalVisible = false;
    },
    // 提交编辑用户信息
    handleSubmitEditUser() {
      this.$refs.editUserFormRef.validate().then(() => {
        this.updateUser();
      }).catch(() => {
        Message.error({content: '请检查输入内容', showIcon: true});
      });
    },
    // 更新用户信息
    updateUser() {
      axios.put(bUrl() + "/user/" + this.editUserForm.uid, this.editUserForm).then(res => {
        this.getLoad(); // 重新加载用户列表
        Message.success({content: '用户信息更新成功', showIcon: true});
        this.handleCancelEditUser(); // 关闭弹框
      }).catch(err => {
        console.log("更新用户失败");
      });
    },
    // 重置表单
    resetForm(formType) {
      if (formType === 'add') {
        this.addUserForm = {
          uid: '',
          userName: '',
          realName: '',
          passWord: '',
          uaddress: '',
          uphone: ''
        };
      } else if (formType === 'edit') {
        this.editUserForm = {
          uid: '',
          userName: '',
          realName: '',
          passWord: '',
          uaddress: '',
          uphone: ''
        };
      }
    }
  },
  mounted() {
    this.getLoad(); // 组件挂载后加载用户列表
  }
});
</script>

<style scoped>
.layout-demo {
  height: 100vh;
  background: var(--color-fill-2);
  border: 1px solid var(--color-border);
}

.layout-demo :deep(.arco-layout-sider) .logo {
  height: 40px;
  margin: 12px 8px;
  background: rgba(255, 255, 255, 0.2);
}

.layout-demo :deep(.arco-layout-sider-light) .logo {
  background: var(--color-fill-2);
}

.layout-demo :deep(.arco-layout-header) {
  height: 64px;
  line-height: 64px;
  background: var(--color-bg-3);
}

.layout-demo :deep(.arco-layout-footer) {
  height: 48px;
  color: var(--color-text-2);
  font-weight: 400;
  font-size: 14px;
  line-height: 48px;
}

.layout-demo :deep(.arco-layout-content) {
  color: var(--color-text-2);
  font-weight: 400;
  font-size: 14px;
  background: var(--color-bg-3);
}

.layout-demo :deep(.arco-layout-footer),
.layout-demo :deep(.arco-layout-content) {
  color: #7ecb57;
  font-size: 16px;
  font-stretch: condensed;
  text-align: center;
}
</style>
