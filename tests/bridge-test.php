<?php
// Isolated contract/security tests: no database, network, or customer WordPress access.
define('ABSPATH', __DIR__ . '/'); define('HOUR_IN_SECONDS',3600); define('EVERNEVER_BRIDGE_SECRET',str_repeat('test',16));
class WP_Error { public $message;public $data;function __construct($code,$message,$data){$this->message=$message;$this->data=$data;} }
function is_wp_error($x){return $x instanceof WP_Error;}
function add_action(...$args){} function add_filter(...$args){}
$store=[];$posts=[];$meta=[];$uid=0;
$users=[1=>(object)['ID'=>1,'display_name'=>'Editor','user_pass'=>'hash1'],2=>(object)['ID'=>2,'display_name'=>'Subscriber','user_pass'=>'hash2']];
function get_transient($k){global $store;return $store[$k]??false;}
function set_transient($k,$v,$ttl){global $store;$store[$k]=$v;return true;}
function get_user_by($field,$id){global $users;return $users[$id]??false;}
$caps=[1=>['edit_others_posts','publish_posts','upload_files'],2=>[]];
function user_can($user,$cap){global $caps;return in_array($cap,$caps[$user->ID]??[],true);}
function wp_set_current_user($id){global $uid;$uid=$id;}
function wp_get_current_user(){global $users,$uid;return $users[$uid];}
function current_user_can($cap){global $users,$uid;return isset($users[$uid])&&user_can($users[$uid],$cap);}
function wp_authenticate($name,$password){global $users;return $password==='valid-password'&&isset(['editor'=>1,'subscriber'=>2][$name])?$users[['editor'=>1,'subscriber'=>2][$name]]:new WP_Error('bad','bad',[]);}
function absint($x){return abs((int)$x);} function sanitize_text_field($s){return strip_tags((string)$s);}function sanitize_textarea_field($s){return strip_tags((string)$s);} function sanitize_title($s){return strtolower(trim(preg_replace('/[^a-z0-9-]+/i','-',(string)$s),'-'));}
function esc_url_raw($s,$protocols){return filter_var($s,FILTER_VALIDATE_URL)&&parse_url($s,PHP_URL_SCHEME)==='https'?$s:'';}
function get_post($id){global $posts;return $posts[$id]??null;}
function get_posts($args){global $posts;return array_values(array_filter($posts,function($p)use($args){return $p->post_type===$args['post_type']&&(!isset($args['name'])||$p->post_name===$args['name'])&&!in_array($p->ID,$args['post__not_in']??[]);}));}
function wp_insert_post($data,$error){global $posts;$id=$data['ID']?:count($posts)+1;$posts[$id]=(object)array_merge($data,['ID'=>$id,'post_modified_gmt'=>'2026-01-01 12:00:00']);return $id;}
function get_post_meta($id,$key,$single){global $meta;return $meta[$id]??[];}
function update_post_meta($id,$key,$data){global $meta;$meta[$id]=$data;return true;}
function wp_json_encode($x){return json_encode($x);}
function wp_slash($x){return $x;}
class Request {private $data;private $headers;function __construct($data=[],$headers=[]){$this->data=$data;$this->headers=$headers;}function get_method(){return 'POST';}function get_url_params(){return isset($this->data['id'])?['id'=>$this->data['id']]:[];}function get_param($k){return $this->data[$k]??null;}function get_json_params(){return $this->data;}function get_header($k){return $this->headers[$k]??'';}}
require __DIR__.'/../wordpress/evernever-bridge/evernever-bridge.php';
$count=0;function check($ok,$label){global $count;if(!$ok){fwrite(STDERR,"FAIL: $label\n");exit(1);}echo "PASS: $label\n";$count++;}
$key=['x-evernever-key'=>EVERNEVER_BRIDGE_SECRET];
check(is_wp_error(en_bridge_key(new Request())), 'Missing bridge key rejected');
check(en_bridge_key(new Request([],$key))===true,'Valid bridge key accepted');
check(is_wp_error(en_editor(new Request([],$key))),'Missing session rejected');
check(is_wp_error(en_login(new Request(['username'=>'editor','password'=>'wrong']))),'Wrong password rejected');
$login=en_login(new Request(['username'=>'editor','password'=>'valid-password']));
check(strlen($login['token'])===64,'Login issues opaque random token');
$auth=$key+['x-evernever-session'=>$login['token']];
check(en_editor(new Request([],$auth))===true,'Editor session accepted');
check($login['user']['canManageSettings']===false,'Editor cannot manage company settings');
$denied=en_company(new Request([]));check(is_wp_error($denied)&&$denied->data['status']===403,'Editor company write rejected');
check(is_wp_error(en_login(new Request(['username'=>'subscriber','password'=>'valid-password']))),'Subscriber login rejected');
$caps[1]=['edit_others_posts','upload_files'];
$denied=en_editor(new Request([],$auth));check(is_wp_error($denied)&&$denied->data['status']===403,'Revoked publish permission blocks existing session');
$caps[1][]='publish_posts';
$caps[1][]='manage_options';check(en_user()['canManageSettings']===true,'Administrator capability exposed');
$caps[1]=['edit_others_posts','publish_posts','upload_files'];
$users[1]->user_pass='changed';check(is_wp_error(en_editor(new Request([],$auth))),'Password change invalidates session');$users[1]->user_pass='hash1';
for($i=0;$i<11;$i++)$limited=en_login(new Request(['username'=>'blocked','password'=>'wrong']));
check(is_wp_error($limited)&&$limited->data['status']===429,'Repeated failed login throttled');
$project=['title'=>'Example','slug'=>['current'=>'example'],'status'=>'publish','coverImage'=>'','categories'=>[]];
check(is_wp_error(en_save_project(new Request($project))),'Published project requires cover');
$project['status']='draft';$draft=en_save_project(new Request($project));check($draft['status']==='draft','Draft saved');
check(is_wp_error(en_save_project(new Request($project))),'Duplicate slug rejected');
$project['id']=$draft['id'];$project['modified']='stale';check(is_wp_error(en_save_project(new Request($project))),'Stale update rejected');
$project['modified']=$draft['modified'];$project['status']='publish';$project['coverImage']='https://cms.example.com/image.jpg';$published=en_save_project(new Request($project));check($published['status']==='publish','Draft can be published');
$project['modified']=$published['modified'];$project['gallery']=['javascript:alert(1)'];check(is_wp_error(en_save_project(new Request($project))),'Unsafe media URL rejected');
$posts[99]=(object)['ID'=>99,'post_type'=>'post'];$project['id']=99;check(is_wp_error(en_save_project(new Request($project))),'Existing Elementor posts cannot be overwritten');
echo "$count checks passed\n";
