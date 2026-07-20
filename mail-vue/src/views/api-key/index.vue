<template>
  <div class="api-key">
    <div class="header-actions">
      <Icon class="icon" icon="ion:add-outline" width="23" height="23" @click="openCreate"/>
      <Icon class="icon" icon="ion:reload" width="18" height="18" @click="loadData"/>
    </div>

    <el-scrollbar class="scrollbar">
      <div class="loading" :class="loading ? 'loading-show' : 'loading-hide'">
        <loading v-if="!first"/>
      </div>

      <!-- Key list -->
      <div class="code-box">
        <div class="code-item" v-for="item in dataList" :key="item.api_key_id">
          <div class="code-info">
            <div class="info-left">
              <div class="info-left-item">
                <span class="code-name">{{ item.name }}</span>
                <el-tag size="small" :type="item.status === 0 ? 'success' : 'danger'" style="margin-left:8px">
                  {{ item.status === 0 ? 'Active' : 'Disabled' }}
                </el-tag>
              </div>
              <div class="info-left-item">
                <span class="code-prefix">{{ item.key_prefix }}</span>
              </div>
              <div class="info-left-item">
                <div>Scopes：</div>
                <el-tag v-for="s in parseScopes(item.scopes)" :key="s" size="small" style="margin-right:4px">{{ s }}</el-tag>
              </div>
              <div class="info-left-item" v-if="item.expireTime">
                <div>Expires：</div>
                <div>{{ item.expireTime }}</div>
              </div>
            </div>
            <div class="info-right">
              <el-dropdown class="setting">
                <Icon icon="fluent:settings-24-filled" width="21" height="21" color="#909399"/>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="toggleStatus(item)">
                      {{ item.status === 0 ? 'Disable' : 'Enable' }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="deleteKey(item)" style="color: #f56c6c">
                      Delete
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>

      <div class="empty" v-if="dataList.length === 0 && !first">
        <el-empty :image-size="120" description="No API keys found"/>
      </div>
    </el-scrollbar>

    <!-- Create dialog -->
    <el-dialog v-model="showCreate" title="Create API Key" width="500px" @closed="onDialogClosed">
      <div class="container" v-if="!createdKey">
        <el-input v-model="createForm.name" placeholder="Name (e.g. Discord Bot)"/>
        <div style="margin: 12px 0; font-size: 14px; color: #606266;">Scopes</div>
        <el-checkbox-group v-model="createForm.scopes">
          <el-checkbox value="users">Users</el-checkbox>
          <el-checkbox value="emails">Emails</el-checkbox>
          <el-checkbox value="stats">Stats</el-checkbox>
          <el-checkbox value="settings">Settings</el-checkbox>
        </el-checkbox-group>
        <el-date-picker
            v-model="createForm.expireTime"
            type="datetime"
            placeholder="Expiration (optional)"
            style="margin-top: 12px; width: 100%;"
        />
        <el-button class="btn" type="primary" @click="submitCreate" :loading="createLoading"
                   style="margin-top: 12px; width: 100%;">
          Generate Key
        </el-button>
      </div>

      <!-- Show key once -->
      <div v-else class="created-key-box">
        <el-alert
            title="API Key Generated"
            description="Copy this key now. It will NOT be shown again."
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 16px;"
        />
        <div class="created-key">
          <code>{{ createdKey }}</code>
        </div>
        <el-button type="primary" @click="copyKey" style="margin-top: 12px; width: 100%;">
          Copy to Clipboard
        </el-button>
        <el-button style="margin-top: 8px; width: 100%;" @click="showCreate = false; createdKey = ''">
          Close
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, nextTick} from 'vue';
import {Icon} from '@iconify/vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {apiKeyList, apiKeyCreate, apiKeyUpdate, apiKeyDelete} from '@/request/api-key.js';

defineOptions({name: 'api-key'});

const dataList = ref([]);
const loading = ref(false);
const first = ref(true);

// Create
const showCreate = ref(false);
const createLoading = ref(false);
const createdKey = ref('');
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
    dataList.value = res || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
    first.value = false;
  }
}

function openCreate() {
  createForm.value = {name: '', scopes: ['users', 'emails'], expireTime: null};
  createdKey.value = '';
  showCreate.value = true;
}

async function submitCreate() {
  if (!createForm.value.name) {
    ElMessage.warning('Name is required');
    return;
  }
  createLoading.value = true;
  try {
    const res = await apiKeyCreate(createForm.value);
    createdKey.value = res.apiKey;
    showCreate.value = false;
  } catch (e) {
    console.error(e);
  } finally {
    createLoading.value = false;
  }
}

function onDialogClosed() {
  createdKey.value = '';
  loadData();
}

function copyKey() {
  navigator.clipboard.writeText(createdKey.value).then(() => {
    ElMessage.success('Copied');
  });
}

async function toggleStatus(item) {
  const newStatus = item.status === 0 ? 1 : 0;
  try {
    await apiKeyUpdate({apiKeyId: item.api_key_id, status: newStatus});
    await nextTick(loadData);
  } catch (e) {
    console.error(e);
  }
}

async function deleteKey(item) {
  try {
    await ElMessageBox.confirm('This will permanently delete this API key. Continue?', 'Warning', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    });
    await apiKeyDelete(item.api_key_id);
    await nextTick(loadData);
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
  &:hover { color: var(--el-color-primary); }
}

.scrollbar {
  flex: 1;
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
  &:hover { border-color: var(--el-color-primary-light-5); }
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
}

.loading-show { opacity: 1; }
.loading-hide { opacity: 0; pointer-events: none; }

.empty {
  display: flex;
  justify-content: center;
  padding-top: 60px;
}

@media (max-width: 767px) {
  .code-info { flex-direction: column; align-items: flex-start; gap: 8px; }
  .info-right { align-self: flex-end; }
}
</style>
