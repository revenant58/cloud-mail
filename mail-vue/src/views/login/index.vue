<template>
  <div id="login-box" :style="background ? 'background: var(--el-bg-color)' : ''" v-loading="oauthLoading" element-loading-text="登录中...">
    <div v-if="background" :style="background"></div>
    <div class="form-wrapper">
      <div class="container">
        <div class="form-header">
          <div class="logo-icon">
            <Icon icon="mingcute:mail-line" width="30" height="30" />
          </div>
          <span class="form-title">{{ settingStore.settings.title }}</span>
          <span class="form-desc" v-if="show === 'login'">{{ $t('loginTitle') }}</span>
          <span class="form-desc" v-else>{{ $t('regTitle') }}</span>
        </div>

        <!-- Login Form -->
        <div v-show="show === 'login'" class="form-body">
          <label class="input-label">{{ $t('emailAccount') }}</label>
          <div class="input-group">
            <el-input :class="!hideLoginDomain ? 'email-input' : ''" v-model="form.email"
                      type="text" :placeholder="$t('emailAccount')" autocomplete="off">
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
                  <div class="domain-suffix">
                    <span>{{ suffix }}</span>
                    <Icon class="setting-icon" icon="mingcute:down-small-fill" width="18" height="18"/>
                  </div>
                </div>
              </template>
            </el-input>
          </div>
          <label class="input-label">{{ $t('password') }}</label>
          <div class="input-group">
            <el-input v-model="form.password" :placeholder="$t('password')" type="password" autocomplete="off">
              <template #prefix>
                <Icon class="input-icon" icon="mingcute:lock-line" width="18" height="18" />
              </template>
            </el-input>
          </div>
          <el-button class="btn btn-primary" type="primary" @click="submit" :loading="loginLoading"
          >{{ $t('loginBtn') }}
          </el-button>
          <el-button class="btn btn-oauth" v-if="settingStore.settings.linuxdoSwitch" @click="linuxDoLogin">
            <el-avatar src="/image/linuxdo.webp" :size="18" style="margin-right: 10px" />LinuxDo
          </el-button>
        </div>

        <!-- Register Form -->
        <div v-show="show !== 'login'" class="form-body">
          <label class="input-label">{{ $t('emailAccount') }}</label>
          <div class="input-group">
            <el-input :class="!hideLoginDomain ? 'email-input' : ''" v-model="registerForm.email" type="text" :placeholder="$t('emailAccount')"
                      autocomplete="off">
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
                  <div class="domain-suffix">
                    <span>{{ suffix }}</span>
                    <Icon class="setting-icon" icon="mingcute:down-small-fill" width="18" height="18"/>
                  </div>
                </div>
              </template>
            </el-input>
          </div>
          <label class="input-label">{{ $t('password') }}</label>
          <div class="input-group">
            <el-input v-model="registerForm.password" :placeholder="$t('password')" type="password" autocomplete="off">
              <template #prefix>
                <Icon class="input-icon" icon="mingcute:lock-line" width="18" height="18" />
              </template>
            </el-input>
          </div>
          <label class="input-label">{{ $t('confirmPwd') }}</label>
          <div class="input-group">
            <el-input v-model="registerForm.confirmPassword" :placeholder="$t('confirmPwd')" type="password"
                      autocomplete="off">
              <template #prefix>
                <Icon class="input-icon" icon="mingcute:lock-2-line" width="18" height="18" />
              </template>
            </el-input>
          </div>
          <div class="input-group" v-if="settingStore.settings.regKey === 0">
            <el-input v-model="registerForm.code" :placeholder="$t('regKey')"
                      type="text" autocomplete="off">
              <template #prefix>
                <Icon class="input-icon" icon="mingcute:key-line" width="18" height="18" />
              </template>
            </el-input>
          </div>
          <div class="input-group" v-if="settingStore.settings.regKey === 2">
            <el-input v-model="registerForm.code"
                      :placeholder="$t('regKeyOptional')" type="text" autocomplete="off">
              <template #prefix>
                <Icon class="input-icon" icon="mingcute:key-line" width="18" height="18" />
              </template>
            </el-input>
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
          <el-button class="btn btn-primary" style="margin: 0" type="primary" @click="submitRegister" :loading="registerLoading"
          >{{ $t('regBtn') }}
          </el-button>
          <el-button v-if="settingStore.settings.linuxdoSwitch" class="btn btn-oauth" @click="linuxDoLogin">
            <el-avatar src="/image/linuxdo.webp" :size="18" style="margin-right: 10px" />LinuxDo
          </el-button>
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
        <el-button class="btn btn-primary" type="primary" @click="bind" :loading="bindLoading"
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
   LOGIN PAGE â€” Premium v3 Design System
   460px card, 16px radius, glint shadows,
   staggered animations, deep dark mode
   ============================================ */

