<?php
/**
 * Plugin Name: Evernever Portfolio Bridge
 * Description: Private API for the Evernever Next.js admin. Existing Elementor posts are not modified.
 * Version: 1.0.1
 * Requires PHP: 7.4
 */
if (!defined('ABSPATH')) exit;

add_action('init', function () {
    register_post_type('en_project', array('label' => 'Evernever Portfolio', 'public' => false, 'show_ui' => true, 'show_in_rest' => false, 'supports' => array('title', 'revisions'), 'capability_type' => 'post', 'map_meta_cap' => true));
});
function en_error($message, $status = 400) { return new WP_Error('evernever_error', $message, array('status' => $status)); }
function en_bridge_key($r) {
    if (!defined('EVERNEVER_BRIDGE_SECRET') || strlen(EVERNEVER_BRIDGE_SECRET) < 32 || !hash_equals(EVERNEVER_BRIDGE_SECRET, (string)$r->get_header('x-evernever-key'))) return en_error('ไม่ได้รับอนุญาต', 401);
    return true;
}
function en_editor($r) {
    $key = en_bridge_key($r); if (is_wp_error($key)) return $key;
    $token = (string)$r->get_header('x-evernever-session');
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) return en_error('กรุณาเข้าสู่ระบบ', 401);
    $session = get_transient('en_session_' . hash('sha256', $token));
    $user = $session ? get_user_by('id', $session['id']) : false;
    if (!$user || !hash_equals($session['password_marker'], hash('sha256', $user->user_pass))) return en_error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบ', 401);
    if (!user_can($user, 'edit_others_posts') || !user_can($user, 'publish_posts') || !user_can($user, 'upload_files')) return en_error('ไม่มีสิทธิ์จัดการผลงาน', 403);
    wp_set_current_user($user->ID);
    return true;
}
function en_user() { $u = wp_get_current_user(); return array('id' => $u->ID, 'name' => $u->display_name, 'canManageSettings' => current_user_can('manage_options')); }
function en_limit($key, $max, $seconds) {
    $name = 'en_limit_' . hash('sha256', $key); $value = get_transient($name);
    if (!$value) $value = array('count' => 0, 'until' => time() + $seconds);
    if ($value['count'] >= $max) return false;
    $value['count']++; set_transient($name, $value, max(1, $value['until'] - time())); return true;
}
function en_login($r) {
    $name = trim((string)$r->get_param('username')); $password = (string)$r->get_param('password');
    if (!en_limit('login_global', 200, 900) || !en_limit('login_' . strtolower($name), 10, 900)) return en_error('ลองเข้าสู่ระบบบ่อยเกินไป กรุณารอ 15 นาที', 429);
    $user = wp_authenticate($name, $password);
    if (is_wp_error($user) || !user_can($user, 'edit_others_posts') || !user_can($user, 'publish_posts') || !user_can($user, 'upload_files')) return en_error('ชื่อผู้ใช้ รหัสผ่าน หรือสิทธิ์ไม่ถูกต้อง', 401);
    $token = bin2hex(random_bytes(32));
    set_transient('en_session_' . hash('sha256', $token), array('id' => $user->ID, 'password_marker' => hash('sha256', $user->user_pass)), 8 * HOUR_IN_SECONDS);
    wp_set_current_user($user->ID);
    return array('token' => $token, 'user' => en_user());
}
function en_project($post) {
    $data = get_post_meta($post->ID, '_en_project', true); if (!is_array($data)) $data = array();
    return array_merge($data, array('id' => $post->ID, '_id' => 'wp-' . $post->ID, 'title' => $post->post_title, 'slug' => array('current' => rawurldecode($post->post_status === 'trash' ? (get_post_meta($post->ID, '_wp_desired_post_slug', true) ?: $post->post_name) : $post->post_name)), 'status' => $post->post_status, 'order' => $post->menu_order, 'modified' => hash('sha256', wp_json_encode(array($post->post_modified_gmt, $post->post_title, $post->post_name, $post->post_status, $post->menu_order, $data)))));
}
function en_projects($public = false) {
    $posts = get_posts(array('post_type' => 'en_project', 'post_status' => $public ? 'publish' : array('publish','draft','trash'), 'posts_per_page' => -1, 'orderby' => array('menu_order' => 'ASC', 'ID' => 'DESC')));
    return array_map('en_project', $posts);
}
function en_url($value) {
    if (!is_string($value)) return '';
    if (preg_match('#^/evernever/[a-zA-Z0-9_./-]+$#', $value) && strpos($value, '..') === false) return $value;
    if (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'local' && preg_match('#^http://(127\.0\.0\.1|localhost)(:\d+)?/#', $value)) return esc_url_raw($value, array('http'));
    $url = esc_url_raw($value, array('https')); return $url ?: '';
}
function en_save_project($r) {
    $d = $r->get_json_params(); if (!is_array($d)) return en_error('ข้อมูลไม่ถูกต้อง');
    $id = absint($r->get_url_params()['id'] ?? 0); $existing = $id ? get_post($id) : null;
    if ($id && (!$existing || $existing->post_type !== 'en_project')) return en_error('ไม่พบผลงาน', 404);
    if ($existing && (!isset($d['modified']) || $d['modified'] !== en_project($existing)['modified'])) return en_error('ข้อมูลถูกแก้ไขแล้ว กรุณาโหลดรายการใหม่ก่อนบันทึก', 409);
    if (!is_string($d['title'] ?? null) || !is_array($d['slug'] ?? null) || !is_string($d['slug']['current'] ?? null)) return en_error('ชื่อและลิงก์ไม่ถูกต้อง');
    $title = sanitize_text_field($d['title'] ?? ''); $slug = sanitize_title($d['slug']['current'] ?? '');
    $status = $d['status'] ?? 'draft';
    if (!$title || strlen($title) > 500 || !$slug || !in_array($status, array('draft','publish'), true)) return en_error('กรุณาตรวจสอบชื่อ ลิงก์ และสถานะ');
    $duplicate = get_posts(array('post_type'=>'en_project','post_status'=>array('publish','draft','trash'),'name'=>$slug,'posts_per_page'=>1,'post__not_in'=>$id?array($id):array()));
    if ($duplicate) return en_error('ลิงก์นี้ถูกใช้แล้ว กรุณาเปลี่ยนลิงก์', 409);
    $data = array('sourceUrl' => en_url($d['sourceUrl'] ?? ''), 'coverImage' => en_url($d['coverImage'] ?? ''), 'category' => sanitize_title($d['category'] ?? 'all'), 'featured' => !empty($d['featured']));
    if ($status === 'publish' && !$data['coverImage']) return en_error('กรุณาเพิ่มรูปปกก่อนเผยแพร่');
    foreach (array('summary','description') as $field) $data[$field] = sanitize_textarea_field(substr((string)($d[$field] ?? ''), 0, 40000));
    foreach (array('gallery','videoUrls') as $field) {
        $limit = $field === 'gallery' ? 200 : 100;
        $items = $d[$field] ?? array(); if (!is_array($items) || count($items) > $limit) return en_error('รายการรูปหรือวิดีโอเกินจำนวนที่รองรับ (รูป 200 / วิดีโอ 100)');
        foreach ($items as $item) { if (!is_string($item)) return en_error('รายการลิงก์ไม่ถูกต้อง'); if (trim($item) !== '' && !en_url($item)) return en_error('กรุณาใช้ลิงก์ HTTPS ที่ถูกต้อง'); }
        $data[$field] = array_values(array_filter(array_map('en_url', $items)));
    }
    $data['videoUrl'] = $data['videoUrls'][0] ?? null;
    foreach (array('categories','categoryLabels') as $field) {
        $items = $d[$field] ?? array(); if (!is_array($items) || count($items) > 30) return en_error('หมวดหมู่ไม่ถูกต้อง');
        $data[$field] = array_map('sanitize_text_field', $items);
    }
    $data['content'] = array();
    foreach (array_slice(is_array($d['content'] ?? null) ? $d['content'] : array(), 0, 100) as $block) {
        if (is_array($block)) $data['content'][] = array('kind' => ($block['kind'] ?? '') === 'heading' ? 'heading' : 'paragraph', 'text' => sanitize_textarea_field(substr((string)($block['text'] ?? ''),0,40000)));
    }
    $result = wp_insert_post(wp_slash(array('ID'=>$id,'post_type'=>'en_project','post_title'=>$title,'post_name'=>$slug,'post_status'=>$status,'menu_order'=>max(0,min(99999,(int)($d['order'] ?? 0))))),true);
    if (is_wp_error($result)) return en_error('บันทึกผลงานไม่สำเร็จ', 500);
    update_post_meta($result, '_en_project', wp_slash($data));
    return en_project(get_post($result));
}
function en_media($r) {
    if (empty($_FILES['file']) || ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || $_FILES['file']['size'] > 3 * MB_IN_BYTES) return en_error('ไฟล์ต้องมีขนาดไม่เกิน 3 MB');
    $file = $_FILES['file'];
    $check = wp_check_filetype_and_ext($file['tmp_name'], $file['name'], array('jpg|jpeg'=>'image/jpeg','png'=>'image/png','webp'=>'image/webp'));
    if (!$check['ext'] || !$check['type'] || !@getimagesize($file['tmp_name'])) return en_error('รองรับรูป JPG, PNG และ WebP เท่านั้น');
    require_once ABSPATH . 'wp-admin/includes/file.php'; require_once ABSPATH . 'wp-admin/includes/media.php'; require_once ABSPATH . 'wp-admin/includes/image.php';
    $id = media_handle_upload('file', 0, array(), array('test_form'=>false, 'mimes'=>array('jpg|jpeg'=>'image/jpeg','png'=>'image/png','webp'=>'image/webp')));
    if (is_wp_error($id)) return en_error('อัปโหลดรูปไม่สำเร็จ', 500);
    return array('id'=>$id, 'url'=>wp_get_attachment_url($id));
}
function en_company($r) {
    if ($r->get_method() === 'GET') return (object)get_option('en_company', array());
    if (!current_user_can('manage_options')) return en_error('เฉพาะผู้ดูแลระบบเท่านั้น',403);
    $d = $r->get_json_params(); if (!is_array($d)) return en_error('ข้อมูลไม่ถูกต้อง'); $data = array();
    foreach (array('thaiDescription','aboutHeading','about','invitation','legalName','address','hours','email') as $key) {
        if (isset($d[$key])) $data[$key] = sanitize_textarea_field(substr((string)$d[$key],0,10000));
    }
    if (isset($data['email']) && !is_email($data['email'])) return en_error('อีเมลไม่ถูกต้อง');
    update_option('en_company', $data, false); return (object)$data;
}
function en_contact($r) {
    if (!defined('EVERNEVER_CONTACT_TO') || !is_email(EVERNEVER_CONTACT_TO)) return en_error('ยังไม่ได้ตั้งค่าอีเมลรับข้อความ',503);
    if (!en_limit('contact_global',30,3600) || !en_limit('contact_' . (string)$r->get_param('clientKey'),5,3600)) return en_error('ส่งข้อความบ่อยเกินไป กรุณาลองใหม่ภายหลัง',429);
    $name=sanitize_text_field($r->get_param('fullName')); $phone=sanitize_text_field($r->get_param('phone'));
    $email=sanitize_email($r->get_param('email')); $company=sanitize_text_field($r->get_param('company'));
    if (!$name || !$phone || ($r->get_param('email') && !is_email($email))) return en_error('ข้อมูลติดต่อไม่ถูกต้อง');
    $headers=$email?array('Reply-To: '.$email):array();
    $sent=wp_mail(EVERNEVER_CONTACT_TO,'Evernever website enquiry',"Name: $name\nPhone: $phone\nEmail: $email\nCompany: $company",$headers);
    if (!$sent) return en_error('ส่งข้อความไม่สำเร็จ กรุณาติดต่อโดยตรง',502);
    return array('success'=>true);
}
add_action('rest_api_init', function () {
    $route = function($path,$methods,$callback,$permission='en_editor') { register_rest_route('evernever/v1',$path,array('methods'=>$methods,'callback'=>$callback,'permission_callback'=>$permission)); };
    $route('/contact','POST','en_contact','en_bridge_key');
    $route('/login','POST','en_login','en_bridge_key');
    $route('/session','GET',function(){return en_user();});
    $route('/logout','POST',function($r){delete_transient('en_session_' . hash('sha256',(string)$r->get_header('x-evernever-session')));return array('success'=>true);});
    $route('/public/projects','GET',function(){return en_projects(true);},'en_bridge_key');
    $route('/public/company','GET',function(){return (object)get_option('en_company',array());},'en_bridge_key');
    $route('/projects','GET',function(){return en_projects();});
    $route('/projects','POST','en_save_project');
    $route('/projects/(?P<id>\d+)','POST','en_save_project');
    $route('/projects/(?P<id>\d+)','DELETE',function($r){$p=get_post(absint($r['id']));if(!$p || $p->post_type!=='en_project')return en_error('ไม่พบผลงาน',404);if($p->post_status==='trash')return en_error('ผลงานอยู่ในถังขยะแล้ว');if(defined('EMPTY_TRASH_DAYS') && !EMPTY_TRASH_DAYS)return en_error('WordPress ปิดถังขยะอยู่ จึงไม่ดำเนินการลบ',409);if(!wp_trash_post($p->ID))return en_error('ย้ายลงถังขยะไม่สำเร็จ',500);return array('success'=>true);});
    $route('/media','POST','en_media');
    $route('/company',array('GET','POST'),'en_company');
});
add_filter('rest_post_dispatch', function($response,$server,$request){ if(strpos($request->get_route(),'/evernever/v1/')===0) $response->header('Cache-Control','no-store, private'); return $response;},10,3);
