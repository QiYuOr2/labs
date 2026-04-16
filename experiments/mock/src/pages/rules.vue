<script setup lang="ts">
import { GM_getValue } from '$';
import { computed, ref } from 'vue';
import RuleItem from '../components/RuleItem.vue';
import { Pages, usePageStore, useRuleStore } from '../store';
import { useToggle } from '@vueuse/core';

const ruleStore = useRuleStore();
const router = usePageStore();

function toEdit(index: number) {
  ruleStore.current.value = index;
  router.to(Pages.Edit);
}

function add() {
  ruleStore.current.value = ruleStore.add({ name: '', url: '', response: {}, contains: true, enable: true });
  router.to(Pages.Edit);
}

function showAll() {
  console.log(ruleStore.rules.value);
}

const [recordVisible, toggleRecord] = useToggle(false);

function addRecord(url: string, response: any) {
  ruleStore.current.value = ruleStore.add({ name: '', url, response, contains: true, enable: true });
  router.to(Pages.Edit);
}
</script>

<template>
  <div class="rules">
    <div class="margin button" @click="add">添加新规则</div>
    <div class="margin buttons">
      <div class="button" @click="showAll">控制台输出所有规则</div>
      <div class="button" @click="toggleRecord()">{{ recordVisible ? '隐藏请求记录' : '查看请求记录' }}</div>
    </div>
    <div v-if="recordVisible" class="record">
      <div class="list">
        <RuleItem
          v-for="(rule, i) in ruleStore.record.values()"
          :key="i"
          :index="i"
          :name="rule.name"
          :url="rule.url"
          :contains="rule.contains"
          :enable="rule.enable"
          @click="addRecord(rule.url as string, rule.response)"
          style="margin-bottom: 0.5em"
          type="record"
        />
      </div>
    </div>
    <div class="list" v-if="ruleStore.rules.value.length">
      <RuleItem
        v-for="(rule, i) in ruleStore.rules.value"
        :key="i"
        :index="i"
        :name="rule.name"
        :url="rule.url"
        :contains="rule.contains"
        :enable="rule.enable"
        @click="toEdit(i)"
        style="margin-bottom: 0.5em"
      />
    </div>
    <div class="empty" v-else>啥都没</div>
  </div>
</template>

<style scoped>
.rules {
  height: 100%;
  padding: 0.8em 0;
  overflow-y: auto;
}

.margin {
  margin: 0 0.7em 0.7em;
}

.list {
  margin-top: 1em;
}

.empty {
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
}
</style>
