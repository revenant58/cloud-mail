<template>
  <div id="login-box" :style="background ? 'background: var(--el-bg-color)' : ''" v-loading="oauthLoading" element-loading-text="登录中...">
    <div v-if="background" :style="background" class="bg-image-layer"></div>

    <!-- Aurora Background -->
    <div class="aurora-bg">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>

    <!-- Login Panel -->
    <div class="login-panel">
      <div class="glass-card">
        <div class="card-header">
          <div class="logo-wrap">
            <Icon class="logo-icon" icon="mingcute:mail-line" width="28" height="28" />
          </div>
          <h1 class="form-title">{{ settingStore.settings.title }}</h1>
          <p class="form-desc" v-if="show === 'login'">{{ $t('loginTitle') }}</p>
          <p class="form-desc" v-else>{{ $t('regTitle') }}</p>
        </div>

        <!-- Login Form -->
        <div v-show="show === 'login'" class="form-body">
          <div class="input-wrap" :class="{ focused: emailFocused }">
            <label class="floating-label">{{ $t('emailAccount') }}</label>
            <div class="input-row">
              <Icon class="input-icon" icon="mingcute:mail-2-line" width="18" height="18" />
              <el-input :class="!hideLoginDomain ? 'email-input' : ''" v-model="form.email"
                        type="text" :placeholder="$t('emailAccount')" autocomplete="off"
                        @focus="emailFocused = true" @blur="emailFocused = false">
                <template #append v-if="!hideLoginDomain">
                  <div @click.stop="openSelect">
                    <el-select
                        v-if="show === 'login'"
                        ref="mySelect"
                        v-model="suffix"
                        :placeholder="$t('select')"
                        class="select"
                    >
                      <el-option
                          v-for="item in domainList"
                          :key="item"
                          :label="item"
                          :value="item"
                      />
                    </el-select>
                    <div class="domain-suffix">
                      <span>{{ suffix }}</span>
                      <Icon class="setting-icon" icon="mingcute:down-small-fill" width="18" height="18"/>
                    </div>
                  </div>
                </template>
              </el-input>
            </div>
          </div>

          <div class="input-wrap" :class="{ focused: passFocused }">
            <label class="floating-label">{{ $t('password') }}</label>
            <div class="input-row">
              <Icon class="input-icon" icon="mingcute:lock-line" width="18" height="18" />
              <el-input v-model="form.password" :placeholder="$t('password')" type="password" autocomplete="off"
                        @focus="passFocused = true" @blur="passFocused = false">
              </el-input>
            </div>
          </div>

          <button class="btn-primary" @click="submit" :disabled="loginLoading">
            <span v-if="!loginLoading">{{ $t('loginBtn') }}</span>
            <span v-else class="btn-spinner"></span>
          </button>
        </div>

        <!-- Register Form -->
        <div v-show="show !== 'login'" class="form-body">
          <div class="input-wrap" :class="{ focused: regEmailFocused }">
            <label class="floating-label">{{ $t('emailAccount') }}</label>
            <div class="input-row">
              <Icon class="input-icon" icon="mingcute:mail-2-line" width="18" height="18" />
              <el-input :class="!hideLoginDomain ? 'email-input' : ''" v-model="registerForm.email" type="text"
                        :placeholder="$t('emailAccount')" autocomplete="off"
                        @focus="regEmailFocused = true" @blur="regEmailFocused = false">
                <template #append v-if="!hideLoginDomain">
                  <div @click.stop="openSelect">
                    <el-select
                        v-if="show !== 'login'"
                        ref="mySelect"
                        v-model="suffix"
                        :placeholder="$t('select')"
                        class="select"
                    >
                      <el-option
                          v-for="item in domainList"
                          :key="item"
                          :label="item"
                          :value="item"
                      />
                    </el-select>
                    <div class="domain-suffix">
                      <span>{{ suffix }}</span>
                      <Icon class="setting-icon" icon="mingcute:down-small-fill" width="18" height="18"/>
                    </div>
                  </div>
                </template>
              </el-input>
            </div>
          </div>

          <div class="input-wrap" :class="{ focused: regPassFocused }">
            <label class="floating-label">{{ $t('password') }}</label>
            <div class="input-row">
              <Icon class="input-icon" icon="mingcute:lock-line" width="18" height="18" />
              <el-input v-model="registerForm.password" :placeholder="$t('password')" type="password" autocomplete="off"
                        @focus="regPassFocused = true" @blur="regPassFocused = false">
              </el-input>
            </div>
          </div>

          <div class="input-wrap" :class="{ focused: regConfirmFocused }">
            <label class="floating-label">{{ $t('confirmPwd') }}</label>
            <div class="input-row">
              <Icon class="input-icon" icon="mingcute:lock-2-line" width="18" height="18" />
              <el-input v-model="registerForm.confirmPassword" :placeholder="$t('confirmPwd')" type="password"
                        autocomplete="off"
                        @focus="regConfirmFocused = true" @blur="regConfirmFocused = false">
              </el-input>
            </div>
          </div>

          <div class="input-wrap" :class="{ focused: regCodeFocused }" v-if="settingStore.settings.regKey === 0">
            <label class="floating-label">{{ $t('regKey') }}</label>
            <div class="input-row">
              <Icon class="input-icon" icon="mingcute:key-line" width="18" height="18" />
              <el-input v-model="registerForm.code" :placeholder="$t('regKey')"
                        type="text" autocomplete="off"
                        @focus="regCodeFocused = true" @blur="regCodeFocused = false">
              </el-input>
            </div>
          </div>

          <div class="input-wrap" :class="{ focused: regCodeFocused2 }" v-if="settingStore.settings.regKey === 2">
            <label class="floating-label">{{ $t('regKeyOptional') }}</label>
            <div class="input-row">
              <Icon class="input-icon" icon="mingcute:key-line" width="18" height="18" />
              <el-input v-model="registerForm.code"
                        :placeholder="$t('regKeyOptional')" type="text" autocomplete="off"
                        @focus="regCodeFocused2 = true" @blur="regCodeFocused2 = false">
              </el-input>
            </div>
          </div>

          <div v-show="verifyShow"
               class="register-turnstile"
               :data-sitekey="settingStore.settings.siteKey"
               data-callback="onTurnstileSuccess"
               data-error-callback="onTurnstileError"
               data-after-interactive-callback="loadAfter"
               data-before-interactive-callback="loadBefore"
          >
            <span style="font-size: 12px;color: #F56C6C" v-if="botJsError">{{ $t('verifyModuleFailed') }}</span>
          </div>

          <button class="btn-primary" @click="submitRegister" :disabled="registerLoading">
            <span v-if="!registerLoading">{{ $t('regBtn') }}</span>
            <span v-else class="btn-spinner"></span>
          </button>
        </div>

        <!-- Switch between login/register -->
        <template v-if="settingStore.settings.register === 0">
          <div class="switch" @click="show = 'register'" v-if="show === 'login'">
            {{ $t('noAccount') }} <span>{{ $t('regSwitch') }}</span>
          </div>
          <div class="switch" @click="show = 'login'" v-else>
            {{ $t('hasAccount') }} <span>{{ $t('loginSwitch') }}</span>
          </div>
        </template>
      </div>

      <p class="footer-text">Cloud Mail &mdash; Serverless Email</p>
    </div>

    <!-- Bind dialog -->
    <el-dialog class="bind-dialog" v-model="showBindForm" title="注册邮箱">
      <div class="bind-container">
        <el-input :class="!hideLoginDomain ? 'email-input' : ''" v-model="bindForm.email" type="text" :placeholder="$t('emailAccount')" autocomplete="off">
          <template #append v-if="!hideLoginDomain">
            <div @click.stop="openSelect">
              <el-select
                  ref="mySelect"
                  v-model="suffix"
                  :placeholder="$t('select')"
                  class="select"
              >
                <el-option
                    v-for="item in domainList"
                    :key="item"
                    :label="item"
                    :value="item"
                />
              </el-select>
              <div class="domain-suffix">
                <span>{{ suffix }}</span>
                <Icon class="setting-icon" icon="mingcute:down-small-fill" width="18" height="18"/>
              </div>
            </div>
          </template>
        </el-input>
        <el-input v-if="settingStore.settings.regKey === 0" v-model="bindForm.code" :placeholder="$t('regKey')"
                  type="text" autocomplete="off"/>
        <el-input v-if="settingStore.settings.regKey === 2" v-model="bindForm.code"
                  :placeholder="$t('regKeyOptional')" type="text" autocomplete="off"/>
        <el-button class="btn-gradient" type="primary" @click="bind" :loading="bindLoading"
        >绑定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import router from "@/router";
