Thingiverse.Group = function() {
};

Thingiverse.Group.getUserGroups = function (user_id) {
  $.ajax({
      url: '/ajax/user/groups',
      type: 'POST',
      data: {
        user_id: user_id
      },
      dataType: 'html',
      success: function(data, status, xhr) {
        $('.groups-container').after(data);
        $('#view-more-groups').hide();
        $('#view-fewer-groups').show();
      }
  });
};

Thingiverse.Group.addThing = function(slug, thing_id) {
  var data = {slug: slug,
              thing_id: thing_id
            };
            
  return $.post('/ajax/groupthings/add_thing', data);
};

Thingiverse.Group.removeThing = function(slug, thing_id) {
  var data = {slug: slug,
              thing_id: thing_id
            };
  
  return $.post('/ajax/groupthings/remove_thing', data);
};

Thingiverse.Group.removeUser = function(slug, user_id) {
  var data = {slug: slug,
              user_id: user_id
            };
  
  return $.post('/ajax/groupmembers/remove_user', data);
};

Thingiverse.Group.removeThingByElement = function(slug, $elem) {
  var item_id = $elem.data('id');
  var errorMsg = 'There was a problem removing this Thing from this Group';
  
  $.when(Thingiverse.Group.removeThing(
      slug,
      item_id
  ))
  .done(function(response) {
      response = $.parseJSON(response);
  
      if (!response.ok) {
          alert((response.error) ? response.error : errorMsg);
      } else {
          $elem.remove();
      }
  })
  .fail(function(response) {
      alert(errorMsg);
  });
};

Thingiverse.Group.removeUserByElement = function(slug, $elem) {
  var item_id = $elem.data('id');
  var errorMsg = 'There was a problem removing this User from this Group';
  
  $.when(Thingiverse.Group.removeUser(
      slug,
      item_id
  ))
  .done(function(response) {
      response = $.parseJSON(response);
  
      if (!response.ok) {
          alert((response.error) ? response.error : errorMsg);
      } else {
          $elem.remove();
      }
  })
  .fail(function(response) {
      alert(errorMsg);
  });
};

Thingiverse.Group.create = {};
Thingiverse.Group.create.form = {
  rules: {
    remote: '/ajax/groups/validate'
  },
  valid: function($elem) {
    return $.post(this.rules.remote, this.serialize($elem));
  },
  validate: function($elem) {
    var self = this;
    var fieldname = $elem.attr('name');
    
    $.when(this.valid($elem))
    .done(function(response) {
      response = $.parseJSON(response);
      if (response) {
        if (response.ok || !response[fieldname]) {
          self.updateElementValid($elem);
        } else {
          if (response[fieldname].error) {
            self.updateElementInvalid($elem, response[fieldname].error);
          }
        }
      }
    })
    .fail(function(response) {
      alert('There was a problem with your request.');
    });
  },
  updateElementValid: function($elem) {
    $elem.removeClass('error').addClass('valid');
    $elem.next('.alert-error').removeClass('active');
    $elem.trigger('validated');
  },
  updateElementInvalid: function($elem, message) {
    $elem.removeClass('valid').addClass('error');
    $elem.next('.alert-error').text(message).addClass('active');
  },
  submit: function($form) {
    var valid = true;
    
    $form.find('input, textarea').each(function(index, elem) {
      if ($(elem).hasClass('error')) {
        valid = false;
      }
    });
    
    return valid;
  }
};

Thingiverse.Group.create.slug = {
  slug_url: '/ajax/groups/slug',
  generateSlug: function(name) {
    return $.post(this.slug_url, {name: name});
  }
};

Thingiverse.Group.create.form.populateSlug = function($form) {
  var self = this;
  var $name = $form.find('input[name="name"]');
  var $slug = $form.find('input[name="slug"]');
  
  if (!$name.hasClass('error') && !$slug.val()) {
    $.when(Thingiverse.Group.create.slug.generateSlug($name.val()))
    .done(function(response) {
      response = $.parseJSON(response);
      
      if (response) {
        if (response.slug) {
          $slug.val(response.slug).trigger('blur');
        } else if (response.error) {
          alert(response.error);
        }
      }
    })
    .fail(function(response) {
      alert('There was a problem with your request');
    });
  }
};

Thingiverse.Group.create.form.serialize = function($elem) {
  var result = {};
  $.each($elem.serializeArray(), function() {
      result[this.name] = this.value;
  });
  
  return result;
};
