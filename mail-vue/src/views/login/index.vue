<template>
  <div id="login-box" :style="background ? 'background: var(--el-bg-color)' : ''" v-loading="oauthLoading" element-loading-text="登录中...">
    <div v-if="background" :style="background" class="bg-image-layer"></div>

    <!-- Aurora Background -->
    <div class="aurora-bg">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="aurora-mesh"></div>
      <div class="grid-overlay"></div>
    </div>

    <!-- Login Panel -->
    <div class="login-panel">
      <div class="glass-card">
        <div class="card-header">
          <div class="logo-wrap">
            <div class="logo-glow"></div>
            <Icon class="logo-icon" icon="mingcute:mail-line" width="32" height="32" />
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

          <button class="btn-gradient" @click="submit" :disabled="loginLoading">
            <span v-if="!loginLoading">{{ $t('loginBtn') }}</span>
            <span v-else class="btn-spinner"></span>
            <div class="btn-shimmer"></div>
          </button>
          <button class="btn-oauth-aurora" v-if="settingStore.settings.linuxdoSwitch" @click="linuxDoLogin">
            <img src="/image/linuxdo.webp" width="18" height="18" style="border-radius: 4px" alt="" />
            <span>LinuxDo</span>
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

          <button class="btn-gradient" style="margin: 0" @click="submitRegister" :disabled="registerLoading">
            <span v-if="!registerLoading">{{ $t('regBtn') }}</span>
            <span v-else class="btn-spinner"></span>
            <div class="btn-shimmer"></div>
          </button>
          <button class="btn-oauth-aurora" v-if="settingStore.settings.linuxdoSwitch" @click="linuxDoLogin">
            <img src="/image/linuxdo.webp" width="18" height="18" style="border-radius: 4px" alt="" />
            <span>LinuxDo</span>
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
   LOGIN PAGE — Aurora Glassmorphism
   Split layout, animated mesh gradient,
   frosted glass card, floating inputs
   ============================================ */

#login-box {
  font: 15px/1.5 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  position: relative;
  background: #0a0a1a;
}

.bg-image-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* ── Aurora Background ── */
.aurora-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a1a 0%, #0d1025 30%, #110f28 60%, #0a0a1a 100%);
}

.aurora-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 10% 50%, rgba(88, 28, 255, 0.25) 0%, transparent 60%),
    radial-gradient(ellipse 70% 50% at 80% 20%, rgba(0, 210, 211, 0.2) 0%, transparent 55%),
    radial-gradient(ellipse 60% 80% at 50% 90%, rgba(255, 0, 128, 0.15) 0%, transparent 50%);
  animation: meshShift 20s ease-in-out infinite alternate;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0.4), transparent 70%);
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: orbFloat 15s ease-in-out infinite alternate;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(99, 60, 255, 0.5) 0%, transparent 70%);
  top: -10%;
  left: -5%;
  animation-duration: 18s;
}

.orb-2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(0, 210, 211, 0.4) 0%, transparent 70%);
  bottom: -15%;
  right: 10%;
  animation-duration: 22s;
  animation-delay: -5s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 0, 128, 0.35) 0%, transparent 70%);
  top: 40%;
  left: 30%;
  animation-duration: 25s;
  animation-delay: -10s;
}

@keyframes orbFloat {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -40px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
  100% { transform: translate(15px, -15px) scale(1.05); }
}

@keyframes meshShift {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.05) rotate(2deg); }
  100% { transform: scale(1) rotate(-1deg); }
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
  max-width: 440px;
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 48px 40px 40px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  animation: cardSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;

  /* scrollbar for webkit */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }

  @media (max-width: 480px) {
    padding: 36px 28px 32px;
    max-height: 90vh;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.08);
  }
}

@keyframes cardSlideUp {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.97);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0px);
  }
}

/* ── Card Header ── */
.card-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(99, 60, 255, 0.3) 0%, rgba(0, 210, 211, 0.3) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 20px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: translateY(-3px) scale(1.05);
    background: linear-gradient(135deg, rgba(99, 60, 255, 0.45) 0%, rgba(0, 210, 211, 0.45) 100%);
    box-shadow: 0 8px 24px rgba(99, 60, 255, 0.3);
  }
}

