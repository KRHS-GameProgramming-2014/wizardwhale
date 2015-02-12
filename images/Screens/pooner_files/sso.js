var SSO = function() {
	var self = this;
	var $loading_screen = $('.loading-screen')
	// Will hold a timeout so that we don't send too many AJAX requests
	var checkAvailabilityTimeout = null;
	var $article = $('article.sso');
	var theme = $('#sso-theme').val();
	this.redirect_payload = $('#sso-redirect').val();
	this.redirect_url = ( this.redirect_payload) ?  unserialize(atob(this.redirect_payload))['data'] : null;

	self.redirect = function(next) {
		// self.hide_loading();
		var url = '/edit';

		if ( typeof(next)!='undefined' ) {
			// display next screen?
			url = next;
		} else if (this.redirect_url) {
			// our object has a setting
			url = this.redirect_url;
		} else {
			// last chance, check the get args?
			document.location.href.replace(/redirect=([^&]+)/, function(string, match){
				url = atob(match).data;
				return string;
			});
		}

		document.location.href = url;
	}

	// Once we're complete, work the countdown timer
	self.countdown_on_complete = function() {
		var $merge_complete = $('.merge-complete');

		if (!$merge_complete.length) return;

		var $count = $merge_complete.find('.redirecting .count');
		var seconds_left = parseInt($count.text(), 10);

		if (!seconds_left) {
			document.location.href = $merge_complete.find('.continue').attr('href');
		} else {
			$count.text(seconds_left - 1);
			setTimeout(self.countdown_on_complete, 1000);
		}
	};

	$article.on('change keyup', 'input.check-availability', function (e) {
		// Don't send for return key
		if (e.originalEvent.keyCode == 13) {
			return;
		}

		var $input = $(this);
		var value = $input.val();
		var $wrapper = $input.closest('div');
		var $availability = $wrapper.find('.availability .wrap');
		var endpoint;

		// We're going to register a new call in a second
		clearTimeout(checkAvailabilityTimeout);

		if (value.length < 3 || $input.data('original') === value ) {
			$availability.stop().slideUp('fast');
			// Get rid of the checkmark
			$wrapper.removeClass('unavailable').removeClass('available');
			return;
		}

		var type = $input.attr('id');
		switch (type) {
			case 'email':
				endpoint = '/email_available/' + encodeURIComponent(value);
				break;
			case 'tv_username':
			default:
				endpoint = '/username_available/' + encodeURIComponent(value);
				break;
		}

		checkAvailabilityTimeout = setTimeout(function () {
			$.ajax(endpoint,
				{
					success: function (data, textStatus, jqXHR) {
						if (textStatus == 'success') {
							var $status_span = $availability.find('.status');
                            var un = data.available ? '' : 'un';
                            var status = un + 'available';

                            $wrapper.removeClass('available unavailable')
                                .addClass(status);
							$status_span.text(status);
							$availability.slideDown('fast');
						}
					}
				});
		}, 750);
	}); // username.on(keyup)

  $article.on('submit', "#sso-sign-in-form", function() {
     return false;
  });

  $(document).on('keypress', function(e) {
      if (e.which == 13) { // enter key
          if (!$(e.target).hasClass('search-query')) {
            $('#sso_sign_in').trigger('click');
            return false;
          }
      }
  });

	// implements sign-in-form submit
	$article.on('click', '#sso_sign_in', function(event)
	{
		event.preventDefault();
		self.show_loading('Signing you in...');

		self.data = {
			'username': $("#username").val(),
			'password': $("#password").val(),
			'theme': theme,
			'redirect': this.redirect_payload
		};

		// submit username & password
		$.ajax({
			'url': '/login',
			'type': 'POST',
			'data': self.data,
			'dataType': "json",
			'success': function(res) {
				self.hide_error();

        var redirect = function() {
          // display merge screen?
          if ( typeof(res.next)!='undefined' )
          {
            self.load_next_screen(res.next);
          }
          else
            self.redirect();
        }

        if ( typeof(res.enabled_domains)!='undefined' )
          self.set_cookies(res, function(){redirect()});
        else
          redirect();
			},
			'error': function(res) {
				res = JSON.parse(res.responseText);
				self.hide_loading();
				self.show_error(res.error);
			}
		});

		return false;
	});

  // the user forgot his/her password
  $article.on('click', '#forgot-password', function(event)
  {
    self.post("/forgot");
  });

  // register for a new account
	$article.on('submit', '#sso-register', function(event)
	{
		event.preventDefault();
		self.show_loading('Welcome to Makerbot...');

    if ( $("#password").val()!=$("#confirm-password").val() )
    {
      self.hide_loading();
      self.show_error("Passwords must match");
      $('label[for=confirm-password]').addClass('error');
      return;
    }

    // If this is TV and someone is creating a new account, go to the new user onboarding
    if($('body').hasClass('thingiverse')) {
      var next_url = 'http://' + self.site_hostname + '/welcome';
    }

		self.data = {
			'username': $("#tv_username").val(),
			'password': $("#password").val(),
			'confirm-password': $("#confirm-password").val(),
			'first_name': $("#first_name").val(),
			'last_name': $("#last_name").val(),
			'email': $("#email").val(),
			'theme': theme,
			'redirect': this.redirect_payload
		};

		if ($('#newsletter-signup').prop('checked')) {
			self.data['newsletter-signup'] = 1;
		}

		// submit username & password
		$.ajax({
			'url': '/register',
			'type': 'POST',
			'data': self.data,
			'dataType': "json",
			'success': function(res) {
				self.hide_error();

        if ( typeof(res.enabled_domains)!='undefined' )
          self.set_cookies(res, function(){self.redirect(next_url)});
        else
          self.redirect(next_url);
			},
			'error': function(res) {
				res = JSON.parse(res.responseText);
				self.hide_loading();
				self.show_error(res.error);

				$('#sso-register input').each(function(idx) {
					var $this = $(this);
					var name = $this.attr('name');
					var $label = $('label[for='+name+']');
					var found_error = false;

					for(var i = 0; i < res.errors.length; i++) {
						if (found_error = (res.errors[i] == name)) break;
					}

					if (found_error) {
						$label.addClass('error');
					} else {
						$label.removeClass('error');
					}
				});
			}
		});
		return false;
	});

  // merge tv account to store
	$article.on('submit', '#sso-merge-tv', function(event)
	{
		event.preventDefault();
		self.load_next_screen({
			'method': 'POST',
			'url': '/merge_tv',
			'username': $('#tv_username').val(),
			'password': self.data.password,
			'theme': theme,
			'tv_password': $('#tv_password').val()
		}, self.countdown_on_complete);
		return false;
	});

	// Reload merge_tv with the ability to select a username
	$article.on('click', '#sso-merge-different-tv', function(event)
	{
		event.preventDefault();
		self.load_next_screen({
			'method': 'GET',
			'url': '/merge_tv',
			'email': self.data.username,
			'theme': theme,
			'message': 'Please wait...'
		}, self.countdown_on_complete);
		return false;
	});

	$article.on('submit', '#sso-choose-username', function(event)
	{
		event.preventDefault();
		self.load_next_screen({
			'method': 'POST',
			'url': '/choose_username',
			'username': $('#tv_username').val(),
			'password': self.data.password,
			'tv_password': $('#tv_password').val(),
			'theme': theme,
			'message': 'Creating your Thingiverse account...'
		}, self.countdown_on_complete);
		return false;
	});

  // save email
	$article.on('submit', '#sso-change-username', function(event)
	{
		event.preventDefault();
    var data = {
        'email': $('#sso-email-new').val()
    };
		$.ajax({
			'url': '/edit',
			'type': 'POST',
			'data': data,
			'success': function(res) {
        $('#sso-change-username-status').html('<p>email updated</p>');
        $('#sso-change-username-status').effect('highlight');
			},
      'error': function(res) {
        $('#sso-change-username-status').html('<p>error updating email, please try again</p>');
        $('#sso-change-username-status').effect('highlight');
        console.log(res);
      }
		});
		return false;
	});

  // update password
	$article.on('submit', '#sso-change-password', function(event)
	{
		event.preventDefault();

    // make sure passwords match
    var new_password = $('#new_password').val();
    if ( new_password != $('#confirm_password').val() )
    {
      $('#sso-change-password-status').html('<p>passwords do not match</p>');
      $('#sso-change-password-status').effect('highlight');
      return false;
    }

    var data = {
        'password': new_password,
        'old_password': old_password
    };
		$.ajax({
			url: '/edit',
			type: 'POST',
			data: data,
			success: function(res) {
        $('#sso-change-password-status').html('<p>password updated</p>');
        $('#sso-change-password-status').effect('highlight');
			},
      error: function(res) {
        // generic error message
        var error_msg = "error updating password, please try again";
        // update with specific error message
        if ( typeof(res.error)!='undefined' )
          error_msg = res.error;
        $('#sso-change-password-status').html("<p>"+error_msg+"</p>");
        $('#sso-change-password-status').effect('highlight');
        console.log(res);
      }
		});
		return false;
	});

  // update password
	$article.on('submit', '#sso-reset-password', function(event)
	{
		event.preventDefault();

    // make sure passwords match
    var new_password = $('#new_password').val();
    if ( new_password != $('#confirm_password').val() )
    {
      $('#sso-change-password-status').html('<p>passwords do not match</p>');
      $('#sso-change-password-status').effect('highlight');
      return false;
    }

    var data = {
        'username': $('#username').val(),
        'hash': $('#hash').val(),
        'password': new_password
    };
		self.post('/reset_forgotten', data);

		return false;
	});


  // replace the page with the next page in the flow
  this.load_next_screen = function(options, callback)
  {
    if ( typeof(options.method)=='undefined' )
      options.method = 'POST';

    var data = {
        'theme': theme,
        'redirect': this.redirect_payload,
        'redirect_url': this.redirect_url,
        'email': self.data.username,
        'username': options.username
    };
    if ( options.password )
      data.password = options.password;
    if ( options.tv_password )
      data.tv_password = options.tv_password;

		$.ajax({
			'url': options.url,
			'type': options.method,
			'data': data,
			'success': function(res) {
        $article.html(res);
				self.hide_loading();
        if ( typeof(callback)=='function' )
          callback();
			}
		});
  }

	// Devices
	$add_device_form = $('#add-device');

	$add_device_form.find('#address_id').on('change', function (e) {
		var $new_address = $add_device_form.find('#new_address')

		if (e.target.value) {
			$new_address.stop().slideUp(350);
		} else {
			$new_address.stop().slideDown(350);
		}
	});

	//Where MakerCare was purchased
	var $purchase_makercare = $('.purchase_makercare');
	var $activation_code = $('.activation_code');

	$('#third_party_yes').on('click', function(){
		$purchase_makercare.hide();
		$activation_code.show();
	});

	$('#third_party_no').on('click', function(){
		$activation_code.hide();
		$purchase_makercare.show();
	});

	// log into all the things
	// called in response to successful account login
	this.set_cookies = function(payload, callback)
	{
    self.domains_to_load = payload.enabled_domains.length;
		var progress = $('#sso-progress');
		var form_wrapper;
		var loggedInTimer = null;
		var timeoutLogin = function (token_name) {
			console.log('We spent too long waiting for a message from '+token_name+'!');
			// TODO: Handle it somehow
			if ( typeof(callback)=='function' ) {
				callback();
			}
		}
		// Set up our message listener
		var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
		var eventer = window[eventMethod];
		var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
		progress.show();

		eventer(messageEvent,function(e) {
			console.log('parent received message!:  ',e.data);

			if (e.data.split(':')[1] == 'success') {
				self.domains_to_load--;
			} else {
				// TODO: Handle the error and cancel the error timeout
				console.log(e.data);
			}

			if ( !self.domains_to_load) {
				clearTimeout(loggedInTimer);

				if ( typeof(callback)=='function' ) {
					console.log('Calling callback after logged in!');
					callback(token.token);
				}
			}
		},false);

        var form;
		for ( var i=0; i<payload.enabled_domains.length; i++ ) {
			token = payload.enabled_domains[i];
			// add a blank iframe
			form_wrapper = document.createElement('div');

			form =  '<iframe id="'+token.name+'-iframe" name="'+token.name+'-iframe"></iframe>';
			form += '<form id="'+token.name+'-form" action="'+token.url+'" target="'+token.name+'-iframe" method="post">';
			form += '<input type="hidden" name="sso_token" value="'+token.token+'" />';

			if (token.thingiverse_id != undefined) {
                form += '<input type="hidden" name="thingiverse_id" value="'+token.thingiverse_id+'" />';
			}

			if (token.full_name != undefined) {
                form += '<input type="hidden" name="full_name" value="'+token.full_name+'" />';
			}

			if (token.email != undefined) {
                form += '<input type="hidden" name="email" value="'+token.email+'" />';
			}

			if (token.avatar != undefined) {
                form += '<input type="hidden" name="avatar" value="'+token.avatar+'" />';
			}

			form += '</form>';

			form_wrapper.innerHTML = form;

			progress.append(form_wrapper);

			$('#'+token.name+'-form').submit();
			// Trigger an error after 5 seconds without a reply
			if (loggedInTimer != null) {
				clearTimeout(loggedInTimer);
			}
			console.log('Setting timer for ',token.name);
			loggedInTimer = setTimeout(timeoutLogin, 5000, token.name);
		}
	};

  // invalidate a token
	this.delete_token = function(id) {
		$.ajax({
			'url': '/delete_token',
			'type': 'POST',
			'data': {id: id},
			'success': function(res) {
        $('#token_'+id).hide();
			}
		});
	}

  // navigate to a page using post params to handle all our params
  this.post = function(url, options) {
    if ( typeof(options)=='undefined' )
      options = new Object();

    var form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", url);

    options.theme = theme;
    options.redirect = this.redirect_payload;

    for (var arg in options) {
      if (options.hasOwnProperty(arg)) {
        var input = document.createElement("input");
        input.setAttribute("name", arg);
        input.setAttribute("value", options[arg]);
        form.appendChild(input);
      }
    }
    document.body.appendChild(form);
    form.submit();
  }

	this.show_loading = function(message) {
		$loading_screen.find('.message').text(message);
		$loading_screen.addClass('show');
	}

	this.hide_loading = function() {
		$loading_screen.removeClass('show');
	}

	this.show_error = function(message) {
		var $error = $('div.error p');
		$error.html(message);

		if ($error.is(':visible')) {
			$error.effect('highlight');
		} else {
			$error.closest('div').slideDown();
		}
	};

	this.hide_error = function() {
		var $error = $('div.error p');
		$error.slideUp();
	};

	return self;
};

