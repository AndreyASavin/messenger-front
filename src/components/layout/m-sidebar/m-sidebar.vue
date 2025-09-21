<template>
  <aside class="app-sidebar" :class="{ 'app-sidebar-collapsed': collapsed }">
    <nav class="app-sidebar-nav">
      <ul class="app-sidebar-menu">
        <li v-for="item in navItems" :key="item.to" class="app-sidebar-item">
          <router-link
            :to="item.to"
            class="app-sidebar-link"
            :class="{ 'app-sidebar-link-active': $route.path === item.to }"
          >
            <span class="app-sidebar-icon" v-if="item.icon">{{ item.icon }}</span>
            <span class="app-sidebar-text">{{ item.text }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <button class="app-sidebar-toggle" @click="$emit('toggle')">
      {{ collapsed ? '→' : '←' }}
    </button>
  </aside>
</template>

<script setup lang="ts">
interface NavItem {
  to: string;
  text: string;
  icon?: string;
}

interface Props {
  navItems: NavItem[];
  collapsed?: boolean;
}

withDefaults(defineProps<Props>(), {
  collapsed: false
});

defineEmits<{
  (e: 'toggle'): void;
}>();
</script>

<style scoped lang="scss">

.app-sidebar {
  position: fixed;
  top: 4rem;
  left: 0;
  bottom: 0;
  width: 250px;
  background-color: white;
  border-right: 1px solid $border-color;
  transition: width 0.3s ease;
  z-index: 40;
  display: flex;
  flex-direction: column;

  &.app-sidebar-collapsed {
    width: 64px;

    .app-sidebar-text {
      opacity: 0;
      visibility: hidden;
    }
  }
}

.app-sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.app-sidebar-menu {
  list-style: none;
}

.app-sidebar-item {
  margin-bottom: 0.25rem;
}

.app-sidebar-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: $text-light;
  text-decoration: none;
  transition: all 0.2s ease;
  border-right: 3px solid transparent;

  &:hover {
    background-color: #f9fafb;
    color: $text-color;
  }

  &.app-sidebar-link-active {
    background-color: #f1f5f9;
    color: $primary-color;
    border-right-color: $primary-color;
  }
}

.app-sidebar-icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.app-sidebar-text {
  transition: all 0.3s ease;
  white-space: nowrap;
}

.app-sidebar-toggle {
  position: absolute;
  top: 50%;
  right: -1rem;
  width: 2rem;
  height: 2rem;
  background-color: white;
  border: 1px solid $border-color;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: $shadow;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9fafb;
  }
}

@media (max-width: 768px) {
  .app-sidebar {
    width: 64px;

    .app-sidebar-text {
      opacity: 0;
      visibility: hidden;
    }

    &.app-sidebar-expanded {
      width: 250px;

      .app-sidebar-text {
        opacity: 1;
        visibility: visible;
      }
    }
  }
}
</style>