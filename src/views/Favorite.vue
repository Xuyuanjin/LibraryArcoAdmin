<template>
  <AppLayout :breadcrumbs="['首页', '我的收藏']">
    <div class="toolbar">
      <a-button type="primary" @click="loadAll">
        <icon-refresh/> 刷新
      </a-button>
      <a-tag color="orangered" style="margin-left: 14px">共 {{ list.length }} 本收藏</a-tag>
    </div>

    <a-empty v-if="list.length === 0" description="您还没有收藏任何图书" style="margin-top: 60px"/>

    <div class="fav-grid" v-else>
      <div class="fav-card" v-for="b in list" :key="b.bisbn">
        <div class="fav-cover">
          <img v-if="b.bimage" :src="b.bimage"/>
          <div v-else class="placeholder"><icon-book :size="48" style="color: #D4CFC8"/></div>
          <icon-heart-fill class="fav-icon" @click="onRemove(b)"/>
        </div>
        <div class="fav-body">
          <h3 :title="b.bname">{{ b.bname }}</h3>
          <p>
            <icon-user-group style="font-size: 12px"/>
            {{ b.bauthor || '未知作者' }}
          </p>
          <div class="fav-meta">
            <a-tag :color="getStockColor(b.bnum)" size="small">库存: {{ b.bnum }}</a-tag>
            <span class="rating" v-if="b.avgRating > 0">
              <icon-star-fill style="color: #F7BA1E"/> {{ Number(b.avgRating).toFixed(1) }}
            </span>
          </div>
          <div class="fav-actions">
            <a-button size="small" type="primary" :disabled="parseInt(b.bnum) <= 0" @click="onBorrow(b)">
              <icon-plus/> {{ parseInt(b.bnum) > 0 ? "借阅" : "无库存" }}
            </a-button>
            <a-button size="small" v-if="parseInt(b.bnum) <= 0" status="warning" @click="onReserve(b)">
              <icon-clock-circle/> 预约
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import {defineComponent} from "vue";
import {Message} from "@arco-design/web-vue";
import {
  IconRefresh, IconBook, IconUserGroup, IconHeartFill, IconPlus, IconClockCircle, IconStarFill,
} from "@arco-design/web-vue/es/icon";
import AppLayout from "@/components/AppLayout.vue";
import {loadMyFavorites, removeFavorite} from "@/api/FavoriteRequest";
import {borrowBook} from "@/api/BorrowRequest";
import {createReservation} from "@/api/ReservationRequest";

export default defineComponent({
  name: "favorites",
  components: {
    AppLayout, IconRefresh, IconBook, IconUserGroup,
    IconHeartFill, IconPlus, IconClockCircle, IconStarFill,
  },
  data() {
    return {list: []};
  },
  methods: {
    loadAll() {
      loadMyFavorites().then(res => {
        if (res.data.status === true) this.list = res.data.data || [];
      }).catch(() => Message.error("加载失败"));
    },
    getStockColor(num) {
      const n = parseInt(num) || 0;
      if (n <= 0) return "red";
      if (n <= 3) return "orange";
      return "green";
    },
    onRemove(b) {
      removeFavorite(b.bisbn).then(res => {
        if (res.data.status === true) {
          Message.success("已取消收藏");
          this.loadAll();
        }
      });
    },
    onBorrow(b) {
      const uid = this.$store.state.uid;
      borrowBook(uid, b.bisbn).then(res => {
        if (res.data.status === true) {
          Message.success("借阅成功！请在 30 天内归还");
          this.loadAll();
        } else {
          Message.error(res.data.msg || "借阅失败");
        }
      });
    },
    onReserve(b) {
      createReservation(b.bisbn).then(res => {
        if (res.data.status === true) Message.success(res.data.data || "预约成功");
        else Message.error(res.data.msg || "预约失败");
      });
    },
  },
  mounted() {
    this.loadAll();
  },
});
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.fav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 22px;
  padding: 4px 0 24px;
}

.fav-card {
  background: #FFFFFF;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #E8E4DF;
  transition: all 0.3s ease;
}

.fav-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.07);
  border-color: #D4A574;
}

.fav-cover {
  width: 100%;
  height: 220px;
  position: relative;
  background: linear-gradient(135deg, #F5F0EB 0%, #EDE8E3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fav-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fav-cover .placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.fav-icon {
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 22px;
  color: #C45B4A;
  cursor: pointer;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
  transition: transform 0.2s;
}

.fav-icon:hover {
  transform: scale(1.15);
}

.fav-body {
  padding: 14px 16px 18px;
}

.fav-body h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-body p {
  font-size: 13px;
  color: #9B9590;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.fav-meta {
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

.fav-actions {
  display: flex;
  gap: 8px;
}
</style>
