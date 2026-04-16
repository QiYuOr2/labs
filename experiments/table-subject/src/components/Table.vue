<script setup lang="tsx" generic="T">
import IconFilter from './icons/IconFilter.vue'

interface ColumnOption {
  name: string
  key: string
  cellWidth: string
  filterable?: boolean
  onClick?: (e: MouseEvent) => void
}

defineProps<{
  columns: ColumnOption[]
  data: T[]
}>()
</script>

<template>
  <table>
    <thead>
      <tr>
        <th
          v-for="col in columns" :key="col.key" :class="{ filterable: col.filterable }"
          @click.stop="(e) => col.onClick?.(e)"
        >
          <div class="cell" :style="{ width: col.cellWidth }">
            {{ col.name }}
            <IconFilter v-if="col.filterable" class="icon" />
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, i) in data" :key="i">
        <td v-for="col in columns" :key="col.key">
          <div class="cell" :style="{ width: col.cellWidth }">
            {{ item[col.key as keyof typeof data[0]] }}
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  border-radius: var(--radius);
  border: 1px solid var(--table-border-color);
  background: var(--table-bg-color);
  border-collapse: collapse;
  border-style: hidden;
  box-shadow: 0 0 0 1px var(--table-border-color);
}

th,
td {
  padding: 0;
  border: 1px solid var(--table-border-color);
  text-align: center;
  letter-spacing: 2px;
  font-weight: 400;
}

.cell {
  height: 40px;
  margin: 0 40px;
  line-height: 40px;
}

th .cell {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 2px;
  color: var(--table-title-text-color);
}

th.filterable {
  cursor: pointer;
}
th.filterable {
  position: relative;
}

th.filterable::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

th .icon {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  transition: color 0.3s;
}

th:hover .icon {
  color: white;
  transition: color 0.3s;
}

td {
  box-sizing: border-box;
  color: var(--table-cell-text-color);
}

th:first-child .cell,
td:first-child .cell {
  text-align: left;
  margin: 0;
  padding-left: 20px;
  width: 120px;
  justify-content: flex-start;
}
</style>
