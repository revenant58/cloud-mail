<template>
  <div class="api-key">
    <div class="header-actions">
      <Icon class="icon" icon="ion:add-outline" width="23" height="23" v-perm="'api-key:add'" @click="openCreate"/>
      <Icon class="icon" icon="ion:reload" width="18" height="18" @click="loadData"/>
    </div>

    <!-- FIX: Ganti el-scrollbar → div biasa dengan overflow-y: auto -->
    <!-- el-scrollbar punya internal ResizeObserver + DOM refs yang crash -->
    <!-- saat splice() memicu re-render di dalam scrollbar virtual -->
    <div class="scroll-area">

      <!-- Loading overlay -->
      <div class="loading" :class="loading ? 'loading-show' : 'loading-hide'">
        <loading v-show="!first"/>
      </div>

      <!-- Key list -->
      <div class="code-box">
        <div class="code-item" v-for="item in dataList" :key="item.apiKeyId">
          <div class="code-info">
            <div class="info-left">
              <div class="info-left-item">
                <span class="code-name">{{ item.name }}</span>
                <el-tag size="small" :type="item.status === 0 ? 'success' : 'danger'" style="margin-left:8px">
                  {{ item.status === 0 ? $t('apiKeyActive') : $t('apiKeyDisabled') }}
                </el-tag>
              </div>
              <div class="info-left-item">
                <span class="code-prefix">{{ item.keyPrefix }}</span>
              </div>
              <div class="info-left-item">
                <div>{{ $t('apiKeyScopes') }}：</div>
                <el-tag v-for="s in parseScopes(item.scopes)" :key="s" size="small" style="margin-right:4px">{{ s }}</el-tag>
              </div>
              <div class="info-left-item" v-if="item.expireTime">
                <div>{{ $t('apiKeyExpires') }}：</div>
                <div>{{ item.expireTime }}</div>
              </div>
            </div>
            <div class="info-right">
              <!-- FIX: teleported="true" (default) agar dropdown tidak nested -->
              <!-- di dalam scroll container yang bisa terpotong overflow -->
              <el-dropdown class="setting" v-if="canUpdateKey || canDeleteKey">
                <Icon icon="fluent:settings-24-filled" width="21" height="21" color="#909399"/>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="canUpdateKey" @click="toggleStatus(item)">
                      {{ item.status === 0 ? $t('apiKeyDisable') : $t('apiKeyEnable') }}
                    </el-dropdown-item>
                    <el-dropdown-item v-if="canDeleteKey" @click="deleteKey(item)" style="color: #f56c6c">
                      {{ $t('delete') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>

      <div class="empty" v-show="dataList.length === 0 && !first">
        <el-empty :image-size="120" :description="$t('apiKeyEmpty')"/>
      </div>

    </div>

    <!-- Create dialog -->
    <el-dialog
      v-model="showCreate"
      :title="$t('apiKeyCreateTitle')"
      width="500px"
      destroy-on-close
      @closed="onDialogClosed"
    >
      <div v-if="!createdKey" class="container">
        <el-input v-model="createForm.name" :placeholder="$t('apiKeyNamePlaceholder')"/>
        <div style="margin: 12px 0; font-size: 14px; color: #606266;">{{ $t('apiKeyScopes') }}</div>
        <el-checkbox-group v-model="createForm.scopes">
          <el-checkbox value="users">Users</el-checkbox>
          <el-checkbox value="emails">Emails</el-checkbox>
          <el-checkbox value="stats">Stats</el-checkbox>
        </el-checkbox-group>
        <el-date-picker
          v-model="createForm.expireTime"
          type="datetime"
          :placeholder="$t('apiKeyExpirePlaceholder')"
          style="margin-top: 12px; width: 100%;"
        />
        <el-button
          class="btn"
          type="primary"
          @click="submitCreate"
          :loading="createLoading"
          style="margin-top: 12px; width: 100%;"
        >
          {{ $t('apiKeyGenerate') }}
        </el-button>
      </div>

      <div v-else class="created-key-box">
        <el-alert
          :title="$t('apiKeyGeneratedTitle')"
          :description="$t('apiKeyGeneratedDesc')"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 16px;"
        />
        <div class="created-key">
          <code>{{ createdKey }}</code>
        </div>
        <el-button type="primary" @click="copyKey" style="margin-top: 12px; width: 100%;">
          {{ $t('apiKeyCopy') }}
        </el-button>
        <el-button style="margin-top: 8px; width: 100%;" @click="closeDialog">
          {{ $t('close') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { apiKeyList, apiKeyCreate, apiKeyUpdate, apiKeyDelete } from '@/request/api-key.js';
import { hasPerm } from '@/perm/perm.js';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'api-key' });

const { t } = useI18n();
const canUpdateKey = computed(() => hasPerm('api-key:update'));
const canDeleteKey = computed(() => hasPerm('api-key:delete'));

const dataList = ref([]);
const loading = ref(false);
const first = ref(true);

const showCreate = ref(false);
const createLoading = ref(false);
const createdKey = ref('');
const keyCreatedWithData = ref(false);

const createForm = ref({
  name: '',
  scopes: ['users', 'emails'],
  expireTime: null,
});

onMounted(() => {
  loadData();
});

function parseScopes(scopes) {
  try {
    return JSON.parse(scopes);
  } catch {
    return [];
  }
}

async function loadData() {
  loading.value = true;
  try {
    const res = await apiKeyList();
    // FIX: Ganti splice → assignment biasa
    // Splice sebelumnya memicu Vue reactive interceptor yang cascade ke
    // el-scrollbar scheduler → nextSibling crash.
    // Sekarang el-scrollbar sudah dihapus, tapi assignment lebih aman
    // dan performa Vue diff-nya sama saja karena key="item.apiKeyId" di v-for.
    dataList.value = res || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
    first.value = false;
  }
}

function openCreate() {
  createForm.value = { name: '', scopes: ['users', 'emails'], expireTime: null };
  createdKey.value = '';
  keyCreatedWithData.value = false;
  showCreate.value = true;
}

function closeDialog() {
  showCreate.value = false;
}

async function submitCreate() {
  if (!createForm.value.name.trim()) {
    ElMessage.warning(t('apiKeyNameRequired'));
    return;
  }
  if (!createForm.value.scopes.length) {
    ElMessage.warning(t('apiKeyScopeRequired'));
    return;
  }
  createLoading.value = true;
  try {
    const res = await apiKeyCreate(createForm.value);
    createdKey.value = res.apiKey;

    if (res.keyData) {
      dataList.value = [...dataList.value, res.keyData];
      keyCreatedWithData.value = true;
    } else {
      keyCreatedWithData.value = false;
    }
  } catch (e) {
    console.error(e);
  } finally {
    createLoading.value = false;
  }
}

function onDialogClosed() {
  const needReload = !keyCreatedWithData.value && !!createdKey.value;

  createdKey.value = '';
  keyCreatedWithData.value = false;
  createForm.value = { name: '', scopes: ['users', 'emails'], expireTime: null };

  if (needReload) {
    setTimeout(() => loadData(), 0);
  }
}

function copyKey() {
  navigator.clipboard.writeText(createdKey.value).then(() => {
    ElMessage.success(t('copySuccessMsg'));
  });
}

async function toggleStatus(item) {
  const newStatus = item.status === 0 ? 1 : 0;
  try {
    await apiKeyUpdate({ apiKeyId: item.apiKeyId, status: newStatus });
    // Update in-place di dalam array yang sama
    const index = dataList.value.findIndex(d => d.apiKeyId === item.apiKeyId);
    if (index !== -1) {
      dataList.value[index] = { ...dataList.value[index], status: newStatus };
    }
  } catch (e) {
    console.error(e);
  }
}

async function deleteKey(item) {
  try {
    await ElMessageBox.confirm(
      t('apiKeyDeleteConfirm'),
      t('warning'),
      {
        confirmButtonText: t('delete'),
        cancelButtonText: t('cancel'),
        type: 'warning',
      }
    );
    await apiKeyDelete(item.apiKeyId);
    setTimeout(() => {
      dataList.value = dataList.value.filter(d => d.apiKeyId !== item.apiKeyId);
    }, 300);
  } catch (e) {
    if (e !== 'cancel') console.error(e);
  }
}
</script>

<style lang="scss" scoped>
.api-key {
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.icon {
  cursor: pointer;
  color: var(--el-text-color-regular);
  transition: color 0.2s;

  &:hover {
    color: var(--el-color-primary);
  }
}

/* FIX: Ganti .scrollbar (el-scrollbar) → .scroll-area (div biasa) */
.scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;

  /* Scrollbar styling native agar tetap konsisten dengan design */
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--el-border-color);
    border-radius: 3px;
  }
}

.code-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.code-item {
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
  }
}

.code-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-left-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.code-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.code-prefix {
  font-family: monospace;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.created-key-box {
  display: flex;
  flex-direction: column;
}

.created-key {
  background: var(--el-fill-color-light);
  padding: 12px;
  border-radius: 6px;
  word-break: break-all;

  code {
    font-size: 13px;
    color: var(--el-color-success);
  }
}

.loading {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  padding-top: 80px;
  z-index: 1;
  background: transparent;
  transition: opacity 0.3s;
  pointer-events: none;
}

.loading-show {
  opacity: 1;
}

.loading-hide {
  opacity: 0;
}

.empty {
  display: flex;
  justify-content: center;
  padding-top: 60px;
}

@media (max-width: 767px) {
  .code-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .info-right {
    align-self: flex-end;
  }
}
</style>