import {computed, nextTick, reactive, ref} from "vue";
import {login} from "@/request/login.js";
import {register} from "@/request/login.js";
import {websiteConfig} from "@/request/setting.js";
import {isEmail} from "@/utils/verify-utils.js";
import {useSettingStore} from "@/store/setting.js";
import {useAccountStore} from "@/store/account.js";
import {useUserStore} from "@/store/user.js";
import {useUiStore} from "@/store/ui.js";
import {Icon} from "@iconify/vue";
import {cvtR2Url} from "@/utils/convert.js";
import {loginUserInfo} from "@/request/my.js";
import {permsToRouter} from "@/perm/perm.js";
import {useI18n} from "vue-i18n";
import {oauthBindUser, oauthLinuxDoLogin} from "@/request/ouath.js";

const {t} = useI18n();
const accountStore = useAccountStore();
const userStore = useUserStore();
const uiStore = useUiStore();
const settingStore = useSettingStore();
const loginLoading = ref(false)
const bindLoading = ref(false)
const oauthLoading = ref(false);
const showBindForm = ref(false);
const show = ref('login')

// Focus states for floating labels
const emailFocused = ref(false)
const passFocused = ref(false)
const regEmailFocused = ref(false)
const regPassFocused = ref(false)
const regConfirmFocused = ref(false)
const regCodeFocused = ref(false)
const regCodeFocused2 = ref(false)

