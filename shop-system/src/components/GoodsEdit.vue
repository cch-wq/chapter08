<template>
    <el-form ref="formRef" :model="form" label-width="120px">
        <!-- 商品名称 -->
        <el-form-item label="商品名称" prop="name" style="width: 92%">
            <el-input v-model="form.name" placeholder="请填写商品名称" />
        </el-form-item>
        <!-- 商品分类 -->
        <el-form-item label="分类名称" prop="category_id">
            <el-select v-model="form.category_id" placeholder="请选择二级分类名称">
                <el-option-group v-for="category in categoryList" :key="category.id" :label="category.name">
                    <el-option v-for="item in category.children" :key="item.id" :label="item.name" :value="item.id" />
                </el-option-group>
            </el-select>
        </el-form-item>
        <!-- 商品价格 -->
        <el-form-item label="商品价格" prop="price" style="width: 92%">
            <el-input v-model="form.price" placeholder="请填写商品价格" />
        </el-form-item>
        <!-- 商品图片 -->
        <el-form-item label="商品图片">
            <el-upload ref="uploadRef" v-model:file-list="fileList" class="upload-demo" :action="uploadURL"
                :headers="headers" :data="{ type: 'goods_picture' }" :limit="1" :on-exceed="handleExceed"
                :on-success="uploadSuccess">
                <template #trigger>
                    <el-button type="primary" style="text-align: left;">选择图片</el-button>
                </template>
                <template #tip>
                    <div class="el-upload__tip">
                        图片文件大小不超过 500KB
                    </div>
                </template>
            </el-upload>
        </el-form-item>
        <!-- 商品相册 -->
        <el-form-item label="图片相册" prop="album">
            <el-upload ref="albumUploadRef" class="upload-demo" list-type="picture-card"
                v-model:file-list="albumFileList" :action="uploadURL" :data="{ type: 'goods_album' }" :headers="headers"
                :on-preview="handlePictureCardPreview" :on-remove="albumHandleRemove" :on-success="albumUploadSuccess"
                :multiple="true">
                <el-icon>
                    <Plus />
                </el-icon>
            </el-upload>
            <el-dialog v-model="albumDialogVisible" align-center width="30%">
                <el-Image :src="albumDialogImageUrl" />
            </el-dialog>
        </el-form-item>
        <!-- 商品库存 -->
        <el-form-item label="商品库存" prop="stock" style="width: 92%">
            <el-input v-model="form.stock" placeholder="请填写库存数量" />
        </el-form-item>
        <!-- 商品规格 -->
        <el-form-item label="商品规格" prop="spec" style="width: 92%">
            <el-input v-model="form.spec" placeholder="请填写商品规格" />
        </el-form-item>
        <!-- 商品简介 -->
        <el-form-item label="商品简介" prop="description" style="width: 92%" class="desc">
            <Editor :init="initEditor" v-model="form.description"></Editor>
        </el-form-item>
        <!-- 操作按钮 -->
        <el-form-item>
            <el-button type="primary" @click="editSubmit()" v-if="form.id">修改
            </el-button>
            <el-button type="primary" @click="addSubmit()" v-else>新增</el-button>
            <el-button @click="btnCancel">重置</el-button>
        </el-form-item>
    </el-form>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { getCategoryList, uploadPictureURL, getGoods, addGoods, editGoods } from '../api'
import useToken from '../stores/token'
import { Plus } from '@element-plus/icons-vue'

import Editor from '@tinymce/tinymce-vue'
import 'tinymce/tinymce'
import 'tinymce/models/dom'
import 'tinymce/themes/silver'
import 'tinymce/icons/default'
import 'tinymce/plugins/image'
// 编辑器配置
let initEditor = {
    width: '100%',
    skin_url: '/tinymce/skins/ui/oxide',
    content_css: '/tinymce/skins/content/default/content.css',
    language_url: '/tinymce/langs/zh-Hans.js',
    language: 'zh-Hans',
    menubar: false,
    statusbar: false,
    toolbar: 'bold underline italic strikethrough image undo redo',
    plugins: 'image',
}

