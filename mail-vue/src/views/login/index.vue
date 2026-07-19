<template>
  <div id="login-box" :style="background ? backgroundStyle : ''" v-loading="oauthLoading" :element-loading-text="$t('processing')">
    <!-- Neobrutalism geometric decorations -->
    <div class="neo-bg" v-if="!settingStore.settings.background">
      <div class="neo-shape neo-shape--square"></div>
      <div class="neo-shape neo-shape--circle"></div>
      <div class="neo-shape neo-shape--rect"></div>
      <div class="neo-shape neo-shape--dot-grid"></div>
      <!-- Brand panel (desktop only) -->
      <div class="neo-brand-panel">
        <div class="neo-brand-badge">MAIL</div>
        <h1 class="neo-brand-title">{{ settingStore.settings.title }}</h1>
        <p class="neo-brand-sub">{{ $t('brandSub') }}</p>
        <div class="neo-brand-strips">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
    <div v-else :style="backgroundStyle" class="neo-bg-image"></div>

    <div class="form-wrapper">
      <div class="container">
        <div class="form-header">
          <span class="form-title">{{ settingStore.settings.title }}</span>
          <span class="form-mode-badge" v-if="show === 'login'">{{ $t('loginBtn') }}</span>
          <span class="form-mode-badge form-mode-badge--reg" v-else>{{ $t('regBtn') }}</span>
        </div>
        <span class="form-desc" v-if="show === 'login'">{{ $t('loginTitle') }}</span>
        <span class="form-desc" v-else>{{ $t('regTitle') }}</span>
        <div v-show="show === 'login'">
          <el-input :class="!hideLoginDomain ? 'email-input' : ''" v-model="form.email"
                    type="text" :placeholder="$t('emailAccount')" autocomplete="off">
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
                <div style="color: #0A0A0A; font-weight: 600;">
                  <span>{{ suffix }}</span>
                  <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
                </div>
              </div>
            </template>
          </el-input>
          <el-input v-model="form.password" :placeholder="$t('password')" type="password" autocomplete="off">
          </el-input>
          <el-button class="btn" type="primary" @click="submit" :loading="loginLoading"
          >{{ $t('loginBtn') }}
          </el-button>
          <el-button class="btn btn--secondary" v-if="settingStore.settings.linuxdoSwitch" style="margin-top: 12px" @click="linuxDoLogin">
            <el-avatar src="/image/linuxdo.webp" :size="18" style="margin-right: 10px" />LinuxDo
          </el-button>
        </div>
        <div v-show="show !== 'login'">
          <el-input :class="!hideLoginDomain ? 'email-input' : ''" v-model="registerForm.email" type="text" :placeholder="$t('emailAccount')"
                    autocomplete="off">
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
                <div style="font-weight: 600;">
                  <span>{{ suffix }}</span>
                  <Icon class="setting-icon" icon="mingcute:down-small-fill" width="20" height="20"/>
                </div>
              </div>
            </template>
          </el-input>
          <el-input v-model="registerForm.password" :placeholder="$t('password')" type="password" autocomplete="off"/>
          <el-input v-model="registerForm.confirmPassword" :placeholder="$t('confirmPwd')" type="password"
                    autocomplete="off"/>
          <el-input v-if="settingStore.settings.regKey === 0" v-model="registerForm.code" :placeholder="$t('regKey')"
                    type="text" autocomplete="off"/>
          <el-input v-if="settingStore.settings.regKey === 2" v-model="registerForm.code"
                    :placeholder="$t('regKeyOptional')" type="text" autocomplete="off"/>
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
          <el-button class="btn" style="margin: 0" type="primary" @click="submitRegister" :loading="registerLoading"
          >{{ $t('regBtn') }}
          </el-button>
          <el-button v-if="settingStore.settings.linuxdoSwitch" class="btn btn--secondary" style="margin-top: 12px" @click="linuxDoLogin">
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
    <el-dialog class="bind-dialog" v-model="showBindForm" :title="$t('bindEmail')">
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
        <el-button class="btn" type="primary" @click="bind" :loading="bindLoading"
        >{{ $t('bindBtn') }}
        </el-button>
      </div>
    </el-dialog>
    <a v-show="settingStore.settings.projectLink" class="github" href="https://github.com/maillab/cloud-mail">
      <Icon icon="mingcute:github-line" color="#0A0A0A" width="20" height="20" />
    </a>
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
  return settingStore.settings.background ? settingStore.settings.background : ''
})

