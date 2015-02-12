Thingiverse.UserController = (function() {
  var self = {
    $profile_nav_bttn     : $('.profile-edit-page .user-nav a'),
    $profile_view         : $('div.profile_view'),
    $toggle_bttns         : $('div.toggle_container'),
    $selected_section     : $('span.selected-section'),
    $user_edit_form       : $('#user_edit_form'),
    $auth_apps_revoke     : $('div.app_interact'),
    $save_profile_bttn    : $('#save_profile_bttn'),
    $cancel_profile_bttn  : $('#cancel_profile_bttn'),
    tab_names             : ['thingiverse_settings', 'makerbot_account_settings', 'apps'],
    currentView           : null,
    $favoritesContainer   : $('.choose_item'),
    $things               : $('.choose_item .thing:not(.add_item)'),
    $thingInteract        : $('.thing-interact > *'),
    $favoriteSelector     : $('#favorites_selector'),
    $favoritesNav         : $('.modal-nav'),
    $favoritesContent     : $('.modal_selector_content'),
    $favoritesClose       : $('#favorites_selector span.close'),
    selectedFavoriteSpot  : null,
    favoritesDeleted      : [],
    favoritesAdded        : {},
    $addFavoriteTemplate  : $('.add_item:last')
  };
  
  self.init = function(user_id) {    
    self.currentView = self.tab_names[0];
    self.user_id = user_id;
        
    new FormFileBttn({
        external: 'iframe#profile_image_iframe',
        target: '#file',
        type: 'div',
        style: 'upload-btn',
        html: '<span id="upload_msg">Choose File</span>'
    });
    
    new FormFileBttn({
        external: 'iframe#profile_image_iframe-tv',
        target: '#file',
        type: 'div',
        style: 'upload-btn',
        html: '<span id="upload_msg">Choose File</span>'
    });

    new FormFileBttn({
        external: 'iframe#header_image_iframe',
        target: '#file',
        type: 'div',
        style: 'upload-btn',
        html: '<span id="upload_msg">Choose File</span>'
    });
    
    self.$favoriteSelector.detach().appendTo('body');

    self.$profile_nav_bttn.on('click', function(event) {
        event.preventDefault();
        self.changeView($(this), $(this).attr('data-view'));
    });

    self.$toggle_bttns.on('click', function() {
        self.toggleBttn($(this));
    } );

    self.$auth_apps_revoke.on('click', function() {
        self.revokeAppAuth($(this));
    } );

    self.$save_profile_bttn.on('click', function() {
        self.saveProfile();
        return false;
    } );

    self.$cancel_profile_bttn.on('click', function() {
        self.cancelSave();
    } );

		hash = window.location.hash.replace(/#/, '');
		if($.inArray(hash, self.tab_names) > -1) {
			self.changeView(self.$profile_nav_bttn.filter('[data-view="'+hash+'"]').first(), hash);
		}
		
		self.$favoritesContainer.on('click', '.add_item', function() {
      self.showFavoritesSelector($(this));
		});
		
		self.$favoritesNav.find('a').on('click', function(event) {
		  event.preventDefault();
		  
		  var $this = $(this);      			  
		  if($this.hasClass('active')) {
		    return false;
		  }
		  
		  self.$favoritesNav.find('.active').removeClass('active');
		  $this.addClass('active');
		  
		  var typeToLoad = $this.data('type');
		  
		  self.populateUserItems(typeToLoad);
		});
		
		self.$favoritesClose.on('click', function(){
		  self.hideFavoritesSelector();
		});
		
		self.$favoritesContent.on('click', '.template-micro', function(event) {
      self.addFavorite($(this));
		});
		
		self.$favoritesContainer.on('click', '.thing .remove-btn', function() {
		  self.removeFavorite($(this).closest('.thing'));
		});
  };
  
  self.changeView = function(jqself, view) {
      if(self.currentView === view) {
        return false;
      }
      
      self.currentView = view;

      // Change everything for both mobile and non-mobile views
      self.$profile_nav_bttn.filter('.active').removeClass('active');
      self.$profile_nav_bttn.filter('[data-view="'+view+'"]').addClass('active');
      self.$selected_section.text(jqself.text());

      self.$profile_view.removeClass('selected_view');
      $('#' + view + '_view').addClass('selected_view');

      window.location.hash = view;            
  };

  self.toggleBttn = function(jqself) {

      var toggle = jqself.children( ':first' );
      var is_on  = jqself.hasClass( 'toggle_container_active' );
      var param  = jqself.next();

      if(is_on) {
        jqself.removeClass( 'toggle_container_active' );
      
        if(param !== undefined) {
            param.val( 0 );
        }

      }
      else {
        jqself.addClass( 'toggle_container_active' );

        if(param !== undefined) {
            param.val( 1 );
        }

      }
  };

  self.revokeAppAuth = function(jqself) {

      var revoke_url = jqself.attr( 'data-revoke' );
      if(revoke_url !== undefined) {
          $.get(revoke_url); // Hit Revoke URL
      }
      
      jqself.closest('.thing').fadeOut( 200, function() {
          $(this).remove();
      });
  };

  self.saveProfile = function() {
      // verify that the password confirms align
      var pass1 = $( '#changepass1' ).val();
      var pass2 = $( '#changepass2' ).val();

      if(pass1 === pass2) {
        var favsAdded = !$.isEmptyObject(self.favoritesAdded);
        var favsDeleted = self.favoritesDeleted.length;
        
        if(favsAdded || favsDeleted) {
          var data = {id: this.user_id, favorites:[]};
          var num_deleted = self.favoritesDeleted.length;
          
          if(favsDeleted) {
            for(var fd= 0; fd < favsDeleted; fd++) {
              data.favorites.push(self.favoritesDeleted[fd]);
            }
          }
          
          if(favsAdded) {
            for(var key in self.favoritesAdded) {
              data.favorites.push(self.favoritesAdded[key]);
            }
          }
          
          $.ajax({
            type: "POST",
            url: '/ajax/user/edit_favorites',
            data: data,
            complete: function() {
              self.$user_edit_form.submit();
            }
          });
        }
        else {
          self.$user_edit_form.submit();
        }
      }
      else {
        alert('Passwords must match!');
        return false;
      }
  };

  self.showFavoritesSelector = function($element) {
    self.$selectedFavoriteSpot = $element;
    self.$favoriteSelector.modal('show');
    self.populateUserItems(self.$favoritesNav.find('.active').data('type'));
  };
  
  self.hideFavoritesSelector = function() {
    self.$favoriteSelector.modal('hide');
  };

  self.removeFavorite = function($element) {
    var type = $element.data('type');
    var id = $element.data('id');
    var rank = $element.index() + 1;
    
    $element.replaceWith(self.$addFavoriteTemplate.clone());
    self.favoritesDeleted.push({'type': type, 'id': id, 'rank': 0});
    
    // In case it happens to be in the favoritesAdd, remove it
    delete self.favoritesAdded[rank];
  };

  self.addFavorite = function($element) {
    var type = $element.data('type');
    var id = $element.data('id');
    var rank = (self.$selectedFavoriteSpot.index()) + 1;
    
    // Check if this has already been added
    var $existingSpot = self.$favoritesContainer.find('.thing[data-type="'+type+'"][data-id="'+id+'"]');
    if($existingSpot.length) {
      self.removeFavorite($existingSpot);
    }
    
    var template = (type === 'Thing' || type === 'Make') ? 'draw_thing' : 'draw_collection';
    
    $.get(
      '/ajax/user/favoriteselector', 
      {        
        'id': self.user_id,
        'type': type,
        'model_id': id,
      },
      function(data) {
        if(data) {
          self.$selectedFavoriteSpot.replaceWith(data);
        }
      },
      'html'
    );
    
    self.favoritesAdded[rank] = {'type': type, 'id': id, 'rank': rank};
        
    this.hideFavoritesSelector();
  };
  
  self.populateUserItems = function(type) {
    self.$favoritesContent.find('.active').removeClass('active');
    
    self.$favoritesContent.addClass('loading');
    
    var $loadContainer = self.$favoritesContent.find('.favorites_selector_'+type);
    if(!$loadContainer.hasClass('loaded')) {
      $loadContainer.html('');
      $loadContainer.load('/ajax/user/favoriteselector',
      {
        'id': self.user_id,
        'type': type
      },
      function() {
          self.$favoritesContent.removeClass('loading');
          $loadContainer.addClass('loaded active');
      });
    }
    else {
      self.$favoritesContent.removeClass('loading');
      $loadContainer.addClass('active');
    }        
  };
  
  return self;
  
}());