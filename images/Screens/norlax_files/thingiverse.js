 var $document = $(document);
var clickEventType = 'click'; //Ugh ios scrolling and touchend
var resizeEvent = (document.ontouchstart !== null) ? 'resize' : 'orientationchange';
var isIE10 = false;
/*@cc_on
  if (/^10/.test(@_jscript_version)) {
    isIE10 = true;
  }
@*/

function ajaxLoad()
{
	$('#ajax_loader').show();
}

function ajaxUnload()
{
	$('#ajax_loader').hide();
}

// Cool bug in jquery where this function does not work all the time!
// overriding it so that it works
$.param = function( obj )
{
  var ret = "";
  var appendNameValue = function( obj, name ) {
    if ( typeof(obj)!='array' && typeof(obj)!='object' )
    {
      if ( ret!="" )
        ret += "&";
      ret += name+"="+encodeURIComponent(obj);
    }
    else
    {
      for ( attribute in obj )
        if ( obj.hasOwnProperty(attribute) )
        {
          if ( name==undefined )
            appendNameValue( obj[attribute], attribute );
          else
            appendNameValue( obj[attribute], name+'['+attribute+']' );
        }
    }
  }
  appendNameValue( obj );
  return ret;
}

function add_images(thing_id)
{
	ajaxLoad();
	$('#add_images_button').attr('disabled', true);

	$('#manageimages').load('/ajax/things/addimages',
    {
			'id': thing_id,
			'image_ids': $('#image_ids').val()
		},
		function() {
			ajaxUnload();
			$('#add_images_button').removeAttr('disabled');
			$('#image_ids')[0].value = '';
		}
	);
}

function add_user_profile_image(user_id)
{
	ajaxLoad();
	$('#add_image_button').attr('disabled',true);

	$('#current-profile-image-image').load('/ajax/user/add_image_by_url',
    {
			'id': user_id,
			'image_id': $('#image_id').val()
		},
		function() {
			ajaxUnload();
			$('#add_image_button').removeAttr('disabled');
			$('#image_id')[0].value = '';
		}
	);
}

/* FIXME: reg. this differently and prevent default */
function set_thumbnail(thing_id, image_id)
{
	ajaxLoad();
	$('#set_thumb_' + image_id).attr('disabled',true);

	$('#manageimages').load( '/ajax/things/setthumbnail',
    {
			'id': thing_id,
			'image_id': image_id
		},
		function() {
			ajaxUnload();
			$('#set_thumb_' + image_id).removeAttr('disabled');
		}
	);
}

/* FIXME: reg. this differently and prevent default. where is it used? */
function render_image(image_id)
{
  if ( typeof(image_id)=='object' || typeof(image_id)=='array' )
    image_id = image_id.id;
	ajaxLoad();
	$('#render_image_' + image_id).attr('disabled',true);

	$.post('/ajax/render/resize_image', { 'id': image_id },
		function() {
			ajaxUnload();
			$('#render_image_' + image_id).removeAttr('disabled');
		}
	);
}

/* FIXME: reg. this differently and prevent default */
function delete_image(image_id)
{
	ajaxLoad();
	$('#delete_image_' + image_id).attr('disabled',true);

	$('#manageimages').load( '/ajax/things/deleteimage',
    { 'image_id': image_id }, ajaxUnload);
}

function reorder_thing_images(thing_id, image_ids)
{
  $.post( '/ajax/things/orderimages',
    { 'thing_id': thing_id, 'image_ids': image_ids });
}

function delete_file(file_id)
{
	ajaxLoad();
	$('#delete_file_' + file_id).attr('disabled', true);

	$('#managefiles').load( '/ajax/things/deletefile',
    { 'file_id': file_id }, ajaxUnload );
}

function render_file(file_id)
{
	//$('render_file_' + file_id).disable();

	$.post('/ajax/things/renderfile', { 'file_id': file_id });
}

function add_tags(thing_id)
{
  ajaxLoad();
  $('#add_tags_button').attr('disabled', true);

  $('#managetags').load( '/ajax/things/addtags',
    {
      'id': thing_id,
      'tags': $('#tags_to_add').val()
    },
    function() {
      ajaxUnload();
      $('#tags_to_add')[0].value = '';
      $('#add_tags_button').removeAttr('disabled');
    }
  );
}

function add_tag(ele, thing_id, tag)
{
  ajaxLoad();

  $(ele).hide();

  $('#managetags').load( '/ajax/things/addtags',
    { 'id': thing_id, 'tags': tag }, ajaxUnload );
}

function remove_tag(thing_id, tag_id)
{
  ajaxLoad();

  $('#managetags').load( '/ajax/things/deletetag',
    { 'thing_id': thing_id, 'tag_id': tag_id }, ajaxUnload );
}

function feature_thing(thing_id)
{
	$('#feature-btn').load( '/ajax/things/feature', { 'id': thing_id } );
}

function unfeature_thing(thing_id)
{
	$('#feature-btn').load( '/ajax/things/unfeature', { 'id': thing_id } );
}

function feature_collection(collection_id)
{
	$('#feature-btn').load( '/ajax/thingcollection/feature', { 'id': collection_id } );
}

function unfeature_collection(collection_id)
{
	$('#feature-btn').load( '/ajax/thingcollection/unfeature', { 'id': collection_id } );
}

function confirm_page_exit(){
    if (needToConfirm) return "You have unsaved data in your Thing's name, description, and instructions fields... in order to not lose data, please click 'Save' before leaving this page.";
}

function add_user_things_tab_listener(ele,idx){
  var my_div = $('#user-things >div').eq(idx);
  var e = $(ele);
  e.click(function(evt){
    evt.preventDefault();
    // give me the active class
    $('#user-things-tabs li').each(function(j,elm){
      if(j == idx){
        $(elm).addClass('active');
        e.unbind('click');
      } else {
        if($(elm).hasClass("active")){
          $(elm).removeClass('active');
          add_user_things_tab_listener(elm,j);
        }
      }
    });
    // fade out all the things sections, the fade in mine
    $('#user-things >div').filter(':visible').eq(0).hide();
    my_div.fadeIn('fast');
  });
}

function setup_user_things_tabs() {
  $('#user-things-tabs a').each(function(idx,ele){
    var e = $(ele);
    if(! e.parent().hasClass('active')){
      add_user_things_tab_listener(ele,idx);
    }
  });
}

function toggle_like(id, type)
{
	ajaxLoad();
  if ( type==undefined || type=='thing' )
  {
    $.post(
      '/ajax/things/toggle_like',
      {'id': id },
      function(response){
        $('.thing-favorites-container').html(response);
        ajaxUnload();
      }
    );
    return false;
  }
  if ( type=='make' )
  {
    $.post(
      '/ajax/makes/toggle_like',
      {'id': id },
      function(response){
        ajaxUnload();
      }
    );
    return false;
  }

  return false;
}

function toggle_follow_thing(target_id, elem)
{
  ajaxLoad();

  var evt_type = "unfollow";
  if(typeof(elem) !== 'undefined') {
    if(! $(elem).hasClass('active'))
      evt_type = "follow";
  }
  else if ($('#follow #follow_button').is(':visible'))
    evt_type = "follow";

  track_event(["dashboard",evt_type,"thing",target_id]);

  $.post(
    '/ajax/dashboard/set_thing_subscribe_state',
    {'action': 'toggle', 'target_id': target_id},
    function(response){
      $('#follow').html(response);
      ajaxUnload();
    }
   );
  return false;
}

function toggle_follow_tag(target_id, elem)
{
  ajaxLoad();

  var evt_type = "unfollow";
  if(typeof(elem) !== 'undefined') {
    if(! $(elem).hasClass('active'))
      evt_type = "follow";
  }
  else if ($('#follow #follow_button').is(':visible'))
    evt_type = "follow";

 	track_event(["dashboard",evt_type,"tag",target_id]);

  $.post(
    '/ajax/dashboard/set_tag_subscribe_state',
    {'action': 'toggle', 'target_id': target_id},
    function(response){
      $('#follow').html(response);
      ajaxUnload();
    }
   );
  return false;
}

function toggle_follow(target_type, target_id, elem)
{
  if(typeof(elem) == 'undefined') {
    elem = $('#follow_controls');
  }
  if ( $(elem).hasClass("is_following") )
  {
    $(elem).removeClass("is_following").addClass("not_following").removeClass("active");
		track_event(["dashboard","unfollow",target_type,target_id]);
  }
  else
  {
    $(elem).removeClass("not_following").addClass("is_following").addClass("active");
		track_event(["dashboard","follow",target_type,target_id]);
  }

	ajaxLoad();

	$.post(
    '/ajax/dashboard/set_subscribe_state',
    {'action': 'toggle', 'target_type': target_type, 'target_id': target_id},
    ajaxUnload
  );

	return false;
}

$(document).on(clickEventType, '.toggle_follow', function() {
  var $this = $(this);
  toggle_follow($this.data('type'), $this.data('id'), $this);
});

function manage_unsubscribe(subscription_id)
{
  ajaxLoad();
  $('#edit-subscriptions').load('/ajax/dashboard/manage_unfollow',
    {
      'id': subscription_id
    },
    ajaxUnload);
}

function recommend_subscribe(target_type, target_id)
{
	ajaxLoad();
	$('#subscription_view_container').load('/ajax/dashboard/recommend_subscribe',
		{
			'target_type': target_type,
			'target_id': target_id
		}
	);
}

function flag_thing(thing_id)
{
  alert("Implement Me!");
}

function check_upload_form(ele)
{
	var form = $(ele)[0];

	var filename = form['file'].value;
	filename = filename.replace(/^.*[\\\/]/, '');

	//error checking.
	if (!filename || filename.length == 0)
	{
		alert("You must select a file.");
		return false;
	}

	//figure out our extension
	var dot = filename.lastIndexOf('.');
	var extension = '';
	if (dot != -1)
		extension = filename.substr(dot+1,filename.length);

	//figure out our MIME/content-type and do something with it.
	var contentType = find_mime_type(extension);
	form['Content-Type'].value = contentType;

	//this is for prompting a download.
	if (contentType != 'application/octet-stream')
		form['Content-Disposition'].value = "";
	else
		form['Content-Disposition'].value = "Content-disposition: attachment; filename=" + filename;

	return true;
}

function find_mime_type(ext)
{
	ext = ext.toLowerCase();

	var mime_types = {
		pdf: 'application/pdf',
		zip: 'application/zip',
		tar: 'application/x-tar',
		tgz: 'application/x-tar',
		rar: 'application/x-rar-compressed',
		p3d: 'application/x-p3d',
		stl: 'application/sla',
		eps: 'application/postscript',
		ai: 'application/postscript',
		ps: 'application/postscript',
		ccad: 'application/clariscad',
		latex: 'application/x-latex',
		dvi: 'application/x-dvi',
		rtf: 'application/rtf',
		cdr: 'application/coreldraw',

		gif: 'image/gif',
		jpe: 'image/jpeg',
		jpg: 'image/jpeg',
		png: 'image/png',
		jpeg: 'image/jpeg',
		tiff: 'image/tiff',
		dwg: 'image/vnd.dwg',
		dxf: 'image/vnd.dxf',
		svg: 'image/svg+xml',
		svf: 'image/vnd.svf',
		epsi: 'image/x-eps',
		epsf: 'image/x-eps',
		lwo: 'image/x-lwo',


		iv: 'graphics/x-inventor',

		iges: 'model/iges',
		igs: 'model/iges',
		wrl: 'model/vrml',
		vrml: 'model/vrml',
		msh: 'model/mesh',
		mesh: 'model/mesh',
		silo: 'model/silo',
		dwf: 'model/vnd.dwf',
		'3dml': 'model/vnd.flatland.3dml',
		'3dm': 'model/vnd.flatland.3dml',
		gdl: 'model/vnd.gdl',
		dsm: 'model/vnd.gdl',
		win: 'model/vnd.gdl',
		dor: 'model/vnd.gdl',
		lmp: 'model/vnd.gdl',
		rsm: 'model/vnd.gdl',
		msm: 'model/vnd.gdl',
		ism: 'model/vnd.gdl',
		gtw: 'model/vnd.gtw',
		moml: 'model/vnd.moml+xml',
		mts: 'model/vnd.mts',
		x_b: 'model/vnd.parasolid.transmit-binary',
		x_t: 'model/vnd.parasolid.transmit-text',
		vtu: 'model/vnd.vtu',
		x3d: 'model/x3d+xml',
		pov: 'model/x-pov',

		txt: 'text/plain',
		htm: 'text/html',
		html: 'text/html'
	};

	var type = mime_types[ext];

	//standard default.
	if (!type)
		type = 'application/octet-stream';

	return type;
}

function render_js_template(tmpl_name, context)
{
  var tmpl = $('#' + tmpl_name).html();
  return _.template(tmpl, context);
}

function init_login_form()
{
  $('#ajax-login-form').submit(function(e){
      e.preventDefault();
      var usr = $('#usr').val();
      var pwd = $('#pwd').val();
      if ($('#rememberme').is(':checked')){
        var rmb = 1;
      } else {
        rmb = 0;
      }

      var submitButton = $('#ajax-login-form > button');
      submitButton.html('Signing you in<img src="/img/loading-dots.gif"/>');
      $.ajax({
        url: '/login',
        type: 'POST',
        data: {
          username: usr,
          password: pwd,
          rememberme: rmb,
          submit: 'Login',
          requestmode: 'ajax'
        },
        dataType: "json",
        success: function(r) {
          if ( r.loggedin ) { // If the login worked, refresh page.
            var sso = new SSO();
            sso.set_cookies(r, function(){
              location.reload(true);
            });
          } else { // else run the error function.
            ajax_login_error();
          }
        },
        error: ajax_login_error
      });
  });
}

function ajax_login_error() {
  $('#ajax-login').addClass('error');
  $('#ajax-login-terms').hide();
  $('#ajax-login-error').show();
  $('#ajax-login-form > button').html('Sign in');
}

