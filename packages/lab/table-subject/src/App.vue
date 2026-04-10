<script setup lang="ts">
import { computed, ref } from 'vue'
import DropDown from './components/DropDown.vue'
import IconSearch from './components/icons/IconSearch.vue'
import Tab from './components/Tab.vue'
import Table from './components/Table.vue'
import Tabs from './components/Tabs.vue'

const dropdownVisible = ref(false)
const dropdwonTarget = ref({ x: 0, y: 0 })

const columnsOptions = [
  { name: '名称', key: 'name', cellWidth: '120px' },
  {
    name: '类型',
    key: 'type',
    cellWidth: '130px',
    filterable: true,
    onClick: (e: MouseEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect()

      dropdwonTarget.value = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }

      dropdownVisible.value = true
    },
  },
  { name: '联系方式', key: 'phone', cellWidth: '162px', filterable: true },
]

const data = ref([
  { name: '整数001', type: 'AAAA', phone: '10887388928' },
  { name: '整数002', type: 'BBBB', phone: '10887388928' },
  { name: '整数003', type: 'CCCC', phone: '10887388928' },
  { name: '整数004', type: 'DDDD', phone: '10887388928' },
])

const typeFilterList = computed(() => {
  const set = new Set<string>()
  data.value.forEach(item => set.add(item.type))
  return Array.from(set)
})
</script>

<template>
  <div class="wrapper">
    <div class="wrapper__aside" />
    <div class="wrapper__main">
      <div class="title">
        Title
      </div>
      <Tabs>
        <Tab label="订单统计" :index="0">
          <Table :columns="columnsOptions" :data="data" />
        </Tab>
        <Tab label="订单列表" :index="1">
          <div>这里没东西</div>
        </Tab>
      </Tabs>
    </div>

    <DropDown v-model="dropdownVisible" :target-center="dropdwonTarget">
      <div class="search">
        <IconSearch class="icon" />
        <input type="text" placeholder="搜索">
      </div>

      <label v-for="item in typeFilterList" :key="item" class="check-item" :for="item">
        <input :id="item" type="checkbox" :name="item">
        <span>{{ item }}</span>
      </label>
    </DropDown>
  </div>
</template>

<style>
.wrapper {
  display: flex;
  margin: 100px auto;
  width: 736px;
  height: 407px;
}

.wrapper__aside {
  width: 80px;
  height: 100%;
  background: var(--background);
}

.wrapper__main {
  flex: 1;
  box-sizing: border-box;
  padding: 0 24px;
  background: #101010;
}

.title {
  height: 64px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  font-weight: 600;
  font-size: 20px;
  line-height: 64px;
}

.search {
  position: relative;
  margin-bottom: 8px;
}

.search .icon {
  position: absolute;
  left: 12px;
  top: 8px;
}

.search input[type="text"] {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 12px 8px 36px;
  appearance: none;
  border: 0.5px solid var(--table-border-color);
  background: transparent;
  border-radius: var(--radius-1\/2);
  outline: none;
  color: var(--text-primary);
}

.search input[type="text"]::placeholder {
  letter-spacing: 2px;
}

.check-item {
  display: flex;
  align-items: center;
  height: 32px;
  padding-left: 8px;
  line-height: 32px;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 2px;
  cursor: pointer;
  user-select: none;
}

.check-item input[type='checkbox'] {
  appearance: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 13.5px;
  height: 13.5px;
  border-radius: 3px;
  margin-right: 13.25px;

  cursor: pointer;
}

.check-item input[type='checkbox']:checked::after {
  content: '✓';
  font-size: 10px;
  color: var(--text-primary);
}
</style>