// redirect payloads are php serialized instead of json_encoded, so use this
function unserialize (data) {
  //Copyright (c) 2013 Kevin van Zonneveld (http://kvz.io) and Contributors (http://phpjs.org/authors)
  //Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  //The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
	var that = this,
    utf8Overhead = function (chr) {
      // http://phpjs.org/functions/unserialize:571#comment_95906
      var code = chr.charCodeAt(0);
      if (code < 0x0080) {
        return 0;
      }
      if (code < 0x0800) {
        return 1;
      }
      return 2;
    },
    error = function (type, msg, filename, line) {
      throw new that.window[type](msg, filename, line);
    },
    read_until = function (data, offset, stopchr) {
      var i = 2, buf = [], chr = data.slice(offset, offset + 1);

      while (chr != stopchr) {
        if ((i + offset) > data.length) {
          error('Error', 'Invalid');
        }
        buf.push(chr);
        chr = data.slice(offset + (i - 1), offset + i);
        i += 1;
      }
      return [buf.length, buf.join('')];
    },
    read_chrs = function (data, offset, length) {
      var i, chr, buf;

      buf = [];
      for (i = 0; i < length; i++) {
        chr = data.slice(offset + (i - 1), offset + i);
        buf.push(chr);
        length -= utf8Overhead(chr);
      }
      return [buf.length, buf.join('')];
    },
    _unserialize = function (data, offset) {
      var dtype, dataoffset, keyandchrs, keys, contig,
        length, array, readdata, readData, ccount,
        stringlength, i, key, kprops, kchrs, vprops,
        vchrs, value, chrs = 0,
        typeconvert = function (x) {
          return x;
        };

      if (!offset) {
        offset = 0;
      }
      dtype = (data.slice(offset, offset + 1)).toLowerCase();

      dataoffset = offset + 2;

      switch (dtype) {
        case 'i':
          typeconvert = function (x) {
            return parseInt(x, 10);
          };
          readData = read_until(data, dataoffset, ';');
          chrs = readData[0];
          readdata = readData[1];
          dataoffset += chrs + 1;
          break;
        case 'b':
          typeconvert = function (x) {
            return parseInt(x, 10) !== 0;
          };
          readData = read_until(data, dataoffset, ';');
          chrs = readData[0];
          readdata = readData[1];
          dataoffset += chrs + 1;
          break;
        case 'd':
          typeconvert = function (x) {
            return parseFloat(x);
          };
          readData = read_until(data, dataoffset, ';');
          chrs = readData[0];
          readdata = readData[1];
          dataoffset += chrs + 1;
          break;
        case 'n':
          readdata = null;
          break;
        case 's':
          ccount = read_until(data, dataoffset, ':');
          chrs = ccount[0];
          stringlength = ccount[1];
          dataoffset += chrs + 2;

          readData = read_chrs(data, dataoffset + 1, parseInt(stringlength, 10));
          chrs = readData[0];
          readdata = readData[1];
          dataoffset += chrs + 2;
          if (chrs != parseInt(stringlength, 10) && chrs != readdata.length) {
            error('SyntaxError', 'String length mismatch');
          }
          break;
        case 'a':
          readdata = {};

          keyandchrs = read_until(data, dataoffset, ':');
          chrs = keyandchrs[0];
          keys = keyandchrs[1];
          dataoffset += chrs + 2;

          length = parseInt(keys, 10);
          contig = true;

          for (i = 0; i < length; i++) {
            kprops = _unserialize(data, dataoffset);
            kchrs = kprops[1];
            key = kprops[2];
            dataoffset += kchrs;

            vprops = _unserialize(data, dataoffset);
            vchrs = vprops[1];
            value = vprops[2];
            dataoffset += vchrs;

            if (key !== i)
              contig = false;

            readdata[key] = value;
          }

          if (contig) {
            array = new Array(length);
            for (i = 0; i < length; i++)
              array[i] = readdata[i];
            readdata = array;
          }

          dataoffset += 1;
          break;
        default:
          error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
          break;
      }
      return [dtype, dataoffset - offset, typeconvert(readdata)];
    };

  return _unserialize((data + ''), 0)[2];
};

