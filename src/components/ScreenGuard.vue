<template>
  <div v-if="showGuard" class="guard-mask">
    <div class="guard-panel">
      <h2>请使用平板横屏或电脑访问</h2>
      <p>当前窗口 {{ guardSize }}，本应用需要足够的可视化空间（≥ 820 × 500），请使用平板横屏或电脑访问，或将窗口调大。</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';

const showGuard = ref(false);
const guardSize = ref('');

function updateGuard() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  showGuard.value = w < 820 || h < 500;
  guardSize.value = `${w} × ${h}`;
}

onMounted(() => {
  updateGuard();
  window.addEventListener('resize', updateGuard, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateGuard);
});
</script>

<style scoped>
.guard-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.88);
  display: grid;
  place-items: center;
  pointer-events: all;
}

.guard-panel {
  max-width: 520px;
  margin: 24px;
  padding: 28px;
  border-radius: 20px;
  background: #FFFFFF;
  color: #0F172A;
  border: 1px solid #E2E8F0;
  box-shadow: 0 20px 50px rgba(2, 6, 23, 0.2);
}

.guard-panel h2 {
  margin: 0 0 12px;
  font-size: 24px;
}

.guard-panel p {
  margin: 0;
  color: #334155;
  line-height: 1.6;
}
</style>