function init_ancestor_search_form()
{
  $('#ancestor_search').click(function(event){
      event.stopPropagation();
      var thing_id = $('#ancestor_search_thing_id').val();
      var re_match = thing_id.match(/^(.*\/thing:)?([0-9][0-9]*)$/);
      if(re_match == null){
          show_ancestor_error("Could not understand '" + thing_id + "'.");
      } else {
        thing_id = re_match[2];
        $('#new_ancestor_btn').show();
        $.ajax({
            url: '/thing:' + thing_id,
            dataType: 'json',
            success: show_ancestor_update_form,
            error: function(){
                show_ancestor_error("Could not find a thing with ID '" + thing_id + "'.");
            }
        });
      }
   });
   change_enter_behavior('#ancestor_search_thing_id', function(){$('#ancestor_search').click();});

  $('#new_ancestor_btn').click(add_ancestor);
  $('#new_ancestor_btn').attr('disabled', true);
}

function insert_ancestor_form(ancestor)
{
  var re_match = document.location.pathname.match(/^.*\/thing:([0-9][0-9]*)(\/.*)?$/);
  var thing_id = re_match[1];
  var content = render_js_template('ancestor_template', ancestor);
  $(content).appendTo('#current-ancestors');
  $('#thing-ancestor-' + ancestor.id + ' .remove-ancestor-btn').click(function(){
    remove_ancestor(thing_id, ancestor.id);
  }).show();
  $('#current-ancestors').show();
}

function remove_ancestor(thing_id, ancestor_id)
{
  $.ajax({
      url: '/thing:' + thing_id + '/drop_ancestor:' + ancestor_id,
      dataType: 'json',
      success: function(data){
        $('#thing-ancestor-' + ancestor_id).remove();
      },
      error: function(err){
          show_ancestor_error(err);
      }
  });
}

function show_ancestor_error(message)
{
  $('#new_ancestor_content').html("<div class='BaseError'>" + message + "</div>");
  $('#new_ancestor_btn').hide();
  $('#new_ancestor').show();
}

function show_ancestor_update_form(thing){
    var content = render_js_template('ancestor_template', thing);
    $('#new_ancestor_content').html(content);
    $('#new_ancestor_thing_id')[0].value = thing.id;
    var sub_btn = $('#new_ancestor_btn');
    if(thing.license.allows_derivatives){
        sub_btn.removeAttr('disabled');
        sub_btn.show();
    } else {
        sub_btn.attr('disabled',true);
    }
    $('#new_ancestor').show();
}

function add_ancestor(){
  var re_match = document.location.pathname.match(/^.*(\/thing:[0-9][0-9]*)(\/.*)?$/);
  var thing_url = re_match[1];
  var anc_id = $('#new_ancestor_thing_id').val();
  var action = thing_url + "/add_ancestor:" + anc_id;
  $.ajax({
      url: action,
      dataType: 'json',
      success: function(data){
        insert_ancestor_form(data);
        $('#new_ancestor').hide();
        $('#ancestor_search_thing_id')[0].value = '';
      },
      error: function(err){
          show_ancestor_error(err);
      }
  });
}

function show_same_design_options()
{
	$('#modified_design').hide();
	$('#same_design').show();
	$('#image_ids').focus();
}

function show_modified_design_options()
{
	$('#same_design').hide();
	$('#modified_design').show();
}

function add_derivative_image(derivative_id)
{
	ajaxLoad();
	$('#add_image_button').attr('disabled',true);

	$('#current_image').load( '/ajax/derivative/set_image',
    {
			'id': derivative_id,
			'image_id': $('#image_id')[0].value
		},
		function() {
			ajaxUnload();
			$('#add_image_button').removeAttr('disabled');
			$('#image_id')[0].value = '';
		}
	);
}

function empty_render_queue()
{
	ajaxLoad();

	$('#result').load( '/ajax/admin/empty_render_queue', ajaxUnload );
}

function empty_background_queue()
{
	ajaxLoad();

	$('#result').load( '/ajax/admin/empty_background_queue', ajaxUnload );
}

function empty_completed_queue()
{
	ajaxLoad();

	$('#result').load( '/ajax/admin/empty_completed_queue', ajaxUnload );
}

function add_thing_category(elem_id, thing_id)
{
	ajaxLoad();

  var params = $(elem_id).serializeObject();
  params['id'] = thing_id;
	$('#managecategories').load( '/ajax/things/add_category', params, ajaxUnload );
}

function remove_thing_category(link_id)
{
  ajaxLoad();

  $('#managecategories').load( '/ajax/things/remove_category',
    { 'link_id': link_id }, ajaxUnload );
}

function resizeIframeToFitContent(frame)
{
	if (document.frames)
	{
		frame.height = 300;
	}
	else
	{
		var innerDoc = (frame.contentDocument) ? frame.contentDocument : frame.contentWindow.document;
		var realHeight = 0;

		if (innerDoc.height)
			realHeight = innerDoc.height;
		else if (innerDoc.body.offsetHeight)
			realHeight = innerDoc.body.offsetHeight

		if (realHeight)
		  frame.style.height = realHeight + 'px';
	}
}

function selectAll(ele)
{
	ele.focus();
	ele.select();
}

/* FIXME: may have to replace this where it is used with change_enter_behavior */
function checkEnter(e){ //e is event object passed from function invocation
	var characterCode //literal character code will be stored in this variable

	if(e && e.which){ //if which property of event object is supported (NN4)
		e = e
		characterCode = e.which //character code is contained in NN4's which property
	}
	else{
		e = event
		characterCode = e.keyCode //character code is contained in IE's keyCode property
	}

	if(characterCode == 13){ //if generated character code is equal to ascii 13 (if enter key)
		return true
	}
	else{
		return false
	}
}

/** Poll Editing **/

function poll_add_answer(poll_id)
{
	ajaxLoad();
	$('#manage_answers').load( '/ajax/polls/add_answer',
    { 'id': poll_id }, ajaxUnload );
}

function poll_update_answer(answer_id)
{
  ajaxLoad();
  $('#manage_answers').load( '/ajax/polls/update_answer',
    {
      'id': answer_id,
      'answer': $('#poll_answer_' + answer_id).val()
    },
		function() {
      /* FIXME: requires jQuery UI Effects */
      $('#poll_answer_' + answer_id).effect("highlight",{},3000);
      ajaxUnload();
    }
  );
}

function poll_delete_answer(answer_id)
{
  ajaxLoad();
  $('#manage_answers').load( '/ajax/polls/delete_answer',
    { 'id': answer_id }, ajaxUnload );
}

function poll_submit_response()
{
  var poll_form = $('#sidebar_poll_form')[0];
	ajaxLoad();
	$('#poll_status').load( poll_form.action,
    poll_form.serializeObject,
		ajaxUnload
	);
}

function arrow_toggle(ele_id)
{
  $("#" + ele_id).toggle('fast');
  var arrow_img = $("#" + ele_id + "-toggle img")[0];
  if(/-expanded.png$/.test(arrow_img.src)) {
    arrow_img.src = arrow_img.src.replace(/expanded/,"unexpanded");
  } else {
    arrow_img.src = arrow_img.src.replace(/unexpanded/,"expanded");
  }
}

function change_enter_behavior(selector, new_behavior)
{
  var fields = $(selector);
  var callback = function(event) {
    if(event.keyCode == 13) {
      new_behavior();
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  };
  if ($.browser.mozilla) {
    $(fields).keypress(callback);
  } else {
    $(fields).keydown(callback);
  }
}

/** attach_sort_events({container: 'selector', ... }) */
function attach_sort_events(options)
{
  var defaults = {
    'sortable_selector': '> *',
    'map': {}
  };
  var opts = $.extend({}, defaults, options);
  $.each(opts['map'], function(selector, data_attr) {
    $(selector).click(function(elem){
      var sort_dir = $(this).hasClass("ascending") ? 'descending' : 'ascending';
      $.each(opts['map'], function(sel, ign){
        $(sel).removeClass('ascending');
        $(sel).removeClass('descending');
      });
      $(this).addClass(sort_dir);
      sort_by_data_attribute(opts['container'], opts['sortable_selector'], data_attr, sort_dir);
    });
  });
}

function sort_by_data_attribute(container, child_selector, data_attr, sort_dir){
  var sort_elems = $(container).find(child_selector);
  $.each(sort_elems, function(idx,el){ $(el).detach(); });
  var reverse = (sort_dir == 'ascending');
  sort_elems.sort(function(a,b){
    var av, bv;
    if(typeof(data_attr) == "function"){
      av = data_attr.call(a);
      bv = data_attr.call(b);
    } else {
      av = $(a).attr('data-' + data_attr);
      bv = $(b).attr('data-' + data_attr);
    }
    var check = ((av < bv) ? -1 : ((av > bv) ? +1 : 0)) * [-1,1][+!!reverse];
    if(check == 0){
      // sort by id for tiebreakers
      av = a.id;
      bv = b.id;
      return ((av < bv) ? -1 : ((av > bv) ? +1 : 0)) * [-1,1][+!!reverse];
    } else {
      return check;
    }
  });
  $.each(sort_elems, function(idx,el){ $(container).append(el); });
}

/* Turn a form into a hash of {name: value, name:[value,value],...} */
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function uncheck_feature_all_users_for_feature(mask)
{
  var feature_boxes = $('input[name^="user_features"][name$="[' + mask + ']"]');
  feature_boxes.each(function(idx,e){ e.checked = false; });
}

function check_feature_all_users_for_feature(mask)
{
  var feature_boxes = $('input[name^="user_features"][name$="[' + mask + ']"]');
  feature_boxes.each(function(idx,e){ e.checked = true; });
}

function uncheck_feature_all_features_for_user(user_id)
{
  var user_boxes = $('input[name^="user_features[' + user_id + ']"]');
  user_boxes.each(function(idx,e){ e.checked = false; });
}

function feature_grid_add_user()
{
  var add_user_element = $('#features_add_user').get(0);
  var username = add_user_element.value;
  var html = render_js_template('features_new_user_row', {'username': username});
  $("#user_features_grid tbody").append(html);
  add_user_element.value = "";
}

/**
 * Javascript Relative Time Helpers
 * https://github.com/jherdman/javascript-relative-time-helpers
 *  The MIT License

 *  Copyright (c) 2009 James F. Herdman

 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:

 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.

 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 * Returns a description of this past date in relative terms.
 * Takes an optional parameter (default: 0) setting the threshold in ms which
 * is considered "Just now".
 *
 * Examples, where new Date().toString() == "Mon Nov 23 2009 17:36:51 GMT-0500 (EST)":
 *
 * new Date().toRelativeTime()
 * --> 'Just now'
 *
 * new Date("Nov 21, 2009").toRelativeTime()
 * --> '2 days ago'
 *
 * // One second ago
 * new Date("Nov 23 2009 17:36:50 GMT-0500 (EST)").toRelativeTime()
 * --> '1 second ago'
 *
 * // One second ago, now setting a now_threshold to 5 seconds
 * new Date("Nov 23 2009 17:36:50 GMT-0500 (EST)").toRelativeTime(5000)
 * --> 'Just now'
 *
 */
Date.prototype.toRelativeTime = function(now_threshold) {
  var delta = new Date() - this;

  now_threshold = parseInt(now_threshold, 10);

  if (isNaN(now_threshold)) {
    now_threshold = 0;
  }

  if (delta <= now_threshold) {
    return 'Just now';
  }

  var units = null;
  var conversions = {
    millisecond: 1, // ms    -> ms
    second: 1000,   // ms    -> sec
    minute: 60,     // sec   -> min
    hour:   60,     // min   -> hour
    day:    24,     // hour  -> day
    month:  30,     // day   -> month (roughly)
    year:   12      // month -> year
  };

  for (var key in conversions) {
    if (delta < conversions[key]) {
      break;
    } else {
      units = key; // keeps track of the selected key over the iteration
      delta = delta / conversions[key];
    }
  }

  // pluralize a unit when the difference is greater than 1.
  delta = Math.floor(delta);
  if (delta !== 1) { units += "s"; }
  return [delta, units, "ago"].join(" ");
};

/*
 * Wraps up a common pattern used with this plugin whereby you take a String
 * representation of a Date, and want back a date object.
 */
Date.fromString = function(str) {
  return new Date(Date.parse(str));
};

/*
 * Change time tags to be local time of day
 */
function formatTime() {
 $('time').each(function(index, element) {
   var $element = $(element);
   var time = new Date($element.attr('datetime'));
   
   // If it is today, format the time
   if (time.toLocaleDateString() == new Date().toLocaleDateString()) {
     $element.html(time.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}));
   }
 });
}

/*
 * For client-side checking of collection names.
 */
