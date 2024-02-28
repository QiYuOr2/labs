<script setup lang="ts">
import { computed, ref } from 'vue';
import { Pages, usePageStore, useRuleStore } from '../store';

const router = usePageStore();

const ruleStore = useRuleStore();
const rule = computed(() => ruleStore.rules.value[ruleStore.current.value]);

const responseText = ref(JSON.stringify(rule.value.response, null, 2));
const isContains = ref(rule.value.contains);

function save() {
  try {
    console.log(responseText.value)
    const parsed = JSON.parse(responseText.value);
    ruleStore.set(ruleStore.current.value, { response: parsed, contains: isContains.value });
    router.to(Pages.Rules);
  } catch (error) {
    alert('JSON 格式错误');
  }
}

function back() {
  if (rule.value.name === '') {
    ruleStore.remove(ruleStore.current.value);
  }
  router.to(Pages.Rules);
}
</script>

<template>
  <div class="edit">
    <div class="buttons">
      <div class="button button--green" @click="save">保存</div>
      <div class="button" @click="back">返回</div>
    </div>
    <input type="text" v-model="rule.name" placeholder="名称" />
    <input type="text" v-model="rule.url" placeholder="URL" />
    <div class="checkbox">
      <label for="contains">包含模式</label>
      <input type="checkbox" name="contains" id="contains" v-model="isContains" />
    </div>
    <textarea v-model="responseText" rows="17" />
  </div>
</template>

<style scoped>
.edit {
  padding: 0.8em 0.7em;
}

input[type='text'],
textarea {
  box-sizing: border-box;
  margin: 0;
  background-color: #fff;
  border-color: #6b7280;
  font-size: 1em;
  line-height: 1.5em;
  display: block;
  width: 100%;
  border-radius: 0.375em;
  border-width: 0px;
  padding: 0.5em 0.875em;
  box-shadow: inset 0 0 0 0 #fff, inset 0 0 0 1px rgb(209 213 219 / 1), 0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 #0000;
  margin-bottom: 1em;
}

textarea {
  resize: none;
}


.button {
  flex: 1;
  margin-bottom: 1em;
}

.checkbox {
  padding-left: 0.2em;
  display: flex;
  align-items: center;
  gap: 0.25em;
  margin-bottom: 1em;
}
</style>
