<template>
  <div id="login-box" :style=" background ? 'background: var(--el-bg-color)' : ''" v-loading="oauthLoading" element-loading-text="登录中...">
    <div class="mesh-bg" v-if="!settingStore.settings.background">
      <div class="mesh-orb orb-1"></div>
      <div class="mesh-orb orb-2"></div>
      <div class="mesh-orb orb-3"></div>
      <div class="mesh-orb orb-4"></div>
      <div class="mesh-orb orb-5"></div>
    </div>
    <div v-else :style="background"></div>
    <div class="form-wrapper">
      <div class="container">
        <div class="form-header">
          <div class="logo-icon">
            <Icon icon="mingcute:mail-line" width="32" height="32" />
          </div>
          <span class="form-title">{{ settingStore.settings.title }}</span>
          <span class="form-desc" v-if="show === 'login'">{{ $t('loginTitle') }}</span>
          <span class="form-desc" v-else>{{ $t('regTitle') }}</span>
        </div>
        <div v-show="show === 'login'" class="form-body">
          <el-input :class="!hideLoginDomain ? 'email-input' : ''" v-model="form.email"
                    type="text" :placeholder="$t('emailAccount')" autocomplete="off" size="large">
            <template #prefix>
              <Icon class="input-icon" icon="mingcute:mail-2-line" width="18" height="18" />
            </template>
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
                <div style="color: var(--el-text-color-primary)">
                  <span>{{ suffix }}</span>
                  <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
                </div>
              </div>
            </template>
          </el-input>
          <el-input v-model="form.password" :placeholder="$t('password')" type="password" autocomplete="off" size="large">
            <template #prefix>
              <Icon class="input-icon" icon="mingcute:lock-line" width="18" height="18" />
            </template>
          </el-input>
          <el-button class="btn btn-gradient" type="primary" @click="submit" :loading="loginLoading"
          >{{ $t('loginBtn') }}
          </el-button>
          <el-button class="btn btn-oauth" v-if="settingStore.settings.linuxdoSwitch" @click="linuxDoLogin">
            <el-avatar src="/image/linuxdo.webp" :size="18" style="margin-right: 10px" />LinuxDo
          </el-button>
        </div>
        <div v-show="show !== 'login'" class="form-body">
          <el-input :class="!hideLoginDomain ? 'email-input' : ''" v-model="registerForm.email" type="text" :placeholder="$t('emailAccount')"
                    autocomplete="off" size="large">
            <template #prefix>
              <Icon class="input-icon" icon="mingcute:mail-2-line" width="18" height="18" />
            </template>
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
                <div>
                  <span>{{ suffix }}</span>
                  <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
                </div>
              </div>
            </template>
          </el-input>
          <el-input v-model="registerForm.password" :placeholder="$t('password')" type="password" autocomplete="off" size="large">
            <template #prefix>
              <Icon class="input-icon" icon="mingcute:lock-line" width="18" height="18" />
            </template>
          </el-input>
          <el-input v-model="registerForm.confirmPassword" :placeholder="$t('confirmPwd')" type="password"
                    autocomplete="off" size="large">
            <template #prefix>
              <Icon class="input-icon" icon="mingcute:lock-2-line" width="18" height="18" />
            </template>
          </el-input>
          <el-input v-if="settingStore.settings.regKey === 0" v-model="registerForm.code" :placeholder="$t('regKey')"
                    type="text" autocomplete="off" size="large">
            <template #prefix>
              <Icon class="input-icon" icon="mingcute:key-line" width="18" height="18" />
            </template>
          </el-input>
          <el-input v-if="settingStore.settings.regKey === 2" v-model="registerForm.code"
                    :placeholder="$t('regKeyOptional')" type="text" autocomplete="off" size="large">
            <template #prefix>
              <Icon class="input-icon" icon="mingcute:key-line" width="18" height="18" />
            </template>
          </el-input>
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
          <el-button class="btn btn-gradient" style="margin: 0" type="primary" @click="submitRegister" :loading="registerLoading"
          >{{ $t('regBtn') }}
          </el-button>
          <el-button v-if="settingStore.settings.linuxdoSwitch" class="btn btn-oauth" @click="linuxDoLogin">
            <el-avatar src="/image/linuxdo.webp" :size="18" style="margin-right: 10px" />LinuxDo
          </el-button>
        </div>
        <template v-if="settingStore.settings.register === 0">
          <div class="switch" @click="show = 'register'" v-if="show === 'login'">{{ $t('noAccount') }}
            <span>{{ $t('regSwitch') }}</span></div>
          <div class="switch" @click="show = 'login'" v-else>{{ $t('hasAccount') }} <span>{{ $t('loginSwitch') }}</span>
          </div>
        </template>
      </div>
    </div>
    <el-dialog class="bind-dialog" v-model="showBindForm"  title="注册邮箱" >
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
              <div>
                <span>{{ suffix }}</span>
                <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
              </div>
            </div>
          </template>
        </el-input>
        <el-input v-if="settingStore.settings.regKey === 0" v-model="bindForm.code" :placeholder="$t('regKey')"
                  type="text" autocomplete="off"/>
        <el-input v-if="settingStore.settings.regKey === 2" v-model="bindForm.code"
                  :placeholder="$t('regKeyOptional')" type="text" autocomplete="off"/>
        <el-button class="btn btn-gradient" type="primary" @click="bind" :loading="bindLoading"
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
   LOGIN PAGE — Premium Glassmorphism Design
   ============================================ */

