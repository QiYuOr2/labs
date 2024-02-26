<script setup lang="ts">
import { useRuleStore } from '../store';

const props = defineProps<{
  url: string | RegExp;
  enable?: boolean;
  contains?: boolean;
}>();
const ruleStore = useRuleStore();

function toggle() {
  ruleStore.set(props.url, { enable: !props.enable });
}
</script>

<template>
  <div class="rule-item">
    <div class="code-text-style url">{{ url.toString() }}</div>
    <div class="contains" v-if="contains">包含模式</div>
    <div class="enable">
      <div :class="['button', enable ? 'button--red' : 'button--green']" @click.stop="toggle">{{ enable ? '停用' : '启用' }}</div>
    </div>
  </div>
</template>

<style scoped>
.button {
  padding: 0.1rem 0.25rem;
  border: 1px solid #efefef;
  border-radius: 0.125rem;
  cursor: pointer;
}

.button--green {
  background-color: #67c23a;
  border-color: #67c23a;
  color: #fff;
}

.button--red {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: #fff;
}

.rule-item {
  height: 45px;
  display: grid;
  grid-template-areas:
    'url . enable'
    'contains . enable';
}

.url {
  grid-area: url;
  font-size: 1.25em;
  font-weight: 500;

  /* 一行省略 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.contains {
  grid-area: contains;
  color: rgba(0, 0, 0, 0.5);
  font-size: 0.9em;
}
.enable {
  grid-area: enable;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: 1em;
}
</style>
