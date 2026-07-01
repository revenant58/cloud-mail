<template>
  <div id="login-box" :style="background ? 'background: var(--el-bg-color)' : ''" v-loading="oauthLoading" element-loading-text="Loading...">
    <div v-if="background" :style="background" class="bg-image-layer"></div>

    <!-- Login Panel -->
    <div class="login-panel">
      <div class="login-card">
        <div class="card-header">
          <h1 class="form-title">{{ settingStore.settings.title }}</h1>
          <p class="form-subtitle" v-if="show === 'login'">{{ $t('loginTitle') }}</p>
          <p class="form-subtitle" v-else>{{ $t('regTitle') }}</p>
        </div>

        <!-- Login Form -->
        <div v-show="show === 'login'" class="form-body">
          <div class="field">
            <label class="field-label">{{ $t('emailAccount') }}</label>
            <div class="field-input-wrap" :class="{ focused: emailFocused }">
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

          <div class="field">
            <label class="field-label">{{ $t('password') }}</label>
            <div class="field-input-wrap" :class="{ focused: passFocused }">
              <el-input v-model="form.password" :placeholder="$t('password')" type="password" autocomplete="off"
                        @focus="passFocused = true" @blur="passFocused = false">
              </el-input>
            </div>
          </div>

          <a class="forgot-link" href="javascript:void(0)">{{ $t('forgetPwd') }}</a>

          <button class="btn-login" @click="submit" :disabled="loginLoading">
            <span v-if="!loginLoading" class="btn-text">{{ $t('loginBtn') }} <span class="btn-arrow">&rarr;</span></span>
            <span v-else class="btn-spinner"></span>
          </button>
        </div>

        <!-- Register Form -->
        <div v-show="show !== 'login'" class="form-body">
          <div class="field">
            <label class="field-label">{{ $t('emailAccount') }}</label>
            <div class="field-input-wrap" :class="{ focused: regEmailFocused }">
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

          <div class="field">
            <label class="field-label">{{ $t('password') }}</label>
            <div class="field-input-wrap" :class="{ focused: regPassFocused }">
              <el-input v-model="registerForm.password" :placeholder="$t('password')" type="password" autocomplete="off"
                        @focus="regPassFocused = true" @blur="regPassFocused = false">
              </el-input>
            </div>
          </div>

          <div class="field">
            <label class="field-label">{{ $t('confirmPwd') }}</label>
            <div class="field-input-wrap" :class="{ focused: regConfirmFocused }">
              <el-input v-model="registerForm.confirmPassword" :placeholder="$t('confirmPwd')" type="password"
                        autocomplete="off"
                        @focus="regConfirmFocused = true" @blur="regConfirmFocused = false">
              </el-input>
            </div>
          </div>

          <div class="field" v-if="settingStore.settings.regKey === 0">
            <label class="field-label">{{ $t('regKey') }}</label>
            <div class="field-input-wrap" :class="{ focused: regCodeFocused }">
              <el-input v-model="registerForm.code" :placeholder="$t('regKey')"
                        type="text" autocomplete="off"
                        @focus="regCodeFocused = true" @blur="regCodeFocused = false">
              </el-input>
            </div>
          </div>

          <div class="field" v-if="settingStore.settings.regKey === 2">
            <label class="field-label">{{ $t('regKeyOptional') }}</label>
            <div class="field-input-wrap" :class="{ focused: regCodeFocused2 }">
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

          <button class="btn-login" @click="submitRegister" :disabled="registerLoading">
            <span v-if="!registerLoading" class="btn-text">{{ $t('regBtn') }} <span class="btn-arrow">&rarr;</span></span>
            <span v-else class="btn-spinner"></span>
          </button>
        </div>

        <!-- Switch between login/register -->
        <template v-if="settingStore.settings.register === 0">
          <div class="switch" v-if="show === 'login'">
            {{ $t('noAccount') }} <span @click="show = 'register'">{{ $t('regSwitch') }}</span>
          </div>
          <div class="switch" v-else>
            {{ $t('hasAccount') }} <span @click="show = 'login'">{{ $t('loginSwitch') }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Bind dialog -->
    <el-dialog class="bind-dialog" v-model="showBindForm" title="Register Email">
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
        >Bind
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

// Focus states
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
          message: 'Please bind an email to continue',
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
      verifyShow.value = 1
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
   LOGIN PAGE — Neobrutalism Pro
   ============================================ */

@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

#login-box {
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  position: relative;
  background: #f5f5f5;
}

