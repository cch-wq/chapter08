import request from '../utils/request'
import config from '../config'
// 登录接口
export function login(data) {
 return request.post('/admin/login', data)
}
// 用户信息接口
export function getAdmin() {
 return request.get('/admin/admin')
}
// 修改密码接口
export function changeAdminPassword(data) {
return request.post('/admin/admin/changePassword', data)
}
// 修改头像接口
export function changeAdminAvatar(data) {
return request.post('/admin/admin/changeAvatar', data)
}
// 更新图片地址
export function uploadPictureURL() {
return config.baseURL + '/admin/upload/picture'
}
// 分类列表接口
export function getCategoryList() {
 return request.get('/admin/category/list')
}
// 查询单个分类接口
export function getCategory(params) {
 return request.get('/admin/category', { params })
}
// 新增分类接口
export function addCategory(data) {
 return request.post('/admin/category/add', data)
}
// 修改分类接口
export function editCategory(data) {
 return request.post('/admin/category/save', data)
}
// 删除分类接口
export function delCategory(data) {
 return request.post('/admin/category/del', data)
}
// 商品列表接口
export function getGoodsList(params) {
 return request.get('/admin/goods/list', { params })
}
// 查询单个商品接口
export function getGoods(params) {
 return request.get('/admin/goods', { params })
}
// 新增商品接口
export function addGoods(data) {
 return request.post('/admin/goods/add', data)
}
// 修改商品接口
export function editGoods(data) {
 return request.post('/admin/goods/save', data)
}
// 删除商品接口
export function delGoods(data) {
 return request.post('/admin/goods/del', data)
}