const props = defineProps({
    id: {
        type: Number
    }
})
const form = reactive({
    id: props.id,
    name: '',
    category_id: '',
    price: '',
    picture: '',
    album: [],
    stock: '',
    spec: '',
    description: ''
})
const formRef = ref()
const categoryList = ref([])
const fileList = ref([])
const uploadRef = ref()
const uploadURL = uploadPictureURL()
const { token } = useToken()
const headers = { jwt: token }

onMounted(() => {
    loadGoods()
})
const resetForm = id => {
    form.id = id
    btnCancel()
}
defineExpose({ resetForm })
const loadGoods = async () => {
    if (form.id) {
        const goods = await getGoods({ id: form.id })
        if (goods.picture !== '') {
            const fileName = goods.picture.substring(goods.picture.lastIndexOf('/') + 1)
            if (fileName) {
                fileList.value = [{ name: fileName, url: goods.picture }]
            }
        }
        albumFileList.value = goods.album.map(item => {
            return {
                name: item.picture.substring(item.picture.lastIndexOf('/') + 1),
                url: item.picture
            }
        })
        goods.album = goods.album.map(item => {
            return item.picture.replace(/^https?:\/\/.*?\//, '')
        })
        Object.assign(form, goods)
    }
    const data = await getCategoryList()
    categoryList.value = convertToTree(data)
}
const convertToTree = data => {
    const treeData = []
    const map = {}
    for (const item of data) {
        map[item.id] = { ...item, children: [] }
    }
    for (const item of data) {
        const node = map[item.id]
        if (item.pid === 0) {
            treeData.push(node)
        } else {
            const parent = map[item.pid]
            parent.children.push(node)
        }
    }
    return treeData
}
// 新增操作
const addSubmit = async () => {
    const data = {
        name: form.name,
        category_id: form.category_id,
        price: form.price,
        picture: form.picture,
        album: form.album,
        stock: form.stock,
        spec: form.spec,
        description: form.description
    }
    if (await addGoods(data)) {
        emit('success')
    }
}
// 修改商品
const editSubmit = async () => {
    if (await editGoods(form)) {
        emit('success')
    }
}
// 重置表单
const btnCancel = () => {
    formRef.value.resetFields()
    form.picture = ''
    uploadRef.value.clearFiles()
    form.album = []
    albumUploadRef.value.clearFiles()
    loadGoods()
}
const emit = defineEmits(['success'])

// 文件超出个数限制时替换已有图片
const handleExceed = files => {
    uploadRef.value.clearFiles()
    uploadRef.value.handleStart(files[0])
    uploadRef.value.submit()
}
// 上传成功
const uploadSuccess = response => {
    const { errno, errmsg, data } = response
    if (errno !== 0) {
        notification({
            message: errmsg,
            type: 'error'
        })
    } else {
        if (errmsg !== '') {
            notification({
                message: errmsg,
                type: 'success'
            })
        }
        form.picture = data.savepath
    }
}

const albumUploadRef = ref()
const albumDialogImageUrl = ref('')
const albumDialogVisible = ref(false)
const albumFileList = ref([])
// 相册图上传成功
const albumUploadSuccess = response => {
    const { errno, errmsg, data } = response
    if (errno !== 0) {
        notification({
            message: errmsg,
            type: 'error'
        })
    } else {
        if (errmsg !== '') {
            notification({
                message: errmsg,
                type: 'success'
            })
        }
        form.album.push(data.savepath)
    }
}
// 删除相册图
const albumHandleRemove = (removeFile, uploadFiles) => {
    form.album = []
    uploadFiles.forEach(item => {
        form.album.push(item.url.replace(/^https?:\/\/.*?\//, ''))
    })
}
// 预览已上传的相册图
const handlePictureCardPreview = uploadFile => {
    albumDialogImageUrl.value = uploadFile.url
    albumDialogVisible.value = true
}
</script>

<style scoped>
.upload-demo {
    text-align: left;
    width: 91%;
}
</style>