const bindForm = reactive({
  email: '',
  oauthUserId: '',
  code: ''
})

const form = reactive({
  email: '',
  password: '',

});
const mySelect = ref()
const suffix = ref('')
const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  code: null
})
const domainList = settingStore.domainList;
const registerLoading = ref(false)
suffix.value = domainList[0]
const verifyShow = ref(false)
let verifyToken = ''
let turnstileId = null
let botJsError = ref(false)
let verifyErrorCount = 0

window.onTurnstileSuccess = (token) => {
  verifyToken = token;
};

window.onTurnstileError = (e) => {
  if (verifyErrorCount >= 4) {
    return
  }
  verifyErrorCount++
  console.warn('人机验加载失败', e)
  setTimeout(() => {
    nextTick(() => {
      if (!turnstileId) {
        turnstileId = window.turnstile.render('.register-turnstile')
      } else {
        window.turnstile.reset(turnstileId);
      }
    })
  }, 1500)
};

window.loadAfter = (e) => {
  console.log('loadAfter')
}

window.loadBefore = (e) => {
  console.log('loadBefore')
}

const loginOpacity = computed(() => {
  const opacity = settingStore.settings.loginOpacity
  return uiStore.dark ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`
})

const hideLoginDomain = computed(() => settingStore.settings.loginDomain === 1)

const background = computed(() => {

  return settingStore.settings.background ? {
    'background-image': `url(${cvtR2Url(settingStore.settings.background)})`,
    'background-repeat': 'no-repeat',
    'background-size': 'cover',
    'background-position': 'center'
  } : ''
})

const openSelect = () => {
  mySelect.value.toggleMenu()
}

const getFullEmail = (email) => {
  return hideLoginDomain.value ? email : email + suffix.value
}

const getEmailName = (email) => {
  return email.split('@')[0]
}

function linuxDoLogin() {
  const clientId = settingStore.settings.linuxdoClientId
  const redirectUri = encodeURIComponent(settingStore.settings.linuxdoCallbackUrl)
  window.location.href =
      `https://connect.linux.do/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid+profile+email`
}

linuxDoGetUser();

async function linuxDoGetUser() {

  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (code) {

    oauthLoading.value = true
    oauthLinuxDoLogin(code).then(data => {

      bindForm.oauthUserId = data.userInfo.oauthUserId;

      if (!data.token) {
        showBindForm.value = true
        oauthLoading.value = false
        ElMessage({
          message: '请注册绑定一个邮箱',
          type: 'warning',
          duration: 4000,
          plain: true,
        })
        return;
      }

      saveToken(data.token);
    }).catch(() => {
      oauthLoading.value = false
    })
  }

  const cleanUrl = window.location.origin + window.location.pathname
  window.history.replaceState({}, '', cleanUrl)
}

function bind() {

  if (!bindForm.email) {
    ElMessage({
      message: t('emptyEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }


  if (getEmailName(bindForm.email).length < settingStore.settings.minEmailPrefix) {
    ElMessage({
      message: t('minEmailPrefix', {msg: settingStore.settings.minEmailPrefix}),
      type: 'error',
      plain: true,
    })
    return
  }

  let email = getFullEmail(bindForm.email);


  if (!isEmail(email)) {
    ElMessage({
      message: t('notEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (settingStore.settings.regKey === 0) {

    if (!bindForm.code) {

      ElMessage({
        message: t('emptyRegKeyMsg'),
        type: 'error',
        plain: true,
      })
      return
    }

  }

  const form = {email, oauthUserId: bindForm.oauthUserId, code: bindForm.code}

  bindLoading.value = true
  oauthBindUser(form).then(data => {
    saveToken(data.token)
  }).catch(() => {
    bindLoading.value = false
  })
}

const submit = () => {

  if (!form.email) {
    ElMessage({
      message: t('emptyEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  let email = getFullEmail(form.email);

  if (!isEmail(email)) {
    ElMessage({
      message: t('notEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (!form.password) {
    ElMessage({
      message: t('emptyPwdMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  loginLoading.value = true
  login(email, form.password).then(async data => {
    await saveToken(data.token)
  }).finally(() => {
    loginLoading.value = false
  })
}

async function saveToken(token) {
  localStorage.setItem('token', token)
  refreshWebsiteConfig()
  const user = await loginUserInfo();
  accountStore.currentAccountId = user.account.accountId;
  accountStore.currentAccount = user.account;
  userStore.user = user;
  const routers = permsToRouter(user.permKeys);
  routers.forEach(routerData => {
    router.addRoute('layout', routerData);
  });
  await router.replace({name: 'layout'})
  uiStore.showNotice()
  oauthLoading.value = false;
  bindLoading.value = false;
}

function refreshWebsiteConfig() {
  websiteConfig().then(setting => {
    settingStore.settings = setting
    settingStore.domainList = setting.domainList
    if (!suffix.value && setting.domainList.length > 0) {
      suffix.value = setting.domainList[0]
    }
    document.title = setting.title
  }).catch(e => {
    console.error(e)
  })
}


function submitRegister() {

  if (!registerForm.email) {
    ElMessage({
      message: t('emptyEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  console.log(registerForm.email)

  if (getEmailName(registerForm.email).length < settingStore.settings.minEmailPrefix) {
    ElMessage({
      message: t('minEmailPrefix', {msg: settingStore.settings.minEmailPrefix}),
      type: 'error',
      plain: true,
    })
    return
  }

  const email = getFullEmail(registerForm.email);

  if (!isEmail(email)) {
    ElMessage({
      message: t('notEmailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (!registerForm.password) {
    ElMessage({
      message: t('emptyPwdMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (registerForm.password.length < 6) {
    ElMessage({
      message: t('pwdLengthMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {

    ElMessage({
      message: t('confirmPwdFailMsg'),
      type: 'error',
      plain: true,
    })
    return
  }

  if (settingStore.settings.regKey === 0) {

    if (!registerForm.code) {

      ElMessage({
        message: t('emptyRegKeyMsg'),
        type: 'error',
        plain: true,
      })
      return
    }

  }

  if (!verifyToken && (settingStore.settings.registerVerify === 0 || (settingStore.settings.registerVerify === 2 && settingStore.settings.regVerifyOpen))) {
    if (!verifyShow.value) {
      verifyShow.value = true
      nextTick(() => {
        if (!turnstileId) {
          try {
            turnstileId = window.turnstile.render('.register-turnstile')
          } catch (e) {
            botJsError.value = true
            console.log('人机验证js加载失败')
          }
        } else {
          window.turnstile.reset('.register-turnstile')
        }
      })
    } else if (!botJsError.value) {
      ElMessage({
        message: t('botVerifyMsg'),
        type: "error",
        plain: true
      })
    }
    return;
  }

  registerLoading.value = true

  const form = {
    email,
    password: registerForm.password,
    token: verifyToken,
    code: registerForm.code
  }

  register(form).then(({regVerifyOpen}) => {
    show.value = 'login'
    registerForm.email = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    registerForm.code = ''
    registerLoading.value = false
    verifyToken = ''
    settingStore.settings.regVerifyOpen = regVerifyOpen
    verifyShow.value = false
    ElMessage({
      message: t('regSuccessMsg'),
      type: 'success',
      plain: true,
    })
  }).catch(res => {

    registerLoading.value = false

    if (res.code === 400) {
      verifyToken = ''
      settingStore.settings.regVerifyOpen = true
      if (turnstileId) {
        window.turnstile.reset(turnstileId)
      } else {
        nextTick(() => {
          turnstileId = window.turnstile.render('.register-turnstile')
        })
      }
      verifyShow.value = true

    }
  });
}

</script>


<style>
.el-select-dropdown__item {
  padding: 0 15px;
}

.no-autofill-pwd {
  .el-input__inner {
    -webkit-text-security: disc !important;
  }
}
</style>

<style lang="scss" scoped>

/* ============================================
   LOGIN PAGE — Clean Minimal
   ============================================ */

#login-box {
  font: 14px/1.5 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  position: relative;
  background: #0c0c1d;
}

.bg-image-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* ── Background ── */
.aurora-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: #0c0c1d;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.35;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: #633cff;
  top: -20%;
  left: -10%;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: #00b4d8;
  bottom: -20%;
  right: -5%;
}

/* ── Login Panel ── */
.login-panel {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* ── Glass Card ── */
.glass-card {
  width: 100%;
  max-width: 400px;
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 44px 36px 36px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
  animation: cardFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

  @media (max-width: 480px) {
    padding: 32px 24px 28px;
    max-height: 92vh;
    border-radius: 16px;
  }
}

@keyframes cardFadeIn {
  0% { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* ── Card Header ── */
.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(99, 60, 255, 0.15);
  border: 1px solid rgba(99, 60, 255, 0.2);
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(99, 60, 255, 0.25);
    border-color: rgba(99, 60, 255, 0.35);
  }
}

.logo-icon {
  color: #a78bfa;
}

.form-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -0.3px;
  color: #ffffff;
  margin: 0;
}

.form-desc {
  display: block;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 14px;
  font-weight: 400;
}

/* ── Form Body ── */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Input ── */
.input-wrap {
  position: relative;

  .floating-label {
    position: absolute;
    top: 14px;
    left: 44px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.3);
    pointer-events: none;
    transition: all 0.2s ease;
    transform-origin: left center;
    font-weight: 500;
    z-index: 2;
  }

  &.focused .floating-label,
  &:has(.el-input:focus-within) .floating-label {
    top: -8px;
    left: 12px;
    font-size: 11px;
    color: rgba(0, 210, 211, 0.8);
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 0 14px;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba(255, 255, 255, 0.1);
    }

    .focused &,
    &:focus-within {
      border-color: rgba(0, 210, 211, 0.4);
      background: rgba(255, 255, 255, 0.06);
    }
  }

  .input-icon {
    color: rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
    transition: color 0.2s ease;
    z-index: 1;
  }

  &.focused .input-icon,
  &:has(.el-input:focus-within) .input-icon {
    color: rgba(0, 210, 211, 0.7);
  }
}

:deep(.el-input) {
  flex: 1;
  width: 100%;

  .el-input__wrapper {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    min-height: 46px;
  }

  .el-input__inner {
    height: 46px;
    font-size: 14px;
    color: #ffffff !important;
    background: transparent !important;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 500;

    &::placeholder {
      color: rgba(255, 255, 255, 0.2) !important;
    }
  }

  .el-input__prefix {
    display: none;
  }
}

:deep(.el-input-group__append) {
  padding: 0 !important;
  padding-left: 8px !important;
  padding-right: 4px !important;
  background: rgba(255, 255, 255, 0.04) !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  color: rgba(255, 255, 255, 0.5) !important;
}

.email-input :deep(.el-input__wrapper) {
  border-radius: 0;
}

/* ── Primary Button ── */
.btn-primary {
  position: relative;
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #ffffff;
  cursor: pointer;
  background: #633cff;
  transition: all 0.2s ease;

  &:hover {
    background: #7c5cff;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Switch ── */
.switch {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 400;

  span {
    color: rgba(0, 210, 211, 0.85);
    cursor: pointer;
    font-weight: 600;
    transition: color 0.2s ease;

    &:hover {
      color: #00d2d3;
    }
  }
}

/* ── Domain Suffix ── */
.domain-suffix {
  display: flex;
  align-items: center;
  gap: 2px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.8);
  }
}

.setting-icon {
  opacity: 0.4;
}

:deep(.el-select-dropdown__item) {
  padding: 0 10px;
}

.select {
  position: absolute;
  right: 30px;
  width: 100px;
  opacity: 0;
  pointer-events: none;
}

/* ── Bind Dialog ── */
:deep(.bind-dialog) {
  width: 400px !important;
  border-radius: 16px !important;
  background: rgba(16, 16, 36, 0.95) !important;
  backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;

  .el-dialog__header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .el-dialog__title {
    color: #ffffff;
    font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  @media (max-width: 440px) {
    width: calc(100% - 40px) !important;
    margin-right: 20px !important;
    margin-left: 20px !important;
  }
}

.bind-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding-top: 12px;
}

/* ── Register Turnstile ── */
.register-turnstile {
  margin-bottom: 4px;
}

/* ── Footer ── */
.footer-text {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.1);
  font-weight: 500;
  letter-spacing: 0.5px;
}

:deep(.el-button + .el-button) {
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .orb { opacity: 0.2; }
  .glass-card { max-width: 100%; margin: 0 8px; }
}
</style>