.bg-image-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* ── Login Panel ── */
.login-panel {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* ── Login Card ── */
.login-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border: 3px solid #1a1a2e;
  border-radius: 20px;
  padding: 40px 36px 32px;
  box-shadow: 6px 6px 0px #1a1a2e;
  animation: cardSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
  scrollbar-width: thin;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }

  @media (max-width: 480px) {
    padding: 28px 20px 20px;
    border-radius: 16px;
    max-width: 100%;
    box-shadow: 4px 4px 0px #1a1a2e;
  }
}

@keyframes cardSlideUp {
  0% { opacity: 0; transform: translateY(20px) rotate(-1deg); }
  100% { opacity: 1; transform: translateY(0) rotate(0deg); }
}

/* ── Card Header ── */
.card-header {
  margin-bottom: 28px;
}

.form-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 32px;
  line-height: 1.1;
  color: #1a1a2e;
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
  text-transform: uppercase;
}

.form-subtitle {
  margin: 0;
  font-size: 15px;
  color: #52525b;
  font-weight: 500;
}

/* ── Form Body ── */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ── Field ── */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.field-input-wrap {
  position: relative;
  border-radius: 10px;
  border: 2.5px solid #1a1a2e;
  background: #ffffff;
  transition: box-shadow 0.12s ease, transform 0.12s ease;
  box-shadow: 3px 3px 0px #1a1a2e;

  &:hover {
    box-shadow: 4px 4px 0px #1a1a2e;
  }

  &.focused {
    box-shadow: 2px 2px 0px #1a1a2e;
    transform: translate(1px, 1px);
    background: #FFFDE7;
  }
}

:deep(.el-input) {
  width: 100%;

  .el-input__wrapper {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 0 14px !important;
    min-height: 44px;
  }

  .el-input__inner {
    height: 44px;
    font-size: 15px;
    color: #1a1a2e !important;
    background: transparent !important;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 500;

    &::placeholder {
      color: #a1a1aa !important;
      font-weight: 400;
    }
  }

  .el-input__prefix {
    display: none;
  }
}

.email-input :deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-input-group__append) {
  padding: 0 !important;
  padding-left: 8px !important;
  padding-right: 4px !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  color: #52525b !important;
}

/* ── Domain Suffix ── */
.domain-suffix {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #52525b;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.12s ease;

  &:hover {
    background: #f0f0f0;
    border-color: #1a1a2e;
  }
}

.setting-icon {
  opacity: 0.5;
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

/* ── Forgot Link ── */
.forgot-link {
  font-size: 13px;
  color: #71717a;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.12s ease;
  display: inline-block;
  margin-top: -4px;

  &:hover {
    color: #E53935;
    text-decoration: underline wavy #E53935;
    text-underline-offset: 3px;
  }
}

/* ── Login Button ── */
.btn-login {
  position: relative;
  width: 100%;
  height: 52px;
  border: 3px solid #1a1a2e;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Space Grotesk', sans-serif;
  color: #ffffff;
  cursor: pointer;
  background: #5C6BC0;
  box-shadow: 4px 4px 0px #1a1a2e;
  transition: all 0.1s ease;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.03em;

  &:hover {
    background: #7986CB;
    box-shadow: 5px 5px 0px #1a1a2e;
    transform: translate(-1px, -1px);
  }

  &:active {
    box-shadow: 2px 2px 0px #1a1a2e;
    transform: translate(2px, 2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: 3px 3px 0px #1a1a2e;
    transform: none;
  }
}

.btn-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-arrow {
  font-size: 20px;
  transition: transform 0.15s ease;

  .btn-login:hover & {
    transform: translateX(4px);
  }
}

.btn-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Switch (account link) ── */
.switch {
  margin-top: 22px;
  text-align: center;
  font-size: 14px;
  color: #71717a;
  font-weight: 500;

  span {
    color: #E53935;
    cursor: pointer;
    font-weight: 700;
    text-decoration: underline wavy #E53935;
    text-underline-offset: 3px;
    transition: all 0.12s ease;

    &:hover {
      color: #C62828;
      text-decoration-style: solid;
    }
  }
}

/* ── Bind Dialog ── */
:deep(.bind-dialog) {
  width: 400px !important;
  border-radius: 16px !important;
  background: #ffffff !important;
  border: 3px solid #1a1a2e !important;
  box-shadow: 6px 6px 0px #1a1a2e !important;

  .el-dialog__header {
    border-bottom: 3px solid #1a1a2e;
  }

  .el-dialog__title {
    color: #1a1a2e;
    font-weight: 700;
    font-family: 'Space Grotesk', sans-serif;
    text-transform: uppercase;
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

/* ── Responsive ── */
@media (max-width: 768px) {
  .login-card {
    max-width: 100%;
    margin: 0 8px;
    box-shadow: 4px 4px 0px #1a1a2e;
  }

  #login-box {
    background: #f5f5f5;
  }
}
</style>