.form-wrapper {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.container {
  background: v-bind(loginOpacity);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 440px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(255,255,255,0.05) inset;
  animation: cardEnter 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;

  @media (max-width: 1024px) {
    padding: 32px 28px;
    width: 400px;
  }
  @media (max-width: 767px) {
    border-radius: 20px 20px 0 0;
    padding: 32px 24px;
    max-height: 90vh;
    width: 100%;
    border-bottom: none;
    animation: cardEnterMobile 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .form-header {
    text-align: center;
    margin-bottom: 8px;
  }

  .logo-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    margin-bottom: 20px;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35);
    animation: logoPulse 3s ease-in-out infinite;
  }

  .form-title {
    display: block;
    font-weight: 700;
    font-size: 24px !important;
    letter-spacing: -0.3px;
    line-height: 1.3;
    background: linear-gradient(135deg, var(--el-text-color-primary) 0%, var(--el-text-color-secondary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .form-desc {
    display: block;
    margin-top: 8px;
    margin-bottom: 28px;
    color: var(--form-desc-color);
    font-size: 14px;
    line-height: 1.5;
  }

  .form-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    animation: staggerIn 0.5s ease-out both;
  }

  .btn {
    height: 44px;
    width: 100%;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
    margin-top: 12px;
  }

  .btn-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.35);
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -60%;
      width: 40%;
      height: 200%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
      transform: skewX(-20deg);
      animation: shimmer 3s ease-in-out infinite;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(102, 126, 234, 0.5);
      background: linear-gradient(135deg, #5a72d6 0%, #6b42a0 100%);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }
  }

  .btn-oauth {
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    color: var(--el-text-color-primary);
    margin-top: 8px;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      background: var(--el-color-primary-light-9);
    }
  }

  .switch {
    margin-top: 24px;
    text-align: center;
    font-size: 14px;
    color: var(--form-desc-color);

    span {
      color: var(--login-switch-color);
      cursor: pointer;
      font-weight: 600;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    background: var(--el-bg-color);
    box-shadow: 0 0 0 1px var(--el-border-color-lighter) inset;
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
    padding: 4px 12px;

    &:hover {
      box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px rgba(102, 126, 234, 0.12);
    }
  }

  .email-input :deep(.el-input__wrapper) {
    border-radius: 10px 0 0 10px;
    background: var(--el-bg-color);
  }

  .el-input {
    height: 44px;
    width: 100%;
    margin-bottom: 4px;

    :deep(.el-input__inner) {
      height: 42px;
      font-size: 14px;
    }

    :deep(.el-input__prefix) {
      color: var(--el-text-color-secondary);
      display: flex;
      align-items: center;
      padding-right: 6px;
    }
  }

  .input-icon {
    opacity: 0.55;
    transition: opacity 0.2s;
  }

  .el-input:focus-within .input-icon {
    opacity: 1;
    color: var(--el-color-primary);
  }
}

:deep(.el-select-dropdown__item) {
  padding: 0 10px;
}

:deep(.bind-dialog) {
  width: 400px !important;
  border-radius: 16px !important;

  @media (max-width: 440px) {
    width: calc(100% - 40px) !important;
    margin-right: 20px !important;
    margin-left: 20px !important;
  }
}

.bind-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.setting-icon {
  position: relative;
  top: 6px;
}


:deep(.el-input-group__append) {
  padding: 0 !important;
  padding-left: 10px !important;
  padding-right: 6px !important;
  background: var(--el-bg-color);
  border-radius: 0 10px 10px 0;
  border: none;
  box-shadow: none;
}

:deep(.el-button+.el-button) {
  margin: 0;
}

.register-turnstile {
  margin-bottom: 12px;
}

.select {
  position: absolute;
  right: 30px;
  width: 100px;
  opacity: 0;
  pointer-events: none;
}

.custom-style {
  margin-bottom: 10px;
}

.custom-style .el-segmented {
  --el-border-radius-base: 6px;
  width: 180px;
}


#login-box {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  font: 100% -apple-system, 'Inter', BlinkMacSystemFont, 'Segoe UI', sans-serif;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: 1fr;
}