String.prototype.getSlug = function(){
  var ret = jQuery.trim(this).toLowerCase();
  ret = ret.replace(/&/g, 'amp')
      .replace(/</g, 'lt')
      .replace(/>/g, 'gt')
      .replace(/"/g, 'quot')
      .replace(/'/g, '')
      .replace(/[^a-zA-Z0-9\/_|+ -]/g, '')
      .replace(/[\/_|+ -]+/g, '-');
  return ret;
}

/*
 * See if a text field is overflowing
 */
function textOverflows(element) {
  // render an unbounded version of the element
  var temp = $(element.cloneNode(true))
    .hide()
    .css("position", "absolute")
    .css("overflow", "visible")
    .width("auto")
    .height($(element).height());
  $(element).after(temp);
  // see if it overflows
  var overflows = element.innerHTML.length>0 && temp.width()>$(element).width();
  // cleanup
  temp.remove();
  return overflows;
}

/*
 * give a 'show more' button for long text areas
 */
function textCollapseVertical(element, targetHeight) {
  if(typeof element === 'undefined') return;
  var element = $(element);
  // see if we've already been called on this element
  if ( element.attr("textCollapseVertical") )
    return;
  // check unbounded height
  var temp = $(element.get(0).cloneNode(true))
    .hide()
    .css("position", "absolute")
    .css("overflow", "visible")
    .css("maxHeight", "none")
    .width($(element).width())
    .height("auto");
  element.after(temp);
  var elementHeight = temp.height();
  if ( targetHeight==undefined )
  {
    var targetHeight = element.height();
    if ( element.css("maxHeight")!='none' )
      targetHeight = parseInt(element.css("maxHeight"));
  }
  var fullHeight = temp.height();
  // cleanup
  temp.remove();
  // see if it overflows
  if ( fullHeight>targetHeight )
  {
    // mark as influenced by this function
    element.attr("textCollapseVertical", "1");
    element.css("maxHeight", "none");
    // compensate for the 'read more' button height
    targetHeight -= 25;
    // wrap original content
    var content = $(document.createElement('div'));
    content.html(element.html());
    element.html("");
    // add transition
    var prefixes = ["", "-webkit-", "-moz-", "-o-", "-ms-"];
    for ( var i=0; i<prefixes.length; i++ )
      content.css(prefixes[i]+"transition", "max-height .5s ease");
    // hide overflow
    content.css("maxHeight", targetHeight+"px");
    content.css("overflow", "hidden");
    content.appendTo(element);

    // add toggle visiblity link
    var showMore = $(document.createElement('div'));
    // track the target height
    showMore.attr("fullHeight", fullHeight+"px");
    showMore.attr("targetHeight", targetHeight+"px");
    showMore.css("width", element.width()+"px"); // adjust for border or padding here
    showMore.css("line-height", "20px");
    showMore.css("margin-top", "-55px");
    showMore.css("padding-top", "60px");
    showMore.html('Read More');
    showMore.addClass('read-more');
    showMore.click(function(){
      if ( !$(this).hasClass('expanded') )
      {
        this.innerHTML = 'Read Less';
        $(this).prev().css("maxHeight", $(this).attr("fullHeight"));
        $(this).addClass('expanded');
        $(this).css("margin-top", "0px");
        $(this).css("padding-top", "0px");
      }
      else
      {
        this.innerHTML = 'Read More';
        $(this).prev().css("maxHeight", $(this).attr("targetHeight"));
        $(this).removeClass('expanded');
        $(this).css("margin-top", "-55px");
        $(this).css("padding-top", "60px");
      }
    });
    showMore.appendTo(element);
  }
}

// enable vertically collapsable elements
function toggleCollapsedState(element) {
  var element = $(element);
  element.children().each( function(index, child) {
      var expand = true;
      // elements labeled with 'large-view' only visible while expanded
      if ( element.hasClass('expanded') && $(child).hasClass('large-view') )
        expand = false;
      // show elements labeled with 'small-view' while minified
      if ( !element.hasClass('expanded') && $(child).hasClass('small-view') )
        expand = false;
      // TODO when we have a javascript framework, come back and use CSS for this
      if (!expand)
      {
        $(child).animate({ 'max-height': '0px' });
        $(child).css("padding-top", "0px");
        $(child).css("padding-bottom", "0px");
        $(child).css("border-top", "none");
      }
      else
      {
        $(child).animate({ 'max-height': $(child).get(0).scrollHeight });
        $(child).css("padding-top", "5px");
        $(child).css("padding-bottom", "5px");
        $(child).css("border-top", "solid 1px rgba(0,0,0,0.2)");
      }
  });
  element.toggleClass('expanded');
}

/*
  Pre-slice print functions
*/

// open new print window
$('#show_add_print').click(function(e){
  // reset the state
  $('select[name=printer_id] option[value=1]').attr('selected', 'selected');
  $('input:text[name=print_name]').val('');
  $('input:radio[name=extruder_count][value=1]').attr('checked', 'checked').click();

  [1,2].map(function(extruder){
    $("[data-extruder='" + extruder + "'] .stl_file").each(function(other){
      $(this).removeClass('selected');
    });
  });

  $('#new_print_container').toggle();
});

// close new print window
$('#hide_add_print').click(function(e){
  $('#new_print_container').hide();
});

$('.stl_file').click(function(e){
  this_element = $(this);
  extruder = $(this).parent().data('extruder');
  extruder_count = $('input:radio[name=extruder_count]:checked').val();

  if (extruder == 1) {
    other_extruder = 2;
  } else {
    other_extruder = 1;
  }

  // hide this stl on the other extruder list
  $("[data-extruder='" + other_extruder + "'] .stl_file").each(function(other){
    $(this).show();
  });
  $("[data-extruder='" + other_extruder + "'] .stl_file[data-file-id=" + this_element.data('file-id') + "]").hide();

  // clear all other selections for this extruder, then selected the one clicked
  $("[data-extruder='" + extruder + "'] .stl_file").each(function(other){
    $(this).removeClass('selected');
  });

  this_element.addClass('selected');

  // build a suggested filename
  extruder1_name = ($('.print_stl_list[data-extruder=1] .stl_file.selected').data('file-name') || '').split('.').reverse().pop();

  if (extruder_count == 1) {
    suggested_filename = extruder1_name;
  } else {
    extruder2_name = ($('.print_stl_list[data-extruder=2] .stl_file.selected').data('file-name') || '').split('.').reverse().pop();
    suggested_filename = extruder1_name + '_' + extruder2_name;
  }

  $('input:text[name=print_name]').val(suggested_filename.substring(0,22));
});

// change extruder count
$('input:radio[name=extruder_count]').click(function(e){
  if ($(this).val() == '1') {
    $('#single_instructions').show();
    $('#dual_instructions').hide();
    $('#extruder_labels').hide();
    $('[data-extruder=1]').show();
    $('[data-extruder=2]').hide();
    $('.print_stl_list[data-extruder=2] .stl_file.selected').click();
    $('.print_stl_list[data-extruder=2] .stl_file.selected').removeClass('selected');
  } else {
    $('#single_instructions').hide();
    $('#dual_instructions').show();
    $('#extruder_labels').show();
    $('[data-extruder=1]').show();
    $('[data-extruder=2]').show();
  }
});

$('#add_print').click(function(e){
  thing_id = $('#add_print').data('thing-id');
  printer_id = $('select[name=printer_id]').val();
  print_name = $('input:text[name=print_name]').val();
  extruder_count = $('input:radio[name=extruder_count]:checked').val();
  extruder1_file_id = $('.print_stl_list[data-extruder=1] .stl_file.selected').data('file-id');
  extruder2_file_id = $('.print_stl_list[data-extruder=2] .stl_file.selected').data('file-id');
  slicer_id = 1; // hardcoded TODO: future support for multiple slicers, 1 = skeinforge 35

  if (!printer_id) {
    alert('You must select a printer');
    return false;
  }

  if (!print_name) {
    alert('You must enter a print name');
    return false;
  }

  if (!extruder_count) {
    alert('You must select the number of extruders');
    return false;
  }

  if (!extruder1_file_id) {
    alert('You must select an STL file for extruder 1');
    return false;
  }

  if (extruder_count > 1) {
    if (!extruder2_file_id) {
      alert('You must select an STL file for extruder 2');
      return false;
    }

    if (extruder1_file_id == extruder2_file_id) {
      alert('You cannot select the same STL for both extruders');
      return false;
    }
  }

	ajaxLoad();
  $('#add_print').attr('disabled','disabled');

  $.ajax({
    type: 'POST',
    url: '/ajax/things/add_print_job',
    data: {
      'id': thing_id,
      'printer_id': printer_id,
      'print_name': print_name,
      'extruder_count': extruder_count,
      'slicer_id': slicer_id,
      'extruder1_file_id': extruder1_file_id,
      'extruder2_file_id': extruder2_file_id
    },
    success: function(response) {
      $('#manageprints').html(response);
      $('#add_print').removeAttr('disabled');
      $('#new_print_container').hide();
      ajaxUnload();
    },
    error: function(e) {
      alert('Error: ' + e.responseText);
      $('#add_print').removeAttr('disabled');
      ajaxUnload();
    }
  });

});

$('.delete-print').on('click', function(e){
	if (confirm('Are you sure you want to delete this print job?')) {
		print_job_id = $(this).data('print-job-id');

	  $.ajax({
	    type: 'POST',
	    url: '/ajax/things/delete_print_job',
	    data: {
	      'id': print_job_id
	    },
	    success: function(response) {
	      $('#manageprints').html(response);
	      ajaxUnload();
	    },
	    error: function(e) {
	      alert('Error: ' + e.responseText);
	      ajaxUnload();
	    }
	  });
	}
});

$('.queue-print').on('click', function(e){
	print_job_id = $(this).data('print-job-id');

  $.ajax({
    type: 'POST',
    url: '/ajax/things/queue_print_job',
    data: {
      'id': print_job_id
    },
    success: function(response) {
      ajaxUnload();
    },
    error: function(e) {
      alert('Error: ' + e.responseText);
      ajaxUnload();
    }
  });
});

$('.toggle-verify-print').on('click', function(e){
	print_job_id = $(this).data('print-job-id');

	$.ajax({
		type: 'POST',
		url: '/ajax/things/toggle_print_verification',
		data: {
			'id': print_job_id
		},
		success: function(response) {
			$('#manageprints').html(response);
			ajaxUnload();
		},
		error: function(e) {
			alert('Error: ' + e.responseText);
			ajaxUnload();
		}
	});
});

$('.verify_print').on('click', function(e){
	thing_id = $(this).data('thing-id');

	$.ajax({
		type: 'POST',
		url: '/ajax/things/verify_print',
		data: {
			'id': thing_id
		},
		success: function(response) {
			$('#verify_buttons').html(response);
			ajaxUnload();
		},
		error: function(e) {
			alert('Error: ' + e.responseText);
			ajaxUnload();
		}
	});
});

// open new print window
$('#thing-print-jobs #print-button a').click(function(e){
	e.preventDefault();
  $('#print-download-window').toggle();
});

// close new print window
$('#print-download-window #ok-button').click(function(e){
  $('#print-download-window').hide();
	return false;
});

$('#print-instructions-button').click(function(e){
	e.preventDefault();
	$('#print-instructions').toggle();
});

$('#print-files #material-select input[name="material_id"]:radio').change(function(e) {
	material_id = $(this).val();
	$('.print-file').hide();
	$('.print-file[data-material-id="' + material_id + '"]').show();
});

//Help non-capable browsers out with HTML5 forms
if(typeof webshims !== 'undefined') $.webshims.polyfill('forms');

//GA event tracking
/* Data attributes used for tracking
	data-track-category
	data-track-action
	data-track-label
	data-track-value
	data-track-noninteraction
*/
$('.track').click(function(e) {
	var $this = $(this),
		eventArray = [];

	if($this.data('trackCategory'))
		eventArray.push($this.data('trackCategory'));
	if($this.data('trackAction'))
		eventArray.push($this.data('trackAction'));
	if($this.data('trackLabel'))
		eventArray.push($this.data('trackLabel'));
	if($this.data('trackValue'))
		eventArray.push($this.data('trackValue'));
	if($this.data('trackNoninteraction'))
		eventArray.push($this.data('trackNoninteraction'));

	if(eventArray.length)
		track_event(eventArray);
});

function track_event(tracking) {
  if(_gaq && tracking.unshift) {
    tracking.unshift('_trackEvent');
	  _gaq.push(tracking);
	}
}

function track_page(url) {
  if(_gaq) {
    _gaq.push(['_trackPageview', url]);
  }
}

function seen_notification_banner()
{
	ajaxLoad();
  $.post(
    '/ajax/user/seen_notification',
    {},
    function(response){
      $('.notification-banner').css("display", "none");
      ajaxUnload();
    }
  );
  return false;
}

var Thingiverse = (function() {
  var self = {};

  self.dialog = (function() {
    var self = {
      'templates': {}
    };

    /**
     * Options
     * - class (default "confirm-dialog"). For extra styling options.
     * - message (HTML allowed)
     * - button_text (default "Yes, remove it.")
     * - button_class (default "btn btn-danger")
     * - action (e.g. "/file:32425/delete")
     * - data (e.g. { 'thing': 12345 }, function($dialogElem){ ... })
     *   Object containing data to POST to the action URL, or a function that
     *   takes in the dialog DOM element and returns such an object.
     * - success (e.g. function(responseData, dialogElem){ ... }).
     *   Default: dialogElem.modal('hide');
     * - failure (e.g. function(responseData, dialogElem){ ... }).
     *   Default: alert(responseData);
     * - template (e.g. 'confirm-dialog', { 'action':'/collection/derp', 'data':{...} })
     *   String for an Underscore HTML template or an object w/ action and data to pass
     *   to an AJAX GET request to retrieve the modal content.
     * - rendered (e.g. function($dialogElem) {...}). Callback for wiring up
     *   events other than the submit and cancel buttons.
     */
    self.create = function(options) {
      // merge our defaults w/ the passed-in options
      var opts = _.defaults(
        options,
        {
          'button_text': 'Yes, remove it.',
          'button_class': 'btn btn-danger',
          'data': {},
          'failure': function(responseData, dialogElem){ alert(responseData.responseText); },
          'class': 'confirm-dialog',
          'message': 'Are you sure you want to remove this item?',
          'message_processing': '',
          'message_success': 'Removed!',
          'template': 'confirm-dialog',
          'modal_id': 'confirm-dialog'
        }
      );

      // get/create modal and its content from template
      var $elem = self.get_modal_elem(opts['modal_id'], opts['class']);
      var wire_and_show = function($elem, opts) {
        // wire up events
        $elem.find('button.dialog-submit').click(self.submitCallback(opts, $elem));

        // allow caller to wire events
        if(typeof opts['rendered'] == 'function'){
          opts['rendered']($elem);
        }

        // show the modal
        $elem.modal();
      }

      if(typeof opts['template'] == 'string') {
        self.render_template($elem, opts['template'], opts, function(){
          wire_and_show($elem, opts);
        });
      } else if(typeof opts['template'] == 'object') {
        var $jqXHR = $.get(opts['template']['action'], opts['template']['data']);
        $jqXHR.success(function(content, textStatus, jqx){
          $elem.html(content);

          wire_and_show($elem, opts);
        });
        $jqXHR.error(function(jqx, textStatus, error){
          // XHR swallows 301/302 redirects. We wrap them as errors w/
          // a JSON payload to, e.g., redirect elsewhere.
          var resp = JSON.parse(jqx.responseText) || {};
          if(resp.redirect)
            window.location = resp.redirect
        });
      }
    }

    /**
     * Returns a function which submits this dialog's action passes along data
     * to success/failure callbacks, etc.
     */
    self.submitCallback = function(opts, $dialogElem) {
      return function(e){
        if(opts['action']){
          // what data do we submit?
          var submitData = {};
          if(typeof opts['data'] == 'object') {
            // we just plain have data. send it.
            submitData = opts['data'];
          } else if(typeof opts['data'] == 'function') {
            // function should return our submit data,
            // given the dialog element
            submitData = opts['data']($dialogElem);
          }

          // show that we are processing
          $dialogElem.find('.dialog-wait-message').html(
            '<span class="text-info">' + opts['message_processing'] + '</span>'
          );
          $dialogElem.find('.dialog-wait').removeClass('hide');

          $jqXHR = $.post(
            opts['action'],
            submitData
          );
          $jqXHR.error(function(responseData){
            opts['failure'](responseData);
            $dialogElem.find('.dialog-wait').addClass('hide');
          });
          $jqXHR.success(function(responseData){
            // dismiss!
            $dialogElem.find('.dialog-wait-message').html(
              '<span class="text-success">' + opts['message_success'] + '</span>'
              );
            // close the modal (with delay)
            setTimeout(
              function(){
                $dialogElem.modal('hide');
                if(opts['success'])
                  opts['success'](responseData);
                }, 750
              );
          });
        }
      };
    }

    /**
     * Find (if already in the document) or create a modal element.
     */
    self.get_modal_elem = function(id, klass) {
      var $elem = $('#' + id);
      if($elem.length == 0) {
        $('<div/>', {
          'id': id,
          'class': "modal hide fade " + klass
        }).appendTo('body');
      }
      return $('#' + id);
    };

    /**
     * Render the Underscore JS template with the given tmpl_id, using
     * the given options as data.
     * Stores the rendered template HTML in $elem, then calls callback
     * Searches for template data:
     *  1. Searchesthe current document for a script tag with the given id.
     *  2. If that fails, attempts to fetch '/tmpl/<id>.html'.
     * Caches the resulting Underscore JS template if successful.
     */
    self.render_template = function($elem, tmpl_id, options, callback) {
      var do_render = function($elem, tmpl, options) {
        $elem.html(tmpl(options));
        callback();
      };

      if(self.templates[tmpl_id]){
        do_render($elem, self.templates[tmpl_id], options);
      } else {
        var $script = $('script#' + tmpl_id);
        if ($script.length > 0) {
          self.templates[tmpl_id] = _.template($script.html());
        } else {
          var tmpl_url = '/tmpl/' + tmpl_id + '.html';
          var $jqXHR = $.get(tmpl_url);
          $jqXHR.error(function(jqx){
            console.log("Failed to fetch template " + tmpl_url);
          });
          $jqXHR.success(function(content){
            self.templates[tmpl_id] = _.template(content);
            do_render($elem, self.templates[tmpl_id], options);
          });
        }
      }
    };

    return self;
  }());

  self.subscriptions = (function() {
  	var self = {};

  	function setState(state, type, id, callback) {
  		$.ajax({
  			"url":"/ajax/dashboard/set_subscribe_state",
  			"type":"post",
  			"data": {
  				"action":state,
  				"target_type":type,
  				"target_id":id
  			},
  			"success": callback
  		});
  	};

  	self.poll = function poll() {return;
  		$.ajax("/ajax/dashboard/poll", {
  			success: function(data) {
  				if (data.activityCount > 99) {
  					$('#nav-activity').html("&infin;").addClass("infin").show();
  				}
  				else if (data.activityCount > 0) {
  					$('#nav-activity').html(data.activityCount).removeClass('infin').show();
  				}
  				else {
  					$('#nav-activity').hide();
  				}
  			}
  		});
  	};

  	self.isFollowing = function isFollowing(element) {
  		return $(element).hasClass("is_following");
  	};

  	self.followClick = function followClick(type, id, element) {
  		if (self.isFollowing(element)) {
  			setState("unsubscribe", type, id, null);
  			$(element).removeClass("is_following").addClass("not_following").children("a").html("Follow");
  			track_event(["dashboard","unfollow",type,id]);
  		}
  		else {
  			setState("subscribe", type, id, null);
  			$(element).addClass("is_following").removeClass("not_following").children("a").html("Following");
  			track_event(["dashboard","follow",type,id]);
  		}
  	};

  	self.initScroll = function(container_selector) {
  	  container_selector = typeof container_selector !== 'undefined' ? container_selector : '.things';

      Thingiverse.scroll.init({
        'container': $(container_selector),
        'source': '/ajax/dashboard/list_events'
      });
  	};

  	return self;
  }());

  self.scroll = (function() {
    var self = {
      'container': null,
      'source': null,
      'source_data': {},
      'minPage': 1, // first page is 1
      'maxPage': 1, // first page is 1
      'finalPage': false,
      'loading': false,
      'scrolling': null,
      'addButtons': true,
      'maxPages': 5,
      'backToTopHeight': 0
    };
  
    self.init = function(options) {
      self.container = $(options['container']);
      self.backToTopHeight = self.container.position().top;
      self.source = options['source'];
      self.source_data = options['source_data'] ? options['source_data'] : {};
      self.autoScroll = (options['auto_scroll'] === 0) ? false : true;
    
      if(options.hasOwnProperty('page')) {
        self.minPage = options['page'];
        self.maxPage = options['page'];
      }
      if(options.hasOwnProperty('final_page')) {
        self.finalPage = options['final_page'];
      }
      if(options.hasOwnProperty('scrolling'))
        self.scrolling = options['scrolling'];
      
      // wire up back-to-top button
      $('#back-to-top').css('display', 'block');
      $('#back-to-top').click(self.backToTop);
    
      $(window).on('keyup.thingiverse.scroll', function(e){
        if(e.keyCode == 36) // Home key
          self.backToTop();
      });
    
      if(self.addButtons){
        $(self.createMoreButton()).insertBefore(self.container);
        $(self.createMoreButton()).insertAfter(self.container);
      }
      var $containerParent = self.container.parent();
      self.prevPageButton = $containerParent.find('.view-more').first();
      self.prevPageStatus = $containerParent.find('.view-more-status').first();
      self.nextPageButton = $containerParent.find('.view-more').last();
      self.nextPageStatus = $containerParent.find('.view-more-status').last();
    
      if(self.minPage <= 1)
        self.prevPageButton.addClass('hidden');
      if(self.finalPage && (self.finalPage == self.maxPage))
        self.nextPageButton.addClass('hidden');
      
      
      var scrollHandler = function(e) {
          var scrollTop = $(window).scrollTop();
          var scrollBottom = scrollTop + $(window).height();
  				var nextMore = self.nextPageButton.offset().top-200;
          var prevMore = self.prevPageButton.offset().top;

          if(self.autoScroll && !self.loading) {
            if(scrollTop<prevMore && self.minPage > 1){
              self.prevPage();
              if(self.scrolling)
                self.scrolling(self.minPage);
            }
            if (scrollBottom>nextMore && ((!self.finalPage) || (self.maxPage < self.finalPage))) {
              self.nextPage();
              if(self.scrolling)
                self.scrolling(self.maxPage);
            	}
    		  }

    			if (scrollTop > self.backToTopHeight && !$('#back-to-top').hasClass('in')) {
    				$('#back-to-top').addClass('in');
    			}
    			else if (scrollTop <= self.backToTopHeight && $('#back-to-top').hasClass('in')) {
    				$('#back-to-top').removeClass('in');
    			}
    	};

    	$(window).scroll( $.debounce(250, scrollHandler));

      self.nextPageButton.click(function(e){
        e.preventDefault();
        self.nextPage();
      });
      self.prevPageButton.click(function(e){
        e.preventDefault();
        self.prevPage();
      });

      // mark the first element as the first page indicator.
      // if beyond page 1, insert a marker and adjust scrollTop.
      if(self.minPage == 1) {
        var $marker = self.container.find('> *:not(script):first');
        $marker.attr('data-page', self.minPage);
      } else {
        var $marker = self.getMarker(self.minPage);
        self.container.prepend($marker);
        $(window).scrollTop(self.container.position().top);
      }
    };

    // super crappy. refactor me and init(..) above.
    self.reinitialize = function(options) {
      if(options['source_data'])
        self.source_data = options['source_data'];

      if(options.hasOwnProperty('source'))
        self.source = options['source'];

      if(options.hasOwnProperty('container')){
        self.container = $(options['container']);
        self.backToTopHeight = self.container.position().top + 100;
      }

      if(options.hasOwnProperty('page')) {
        self.minPage = options['page'];
        self.maxPage = options['page'];
        if(self.minPage <= 1)
          $(self.prevPageButton).addClass('hidden');
        if((self.finalPage) && (self.maxPage >= self.finalPage))
          $(self.nextPageButton).addClass('hidden');
      }

      if(options.hasOwnProperty('scrolling'))
        self.scrolling = options['scrolling'];

      // mark the first element as the first page indicator
      self.container.find('> *:not(script):first').attr('data-page', self.maxPage);
      self.nextPage();
    };

    self.backToTop = function() {
      $(window).scrollTop(0);
      self.updatePageNum(1);
      if (self.minPage > 1) {
        $(self.container).empty();
        self.reinitialize({'page': 0});
      }
    };

  	self.nextPage = function() {
  		// Tracks loading for infinite scroll.  Don't want to rely on class names for that.
  		self.loading = true;
  		self.maxPage++;

  		$(self.nextPageButton).addClass('hidden');
  		$(self.nextPageStatus).removeClass('hidden');

      var submitData = _.extend(self.source_data, {'page': self.maxPage});
  		$.ajax({
  			'url': self.source,
  			'type': 'POST',
  			'data': submitData,

  			success: function(data, textStatus, jqXHR) {
  				if (jQuery.trim(data).length) { // response has content
  					var $content = self.markNewContent(data, self.maxPage);
            $content.appendTo(self.container);
  					self.removeExtraPreviousPages();
            self.resetScrollWatchers();
  					self.container.trigger('makerbot.inserted');

            track_page(self.source_data.base_url+'page:'+self.source_data.page);

            if((!self.finalPage) || (self.maxPage < self.finalPage)) {
              $(self.nextPageButton).removeClass('hidden');
              $(self.nextPageButton).text('View More');
            }
  				} else {
    			  self.maxPage--;
       			self.finalPage = self.maxPage;
       		}

       		// Only unsetting loading in success so that scroll doesn't retry
          // on error.  You must click for that.
  				self.loading = false;
  				
  				$.event.trigger('pageLoaded');
  			},

  			error: function() {
  				self.maxPage--;
  				$(self.nextPageButton).text('Something went wrong.  Try again?');
  			},

  			complete: function() {
  				$(self.nextPageStatus).addClass('hidden');
  			}
  	  });
  	};

    self.removeExtraPreviousPages = function () {
      // get all page markers
      var markers = self.container.find('[data-page]');
      if(markers.length > self.maxPages) {
        var firstMarker = markers.slice(-self.maxPages).first();
        var idx = firstMarker.index();
        // remove extra pages and adjust scroll
        var oldHeight = $(self.container).height();
        var removed = $(self.container).children().slice(0, idx).remove();
        var newHeight = $(self.container).height();

        $(window).scrollTop($(window).scrollTop() - (oldHeight - newHeight));
        // update page number
        self.minPage = firstMarker.data('page');
        if(self.minPage > 1) {
          self.prevPageButton.removeClass('hidden');
          self.prevPageButton.text('View More');
        }
      }
    };

  	self.prevPage = function() {
  			// Tracks loading for infinite scroll.  Don't want to rely on class names for that.
  			self.loading = true;
  			self.minPage--;

  			self.prevPageButton.addClass('hidden');
  			self.prevPageStatus.removeClass('hidden');

        var submitData = _.extend(self.source_data, {'page': self.minPage});
  			$.ajax({
  				'url': self.source,
  				'type': 'POST',
  				'data': submitData,

  				success: function(data, textStatus, jqXHR) {
  					if (jQuery.trim(data).length) {
  						var $content = self.markNewContent(data, self.minPage);
  						var origHeight = self.container.height();
  						$content.prependTo(self.container);
  						var newHeight = self.container.height();
  						$(window).scrollTop($(window).scrollTop() + (newHeight - origHeight));
              self.removeExtraNextPages();
              self.resetScrollWatchers();

              track_page(self.source_data.base_url+'page:'+self.source_data.page);

              if(self.minPage > 1) {
                self.prevPageButton.removeClass('hidden');
                self.prevPageButton.text('View More');
              }
  					}
            // Only unsetting loading in success so that scroll doesn't retry
            // on error.  You must click for that.
            self.loading = false;
            
            $.event.trigger('pageLoaded');
  				},

  				error: function() {
  					self.minPage++;
  					self.prevPageButton.text('Something went wrong.  Try again?');
  				},

  				complete: function() {
  					self.prevPageStatus.addClass('hidden');
  				}
  			});
  	};

    self.removeExtraNextPages = function () {
      // get all page markers
      var markers = self.container.find('[data-page]');
      if(markers.length > self.maxPages) {
        var lastMarker = markers.slice(0,self.maxPages+1).last();
        var idx = lastMarker.index();
        var removed = $(self.container).children().slice(idx).remove();
        // next page nav
        self.maxPage = lastMarker.data('page') - 1;
        self.nextPageButton.removeClass('hidden');
        self.nextPageButton.text('View More');
      }
    };

    self.resetScrollWatchers = function() {
      setTimeout(
          function() {
            Thingiverse.scrollMonitor.reset();
            self.container.find('*[data-page]').each(function(i,e){
              Thingiverse.scrollMonitor.watchElement(
                $(e),
                {'callback': function(e){
                  self.updatePageNum(e.element.data('page'));
                }}
              );
            });
          }, 100
        );
    };

    self.markNewContent = function (data, page) {
      var $content = $(data);
      if(page == 1) {
        var $marker = $content.filter('div').first();
        $marker.attr('data-page', page);
      } else {
        var $marker = self.getMarker(page);
        $content = $.merge($marker, $content);
      }
      return $content;
    };

    self.getMarker = function (page) {
      return $('<div />', {
          'class': 'inf-scroll-separator',
          'data-page': page,
          'html': '<span class=\'banner-wrap\'></span><span class=\'page-marker\'>Page ' + page + '</span>'
          });
    };

    self.updatePageNum = function(pageNum) {
      if(history.replaceState) {
        var loc = document.createElement('a');
        loc.href = window.location.href;
        var args = loc.search;
        loc = loc.pathname;
        var prefix = ((isIE10)? '/' : '');

        var regex = /^(.*)\/page:([0-9])+/;
        if(regex.test(loc)) {
          var matches = regex.exec(loc);

            if(matches[2] != pageNum) {
            history.replaceState({'page':pageNum}, '', prefix +  matches[1] + '/page:' + pageNum + args);
            }
        }
        else {
            if(/\/$/.test(loc)) {
              loc = /^(.*)\//.exec(loc)[1];
            }
            history.replaceState({'page':pageNum}, '',  prefix + loc + '/page:' + pageNum + args);
        }
      }
    };

    self.createMoreButton = function() {
      return $(
        "<div class='view-more'>View More</div>" +
        "<div class='view-more-status hidden'><img src='/img/ajax-loader.gif' /></div>"
      );
    }

    return self;
  }());

  self.collections = (function() {
  	var self = {};

    /**
     * Show the collection info (create/edit) dialog.
     * Options can be used to override the standard behavior.
     * For example, pass in a success callback to do something
     * after the dialog is successfully submitted.
     */
    self.showCollectionInfoDialog = function(opts) {
      _.defaults(opts,
        {
          'modal_id': 'collection-info-modal',
          'class': 'collection-info-modal',
          'message_processing': '',
          'message_success': 'Saved!',
          'template': {
            'action': '/ajax/thingcollection/collection_dialog',
            'data':{}
          },
          'action': '/ajax/thingcollection/new_collection',
          'data': function($modal){
            return {
              'id': $modal.find('input[name=collection_id]').val(),
              'name': $modal.find('input[name=name]').val(),
              'description': $modal.find('textarea').val()
            };
          },
          'failure': function(response){
            alert(response.responseText);
          },
          'success': function(data){
            track_event(["collection", "create"]);
          }
        }
      );
      Thingiverse.dialog.create(opts);
    };

    /**
     * Show the collect (or edit collected) thing dialog.
     */
    self.showCollectThingDialog = function(thing_id, options) {
      // thingcollection_link_id is only specified when editing
      var thingcollection_link_id = null;
      if (options !== undefined && typeof(options.thingcollection_link_id) !== 'undefined') {
        thingcollection_link_id = options.thingcollection_link_id;
      }
      
      Thingiverse.dialog.create({
        'modal_id': 'collector-modal',
        'class': 'collector-modal',
        'message_processing': '',
        'message_success': 'Saved!',
        'template': {
          'action': '/ajax/thingcollection/collect_dialog',
          'data': {
            'thing_id': thing_id,
            'thingcollection_link_id': thingcollection_link_id
          }
        },
        'action': '/ajax/thingcollection/collect_thing',
        'data': function($modal) {
          return {
            'thing_id': $modal.find('input[name=thing_id]').val(),
            'thingcollection_link_id': $modal.find('input[name=thingcollection_link_id]').val(),
            'collection_id': $modal.find('select option:selected').val(),
            'notes': $modal.find('textarea').val()
          };
        },
        'rendered': function($modal) {
          // wire up the "delete this thing" link, if any
          $modal.find('button.remove-thing-button').click(function(e){
            e.preventDefault();
            var tcl_id = $modal.find('input[name=thingcollection_link_id]').val();
            var thing_id = $modal.find('input[name=thing_id]').val();
            var thing_name = $modal.find('.modal-body h4').text();
            self.showRemoveThingDialog({
              'thing_id': thing_id,
              'thing_name': thing_name,
              'thingcollection_link_id': tcl_id,
              'success': function() {
                $modal.modal('hide');
              }
            });
          });

          // wire up the 'New Collection' entry in the collection dropdown
          // it will pop up the Create Collection dialog.
          // upon successful creation of a new collection, it will close and
          // re-open this dialog.
          $modal.find('select').change(function() {
            var cat_id = $modal.find('select option:selected').val();
            if(cat_id == 0) { // 0 is the "New Collection" option
              self.showCollectionInfoDialog({
                'success': function(collection){
                  // log the collection creation
                  track_event(["collection", "create"]);
                  // add the new collection to the selector and select it
                  $('<option/>', { 'value': collection.id })
                    .text(collection.name)
                    .insertBefore($modal.find('option[value=0]'));

                  $modal.find('select').val(collection.id);
                }
              });
            }
          });

          // invoke callbacks
          if (options !== undefined && typeof(options.rendered) === 'function') {
            options.rendered($modal);
          }
        },
        'success': function(content) {
          // log it
          if(thingcollection_link_id)
            track_event(["collection", "thing-edit"]);
          else
            track_event(["collection", "thing-add"]);

          // handle any necessary page updates
          var tcl_id = content['old_id'];
          if(tcl_id) {
          // an edited thing moved. find and remove the element
            setTimeout(
              function(){
                $('#thingcollection-link-' + tcl_id).fadeOut(1000, function(){ $(this).remove()});
              }, 1250
            );
          }
          // update notes on the page
          var visibility = ($.trim(content['notes']) ? 'visible' : 'hidden');
          $('#thingcollection-link-' + content['id'] + ' .collected-thing-list-note-bubble').html(content['notes']);
          $('#thingcollection-link-' + content['id'] + ' .collected-thing-list-note').css('visibility', visibility);
        }
      });
    }

    /**
     * Displays a remove thing dialog
     */
    self.showRemoveThingDialog = function(options) {
      Thingiverse.dialog.create({
          'message': 'Are you sure you want to remove <a href="/thing:' + options['thing_id'] + '">' + options['thing_name'] + '</a> from your collection?',
          'action': '/ajax/thingcollection/remove_thing',
          'data': {
            'thingcollection_link_id': options['thingcollection_link_id']
          },
          'success': function(){
            // log it
            track_event(["collection", "thing-remove"]);
            // refresh makerware
            if(typeof mw !== 'undefined' && mw.appAttributeExists('refreshLibraryTab')) {
              mwThingiverse.refreshLibraryTab();
            }
            // update the page
            $el = $('#thingcollection-link-' + options['thingcollection_link_id']);
            $el.fadeOut(1000, function(){
              $(this).remove();
            });
            
            if (options['success']) {
              options['success']();
            }
          }
      });
    };

    /**
     * Displays a delete collection dialog
     */
    self.showDeleteCollectionDialog = function(options) {
      Thingiverse.dialog.create({
          'message': 'Deleting a collection will permanently remove all <strong>updates and captions</strong> associated with it!<br/><br/>Remove ' + options['collection_name'] + '?',
          'action': '/ajax/thingcollection/delete',
          'data': {
            'collection_id': options['collection_id']
          },
          'success': function(){
            track_event(["collection", "delete"]);
            // refresh makerware
            if(typeof mw !== 'undefined' && mw.appAttributeExists('refreshLibraryTab'))
              mwThingiverse.refreshLibraryTab();
            window.location.reload();
          }
      });
    };

    /**
     * Displays a collection detail dialog.
     * Options:
     * - id - collection id
     * - thing_id - optional thing_id. if absent, shows collection's featured thing.
     */
    self.showCollectedDetailDialog = function(options) {
      Thingiverse.dialog.create({
        'class': 'collection-detail-dialog',
        'modal_id': 'collection-detail-dialog',
        'template': {
          'action': '/ajax/thingcollection/detail',
          'data': options
        }
      });
      track_event(["collection", "view-grid"]);
    };

    /**
     * Used by the prev/next buttons to change the collected detail dialog's
     * content to another Thing in this collection.
     * Options:
     * - id. Collection ID Required.
     * - thing_id. ID of Thing to show. Required.
     */
    self.updateCollectedDetailDialog = function(options) {
      if(options['event'])
        track_event(["collection", options['event']]);
      $.get(
        '/ajax/thingcollection/detail',
        options,
        function(data){
          $('#collection-detail-dialog').html(data);
        }
      );
    };

    self.putThingBetween = function(thinglink_id, previous_id, next_id) {
      $jqXHR = $.post(
        '/ajax/thingcollection/reorder_things',
        {
          'id': thinglink_id,
          'prev_id': previous_id,
          'next_id': next_id
        }
      );
    };

    self.featureThing = function(thinglink_id, element) {
      $jqXHR = $.post(
        '/ajax/thingcollection/feature_thing',
        {
          'id': thinglink_id
        }
      );
      $jqXHR.success(function(data){
        // mark all others as not-active
        $('.thing-collectioncover').removeClass('active');

        $(element).addClass('active');
      });
    }

    self.enableEditMode = function(options) {
      $('#thingcollection-page').addClass('edit');
      $('#name').editable('enable');
      $('#name').editable(function(value, settings) {
        $.ajax({
          type: 'POST',
          url: '/ajax/thingcollection/edit',
          data: {
            'id': options['collection_id'],
            'name': value
          },
        });
        return value;
      }, {
        cancel    : 'Cancel',
        submit    : 'Save'
      });
      $('#description').editable('enable');
      $('#description').editable(function(value, settings) {
        $.ajax({
          type: 'POST',
          url: '/ajax/thingcollection/edit',
          data: {
            'id': options['collection_id'],
            'description': value
          },
        });
        return value;
      }, {
        type      : 'textarea',
        cancel    : 'Cancel',
        submit    : 'Save'
      });
    }

    self.disableEditMode = function() {
      $('#thingcollection-page').removeClass('edit');
      $('#name').editable('disable');
      $('#description').editable('disable');
    };

  	return self;
  }());

  self.users = (function() {
  	var self = {};

  	self.isFeatured = function(element) {
  		return $(element).hasClass('is_featured');
  	},

  	self.featureToggle = function(user_id, element) {
  		if (self.isFeatured(element)) {
  			$.post('/admin/unfeatureUser:'+user_id);
  			$(element).removeClass("is_featured").addClass("not_featured").children("a");
  		}
  		else {
  			$.post('/admin/featureUser:'+user_id);
  			$(element).addClass("is_featured").removeClass("not_featured").children("a");
  		}
  	}

  	return self;
  }());

  self.scrollMonitor = (function() {
  	var self = {
  		'elements': $([]),
  		'scrollElement': $(window),
  		'body': $('body'),
  		'active': false,
  		'defaults': {
  			'offset': 10
  		},
  		'activeTarget': null
  	};

  	self.reset = function() {
  	  self.elements = $([]);
  	};

  	self.watchElement = function($elem, options) {
  		var opts = $.extend({}, self.defaults, options);
  		$elem = $($elem);
  		opts['top'] = $elem.position().top;
  		opts['element'] = $elem;
  		self.elements.push(opts);
  		if(!self.active)
  			self.initialize();
  	};

  	self.initialize = function() {
  		self.scrollElement.on('scroll.thingiverse.scroll-monitor', self.process);
  		self.active = true;
  	};

  	self.process = function() {
  		var scrollTop = self.scrollElement.scrollTop();
  		var scrollHeight = self.scrollElement[0].scrollHeight || self.body[0].scrollHeight || document.documentElement.scrollHeight;
  		var maxScroll = scrollHeight - self.scrollElement.height();
  		var i;

  		if (scrollTop >= maxScroll) {
  			return (self.activeTarget != (i = self.elements.last()[0])) && self.activate(i);
  		}

  		for (i = self.elements.length; i--;) {
  			self.activeTarget != self.elements[i]
  				&& scrollTop > (self.elements[i]['top'] - self.elements[i]['offset'])
  				&& (!self.elements[i+1] || scrollTop <= (self.elements[i+1]['top'] - self.elements[i+1]['offset']))
  				&& self.activate(self.elements[i]);
  		}
    };

  	self.activate = function(element) {
  		self.activeTarget = element;
  		if(element['callback'])
  			element['callback'](element);
  	};

  	return self;
  }());

  self.loadThing = function(data) {
    return $.ajax({
        url: '/ajax/things/thing',
        data: data,
        dataType: 'html'
    });
  };

  return self;
}());

Thingiverse.itemGallery = (function() {
  var self = {
  	$thumbHolder: $('.thing-thumbs-holder'),
  	$toggleThumbs: $('.toggle-thumbs'),
  	$fsModal: $('#image-viewer'),
  	$fsHolder: $('.fs-gallery-holder'),
  	$fsThumbs: $('.fs-gallery-thumbs'),
  	$fsSlideHolder: $('.thing-page-slider-fs'),
  	$fsSlider: $('.thing-page-slider-fs').find('.thing-slides'),
  	$thingiviewBtn: $('.thingiview-btn'),
  	$imageViewerThingiviewBtn: $('.imageview-thingiview-btn')
  };

  self.init = function(opts) {
      _.extend(self, opts);
      self.numSlides = self.$fsSlider.find('.thing-page-image').length;

  	//Need to load one fullsize thingiview image so we can dynamically place the button
  	self.thingiviewSample = self.$fsModal.find('.isthingiview').eq(0);
  	self.loadImages(self.thingiviewSample);

  	self.$toggleThumbs.on(clickEventType, function() {
  		var $this = $(this);
  		$this.toggleClass('active');
  		self.$fsHolder.toggleClass('active');
  		self.$fsThumbs.toggleClass('active');

  		//If the thumbs are now visible, update the image buttons
  		if($this.hasClass('active')) {
  			self.updateFeaturedImage(self.$fsModal.find('.thing-page-image').eq(0));
  		}
  	});

  	self.$fsThumbs.on(clickEventType, '.thing-page-image-thumb', function() {
  		self.$toggleThumbs.trigger(clickEventType);
  		if(self.fullGallery) {
  			self.fullGallery.trigger("slideTo", [$(this).index(), {fx: 'none', duration: 0}]);
  		}
  	});

  	self.$fsModal.find('.close').on(clickEventType, function() {
  		$('body').removeClass('overlay-mode');
  		self.updateFeaturedImage(self.$fsModal.find('.thing-page-image').eq(0));
  		if(self.$toggleThumbs.hasClass('active')) {
  			self.$toggleThumbs.trigger(clickEventType);
  		}
  	});

    $('.largeview-btn').on(clickEventType, function() {
			$('body').addClass('overlay-mode');
			self.showImageViewerModal();
		});

		$('.main-slider').on(clickEventType, '.video-slide', function(e) {
			//If we lose the YouTube iframe, retrigger
			e.preventDefault();
			self.updateFeaturedImage($(this).closest('.thing-page-image'));
		});

    //Let's check for some videos
    var ytIndex = 0;
    $('#description a, #instructions a').each(function(index, element) {
    	var link = $(element).attr('href');
    	if(!link) {
    		return;
    	}
    	link.replace(/(youtu\.be\/|youtube.com\/watch\?v=)([\-_a-zA-Z0-9]+)/, function(expression, match, youtubeID) {
    		//Add this to the carousels
    		var placement = self.addImage({embedYoutube:youtubeID}, ytIndex);

    		// change click behaviour of link
    		$(element).on(clickEventType, function(e) {
    			$(document).scrollTop(100);
    			if(self.carousel) {
    				//Just let this take care of everything if there is a carousel
    				self.carousel.find('.thing-gallery-thumb[data-slideindex="'+placement+'"]').trigger(clickEventType);
    			}
    			else if(self.slider) {
    				self.slider.trigger("slideTo", [placement, {fx: 'none', duration: 0}]);
    			}

    			return false;
    		});

    		ytIndex++;
    	});
    });

    self.resizeTimer = null;
    $(window).on(resizeEvent, function() {
    	if (self.resizeTimer){
    		clearTimeout(self.resizeTimer);
    	};
    		self.resizeTimer = setTimeout(function(){
    		self.onResize();
    	},100);
    });

    //Now set up the gallery items to account for any added items
    self.setUpGallery();
  };

  self.addImage = function(image, placement) {
  	placement = (typeof placement === 'undefined') ? 1 : placement;
  	var slidePos = (self.numSlides === 0) ? 0 : placement+1; //What slide index this actually ends up being

  	var previewUrl = '';
  	var youTubeID = '';
  	var thumb_img = '<img src="/img/default/rendering_thumb_small.jpg">';
  	// This is the same for mobile, regular, and fullscreen
  	var slide_img = '<img src="/img/default/Gears_preview_featured.jpg">';
  	var fullsize_thumb_img = '<img src="/img/default/Gears_preview_large.jpg">';

    if(image.previewUrl) {
		  previewUrl = image.previewUrl
    }
    if(image.embedYoutube) {
  	  youTubeID = image.embedYoutube;
  	  thumb_img = '<img src="http://img.youtube.com/vi/'+youTubeID+'/2.jpg"><i class="icon-play icon-white"></i>';
  	  slide_img = '<img src="http://img.youtube.com/vi/'+youTubeID+'/0.jpg" class="video-slide-img"><a href="http://www.youtube.com/watch?v='+youTubeID+'" target="_blank" class="video-slide"><i class="icon-play icon-white"></i></a>';
  	  fullsize_thumb_img = '<img src="http://img.youtube.com/vi/'+youTubeID+'/0.jpg"><i class="icon-play icon-white"></i>';
  	}

  	var thumb_html = '<div class="thing-gallery-thumb" data-preview-url="'+previewUrl+'" data-embed-youtube="'+youTubeID+'" data-slideindex="'+slidePos+'">';
    var slide_html = '<div class="thing-page-image featured" data-preview-url="'+previewUrl+'" data-embed-youtube="'+youTubeID+'">';
    var fullsize_thumb_html = '<span class="thing-page-image-thumb" data-preview-url="'+previewUrl+'" data-embed-youtube="'+youTubeID+'"">';

  	thumb_html = thumb_html + thumb_img + '</div>';
  	slide_html = slide_html + slide_img + '</div>';
  	fullsize_thumb_html = fullsize_thumb_html + fullsize_thumb_img + '</span>';

  	var $galleryThumbs = $('.thing-gallery-thumbs'),
  		$slider = $('.thing-page-slider:not(.thing-page-slider-fs) .thing-slides');

  	//No images in the sliders, need some different actions
  	if(slidePos === 0) {
  		//Carousel
  		$(thumb_html).appendTo($galleryThumbs);

  		//Page slider
  		$slider.html(slide_html);

  		//Full screen
  		$(slide_html).append(self.$fsSlider);

  		//Full screen thumbs
  		$(fullsize_thumb_html).appendTo(self.$fsThumbs);
  	}
  	else {
  		//Carousel
  		$(thumb_html).insertAfter($galleryThumbs.find('.thing-gallery-thumb:eq('+placement+')'));

  		//Slider
  		$(slide_html).insertAfter($slider.find('.thing-page-image:eq('+placement+')'));

  		//Full screen
  		$(slide_html).insertAfter(self.$fsSlider.find('.thing-page-image:eq('+placement+')'));

  		//Full screen thumbs
  		$(fullsize_thumb_html).insertAfter(self.$fsThumbs.find('.thing-page-image-thumb:eq('+placement+')'));
  	}

  	self.numSlides++;

  	return slidePos;
  }

  self.updateFeaturedImage = function($el) {
  	if(self.isMobile) {
  		return;
  	}

    var $elem = $el.closest('.thing-page-image-holder');
    var opts = {
      'thingiviewUrl': $el.data('thingiviewUrl'),
      'embedYoutube': $el.data('embedYoutube')
    };

    var $thingBanner = $('.thing-banner');
    var $largeviewBtn = $elem.find('.largeview-btn');
    var $cardAbout = $('.thing-about');

    //Kill any videos that might be playing
    var $videoHolder = $elem.find('.video-holder').hide();
    $('.video-iframe').remove();

    //Or any active thingiviews
    var $iframe = $elem.find('.thingiview-iframe');
      $iframe.hide();

    // if we're looking at a video thumb
    if(opts['embedYoutube'] != undefined) {
      $largeviewBtn.hide();
      self.$thingiviewBtn.hide();
      self.$imageViewerThingiviewBtn.hide();

      var width = $videoHolder.width();
      var height = $videoHolder.height();
      if(width > 800) {
        width = 800;
        height = 450;
      }

        $videoHolder.css({width: width, height: height}).html('<iframe class="video-iframe" src="http://www.youtube.com/embed/'+opts['embedYoutube']+'" frameborder="0" width="100%" height="100%"></iframe>').show();;

      if($thingBanner.length) {
        $thingBanner.addClass('hide');
  	  }
  	  //Thing card stuff
  	  $cardAbout.hide();

  	  $videoHolder.show();
      return
  	}

    // make sure the gallery stuff is showing (could be disabled by a video)
    if($thingBanner.length)
      $thingBanner.removeClass('hide');
    $cardAbout.show();

    // enable thingiview mode if we got a link
    if(opts['thingiviewUrl']) {
      $largeviewBtn.show();
      self.$thingiviewBtn.show();
      self.$imageViewerThingiviewBtn.show();

      // update the action of the thingiview button
      self.$thingiviewBtn.off(clickEventType);
      self.$thingiviewBtn.click(function() {
        if ( thingiview.visible ) {
          self.hideThingiview();
        } else {
          self.showThingiview();
          thingiview.loadModelJson(opts['thingiviewUrl']);
        }
      });

      // if we were just in thingiview, stay there but with the new model
      if ( thingiview.visible ) {
        self.showThingiview();
        thingiview.loadModelJson(opts['thingiviewUrl']);
      }

      // handle imageview thingiview button
      self.$imageViewerThingiviewBtn.off(clickEventType);
      self.$imageViewerThingiviewBtn.click(function() {
        $iframe.attr('src', "/thingiview/thingiverse.html?file="+opts['thingiviewUrl'] + "&width="+$iframe.width()+"&height="+$iframe.width());
        $iframe.off('load');
        $(this).hide();
        $iframe.load(function(){
          $iframe.show();
          $elem.find('> img').hide();
          $iframe.each(function(index, element) {
            element.contentWindow.thingiview.show();
            element.style.marginTop = "-"+(element.clientHeight/2)+"px";
            element.style.top = "50%";
            element.style.position = "relative";
            element.contentWindow.thingiview.hideButtons();
            element.contentWindow.thingiview.resize = function(){};
          });
          track_event('Thing', 'Thingiview');
        });
      });

      return;
    }

    // handle normal images
    if(self.numSlides)
    {
      self.hideThingiview();
      $largeviewBtn.show();
      self.$thingiviewBtn.hide();
      self.$imageViewerThingiviewBtn.hide();
    }
  };

  self.showThingiview = function() {
    thingiview.show();
    thingiview.clearScene();
    track_event(['Thing', 'Thingiview']);

    // disable our largeview button as thingiview has its own
    var $largeviewBtn = $('.largeview-btn');
    $largeviewBtn.off(clickEventType);
  }

  self.hideThingiview = function() {
    if ( typeof(thingiview)!="undefined" ) {
      thingiview.hide();
      thingiview.clearScene();
    }

    // largeview button activates modal gallery
    var $largeviewBtn = $('.largeview-btn');
    $largeviewBtn.off(clickEventType);
    $largeviewBtn.on(clickEventType, function() {
      $('body').addClass('overlay-mode');
      self.showImageViewerModal();
    });
  }


  self.showImageViewerModal = function() {
  	self.$fsModal.modal('show');

  	//Initialize the large gallery if necessary
  	if(self.slider) {
  		if(!self.fullGallery) {
  			self.setupFullGallery();
  		}
  		else {
  			//If it already exists, go to the appropriate slide
  			self.sizeFullGalleryImg();
  			self.syncFullGallery();
  		}
  	}
  	else {
  		//No gallery, just show the image
  		self.sizeFullGalleryImg();
  		var $theImage = self.$fsSlider.find('.thing-page-image');
  		self.loadImages($theImage);
  		self.updateFeaturedImage($theImage.show());
  	}

  	//Load the thumbs
  	self.loadImages(self.$fsThumbs);
  };

  self.setupFullGallery = function() {
  	var curPos = false;
  	if(self.fullGallery) {
  		//Save the current position so we can go back to it after tear down
  		curPos = self.fullGallery.triggerHandler('currentPosition');
  		//Reset the original positions so the thumbnails aren't busted
  		self.fullGallery.trigger('destroy', [true]);
  		self.fullGallery = null;
	  }

	  self.sizeFullGalleryImg();

  	self.$fsSlider.carouFredSel({
  		circular: false,
  		infinite: false,
  		auto: false,
  		fx: 'fade',
  		width: '100%',
  		height: '100%',
  		items: {
  			width: '100%',
  			height: '100%',
  			visible: 1,
  			minimum: 2
  		},
  		swipe: true,
  		next: {
  		  button: self.$fsModal.find('.thing-gallery-right'),
  		  key: 39
  	  },
  		prev: {
  		  button: self.$fsModal.find('.thing-gallery-left'),
  		  key: 37
  		},
  		onCreate: function(data) {
  			self.fullGallery = $(this);
  			if(curPos) {
  				self.fullGallery.trigger("slideTo", [curPos, {fx: 'none', duration: 0}]);
  			}
  			else {
  				self.syncFullGallery();
  			}
  			self.loadImages($(data.items));
  		},
  		scroll: {
  			fx: 'fade',
  			onBefore: function(data) {
  				self.$fsModal.find('.thingiview-btn').hide();
  				self.loadImages($(data.items.visible));
  			},
  			onAfter: function(data) {
  				self.updateFeaturedImage(data.items.visible);
  			}
  		}
  	});
  };

  self.sizeFullGalleryImg = function() {
  	var headerHeight = self.$fsModal.find('.thing-page-header').height();
  	var headerPadding = 20;
  	var height = self.$fsModal.height() - headerHeight - headerPadding;
  	var width = self.$fsModal.width();

  	self.$fsSlideHolder.css({height: height+'px'}).find('.thing-page-image').css({
  		width: width+'px',
  		height: height+'px',
  		'line-height': height+'px'
  	});
    	$('.fullSizeContent').css({top: (headerHeight+headerPadding)+'px'});

    	var $frameBase = false;
    	var optPos = false;
    	if(self.thingiviewSample.length) {
    		$frameBase = self.thingiviewSample.find('img');
    		optPos = (height - $frameBase.height()) + self.$fsModal.find('.thingiview-btn').height() + 10;
    	}
    	else if(self.$fsModal.find('.video-slide-img').length) {
    		$frameBase = self.$fsModal.find('.video-slide-img');
    		optPos = (height - $frameBase.height());
    	}

    	if($frameBase) {
    		var frameHeight = $frameBase.height();

    		self.$fsModal.find('.thing-page-image-opts').css({
    			'line-height': optPos+'px'
    		});

    		self.$fsModal.find('.thingiview-iframe, .video-holder').css({
    			width: $frameBase.width()+'px',
    			height: frameHeight+'px',
    			'margin-top': '-'+(frameHeight/2)+'px'
    		});

    		self.$fsModal.find('.thing-page-image-opts').css({
    			width: $frameBase.width()+'px'
    		});

    	}
  };

  self.syncFullGallery = function() {
  	var pos = self.slider.triggerHandler('currentPosition');
  	//The slide to doesn't trigger if there is no change in pos, for example when the slide first loads, so force an update
  	var fullPos = self.fullGallery.triggerHandler('currentPosition');

  	if(pos === fullPos) {
  		self.updateFeaturedImage(self.fullGallery.find('.thing-page-image').eq(pos));
  	}
  	else {
  		self.fullGallery.trigger("slideTo", [pos, {fx: 'none', duration: 0}]);
  	}
  };

  self.onResize = function() {
  	self.setUpGallery();

  	//Need to get some sizes fo FS - but only if it's active but the slideshow isn't visible (i.e. thumbs are visible)
  	if(self.$fsModal.is(':visible')) {
  		var currentlyVisible = self.$fsSlideHolder.is(':visible');

  		if(!currentlyVisible) {
  			self.$fsHolder.addClass('active');
  		}

  		if(self.fullGallery) {
  			self.setupFullGallery();
  		}
  		else {
  			self.sizeFullGalleryImg();
  		}

  		if(!currentlyVisible) {
  			self.$fsHolder.removeClass('active');
  		}
  	}
  	else {
  		if(self.fullGallery) {
  			self.fullGallery.trigger('destroy', [true]);
  			self.fullGallery = null;
  		}
  	}
  };

  self.loadImages = function($parent) {
  	var $elements = $parent.find('img.load-delay');
  	if($elements.length) {
  		$elements.each(function(index, element) {
  			var $this = $(element);
  			$this.attr('src', $this.data('img')).one('load', function() {
  				$(this).removeClass('load-delay');
  			});
  		});
  	}
  };

  self.setUpGallery = function() {
  	self.isMobile = $('.card-slider').is(':visible');

  	//Tear down for resize events
  	var curSliderPos = false;
  	var curCarouselPos = false;

  	if(self.carousel) {
  		curCarouselPos = self.carousel.triggerHandler('currentPosition');
  		self.carousel.trigger('destroy', [true]);
  		self.carousel = null;
  	}
  	if(self.slider) {
  		curSliderPos = self.slider.triggerHandler('currentPosition');
  		self.slider.trigger('destroy', [true]);
  		self.slider = null;
  	}

  	var $slider = $('.thing-page-slider:visible:not(.thing-page-slider-fs) .thing-slides');
  	var $carousel = $('.thing-gallery-holder:visible .thing-gallery-thumbs');

  	if(self.numSlides <= 1) {
  		self.$thumbHolder.addClass('hidden');
  		$('.gallery-arrows').addClass('hidden');

  		if(self.numSlides === 0) {
  			$('.largeview-btn').hide();
  		}
  	}
  	else {
  		self.$thumbHolder.removeClass('hidden');

  		if(self.numSlides > 7) {
  			self.$thumbHolder.find('.gallery-arrows').removeClass('hidden');
  		}
  		else {
  			self.$fsSlideHolder.find('.gallery-arrows').removeClass('hidden');
  		}
  	}

  	if(self.numSlides > 1) {
  		if($slider.length) {
  			$slider.carouFredSel({
  				circular: false,
  				infinite: false,
  				items: {
  					visible: 1,
  					minimum: 1
  				},
  				auto: false,
  				swipe: true,
  				pagination: {
  					container: $carousel,
  					anchorBuilder: false,
  					fx: 'fade',
  					duration: 200
  				},
  				onCreate: function(data) {
  					self.slider = $(this);

  					self.loadImages($(data.items));

  					if(curSliderPos) {
  						self.slider.trigger("slideTo", [curSliderPos, {fx: 'none', duration: 0}]);
  					}
  					else {
  						self.updateFeaturedImage(data.items);
  					}
  				},
  				scroll: {
  					onBefore: function(data) {
  						self.loadImages($(data.items.visible));
  					},
  					onAfter: function(data) {
  						self.updateFeaturedImage(data.items.visible);
  					}
  				}
  			});
  		}

  		// If there's a carousel, then this is the large version
  		if($carousel.length) {
  			$carousel.carouFredSel({
  				circular: false,
  				infinite: false,
  				items: {
  					visible: 7,
  					minimum: 8
  				},
  				auto: false,
  				next: self.$thumbHolder.find('.thing-gallery-right'),
  				prev: self.$thumbHolder.find('.thing-gallery-left'),
  				onCreate: function(data) {
  					self.carousel = $(this);

  					if(curCarouselPos) {
  						self.carousel.trigger("slideTo", [curCarouselPos, {fx: 'none', duration: 0}]);
  					}

  					self.loadImages($(data.items));

  				},
  				scroll: {
  					onBefore: function(data) {
  						self.loadImages($(data.items.visible));
  					}
  				}
  			});
  		}
  	}
  	else {
  		self.updateFeaturedImage($slider.find('.thing-page-image'));
  	}
  };
  return self;
}());

Thingiverse.tagger = (function(e){
  var self = {
    'showFormButton': $('.thing-add-tag-link'),
    'tagForm': $('.thing-add-tag-form'),
    'tagContainer': $('.thing-detail-tags-container')
  };

  self.init = function(options) {
    self = _.extend(self, options);
    self.textField = self.tagForm.find('input[type=text]');
    self.showFormButton.click(function(){
      self.showFormButton.hide();
      self.tagForm.fadeIn(function(){
        self.textField.focus();
      });
    });
    change_enter_behavior(
      self.textField,
      self.publicAddTags
    );
  };

  self.publicAddTags = function(){
    self.textField.attr('disabled','disabled');
    self.tagContainer.load(
      '/ajax/things/addtags',
      {
        'id': self.thing_id,
        'tags': self.textField.val(),
        'public': 1
      },
      function() {
        self.showFormButton.show();
        self.tagForm.hide();
        self.textField.removeAttr('disabled');
        self.textField.val('');
      }
    );
  };

  return self;
}());

function toggle_derivative_print_job(box, derivative_id, print_job_id) {
  $.ajax({
    type: 'POST',
    url: '/ajax/derivative/link_print_job',
    data: {
      'id': derivative_id,
      'print_job_id': print_job_id,
      'state': (box.checked == true ? '1' : '0')
    },
    success: function(response) {
      ajaxUnload();
    },
    error: function(e) {
      alert('Error: ' + e.responseText);
      ajaxUnload();
    }
  });
}

//IE9 doesn't support pushState
if(typeof history.pushState === 'undefined') {
	history.pushState = function() {
		return true;
	};
}

//New stuff for ajaxy thing pages
function update_like(id, type) {
  if ( typeof( type )=='undefined' )
    type = 'things';
  var url = '/ajax/'+type+'/toggle_like';

  var req = $.ajax({
		url: url,
		data: {
		  'id': id
		}
	});

	return req;
}

function update_follow(data)
{
  var req = $.ajax({
		url: '/ajax/dashboard/set_thing_subscribe_state',
		data: data
	});

	return req;
}

function create_new_collection(data) {
  var req = $.ajax({
		url: '/ajax/thingcollection/new_collection',
		data: data
	});

	return req;
}

function save_to_collection(opts) {
  var req = $.ajax({
		url: '/ajax/thingcollection/collect_thing',
		data: opts
	});

  return req;
}

var collectionOpts = false;
//Submit handler for the thing card collection form
function submit_collection_form(form) {
  var $this = $(form),
      $select= $this.find('select'),
      collection= $this.find('select[name="collection"]').val(),
      newCollectionName = $this.find('input[name="new-collection-name"]').val(),
  		thingID = $this.find('input[name="thing_id"]').val(),
  		thingCollectionLinkID = $this.find('input[name="thingcollection_link_id"]').val() ? $this.find('input[name="thingcollection_link_id"]').val() : false,
  		collectionID = $this.find('select').val();

  // TODO fixme, this should happen on the server side
  if ( !newCollectionName.length && collection<=0 )
  {
    alert( 'Please enter a collection name' );
    return;
  }

  $this.find(':input').attr('disabled', true);

	//Let's get ready to rummmble
	$.when(getCollection(newCollectionName, collectionID))
	.done(function(data) {
		//We have a collection, so save the thing to it
		saveToCollection(thingID, data.id, thingCollectionLinkID)
		.done(function() {
		  //Set the select to the last collection id used
		  $select.val(data.id);
		  $this.removeClass('active');
		  update_thing_collect($this.closest('div.thing-interaction-parent').find('.thing-collect'));
		})
		.fail(function(msg) {
			if(msg) alert(msg);
		})
		.always(function() {
		  $this.find(':input').attr('disabled', false);
		});

		//And we have to update all the forms now... but really let's just update this one then set the new options to a variable
		//and then just update the dropdowns if they click on another collect form
		//But don't update it until the collection is actually saved because that makes it look like it's done and it might not be
		if(data.name) {
		  $select.append('<option value="'+data.id+'">'+data.name+'</option>');
		  $select.find('option[value="-1"]').appendTo($select);
		  collectionOpts = $select.html();

		  //I guess technically we should update any collection forms that are open
		  var $visibleSelects = $('form.collect-form.active').not($this).find('select').html(collectionOpts);

		  $this.find('div.new-collection-name').removeClass('active').find('input').val('');
  	}
	})
	.fail(function(msg) {
		if(msg) alert(msg);
		$this.find(':input').attr('disabled', false);
	});

	return false;
}

//This will make the call to create a new collection if that's what we're doing
//Otherwise it'll resolve with an object with the id attribute of the item currently selected
function getCollection(newCollectionName, collectionID) {
  var collectionDeferred = $.Deferred();

	if(newCollectionName) {
		create_new_collection({
			'name': newCollectionName
		})
		.done(function(data) {
			collectionDeferred.resolve(data);
		})
		.fail(function(data) {
			collectionDeferred.reject(data.responseText);
		});
	}
	else if(collectionID) {
	  var data = {
	    id: collectionID
	  };
		collectionDeferred.resolve(data);
	}
	else {
	  collectionDeferred.reject('Invalid collection');
	}

	return collectionDeferred.promise();
}

//This will ajax save the item to the collection
function saveToCollection(thingID, collectionID, thingCollectionLinkID) {
	var saveDeferred = $.Deferred(),
	    thingCollectionLinkID = thingCollectionLinkID ? thingCollectionLinkID : '';

	save_to_collection({
		'thing_id': thingID,
		'thingcollection_link_id': thingCollectionLinkID,
		'collection_id': collectionID
	})
	.done(function(data) {
		saveDeferred.resolve(data.id);
	})
	.fail(function(data) {
		saveDeferred.reject(data.responseText);
	});

	return saveDeferred.promise();
}

function update_thing_like($this) {
  var newtip = "Unlike",
		  trackAction = 'like',
		  $countHolder = $this.find('.interaction-count'),
		  count = +($countHolder.text()); //Current count

  // View In Library
	var $viewBtn = $('.view-in-library');

  if($this.hasClass('active')) {
		newtip = "Like";
		trackAction = 'unlike';
		count = count-1;

    if($viewBtn.length) {
      $viewBtn.removeClass('is_liked');
    }
	}
	else {
	  count = count+1;

    if($viewBtn.length) {
      $viewBtn.addClass('is_liked');
    }
	}

	if (count < 0) {
	  count = 0;
	}

	$this.data('originalTitle', newtip)
		.toggleClass('active');
  if ( count.toString()!='NaN' )
    $countHolder.text(count);

	track_event(['thing', trackAction]);
}

function update_thing_follow($this) {
  var newtip = "Unwatch",
		  trackAction = 'watch',
		  $countHolder = $this.find('.interaction-count'),
		  count = +($countHolder.text()); //Current count

  if($this.hasClass('active')) {
		newtip = "Watch";
		trackAction = 'unwatch';
		count = count-1;
	}
	else {
	  count = count+1;
	}

	$this.data('originalTitle', newtip)
		.toggleClass('active');
	$countHolder.text(count);

	track_event(['thing', trackAction]);
}

function update_thing_collect($element) {
  var $countHolder = $element.find('.interaction-count');
  var count = parseInt($countHolder.text()) + 1;

  $element.addClass('active');

  $countHolder.html(count);
}

function updateUrl(newUrl) {
  if(history.replaceState) {
    history.replaceState({'url':newUrl, 'page': 1}, '', newUrl);
  }
};

function updateResults(filters, data, options) {
  var $body = $('body');
  if ( options==undefined )
    options = {};
  if ( options.loadingAnimation==undefined || options.loadingAnimation )
    $body.addClass('loading');

  $.when(getThings(filters, data))
  .done(function(data) {
      $('div.things-page-content').first().replaceWith($(data).find('div.things-page-content'));
  })
  .fail(function(data) {
  })
  .always(function(data) {
    if ( options.loadingAnimation==undefined || options.loadingAnimation )
      setTimeout(function(){
        $body.removeClass('loading');
      }, 250);
  });
}

function updateEventResults(filters, data) {
  var $body = $('body');
  $body.addClass('loading');

  $.when(getEvents(filters, data))
  .done(function(data) {
      var $newDiv = $(data).find('div.things-page-content');

      if($newDiv.length) {
        $('div.things-page-content').replaceWith($newDiv);
      }
      else {
        $('div.things-page-content').html($('<div class="things notifications">').html(data));
      }

  })
  .fail(function(data) {
  })
  .always(function(data) {
    setTimeout(function(){
      $body.removeClass('loading');
    }, 250);
  });
}

function getThings(filters, data) {
  var default_url = '/ajax/things/list_things/',
      default_type = filters[0] ? filters[0] : '',
      default_source = '/ajax/things/paginate_things/',
      resultsDeferred = $.Deferred();

  //To account for any differences in the defaults
  var firstFilters = {
    'newest': {
    },
    'featured': {
    },
    'popular': {
    },
    'made-things': {
      'type': 'instances'
    },
    'derivatives': {
    },
    'customizable': {
    },
    'random-things': {
      'type': 'random'
    },
    'firehose': {
    },
    'collections': {
    },
  };

  var filter = firstFilters[filters[0]] ? firstFilters[filters[0]] : firstFilters['newest'];

  var source = (filter.url) ? filter.url : default_source,
      source_data = {
        'type': (filter.type) ? filter.type : default_type,
        'per_page': data.per_page ? data.per_page : '12',
        'cat': (filters[1]) ? filters[1] : '',
        'subcat': (filters[2]) ? filters[2] : '',
        'base_url': data.base_url ? data.base_url : ''
      },
      page = data.start_page ? data.start_page : 1;

    //Get the things
    $.ajax({
      url: '/ajax/things/list_things/',
      type: 'POST',
      data: {
        'type': source_data.type,
        'cat': source_data.cat,
        'subcat': source_data.subcat,
        'per_page': source_data.per_page,
        'page': page
      }
    })
    .done(function(data) {
      resultsDeferred.resolve(data);

        track_page(source_data.base_url+'page:'+page);

        //For infinite scrolling
        if(Thingiverse.scroll.container) {
          Thingiverse.scroll.init({
            'container': '.thing-list .things.instances',
            'source': source,
            'source_data': source_data,
            'page': page
          });
        }
    })
    .fail(function(data) {
      resultsDeferred.reject(data);
    });

  return resultsDeferred.promise();
}

function hideOffCanvas() {
  //If this is small enough to still have it, then leave it alone
  var hasOffCanvas = $('#off-canvas').is(':visible');
  if(hasOffCanvas) {
    return false;
  }

  $('#wrapper').removeClass('show-menu');
  $('#off-canvas').removeClass('show');
  $('div.login').removeClass('expanded');
}

$('#off-canvas-toggle').on(clickEventType, function(e) {
  var $target = $(e.target);

  if(!$target.parents('div.dropdown-menu').length) {
    $('#wrapper').toggleClass('show-menu');
    $('#off-canvas').toggleClass('show');
    return false;
  }
});
$(window).on('resize', hideOffCanvas);

$('div.login').on(clickEventType, function(e) {
  var $target = $(e.target);

  if(!$target.parents('div.dropdown-menu').length) {
    $(this).toggleClass('expanded');
  }

})
.on('keydown', function(e){
  if ( e.which == 38 || e.which == 40 ) {
    e.stopPropagation();
  }
});

function isSupported(property) {
    return property in document.body.style;
}

$('.subnav-wrapper:not(.disabled)').on(clickEventType, function() {
  $(this).toggleClass('expanded');
  $('.subnav-wrapper.expanded').not(this).removeClass('expanded');
});

// Hide the login and filter dropdowns when clicked outside of it
$('body').on('click', function(e) {
  var $target = $(e.target);

  // Only applies on normal view
  if(!$('#off-canvas-toggle').is(':visible')) {
	if(!$target.parents('div.login').length) {
	  $('div.login').removeClass('expanded');
	}

	if(!$target.parents('div.subnav-wrapper').length) {
	    $('div.subnav-wrapper').removeClass('expanded');
	}
  }
});


$('#dashboard-page').on('click', 'a.dismiss_notification', function(event) {
  var element = $(this);
  // hide this event
  element.closest('div.row_item').addClass('dismissed');

  if(!isSupported('transition')) {
      $(this).trigger('transitionend');
  }

  event.preventDefault();
  // grab the list of events to dismiss
  var event_ids = element.attr('data-ids');
  $.ajax({
    url: '/ajax/dashboard/delete_event/',
    type: 'POST',
    data: {
      'event_ids': event_ids
    }
  })
})
.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 'div.dismissed', function() {
  $(this).remove();
});

$('a.show_analytics').on('click', function(e) {
  $(this).parent().toggleClass('expanded');

  e.preventDefault();
});

// This and the getThings could maybe be abstracted a little and combined
function getEvents(filters, data) {
  var default_url = '/ajax/dashboard/list_events/',
      default_type = filters[0] ? filters[0] : '',
      default_source = '/ajax/dashboard/list_events/',
      resultsDeferred = $.Deferred();

  var firstFilters = {
    'all-activity': {
    },
    'my-activity': {
    },
    'friends-activity': {
    },
    'watchlist': {
    }
  };

  var filter = firstFilters[filters[0]] ? firstFilters[filters[0]] : firstFilters['all-activity'];


  var source = (filter.url) ? filter.url : default_source,
      source_data = {
        'type': (filter.type) ? filter.type : default_type,
        'per_page': data.per_page ? data.per_page : '30',
        'cat': (filters[1]) ? filters[1] : '',
        'subcat': (filters[2]) ? filters[2] : '',
        'base_url': data.base_url ? data.base_url : ''
      },
      page = data.start_page ? data.start_page : 1;

    //Get the things
    $.ajax({
      url: '/ajax/dashboard/list_events/',
      type: 'POST',
      data: {
        'type': source_data.type,
        'cat': source_data.cat,
        'subcat': source_data.subcat,
        'per_page': source_data.per_page,
        'page': page
      }
    })
    .done(function(data) {
      resultsDeferred.resolve(data);

        track_page(source_data.base_url+'page:'+page);

        //For infinite scrolling
        if(Thingiverse.scroll.container) {
          Thingiverse.scroll.init({
            'container': '.things',
            'source': source,
            'source_data': source_data,
            'page': page
          });
        }
    })
    .fail(function(data) {
      resultsDeferred.reject(data);
    });

  return resultsDeferred.promise();
}

// Brought in from list_things and and list_events
//Update all of the subsequent filters from the one passed
function updateFilters($elem) {
	var $parent = $elem.closest('div.subnav-wrapper'),
		$navs = $parent.nextAll('div.subnav-wrapper');

	//Reset
	$navs.removeClass('selected-child').find('li.active').removeClass('active');
	$navs.find('span.selected-section').text('All');
	$parent.find('.active').removeClass('active');

	//Select
	var childFilterNav = $elem.parent().data('child');
	if(childFilterNav) {
		$('#'+childFilterNav).addClass('selected-child');
	}

	$parent.removeClass('expanded').find('span.selected-section').text($elem.text());
	$elem.parent().addClass('active');
	$elem.addClass('active');
}

// The next two can be combined
var is_things_page = !!$('.list-things-page.page').length;
var is_dashboard_page = !!$('#dashboard-page').length;

// Check for dashboard
if (is_things_page) {
	$(document).ready(function(){
		var sectionBase = '/explore/',
			updateData = {
				'per_page': 30 // Not being used right now
			}

		function updatePage() {
			//Build the url
			var url = sectionBase,
				filters = {
					0: $('div.first-nav ul.section-dropdown li.active a').data('slug'),
					1: $('div.second-nav.selected-child ul.section-dropdown li.active a').data('slug'),
					2: $('div.third-nav.selected-child ul.section-dropdown li.active a').data('slug')
				};

			for(var filterPos in filters) {
				var filter = filters[filterPos];
				if(filter) {
					url = url + filter + '/';
				}
			}

			updateUrl(url);
			updateData.base_url = url;
			updateResults(filters, updateData);
		}

		$('ul.section-dropdown a').on('click', function(e) {
			updateFilters($(this));
			updatePage();
			e.preventDefault();
			return false;
		});
	});
}

if (is_dashboard_page) {
	$(document).ready(function(){
		var sectionBase = '/dashboard/',
			updateData = {
				'per_page': 30 // Not being used right now
			};

		function updatePage() {
			//Build the url
			var url = sectionBase,
				filters = {
					0: $('div.first-nav ul.section-dropdown li.active a').data('slug')
				};

			for(var filterPos in filters) {
				var filter = filters[filterPos];
				if(filter) {
					url = url + filter + '/';
				}
			}

			updateUrl(url);
			updateData.base_url = url;
			updateEventResults(filters, updateData);
		}

		$('ul.section-dropdown a').on('click', function(e) {
			updateFilters($(this));
			updatePage();
			e.preventDefault();
			return false;
		});
	});
}

//Thing page
$('#thing-page a.profile_nav_bttn:not(.disabled, .waiting), #thing-page .nav a').on(clickEventType, function(e) {
  //If this isn't the desktop nav, just get that element the corresponding element and keep in sync
	var $this = $(this);
	if(!$this.hasClass('profile_nav_bttn')) {
	  $this = $('.profile_edit_nav_container').find('a[data-tab="'+$this.data('tab')+'"]').trigger(clickEventType);
	  return false;
	}

	var index = $this.index(),
	    width = $this.width(),
	    currentScroll = $(window).scrollTop(),
	    currentHeight = $('#thing-page').height();

	//Take care of the little menu, too
	updateFilters($('.section-dropdown a[data-tab="'+$this.data('tab')+'"]'));

	$('.profile_nav_bttn.active').removeClass('active');
	$this.addClass('active').closest('.profile_edit_nav_container').attr('data-activetab', index)
	.find('.profile_nav_bttn_active').css({'width': width, 'left': $this.position().left}); //thanks for nothing, unequal widths;

	//Hide content that stays on this page
	$('div.tab-content-holder.active').removeClass('active');

	var ajaxHref = $this.data('ajax');

	//These items get loaded in
	if(ajaxHref) {
	  //Fakeout so the page doesn't jump, jump, jump around jump up jump up and get down
	  $('#thing-page').css({'height': currentHeight+'px'});
	  $.when(getContent({url: ajaxHref}))
  	.done(function(data) {
  	  updateContent(data, $('#ajax-loaded-content').addClass('active'));
  	})
  	.fail(function(data) {
  	})
  	.always(function(data) {
  	  $(window).scrollTop(currentScroll);
  	  $('#thing-page').css({'height': ''});
  	});
	}
	//These already exist on the page
	else {
    $('#'+$this.data('tab')).addClass('active');
	}

	updateUrl($this.attr('href'));

	e.preventDefault();
});


function updateContent(content, $container) {
  $container.html(content);
}

$('#thing-page-content').on(clickEventType, '.pagination a', function() {
  var link = $(this).attr('href');
  var baseUrl = $('a.profile_nav_bttn.active').data('ajax');
  var page = 1;

  var p = new RegExp('(page:)(\\d+)',["i"]);
  var m1 = p.exec(link);
  if (m1 != null) {
     page = m1[2];
  }

  if(page) {
    $.when(getContent({url: baseUrl+'&page='+page}))
  	.done(function(data) {
  	  updateContent(data, $('#ajax-loaded-content').addClass('active'));
  	})
  	.fail(function(data) {
  	})
  	.always(function(data) {
  	  $('html,body').animate({
        scrollTop: $('.thing-page-detail').offset().top - 300},
        150);
  	});

    return false;
  }
});

function getContent(options) {
  var data = (typeof options.data === 'undefined') ? {} : data,
      resultsDeferred = $.Deferred();

  $('body').addClass('loading');
  //Get the content
  $.ajax({
    url: options.url,
    type: 'POST',
    data: data
  })
  .done(function(data) {
    track_page(options.url);
    resultsDeferred.resolve(data);
  })
  .fail(function(data) {
    resultsDeferred.reject(data);
  })
  .always(function(data) {
    $('body').removeClass('loading');
  });

  return resultsDeferred.promise();
}

var loadLikers = function(target, targetContainer, currentUser) {
	$.ajax({
		url: '/'+target.type+':'+target.id+'/likes',
		type: 'get',
		dataType: 'json',
		success: function(response) {
			var likers = new Array();
			var user_jsons = response;
			for ( var i=0; i<user_jsons.length; i++ )
      {
        user_jsons[i].current_user_id = currentUser;
        likers.push( new Thingiverse.User(user_jsons[i]) );
      }


			var targetContainer = $('.all-likes-content');
			targetContainer.html("");
			for ( var i=0; i<likers.length; i++ )
				$(likers[i].getElementMini()).appendTo(targetContainer);
		}
	});
}

$('.thing-share').on(clickEventType, function(e) {
  var $icons = $(this).find('.thing-social-share-icons');
  if(!$icons.hasClass('active')) {
    $(this).find('.thing-social-share-icons').addClass('active');
    return false;
  }
});

function home_get_things(section, name, subheader) {

	ajaxLoad();

    $('#explore-content-' + section).load('/ajax/main/get_things',
    {
	    'section': section,
    },
        function() {
            $('.explore-content').hide();
            $('.explore-content.' + section).show();
            $('#explore-content-' + section + " .explore-slides").carouFredSel({
                auto: false,
                circular: false,
                infinite: false,
                scroll: {
                    items: "page",
                    duration: 400
                },
                swipe: {
                    onTouch: true,
		    options: {
			excludedElements:"button, input, select, textarea, .noSwipe",
                        tap: function (event, target) {
                            window.open($(target).parent('a').attr('href'), '_self');
                        }
		    }
                },
                direction: 'left',
                height: 310,
                width: "100%",
                onWindowResize: "throttle",
                items: {
                    visible: 'variable',
                    height: 310,
                    width: 290
                },
                swipe: true,
                pagination: {
                    container: '.explore-controls',
                    anchorBuilder: function(nr){
                        return '<a href="#'+nr+'"><div class="circle '+nr+'"></div></a>'
                    }
                }
            });

            $('.selected-section').html(name);
            $('.selected-section-subheader').html(subheader);
            $('.subnav-wrapper.expanded').removeClass('expanded');
            ajaxUnload();
        }
    );
}

$('.expandable').on('click', function() {
  var $this = $(this);
  $this.toggleClass('expanded');
  $this.next('.expand_content').toggleClass('expanded');
});

function formDataToObject($form) {
  var formArray = $form.serializeArray();
  var formData = {};

  for(var i=0; i<formArray.length; i++) {
    if(formArray[i]==undefined) {
      continue;
    }

    formData[formArray[i].name] = formArray[i].value;
  }

  return formData;
}

$(document).ready(function() {
  if($('.toggle-search-form').length) {
    var $toggleSearchForm = $('.toggle-search-form');
    var $toggleSearchFormInput = $toggleSearchForm.find('input');
    var hasSearch = !!$toggleSearchFormInput.val();

    $toggleSearchForm.find('.search-icon').on('click', function() {
      if(hasSearch) {
        $toggleSearchFormInput.val('');
        $toggleSearchForm.submit();
      } else {
        $(this).toggleClass('active').parent().toggleClass('active');
      }
    });
  }

  // This has to be at the bottom of the page
  if($('.fixed-footer').length) {
    $('.fixed-footer').detach().appendTo('body');
  }

  $('.group-topics').on('click', '.group-topic .actions', function(e) {
    var $this = $(this);
    
    if (e.target === this) {
      $this.toggleClass('active');
    }
  });

  // iOS doesn't do as well with on change
  // So we want to do this on blur for that
  // But we don't want it to fire twice for other browsers
  var doingGroupAction = false;
  var doGroupAction = function($select) {
    if (!doingGroupAction) {
      doingGroupAction = true;

      var value = $select.val();

      // Avoid back-button shenanigans
      $select.find('option:first').prop('selected', true);
      $select.parent().toggleClass('active');

      window.location = value;
    }
  };
  
  $('.group-topics').on('change', '.group-topic .actions select', function(e) {
    doGroupAction($(this));
  });
  
  $('.group-topics').on('blur', '.group-topic .actions select', function(e) {
    doGroupAction($(this));
  });

  $('.cancel-create-topic').on('click', function(e) {
    var $form = $('.create-topic-form');

    // If this has already been submitted and has errors, just reload the page
    if (!$form.hasClass('error')) {
      e.preventDefault();
      $form.removeClass('active').trigger('reset');
    }
  });

  $('.create-topic').on('click', function(e) {
    e.preventDefault();
    $('.create-topic-form').addClass('active');
  });

  var $groupSettingsModal = $('#group-settings');
  $groupSettingsModal.detach().appendTo('body');
  $('.view-group-settings').on('click', function(){
    $groupSettingsModal.modal('show');
  });

  $groupSettingsModal.find('.close').on('click', function() {
    $groupSettingsModal.modal('hide');
  });

  $('.leave-group').on('click', function() {
    var msg = 'Do you really want to leave this Group? All of your Things will be removed from the Group.';
    
    if (window.confirm(msg)) {
      return true;
    }
    
    return false;
  });

  // Format time elements
  $(document).on('pageLoaded', formatTime);
  
  // Trigger a pageLoaded event for anything that is listening
  $(document).trigger('pageLoaded');
});

/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);
