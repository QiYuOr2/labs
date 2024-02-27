<script setup lang="ts">
import { useRuleStore } from '../store';

const props = defineProps<{
  index: number;
  name: string;
  url: string | RegExp;
  enable?: boolean;
  contains?: boolean;
}>();
const ruleStore = useRuleStore();

function toggle() {
  ruleStore.set(props.index, { enable: !props.enable });
}
</script>

<template>
  <div class="rule-item">
    <div class="name">{{ name }}</div>
    <div class="url">{{ url.toString() }}</div>
    <div class="enable">
      <div :class="['button', enable ? 'button--green' : 'button--gray']" @click.stop="toggle">{{ enable ? '已开启' : '禁用中' }}</div>
    </div>
  </div>
</template>

<style scoped>
.rule-item {
  box-sizing: border-box;
  padding: 4px 18px;
  height: 50px;
  display: grid;
  grid-template-areas:
    'name . enable'
    'url contains enable';

  cursor: pointer;

  background-color: #fff;
  transition: background-color 0.3s;
}
.rule-item:hover {
  background-color: rgb(248 250 252);
  transition: background-color 0.3s;
}

.name {
  grid-area: name;
  font-size: 1em;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 1em;
  color: rgba(0, 0, 0, 0.8);
}

.url {
  grid-area: url;
  font-size: 0.9em;
  font-weight: 500;

  color: rgba(0, 0, 0, 0.5);
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
  font-size: 0.8em;
}
</style>
