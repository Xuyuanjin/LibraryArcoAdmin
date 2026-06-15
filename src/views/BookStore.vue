<template>
  <AppLayout :breadcrumbs="['首页', '图书借阅']">
    <!-- 搜索栏 + 分类标签 -->
    <div class="hero">
      <div class="hero-text">
        <h2>📚 图书商店</h2>
        <p>挑选你心仪的图书，一键借阅。借期 30 天，可续借 2 次。</p>
      </div>
      <a-input-search
          v-model="keyword"
          placeholder="搜索书名 / 作者..."
          size="large"
          style="width: 380px"
          @search="onSearch"
          @clear="onClearSearch"
          allow-clear
      />
    </div>

    <div class="cat-tabs">
      <a-tag :checkable="true" :checked="activeCat === ''" @check="setCat('')" class="cat-tag">全部</a-tag>
      <a-tag :checkable="true" :checked="activeCat === c.cid"
             v-for="c in categories" :key="c.cid"
             @check="setCat(c.cid)" class="cat-tag">
        {{ c.cname }}
        <span class="cat-count">({{ c.bookCount || 0 }})</span>
      </a-tag>
      <a-tag class="result-count">共 {{ books.length }} 本图书</a-tag>
    </div>

    <!-- 图书卡片网格 -->
    <div class="book-grid" v-if="books.length > 0">
      <div class="book-card" v-for="book in books" :key="book.bisbn" @click="openDetail(book)">
        <div class="book-cover">
          <img v-if="book.bimage" :src="book.bimage" :alt="book.bname"/>
          <div v-else class="cover-placeholder">
            <icon-book :size="48" style="color: #D4CFC8"/>
          </div>
          <!-- 收藏图标，停止冒泡避免触发详情弹窗 -->
          <div class="fav-toggle" @click.stop="toggleFavorite(book)">
            <icon-heart-fill v-if="favSet.has(book.bisbn)" style="color: #C45B4A"/>
            <icon-heart v-else style="color: #FAF9F7"/>
          </div>
          <a-tag v-if="book.cname" class="cat-badge" size="small">{{ book.cname }}</a-tag>
        </div>
        <div class="book-info">
          <h3 class="book-name" :title="book.bname">{{ book.bname }}</h3>
          <p class="book-author">
            <icon-user-group style="font-size: 12px"/>
            {{ book.bauthor || '未知作者' }}
          </p>
          <div class="book-meta">
            <a-tag :color="getStockColor(book.bnum)" size="small">
              库存: {{ book.bnum }}
            </a-tag>
            <span class="rating" v-if="ratingMap[book.bisbn] && ratingMap[book.bisbn].cnt > 0">
              <icon-star-fill style="color: #F7BA1E"/>
              {{ Number(ratingMap[book.bisbn].avg).toFixed(1) }}
              <span class="rating-cnt">({{ ratingMap[book.bisbn].cnt }})</span>
            </span>
          </div>
          <div class="book-actions">
            <a-button v-if="parseInt(book.bnum) > 0" size="small" type="primary" class="borrow-btn" @click.stop="onBorrow(book)">
              <icon-plus/> 借阅
            </a-button>
            <a-button v-else size="small" status="warning" @click.stop="onReserve(book)">
              <icon-clock-circle/> 预约
              <span v-if="queueMap[book.bisbn] > 0" class="queue-badge">{{ queueMap[book.bisbn] }}人</span>
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <a-empty v-else description="暂无图书" style="margin-top: 80px"/>

    <!-- 详情弹窗：图书信息 + 评论列表 + 评分提交 -->
    <a-modal v-model:visible="detailVisible" :title="currentBook.bname || '图书详情'"
             width="720px" :footer="false" @cancel="detailVisible = false">
      <a-row :gutter="20">
        <a-col :span="9">
          <div class="detail-cover">
            <img v-if="currentBook.bimage" :src="currentBook.bimage"/>
            <div v-else class="cover-placeholder"><icon-book :size="64"/></div>
          </div>
        </a-col>
        <a-col :span="15">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="ISBN">{{ currentBook.bisbn }}</a-descriptions-item>
            <a-descriptions-item label="作者">{{ currentBook.bauthor }}</a-descriptions-item>
            <a-descriptions-item label="出版社">{{ currentBook.bpress }}</a-descriptions-item>
            <a-descriptions-item label="价格">¥{{ currentBook.bprice }}</a-descriptions-item>
            <a-descriptions-item label="库存">{{ currentBook.bnum }}</a-descriptions-item>
            <a-descriptions-item label="分类">{{ currentBook.cname || '未分类' }}</a-descriptions-item>
            <a-descriptions-item label="平均评分">
              <span v-if="detailStats.cnt > 0">
                <icon-star-fill style="color: #F7BA1E"/>
                {{ Number(detailStats.avg).toFixed(1) }} / 5（{{ detailStats.cnt }} 人评价）
              </span>
              <span v-else style="color: #9B9590">暂无评价</span>
            </a-descriptions-item>
          </a-descriptions>
          <a-space style="margin-top: 14px">
            <a-button v-if="parseInt(currentBook.bnum) > 0" type="primary" @click="onBorrow(currentBook); detailVisible = false">
              <icon-plus/> 立即借阅
            </a-button>
            <a-button v-else status="warning" @click="onReserve(currentBook); detailVisible = false">
              <icon-clock-circle/> 预约
              <span v-if="queueMap[currentBook.bisbn] > 0">（{{ queueMap[currentBook.bisbn] }}人排队）</span>
            </a-button>
            <a-button @click="toggleFavorite(currentBook)">
              <icon-heart-fill v-if="favSet.has(currentBook.bisbn)" style="color: #C45B4A"/>
              <icon-heart v-else/>
              {{ favSet.has(currentBook.bisbn) ? "已收藏" : "收藏" }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <a-divider>评论 ({{ reviews.length }})</a-divider>

      <!-- 评论提交：仅借阅过的读者 -->
      <a-card class="review-form" :bordered="false">
        <p class="review-form-title">写下你的评价：</p>
        <a-rate v-model="myReview.rating" allow-half/>
        <a-textarea v-model="myReview.content" placeholder="分享你对这本书的看法（仅借阅过此书的读者可评论）"
                    :auto-size="{minRows: 3, maxRows: 5}" :max-length="500" style="margin-top: 8px"/>
        <a-button type="primary" style="margin-top: 8px" @click="onSubmitReview" :loading="submitting">
          提交评论
        </a-button>
      </a-card>

      <a-list :data="reviews" :pagination-props="{pageSize: 5}" :bordered="false" style="margin-top: 12px">
        <template #item="{item}">
          <a-list-item :key="item.rvid" class="review-item">
            <a-list-item-meta>
              <template #avatar>
                <a-avatar :style="{background: '#CC785C'}">{{ (item.realName || '读').charAt(0) }}</a-avatar>
              </template>
              <template #title>
                <span style="font-weight: 600">{{ item.realName || item.userName || '匿名' }}</span>
                <a-rate :model-value="item.rating" readonly style="margin-left: 10px"/>
              </template>
              <template #description>
                <p class="review-content">{{ item.content }}</p>
                <p class="review-time"><icon-clock-circle/> {{ formatTime(item.createtime) }}</p>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-modal>
  </AppLayout>
</template>

<script>
import {defineComponent} from "vue";
import {Message} from "@arco-design/web-vue";
import {
  IconBook, IconUserGroup, IconPlus, IconClockCircle,
  IconHeart, IconHeartFill, IconStarFill,
} from "@arco-design/web-vue/es/icon";
import AppLayout from "@/components/AppLayout.vue";
import {loadBooks, searchBooks} from "@/api/BookRequest";
import {loadCategories} from "@/api/CategoryRequest";
import {borrowBook} from "@/api/BorrowRequest";
import {createReservation, getReservationQueue} from "@/api/ReservationRequest";
import {loadMyFavorites, addFavorite, removeFavorite} from "@/api/FavoriteRequest";
import {loadReviews, loadReviewStats, loadMyReview, submitReview} from "@/api/ReviewRequest";
import request from "@/api/request";

export default defineComponent({
  name: "BookStore",
  components: {
    AppLayout, IconBook, IconUserGroup, IconPlus, IconClockCircle,
    IconHeart, IconHeartFill, IconStarFill,
  },
  data() {
    return {
      keyword: "",
      activeCat: "",
      books: [],
      categories: [],
      favSet: new Set(),
      ratingMap: {},
      queueMap: {},
      detailVisible: false,
      currentBook: {},
      detailStats: {avg: 0, cnt: 0},
      reviews: [],
      myReview: {rating: 0, content: ""},
      submitting: false,
    };
  },
  methods: {
    formatTime(t) {
      if (!t) return "";
      return String(t).replace("T", " ").substring(0, 19);
    },
    loadAll() {
      loadBooks().then(res => {
        if (res.data.status === true) {
          this.books = res.data.data || [];
          this.loadAllStats();
        }
      }).catch(() => Message.error("加载图书失败"));
    },
    loadCats() {
      loadCategories().then(res => {
        if (res.data.status === true) this.categories = res.data.data || [];
      }).catch(() => {});
    },
    loadFavs() {
      loadMyFavorites().then(res => {
        if (res.data.status === true) {
          this.favSet = new Set((res.data.data || []).map(f => f.bisbn));
        }
      }).catch(() => {});
    },
    /**
     * 一次性加载当前列表所有书的评分汇总。
     * 量小所以串行 Promise.all，无需并发优化。
     */
    loadAllStats() {
      const promises = this.books.map(b =>
          loadReviewStats(b.bisbn).then(res => {
            if (res.data.status === true) this.ratingMap[b.bisbn] = res.data.data;
          }).catch(() => {})
      );
      Promise.all(promises);
      // 同时加载预约队列信息
      this.loadAllQueues();
    },
    /**
     * 加载所有图书的预约队列人数（仅对库存为 0 的书查询）
     */
    loadAllQueues() {
      const outOfStockBooks = this.books.filter(b => parseInt(b.bnum) <= 0);
      const promises = outOfStockBooks.map(b =>
          getReservationQueue(b.bisbn).then(res => {
            if (res.data.status === true) {
              this.queueMap[b.bisbn] = res.data.data || 0;
              this.queueMap = {...this.queueMap}; // 触发响应式
            }
          }).catch(() => {})
      );
      Promise.all(promises);
    },
    onSearch() {
      if (!this.keyword) return this.refresh();
      searchBooks(this.keyword).then(res => {
        if (res.data.status === true) {
          this.books = res.data.data || [];
          this.activeCat = "";
          this.loadAllStats();
        }
      });
    },
    onClearSearch() {
      this.keyword = "";
      this.refresh();
    },
    setCat(cid) {
      this.activeCat = cid;
      this.keyword = "";
      this.refresh();
    },
    refresh() {
      if (this.activeCat) {
        request.get("/book/category/" + this.activeCat).then(res => {
          if (res.data.status === true) {
            this.books = res.data.data || [];
            this.loadAllStats();
          }
        });
      } else {
        this.loadAll();
      }
    },
    getStockColor(num) {
      const n = parseInt(num) || 0;
      if (n <= 0) return "red";
      if (n <= 3) return "orange";
      return "green";
    },
    onBorrow(book) {
      const uid = this.$store.state.uid;
      if (parseInt(book.bnum) <= 0) {
        Message.warning("该书暂时没有库存，请使用预约功能");
        return;
      }
      borrowBook(uid, book.bisbn).then(res => {
        if (res.data.status === true) {
          Message.success("借阅成功！请在 30 天内归还");
          this.refresh();
        } else {
          Message.error(res.data.msg || "借阅失败");
        }
      }).catch(() => Message.error("借阅请求失败"));
    },
    onReserve(book) {
      createReservation(book.bisbn).then(res => {
        if (res.data.status === true) {
          Message.success(res.data.data || "预约成功，归还后将通知您");
          // 刷新预约队列信息
          getReservationQueue(book.bisbn).then(qres => {
            if (qres.data.status === true) {
              this.queueMap[book.bisbn] = qres.data.data || 0;
              this.queueMap = {...this.queueMap};
            }
          });
        } else {
          Message.error(res.data.msg || "预约失败");
        }
      });
    },
    toggleFavorite(book) {
      if (this.favSet.has(book.bisbn)) {
        removeFavorite(book.bisbn).then(res => {
          if (res.data.status === true) {
            this.favSet.delete(book.bisbn);
            this.favSet = new Set(this.favSet);//触发响应式
            Message.success("已取消收藏");
          }
        });
      } else {
        addFavorite(book.bisbn).then(res => {
          if (res.data.status === true) {
            this.favSet.add(book.bisbn);
            this.favSet = new Set(this.favSet);
            Message.success("已加入收藏");
          }
        });
      }
    },
    openDetail(book) {
      this.currentBook = book;
      this.detailVisible = true;
      this.detailStats = {avg: 0, cnt: 0};
      this.reviews = [];
      this.myReview = {rating: 0, content: ""};
      loadReviewStats(book.bisbn).then(res => {
        if (res.data.status === true) this.detailStats = res.data.data || {avg: 0, cnt: 0};
      });
      loadReviews(book.bisbn).then(res => {
        if (res.data.status === true) this.reviews = res.data.data || [];
      });
      loadMyReview(book.bisbn).then(res => {
        if (res.data.status === true && res.data.data) {
          this.myReview = {rating: res.data.data.rating, content: res.data.data.content};
        }
      });
    },
    onSubmitReview() {
      if (!this.myReview.rating) {
        Message.warning("请先选择评分");
        return;
      }
      this.submitting = true;
      submitReview(this.currentBook.bisbn, this.myReview.rating, this.myReview.content)
          .then(res => {
            if (res.data.status === true) {
              Message.success(res.data.data || "评论已提交");
              this.openDetail(this.currentBook);//刷新评论列表
              this.loadAllStats();
            } else {
              Message.error(res.data.msg || "提交失败");
            }
          })
          .catch(() => Message.error("请求失败"))
          .finally(() => (this.submitting = false));
    },
  },
  mounted() {
    this.loadAll();
    this.loadCats();
    this.loadFavs();
  },
});
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(120deg, #FFFFFF 0%, #FAF5F0 100%);
  border: 1px solid #EDE8E3;
  border-radius: 14px;
  padding: 22px 28px;
  margin-bottom: 16px;
}

.hero-text h2 { font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 4px; }
.hero-text p { font-size: 13px; color: #9B9590; margin: 0; }

.cat-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 4px 0 18px;
}

.cat-tag {
  cursor: pointer;
  padding: 4px 14px !important;
  font-size: 13px !important;
}

.cat-count { margin-left: 4px; font-size: 11px; opacity: 0.6; }

.result-count {
  margin-left: auto;
  background: #F5F0EB;
  color: #CC785C;
  border-color: #E8A88C;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 22px;
  padding: 4px 0 24px;
}

.book-card {
  background: #FFFFFF;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #E8E4DF;
  transition: all 0.3s ease;
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
  border-color: #D4A574;
}

.book-cover {
  width: 100%;
  height: 220px;
  background: linear-gradient(135deg, #F5F0EB 0%, #EDE8E3 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { display: flex; align-items: center; justify-content: center; }

.cat-badge {
  position: absolute;
  top: 10px; left: 10px;
  background: rgba(26, 26, 26, 0.6) !important;
  color: #FAF9F7 !important;
  border: none !important;
  backdrop-filter: blur(4px);
}

.fav-toggle {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 20px;
  cursor: pointer;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
  transition: transform 0.2s;
}

.fav-toggle:hover {
  transform: scale(1.15);
}

.book-info { padding: 14px 16px 18px; }

.book-name {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 13px;
  color: #9B9590;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.book-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.rating {
  font-size: 13px;
  color: #1A1A1A;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
}

.rating-cnt { color: #9B9590; font-weight: 400; font-size: 12px; }

.queue-badge {
  margin-left: 4px;
  font-size: 11px;
  opacity: 0.85;
}

.book-actions { display: flex; gap: 8px; }

.borrow-btn {
  background: #CC785C !important;
  border-color: #CC785C !important;
}
.borrow-btn:hover { background: #B56A50 !important; border-color: #B56A50 !important; }

.detail-cover {
  width: 100%;
  height: 240px;
  border-radius: 8px;
  overflow: hidden;
  background: #F5F0EB;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-cover img { width: 100%; height: 100%; object-fit: cover; }

.review-form {
  background: #FAF9F7;
  border-radius: 8px;
}

.review-form-title {
  font-size: 13px;
  color: #6B6560;
  margin: 0 0 6px;
}

.review-item {
  border-bottom: 1px dashed #EDE8E3;
}
.review-item:last-child { border-bottom: none; }

.review-content {
  font-size: 13px;
  color: #6B6560;
  line-height: 1.7;
  margin: 6px 0 4px;
}
.review-time {
  font-size: 12px;
  color: #9B9590;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
}
</style>