const backgroundStyle = computed(() => {
  return settingStore.settings.background ? {
    'background-image': `url(${cvtR2Url(settingStore.settings.background)})`,
    'background-repeat': 'no-repeat',
    'background-size': 'cover',
    'background-position': 'center'
  } : {}
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
          message: t('bindOauthMsg'),
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
/* Global El overrides — outside scoped */
.el-select-dropdown__item {
  padding: 0 15px;
  font-weight: 600;
}

.no-autofill-pwd .el-input__inner {
  -webkit-text-security: disc !important;
}

/* Neobrutalism: override El-Plus button + input globally for login page */
#login-box .el-button--primary {
  background: #FFE500 !important;
  border: 3px solid #0A0A0A !important;
  color: #0A0A0A !important;
  font-weight: 800 !important;
  box-shadow: 4px 4px 0 #0A0A0A !important;
  border-radius: 4px !important;
  transition: transform 0.1s ease, box-shadow 0.1s ease !important;
  letter-spacing: 0.04em;
}
#login-box .el-button--primary:hover:not(.is-loading) {
  transform: translate(-2px, -2px) !important;
  box-shadow: 6px 6px 0 #0A0A0A !important;
}
#login-box .el-button--primary:active:not(.is-loading) {
  transform: translate(2px, 2px) !important;
  box-shadow: 2px 2px 0 #0A0A0A !important;
}

#login-box .el-input__wrapper {
  border: 2px solid #0A0A0A !important;
  border-radius: 4px !important;
  box-shadow: 3px 3px 0 #0A0A0A !important;
  background: #fff !important;
  transition: box-shadow 0.1s, transform 0.1s;
}
#login-box .el-input__wrapper:hover,
#login-box .el-input__wrapper.is-focus {
  box-shadow: 4px 4px 0 #0A0A0A !important;
  transform: translate(-1px, -1px);
}
#login-box .el-input-group__append {
  border: 2px solid #0A0A0A !important;
  border-left: none !important;
  border-radius: 0 4px 4px 0 !important;
  background: #f5f0e8 !important;
  font-weight: 700;
}
#login-box .email-input .el-input__wrapper {
  border-radius: 4px 0 0 4px !important;
}
</style>

<style lang="scss" scoped>

/* ── LAYOUT ── */
#login-box {
  font-family: 'Arial Black', 'Impact', Arial, sans-serif;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: 1fr;
  background: #F5F0E8;
  position: relative;
}

/* ── NEOBRUTALISM BACKGROUND ── */
.neo-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background:
    radial-gradient(circle, #0A0A0A 1px, transparent 1px) 0 0 / 28px 28px,
    #F5F0E8;
}

.neo-bg-image {
  position: fixed;
  inset: 0;
  z-index: 0;
}

/* Geometric shapes */
.neo-shape {
  position: absolute;
  pointer-events: none;
}

.neo-shape--square {
  width: 200px;
  height: 200px;
  background: #FFE500;
  border: 4px solid #0A0A0A;
  top: -40px;
  left: -40px;
  transform: rotate(-12deg);
  animation: neo-float 8s ease-in-out infinite;
}

.neo-shape--circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: #FF6B35;
  border: 4px solid #0A0A0A;
  bottom: 80px;
  left: 80px;
  animation: neo-float 10s ease-in-out infinite reverse;
}

.neo-shape--rect {
  width: 300px;
  height: 80px;
  background: #AAFF00;
  border: 4px solid #0A0A0A;
  top: 50%;
  left: -80px;
  transform: rotate(8deg);
  animation: neo-float 12s ease-in-out infinite 2s;
}