:root {
  /* Background tokens */
  --ds-neutral-primary-soft: #FFFFFF;
  --ds-neutral-secondary-soft: #F9FAFB;
  --ds-neutral-secondary-medium: #F9FAFB;
  --ds-disabled: #F3F4F6;

  /* Brand tokens */
  --ds-brand: #1447E6;
  --ds-brand-strong: #193CB8;
  --ds-brand-medium: #BEDBFF;
  --ds-brand-softer: #EEF6FF;
  --ds-brand-soft: #DBEAFE;

  /* Text tokens */
  --ds-heading: #111827;
  --ds-body: #4B5563;
  --ds-body-subtle: #6B7280;
  --ds-white: #FFFFFF;
  --ds-fg-brand: #1447E6;
  --ds-fg-disabled: #9CA3AF;

  /* Border tokens */
  --ds-border-default: #E5E7EB;
  --ds-border-default-medium: #E5E7EB;
  --ds-border-default-strong: #E5E7EB;
  --ds-border-brand: #1447E6;

  /* Shadow tokens */
  --ds-shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --ds-shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --ds-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --ds-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* Button glint tokens */
  --ds-color-1-400: rgba(255, 255, 255, 0.25);
  --ds-color-1-700: rgba(0, 0, 0, 0.12);

  /* Radius tokens */
  --ds-radius-base: 8px;
  --ds-radius-lg: 12px;
  --ds-radius-xl: 16px;
  --ds-radius-sm: 4px;

  /* Status tokens */
  --ds-danger: #C70036;

  /* Page background token */
  --ds-bg-page: #F9FAFB;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --ds-neutral-primary-soft: #1A2332;
    --ds-neutral-secondary-soft: #101828;
    --ds-neutral-secondary-medium: #1E2939;
    --ds-disabled: #1F2937;

    --ds-brand: #155DFC;
    --ds-brand-strong: #1447E6;
    --ds-brand-medium: #1C398E;
    --ds-brand-softer: #162455;
    --ds-brand-soft: #1C398E;

    --ds-heading: #FFFFFF;
    --ds-body: #9CA3AF;
    --ds-body-subtle: #9CA3AF;
    --ds-white: #FFFFFF;
    --ds-fg-brand: #51A2FF;
    --ds-fg-disabled: #6B7280;

    --ds-border-default: transparent;
    --ds-border-default-medium: #374151;
    --ds-border-default-strong: #4B5563;
    --ds-border-brand: #51A2FF;

    --ds-color-1-400: rgba(255, 255, 255, 0.12);
    --ds-color-1-700: rgba(0, 0, 0, 0.25);

    --ds-bg-page: #080E1A;
  }
}

