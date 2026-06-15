<template>
  <AppLayout :breadcrumbs="['首页', '图书管理']">
    <!--搜索与功能-->
    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
      <a-input
          v-model="input"
          :style="{ width: '240px' }"
          placeholder="ISBN 精确查询"
          allow-clear
      />
      <a-button @click="getByISBN" type="primary" status="success">ISBN 搜索</a-button>

      <a-input
          v-model="kwInput"
          :style="{ width: '240px' }"
          placeholder="书名 / 作者关键词"
          allow-clear
      />
      <a-button @click="onKwSearch" type="primary">关键词搜索</a-button>

      <a-select v-model="catFilter" :style="{ width: '180px' }" placeholder="按分类筛选" allow-clear @change="onCatChange">
        <a-option value="">全部分类</a-option>
        <a-option v-for="c in categories" :key="c.cid" :value="c.cid">{{ c.cname }}</a-option>
      </a-select>

      <a-button v-if="isAdmin" type="primary" status="warning" @click="showAddBookModal">新增书籍</a-button>
      <a-button type="primary" @click="getAllBooks">查询全部</a-button>
      <a-button v-if="isAdmin" @click="onExport">
        <icon-download/> 导出 CSV
      </a-button>
    </div>
    <!--内容-->
    <a-table :columns="columns" :data="Listdata" :pagination="pagination">
      <template #optional="{ record }">
        <template v-if="isAdmin">
          <a-button @click="showEditBookModal(record)" status="warning">编辑</a-button>
          <a-button status="danger" style="margin-left: 10px;" @click="getDeleteBook(record.bisbn)">删除</a-button>
        </template>
        <a-tag v-else color="gray">仅查看</a-tag>
      </template>
    </a-table>

    <!-- 新增书籍弹框 -->
    <a-modal v-model:visible="addBookModalVisible" title="新增书籍" @cancel="handleCancelAddBook" @ok="handleSubmitAddBook">
      <a-form :model="addBookForm" ref="addBookFormRef">
        <a-form-item field="bisbn" label="ISBN">
          <a-input v-model="addBookForm.bisbn" allow-clear/>
        </a-form-item>
        <a-form-item field="bname" label="书名">
          <a-input v-model="addBookForm.bname" allow-clear/>
        </a-form-item>
        <a-form-item field="bpress" label="出版社">
          <a-input v-model="addBookForm.bpress" allow-clear/>
        </a-form-item>
        <a-form-item field="bauthor" label="作者">
          <a-input v-model="addBookForm.bauthor" allow-clear/>
        </a-form-item>
        <a-form-item field="bprice" label="价格">
          <a-input v-model="addBookForm.bprice" allow-clear/>
        </a-form-item>
        <a-form-item field="bnum" label="数量">
          <a-input v-model="addBookForm.bnum" allow-clear/>
        </a-form-item>
        <a-form-item field="cid" label="分类">
          <a-select v-model="addBookForm.cid" placeholder="选择分类" allow-clear>
            <a-option v-for="c in categories" :key="c.cid" :value="c.cid">{{ c.cname }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="bimage" label="封面">
          <div class="cover-uploader">
            <img v-if="addBookForm.bimage" :src="addBookForm.bimage" class="cover-preview"/>
            <div v-else class="cover-empty"><icon-image :size="22"/></div>
            <a-upload
                :show-file-list="false"
                :custom-request="(o) => doUploadCover('add', o)"
                accept="image/*">
              <template #upload-button>
                <a-button :loading="uploading">
                  <icon-upload/> {{ addBookForm.bimage ? '更换封面' : '上传封面' }}
                </a-button>
              </template>
            </a-upload>
            <a-input v-if="addBookForm.bimage" v-model="addBookForm.bimage"
                     size="small" allow-clear class="cover-url"
                     placeholder="或粘贴外链 URL"/>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑书籍弹框 -->
    <a-modal v-model:visible="editBookModalVisible" title="编辑书籍" @cancel="handleCancelEditBook" @ok="handleSubmitEditBook">
      <a-form :model="editBookForm" ref="editBookFormRef">
        <a-form-item field="bisbn" label="ISBN">
          <a-input v-model="editBookForm.bisbn" allow-clear disabled/>
        </a-form-item>
        <a-form-item field="bname" label="书名">
          <a-input v-model="editBookForm.bname" allow-clear/>
        </a-form-item>
        <a-form-item field="bpress" label="出版社">
          <a-input v-model="editBookForm.bpress" allow-clear/>
        </a-form-item>
        <a-form-item field="bauthor" label="作者">
          <a-input v-model="editBookForm.bauthor" allow-clear/>
        </a-form-item>
        <a-form-item field="bprice" label="价格">
          <a-input v-model="editBookForm.bprice" allow-clear/>
        </a-form-item>
        <a-form-item field="bnum" label="数量">
          <a-input v-model="editBookForm.bnum" allow-clear/>
        </a-form-item>
        <a-form-item field="cid" label="分类">
          <a-select v-model="editBookForm.cid" placeholder="选择分类" allow-clear>
            <a-option v-for="c in categories" :key="c.cid" :value="c.cid">{{ c.cname }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="bimage" label="封面">
          <div class="cover-uploader">
            <img v-if="editBookForm.bimage" :src="editBookForm.bimage" class="cover-preview"/>
            <div v-else class="cover-empty"><icon-image :size="22"/></div>
            <a-upload
                :show-file-list="false"
                :custom-request="(o) => doUploadCover('edit', o)"
                accept="image/*">
              <template #upload-button>
                <a-button :loading="uploading">
                  <icon-upload/> {{ editBookForm.bimage ? '更换封面' : '上传封面' }}
                </a-button>
              </template>
            </a-upload>
            <a-input v-if="editBookForm.bimage" v-model="editBookForm.bimage"
                     size="small" allow-clear class="cover-url"
                     placeholder="或粘贴外链 URL"/>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </AppLayout>
</template>

<script>
import {loadBooks, getBookByIsbn, addBook, updateBook, deleteBook, searchBooks} from "@/api/BookRequest";
import {loadCategories} from "@/api/CategoryRequest";
import {exportBooks, triggerDownload} from "@/api/ExportRequest";
import {uploadCover} from "@/api/UploadRequest";
import request from "@/api/request";
import {defineComponent} from 'vue';
import {Message} from '@arco-design/web-vue';
import {IconDownload, IconUpload, IconImage} from '@arco-design/web-vue/es/icon';
import AppLayout from "@/components/AppLayout.vue";

export default defineComponent({
  name: "books",
  components: {AppLayout, IconDownload, IconUpload, IconImage},
  data() {
    return {
      Listdata: [],
      input: "",
      kwInput: "",
      catFilter: "",
      categories: [],
      addBookModalVisible: false,
      editBookModalVisible: false,
      addBookForm: {
        bisbn: '', bname: '', bpress: '', bauthor: '', bprice: '', bnum: '', cid: '', bimage: ''
      },
      editBookForm: {
        bisbn: '', bname: '', bpress: '', bauthor: '', bprice: '', bnum: '', cid: '', bimage: ''
      },
      visibility: true,
      columns: [
        {title: 'ISBN', dataIndex: 'bisbn', width: 80},
        {title: '书名', dataIndex: 'bname', ellipsis: true, tooltip: true},
        {title: '出版社', dataIndex: 'bpress'},
        {title: '作者', dataIndex: 'bauthor'},
        {title: '分类', dataIndex: 'cname', width: 100},
        {title: '价格', dataIndex: 'bprice', width: 90},
        {title: '数量', dataIndex: 'bnum', width: 70},
        {title: '操作', slotName: 'optional', width: 180}
      ],
      pagination: {showTotal: true, showJumper: true, sizeCanChange: true, pageSize: 8},
      uploading: false,
    };
  },
  computed: {
    isAdmin() {
      return this.$store.state.role === 'admin';
    },
  },
  methods: {
    getLoad() {
      loadBooks().then(res => {
        this.Listdata = res.data.data;
      }).catch(() => Message.error("加载图书失败"));
    },
    getByISBN() {
      if (!this.input) {
        this.getLoad();
        return;
      }
      getBookByIsbn(this.input).then(res => {
        this.Listdata = res.data.data;
      }).catch(() => Message.error("请规范输入书籍ISBN"));
    },
    onKwSearch() {
      if (!this.kwInput) {
        this.getLoad();
        return;
      }
      searchBooks(this.kwInput).then(res => {
        if (res.data.status === true) this.Listdata = res.data.data || [];
      });
    },
    onCatChange(cid) {
      if (!cid) {
        this.getLoad();
        return;
      }
      request.get("/book/category/" + cid).then(res => {
        if (res.data.status === true) this.Listdata = res.data.data || [];
      });
    },
    getAllBooks() {
      this.input = "";
      this.kwInput = "";
      this.catFilter = "";
      this.getLoad();
    },
    onExport() {
      exportBooks().then(res => {
        triggerDownload(res.data, "books.csv");
        Message.success("导出已开始下载");
      }).catch(() => Message.error("导出失败"));
    },
    /**
     * Arco a-upload 的 custom-request:把选中的文件直接走我们的上传 API,
     * 上传成功后把 URL 写回对应表单的 bimage 字段并提示成功。
     */
    doUploadCover(form, option) {
      const file = option && option.fileItem && option.fileItem.file;
      if (!file) {
        option && option.onError && option.onError(new Error('未选中文件'));
        return {abort() {}};
      }
      this.uploading = true;
      uploadCover(file)
          .then(url => {
            if (form === 'add') this.addBookForm.bimage = url;
            else this.editBookForm.bimage = url;
            Message.success('封面上传成功');
            option.onSuccess && option.onSuccess({status: 'done', url});
          })
          .catch(e => {
            Message.error('封面上传失败:' + (e.message || ''));
            option.onError && option.onError(e);
          })
          .finally(() => (this.uploading = false));
      //返回带 abort 的对象给 Arco upload(避免 console 报 abort is not a function)
      return {
        abort() {/* no-op */},
      };
    },
    loadCats() {
      loadCategories().then(res => {
        if (res.data.status === true) this.categories = res.data.data || [];
      }).catch(() => {});
    },
    getDeleteBook(bisbn) {
      deleteBook(bisbn).then(() => {
        this.getLoad();
        Message.success({content: '书籍删除成功', showIcon: true});
      }).catch(() => Message.error("删除失败"));
    },
    showAddBookModal() {
      this.resetForm('add');
      this.addBookModalVisible = true;
    },
    handleCancelAddBook() {
      this.addBookModalVisible = false;
    },
    handleSubmitAddBook() {
      this.$refs.addBookFormRef.validate().then(() => this.submitAddBook())
          .catch(() => Message.error({content: '请检查输入内容', showIcon: true}));
    },
    submitAddBook() {
      addBook(this.addBookForm).then(() => {
        this.getLoad();
        Message.success({content: '书籍新增成功', showIcon: true});
        this.handleCancelAddBook();
      }).catch(() => Message.error({content: '书籍新增失败', showIcon: false}));
    },
    showEditBookModal(record) {
      this.editBookForm = {...record};
      this.editBookModalVisible = true;
    },
    handleCancelEditBook() {
      this.editBookModalVisible = false;
    },
    handleSubmitEditBook() {
      this.$refs.editBookFormRef.validate().then(() => this.submitUpdateBook())
          .catch(() => Message.error({content: '请检查输入内容', showIcon: true}));
    },
    submitUpdateBook() {
      updateBook(this.editBookForm).then(() => {
        this.getLoad();
        Message.success({content: '书籍信息更新成功', showIcon: true});
        this.handleCancelEditBook();
      }).catch(() => Message.error("更新失败"));
    },
    resetForm(formType) {
      const empty = {bisbn: '', bname: '', bpress: '', bauthor: '', bprice: '', bnum: '', cid: '', bimage: ''};
      if (formType === 'add') this.addBookForm = {...empty};
      else if (formType === 'edit') this.editBookForm = {...empty};
    }
  },
  mounted() {
    this.getLoad();
    this.loadCats();
  }
});
</script>

<style scoped>
.cover-uploader {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cover-preview {
  width: 56px;
  height: 76px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #E8E4DF;
}

.cover-empty {
  width: 56px;
  height: 76px;
  border-radius: 4px;
  border: 1px dashed #D4CFC8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C49A7A;
  background: #F5F0EB;
}

.cover-url {
  flex: 1;
  min-width: 200px;
}
</style>