/* ============================================
   ANIMATED MESH GRADIENT BACKGROUND
   ============================================ */

.mesh-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.mesh-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #667eea, transparent 70%);
  top: -10%;
  left: -5%;
  animation: meshMove1 12s ease-in-out infinite alternate;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #764ba2, transparent 70%);
  top: 50%;
  right: -10%;
  animation: meshMove2 15s ease-in-out infinite alternate;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #f093fb, transparent 70%);
  bottom: -15%;
  left: 30%;
  animation: meshMove3 10s ease-in-out infinite alternate;
}

.orb-4 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #4facfe, transparent 70%);
  top: 30%;
  left: 50%;
  animation: meshMove4 18s ease-in-out infinite alternate;
}

.orb-5 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, #a78bfa, transparent 70%);
  top: 10%;
  right: 20%;
  animation: meshMove5 14s ease-in-out infinite alternate;
}

@keyframes meshMove1 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(100px, 60px) scale(1.15); }
  100% { transform: translate(40px, 120px) scale(0.95); }
}

@keyframes meshMove2 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-120px, -80px) scale(1.1); }
  100% { transform: translate(-60px, 40px) scale(0.9); }
}

@keyframes meshMove3 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(80px, -60px) scale(1.2); }
  100% { transform: translate(-40px, -100px) scale(1.05); }
}

@keyframes meshMove4 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-80px, 60px) scale(0.9); }
  100% { transform: translate(60px, -40px) scale(1.15); }
}

@keyframes meshMove5 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(60px, 80px) scale(1.1); }
  100% { transform: translate(-80px, 30px) scale(0.95); }
}

@keyframes cardEnter {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
    filter: blur(8px);
  }
  60% {
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes cardEnterMobile {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes logoPulse {
  0%, 100% {
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.55);
    transform: scale(1.05);
  }
}

@keyframes shimmer {
  0% { left: -60%; }
  100% { left: 120%; }
}

@keyframes staggerIn {
  0% {
    opacity: 0;
    transform: translateY(16px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Legacy fallback */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUpMobile {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