// IE hackery
if ( typeof(atob)!='function' )
{
  atob = function(str, utf8decode) {
    // Base 64 encoding / decoding (c) Chris Veness 2002-2011
    utf8decode =  (typeof utf8decode == 'undefined') ? false : utf8decode;
    var o1, o2, o3, h1, h2, h3, h4, bits, d=[], plain, coded;
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    coded = utf8decode ? Utf8.decode(str) : str;

    for (var c=0; c<coded.length; c+=4) {  // unpack four hexets into three octets
      h1 = b64.indexOf(coded.charAt(c));
      h2 = b64.indexOf(coded.charAt(c+1));
      h3 = b64.indexOf(coded.charAt(c+2));
      h4 = b64.indexOf(coded.charAt(c+3));

      bits = h1<<18 | h2<<12 | h3<<6 | h4;

      o1 = bits>>>16 & 0xff;
      o2 = bits>>>8 & 0xff;
      o3 = bits & 0xff;

      d[c/4] = String.fromCharCode(o1, o2, o3);
      // check for padding
      if (h4 == 0x40) d[c/4] = String.fromCharCode(o1, o2);
      if (h3 == 0x40) d[c/4] = String.fromCharCode(o1);
    }
    plain = d.join('');  // join() is far faster than repeated string concatenation in IE

    return utf8decode ? Utf8.decode(plain) : plain;
  }
}