.neo-shape--dot-grid {
  width: 180px;
  height: 180px;
  top: 60%;
  left: 30%;
  background:
    radial-gradient(circle, #0A0A0A 3px, transparent 3px) 0 0 / 18px 18px;
  opacity: 0.18;
}

@keyframes neo-float {
  0%, 100% { transform: translateY(0) rotate(var(--r, -12deg)); }
  50% { transform: translateY(-18px) rotate(var(--r, -12deg)); }
}

/* ── BRAND PANEL (left side, desktop) ── */
.neo-brand-panel {
  display: none;

  @media (min-width: 900px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: calc(100% - 470px);
    padding: 60px;
    z-index: 2;
  }
}

.neo-brand-badge {
  display: inline-block;
  background: #FFE500;
  border: 3px solid #0A0A0A;
  box-shadow: 5px 5px 0 #0A0A0A;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.2em;
  padding: 6px 18px;
  width: fit-content;
  margin-bottom: 28px;
  text-transform: uppercase;
}

.neo-brand-title {
  font-size: clamp(3rem, 6vw, 6rem);
  font-weight: 900;
  line-height: 1;
  color: #0A0A0A;
  margin: 0 0 20px;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  /* Bold underline stripe */
  position: relative;
  display: inline-block;
  &::after {
    content: '';
    position: absolute;
    left: 0; bottom: -8px;
    width: 100%; height: 8px;
    background: #FF6B35;
    border: 2px solid #0A0A0A;
  }
}

.neo-brand-sub {
  font-size: 1.1rem;
  font-weight: 700;
  color: #444;
  margin: 24px 0 36px;
  letter-spacing: 0.05em;
}

.neo-brand-strips {
  display: flex;
  gap: 10px;

  span {
    display: block;
    height: 10px;
    border: 2px solid #0A0A0A;
    &:nth-child(1) { width: 80px; background: #FFE500; }
    &:nth-child(2) { width: 50px; background: #FF6B35; }
    &:nth-child(3) { width: 120px; background: #AAFF00; }
  }
}

/* ── FORM WRAPPER ── */
.form-wrapper {
  position: fixed;
  right: 0;
  height: 100%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 767px) {
    width: 100%;
    position: relative;
    min-height: 100vh;
  }
}

.container {
  background: #ffffff;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 450px;
  height: 100%;
  border-left: 4px solid #0A0A0A;
  box-shadow: -8px 0 0 #0A0A0A;

  @media (max-width: 1024px) {
    padding: 30px 24px;
    width: 400px;
  }

  @media (max-width: 767px) {
    border: 4px solid #0A0A0A;
    box-shadow: 6px 6px 0 #0A0A0A;
    padding: 28px 20px;
    border-radius: 4px;
    height: fit-content;
    width: calc(100% - 40px);
    margin: 40px 20px;
  }
}

/* ── FORM HEADER ── */
.form-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 6px;
  gap: 12px;
}

.form-title {
  font-weight: 900;
  font-size: 26px;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: #ffffff;
  line-height: 1.1;
}

.form-mode-badge {
  display: inline-block;
  background: #FFE500;
  border: 2px solid #0A0A0A;
  box-shadow: 3px 3px 0 #0A0A0A;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.15em;
  padding: 4px 10px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 4px;

  &--reg {
    background: #AAFF00;
  }
}

.form-desc {
  display: block;
  margin-top: 2px;
  margin-bottom: 22px;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* ── INPUTS ── */
.el-input {
  height: 42px;
  width: 100%;
  margin-bottom: 16px;

  :deep(.el-input__inner) {
    height: 38px;
    font-weight: 600;
    color: #0A0A0A;
  }
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
  background: #fff;
}

.email-input :deep(.el-input__wrapper) {
  border-radius: 4px 0 0 4px;
  background: #fff;
}

/* ── BUTTONS ── */
.btn {
  height: 44px;
  width: 100%;
  border-radius: 4px;
  font-weight: 900;
  font-size: 15px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.btn--secondary {
  background: #fff !important;
  border: 3px solid #0A0A0A !important;
  color: #0A0A0A !important;
  font-weight: 800 !important;
  box-shadow: 4px 4px 0 #0A0A0A !important;
  transition: transform 0.1s ease, box-shadow 0.1s ease !important;

  &:hover {
    transform: translate(-2px, -2px) !important;
    box-shadow: 6px 6px 0 #0A0A0A !important;
    background: #f5f0e8 !important;
  }
}

/* ── SWITCH ── */
.switch {
  margin-top: 22px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #555;

  span {
    color: #0A0A0A;
    cursor: pointer;
    font-weight: 900;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;

    &:hover {
      background: #FFE500;
      text-decoration: none;
    }
  }
}

/* ── BIND DIALOG ── */
:deep(.bind-dialog) {
  width: 420px !important;
  border: 3px solid #0A0A0A !important;
  box-shadow: 8px 8px 0 #0A0A0A !important;
  border-radius: 4px !important;

  .el-dialog__header {
    font-weight: 900;
    font-size: 18px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-bottom: 3px solid #0A0A0A;
    padding-bottom: 12px;
    margin-bottom: 0;
  }

  @media (max-width: 460px) {
    width: calc(100% - 40px) !important;
    margin-right: 20px !important;
    margin-left: 20px !important;
  }
}

.bind-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  padding-top: 16px;
}

/* ── MISC ── */
.setting-icon {
  position: relative;
  top: 6px;
}

:deep(.el-select-dropdown__item) {
  padding: 0 10px;
  font-weight: 700;
}

:deep(.el-input-group__append) {
  padding: 0 !important;
  padding-left: 8px !important;
  padding-right: 4px !important;
  background: #f5f0e8;
  border-radius: 0 4px 4px 0;
  font-weight: 700;
}

:deep(.el-button + .el-button) {
  margin: 0;
}

.register-turnstile {
  margin-bottom: 16px;
}

.select {
  position: absolute;
  right: 30px;
  width: 100px;
  opacity: 0;
  pointer-events: none;
}

/* ── GITHUB BUTTON ── */
.github {
  position: fixed;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #FFE500;
  bottom: 16px;
  right: 16px;
  z-index: 1000;
  border: 3px solid #0A0A0A;
  box-shadow: 4px 4px 0 #0A0A0A;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #0A0A0A;
  }
}

/* ── DARK MODE ADAPTATION ── */
@media (prefers-color-scheme: dark) {
  #login-box:not([style*="background-image"]) {
    background: #1a1a1a;
  }
  .neo-bg {
    background:
      radial-gradient(circle, #555 1px, transparent 1px) 0 0 / 28px 28px,
      #1a1a1a;
  }
  .container {
    background: #2a2a2a;
    color: #f5f0e8;
    border-left-color: #f5f0e8;
    box-shadow: -8px 0 0 #f5f0e8;
  }
  .form-title { color: #f5f0e8; }
  .form-desc { color: #aaa; }
  .switch { color: #aaa; }
  .switch span { color: #FFE500; }
  .neo-brand-title { color: #f5f0e8; }
  .neo-brand-sub { color: #ccc; }
  #login-box .el-input__wrapper {
    background: #333 !important;
  }
  #login-box .el-input__inner {
    color: #f5f0e8;
  }
}
</style>