.form-wrapper {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--ds-bg-page);
  transition: background-color 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.container {
  background: var(--ds-neutral-primary-soft);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 460px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  border-radius: var(--ds-radius-xl);
  border: 1px solid var(--ds-border-default);
  box-shadow: var(--ds-shadow-lg);
  animation: cardEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (max-width: 480px) {
    padding: 24px;
    width: 100%;
    max-height: 92vh;
    border-radius: var(--ds-radius-base);
  }

  .form-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .logo-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: var(--ds-radius-xl);
    background: var(--ds-brand-softer);
    color: var(--ds-brand);
    margin-bottom: 24px;
    transition: all 0.25s ease;
    box-shadow: var(--ds-shadow-sm);

    &:hover {
      background: var(--ds-brand-soft);
      transform: translateY(-2px);
      box-shadow: var(--ds-shadow-md);
    }
  }

  .form-title {
    display: block;
    font-weight: 700;
    font-size: 24px !important;
    letter-spacing: -0.3px;
    line-height: 1.3;
    color: var(--ds-heading);
  }

  .form-desc {
    display: block;
    margin-top: 4px;
    color: var(--ds-body-subtle);
    font-size: 15px;
    line-height: 1.5;
  }

  .form-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: staggerIn 0.5s ease-out both;
  }

  .input-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: var(--ds-body);
    margin-bottom: 6px;
    margin-top: 8px;
    text-align: left;
  }

  .input-group {
    animation: staggerIn 0.5s ease-out both;
  }

  .btn {
    height: 46px;
    width: 100%;
    border-radius: var(--ds-radius-base);
    font-size: 15px;
    font-weight: 600;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    margin-top: 4px;
    font-family: 'Inter', sans-serif;
  }

  .btn-primary {
    background: var(--ds-brand);
    color: var(--ds-white);
    box-shadow:
      var(--ds-shadow-xs),
      inset var(--ds-color-1-400) 0 6px 0px -5px,
      var(--ds-color-1-700) 0 4px 10px -5px;

    &:hover {
      background: var(--ds-brand-strong);
      transform: translateY(-1px);
      box-shadow:
        var(--ds-shadow-xs),
        inset var(--ds-color-1-400) 0 6px 0px -5px,
        var(--ds-color-1-700) 0 4px 14px -4px;
    }

    &:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 4px var(--ds-brand-medium),
        var(--ds-shadow-xs);
    }

    &:active {
      background: var(--ds-brand-strong);
      transform: translateY(0);
      box-shadow: var(--ds-shadow-xs);
    }
  }

  .btn-oauth {
    background: var(--ds-neutral-secondary-medium);
    border: 1px solid var(--ds-border-default-medium);
    color: var(--ds-body);
    margin-top: 0;
    box-shadow:
      var(--ds-shadow-xs),
      inset var(--ds-color-1-400) 0 6px 0px -5px,
      var(--ds-color-1-700) 0 4px 10px -5px;

    &:hover {
      background: var(--ds-neutral-secondary-soft);
      color: var(--ds-heading);
      border-color: var(--ds-border-default-strong);
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 4px var(--ds-neutral-secondary-soft),
        var(--ds-shadow-xs);
    }
  }

  .switch {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--ds-border-default);
    text-align: center;
    font-size: 14px;
    color: var(--ds-body);

    span {
      color: var(--ds-fg-brand);
      cursor: pointer;
      font-weight: 500;
      transition: opacity 0.2s;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  :deep(.el-input__wrapper) {
    border-radius: var(--ds-radius-base);
    background: var(--ds-neutral-secondary-soft);
    border: 1px solid var(--ds-border-default-medium);
    box-shadow: var(--ds-shadow-xs);
    padding: 4px 14px;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--ds-border-default-strong);
    }

    &.is-focus {
      border-color: var(--ds-border-brand);
      box-shadow: 0 0 0 2px var(--ds-brand-softer);
    }
  }

  .email-input :deep(.el-input__wrapper) {
    border-radius: var(--ds-radius-base) 0 0 var(--ds-radius-base);
  }

  .el-input {
    width: 100%;

    :deep(.el-input__inner) {
      height: 46px;
      font-size: 15px;
    }

    :deep(.el-input__prefix) {
      color: var(--el-text-color-placeholder);
      display: flex;
      align-items: center;
      padding-right: 4px;
    }
  }

  .input-icon {
    opacity: 0.4;
    transition: opacity 0.2s, color 0.2s;
  }

  .el-input:focus-within .input-icon {
    opacity: 0.8;
    color: var(--ds-brand);
  }
}

.domain-suffix {
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--ds-heading);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.setting-icon {
  opacity: 0.5;
}

:deep(.el-select-dropdown__item) {
  padding: 0 10px;
}

:deep(.bind-dialog) {
  width: 400px !important;
  border-radius: var(--ds-radius-base) !important;

  @media (max-width: 440px) {
    width: calc(100% - 40px) !important;
    margin-right: 20px !important;
    margin-left: 20px !important;
  }
}

.bind-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

:deep(.el-input-group__append) {
  padding: 0 !important;
  padding-left: 10px !important;
  padding-right: 6px !important;
  background: var(--ds-neutral-secondary-soft);
  border-radius: 0 var(--ds-radius-base) var(--ds-radius-base) 0;
  border: none;
  box-shadow: none;
}

:deep(.el-button+.el-button) {
  margin: 0;
}

.register-turnstile {
  margin-bottom: 4px;
}

.select {
  position: absolute;
  right: 30px;
  width: 100px;
  opacity: 0;
  pointer-events: none;
}

#login-box {
  font: 15px/1.5 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: 1fr;
}

@keyframes cardEnter {
  0% {
    opacity: 0;
    transform: translateY(32px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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

</style>
