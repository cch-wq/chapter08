<template> 
    <van-nav-bar
        :title="$route.meta.title"
        @click-left="onClickLeft"
        :left-arrow="$route.meta.isShowBack"
        fixed
        placeholder
        style="height: 47px"
        />
    <tab-bar v-if="isShowTabbar"></tab-bar>
    <router-view></router-view>
</template>

<script setup>
import TabBar from './components/TabBar.vue'
import { useRouter } from 'vue-router'
import { ref,watch,onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getUser } from './api'
import useUser from './stores/user'

const { user, updateUser } = useUser()
const route =useRoute()
const isShowTabbar =ref(true)
const router = useRouter()
const onClickLeft = () => {
    if (history.length > 1) {
        router.back()
    } else {
        router.push({ name: 'home' })
     }
}

watch(
 () => route.meta,
 val => {
isShowTabbar.value = val.isTab
 }
)

onMounted(() => {
    if (user.isLogin) {
        loadUser()
    }
})
const loadUser = async () => {
    const data = await getUser()
    updateUser({
        isLogin: true,
        username: data.username,
        avatar: data.avatar
})}
</script>

<style>
#app {
 color: #2c3e50;
 line-height: 24px;
 --van-nav-bar-background: #ff8000;
 --van-nav-bar-title-text-color: #fff;
 --van-nav-bar-icon-color: #fff;
}
</style>