.logo-glow {
  position: absolute;
  inset: -4px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(99, 60, 255, 0.2), rgba(0, 210, 211, 0.2));
  filter: blur(12px);
  opacity: 0;
  transition: opacity 0.3s ease;

  .logo-wrap:hover & {
    opacity: 1;
  }
}

.logo-icon {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.95);
}

.form-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  display: block;
  font-weight: 800;
  font-size: 26px;
  letter-spacing: -0.5px;
  line-height: 1.3;
  color: #ffffff;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.75) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-desc {
  display: block;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 15px;
  line-height: 1.5;
  font-weight: 500;
}

/* ── Form Body ── */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: staggerIn 0.6s ease-out 0.2s both;
}

@keyframes staggerIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Input Wrap (Floating Label) ── */
.input-wrap {
  position: relative;

  .floating-label {
    position: absolute;
    top: 14px;
    left: 44px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
    pointer-events: none;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: left center;
    font-weight: 500;
    z-index: 2;
  }

  &.focused .floating-label,
  &:has(.el-input:focus-within) .floating-label {
    top: -8px;
    left: 12px;
    font-size: 11px;
    color: rgba(0, 210, 211, 0.9);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 0 16px;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.12);
    }

    .focused &,
    &:focus-within {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(0, 210, 211, 0.5);
      box-shadow:
        0 0 0 3px rgba(0, 210, 211, 0.1),
        0 0 20px rgba(0, 210, 211, 0.05);
    }
  }

  .input-icon {
    color: rgba(255, 255, 255, 0.3);
    flex-shrink: 0;
    transition: all 0.25s ease;
    z-index: 1;
  }

  &.focused .input-icon,
  &:has(.el-input:focus-within) .input-icon {
    color: rgba(0, 210, 211, 0.8);
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
    min-height: 48px;
  }

  .el-input__inner {
    height: 48px;
    font-size: 15px;
    color: #ffffff !important;
    background: transparent !important;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 500;

    &::placeholder {
      color: rgba(255, 255, 255, 0.25) !important;
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
  background: rgba(255, 255, 255, 0.05) !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  color: rgba(255, 255, 255, 0.6) !important;
}

.email-input :deep(.el-input__wrapper) {
  border-radius: 0;
}

/* ── Gradient Button ── */
.btn-gradient {
  position: relative;
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #ffffff;
  cursor: pointer;
  overflow: hidden;
  background: linear-gradient(135deg, #633cff 0%, #00d2d3 50%, #633cff 100%);
  background-size: 200% 200%;
  animation: gradientPulse 4s ease infinite;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow:
    0 4px 15px rgba(99, 60, 255, 0.35),
    0 1px 3px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  margin-top: 4px;

  &:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow:
      0 8px 25px rgba(99, 60, 255, 0.45),
      0 2px 6px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: translateY(0) scale(0.99);
    box-shadow:
      0 2px 8px rgba(99, 60, 255, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .btn-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.12) 50%,
      transparent 100%
    );
    transition: none;
  }

  &:hover .btn-shimmer {
    animation: shimmer 1.5s ease infinite;
  }
}

.btn-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes gradientPulse {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── OAuth Button ── */
.btn-oauth-aurora {
  width: 100%;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 14px;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

/* ── Switch ── */
.switch {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;

  span {
    color: #00d2d3;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.2s ease;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #00d2d3, #633cff);
      border-radius: 1px;
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 100%;
    }

    &:hover {
      color: #ffffff;
    }
  }
}

/* ── Domain Suffix ── */
.domain-suffix {
  display: flex;
  align-items: center;
  gap: 2px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
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

/* ── Bind Dialog ── */
:deep(.bind-dialog) {
  width: 400px !important;
  border-radius: 20px !important;
  background: rgba(20, 20, 40, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;

  .el-dialog__header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .el-dialog__title {
    color: #ffffff;
    font-weight: 700;
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
  gap: 14px;
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
  font-size: 12px;
  color: rgba(255, 255, 255, 0.15);
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}

:deep(.el-button + .el-button) {
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .aurora-bg {
    opacity: 0.7;
  }

  .glass-card {
    max-width: 100%;
    margin: 0 8px;
  }

  .orb {
    filter: blur(60px);
    opacity: 0.4;
  }
}

/* ── Dark mode handled by default (this IS the dark design) ── */
</style>
